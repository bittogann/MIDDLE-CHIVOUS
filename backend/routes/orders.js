// routes/orders.js
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Order = require('../models/Order')
const Product = require('../models/Product')
const DiscountCode = require('../models/DiscountCode')
const authMiddleware = require('../middleware/auth')

// POST /api/orders — place order (guest + auth supported)
router.post('/', async (req, res) => {
  try {
    const { customer, items, shippingMethod, discountCode, paymentMethod } = req.body
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống.' })
    if (!customer?.email || !customer?.firstName)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin khách hàng.' })

    let subtotal = 0
    const enrichedItems = []
    const stockUpdates = [] // lưu lại để rollback nếu có lỗi giữa đường

    for (const item of items) {
      const qty = Number(item.qty)

      // Trừ kho an toàn: chỉ trừ nếu còn đủ hàng (atomic, chống race condition)
      const product = await Product.findOneAndUpdate(
        { id: item.productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: false } // trả về document TRƯỚC khi update, để lấy giá đúng lúc đặt
      )

      if (!product) {
        // Rollback các sản phẩm đã trừ kho trước đó trong vòng lặp này
        for (const u of stockUpdates) {
          await Product.updateOne({ id: u.productId }, { $inc: { stock: u.qty } })
        }
        const exists = await Product.findOne({ id: item.productId })
        if (!exists) {
          return res.status(400).json({ success: false, message: `Sản phẩm #${item.productId} không tồn tại.` })
        }
        return res.status(409).json({
          success: false,
          message: `"${exists.name}" chỉ còn ${exists.stock} sản phẩm, không đủ số lượng bạn yêu cầu (${qty}).`
        })
      }

      stockUpdates.push({ productId: item.productId, qty })

      const unitPrice = Number(product.price)
      const lineTotal = unitPrice * qty
      subtotal += lineTotal
      enrichedItems.push({
        productId: product.id, name: product.name,
        size: item.size, color: item.colorHex,
        qty, price: unitPrice,
      })
    }

    const feeMap = { standard: 30000, express: 60000, sameday: 90000 }
    let shippingFee = feeMap[shippingMethod] ?? 30000
    if (shippingMethod === 'standard' && subtotal >= 500000) shippingFee = 0

    let discount = 0
    let discountInfo = null
    if (discountCode) {
      const entry = await DiscountCode.findOne({ code: discountCode.toUpperCase() })
      if (!entry) return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ.' })
      if (entry.type === 'percent') discount = Math.round(subtotal * entry.value / 100)
      if (entry.type === 'freeship') discount = shippingFee
      discountInfo = { code: discountCode.toUpperCase(), type: entry.type, value: entry.value, desc: entry.desc, saved: discount }
    }

    const total = Math.max(0, subtotal + shippingFee - discount)
    const orderNumber = 'MF-' + Date.now().toString().slice(-6)

    // Get userId if token present (optional auth)
    let userId = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        userId = decoded.id
      } catch {}
    }

    const order = await Order.create({
      orderNumber, userId,
      customer: {
        firstName: customer.firstName, lastName: customer.lastName,
        email: customer.email, phone: customer.phone,
        address: customer.address, city: customer.city
      },
      items: enrichedItems, total, shippingMethod, paymentMethod,
      discountCode: discountInfo?.code || null,
      status: 'pending',
    })

    if (global.notifyAdmins) {
      global.notifyAdmins('new_order', {
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        total: order.total,
        itemCount: order.items.length
      })
    }

    res.status(201).json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders — my orders (requires auth)
router.get('/', authMiddleware, async (req, res) => {
  const myOrders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
  res.json({ success: true, orders: myOrders })
})

// GET /api/orders/:orderNumber
router.get('/:orderNumber', async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
  if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' })
  res.json({ success: true, order })
})

module.exports = router