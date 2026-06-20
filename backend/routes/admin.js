// routes/admin.js — Full Admin API (MongoDB version)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const DiscountCode = require('../models/DiscountCode');
const SiteContent = require('../models/SiteContent');
const Store = require('../models/Store');
const Category = require('../models/Category');

// ── Multer config ──────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|webp/i.test(path.extname(file.originalname)) ? cb(null, true) : cb(new Error('Chỉ cho phép ảnh'));
  }
});

const uploadAny = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isVideo = /mp4|webm|mov/i.test(path.extname(file.originalname));
      const dir = path.join(__dirname, `../public/${isVideo ? 'videos' : 'images'}`);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// ── Auth ───────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD chưa được set trong .env');

async function adminAuth(req, res, next) {
  if (req.headers['x-admin-token'] === ADMIN_PASSWORD) return next();
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ id: decoded.id });
      if (user?.role === 'admin') return next();
    } catch {}
  }
  return res.status(403).json({ error: 'Không có quyền truy cập' });
}

// ══════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════
router.get('/products', adminAuth, async (req, res) => {
  const products = await Product.find().sort({ id: 1 });
  res.json(products);
});

router.post('/products', adminAuth, async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category) return res.status(400).json({ error: 'Thiếu name, price, category' });

    const last = await Product.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const product = await Product.create({
      id: newId, slug, name, category, price: Number(price),
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : null,
      colors: req.body.colors ? (typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors) : [],
      sizes: req.body.sizes ? (typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes) : ['S', 'M', 'L'],
      soldOutSizes: [], badge: req.body.badge || null,
      isNewProduct: true, isSale: false, stock: Number(req.body.stock) || 0,
      desc: req.body.desc || '', care: req.body.care || '', material: req.body.material || '', images: []
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Không tìm thấy' });

    const fields = ['name', 'category', 'badge', 'desc', 'care', 'material'];
    const numFields = ['price', 'stock'];
    const boolFields = ['isSale'];
    const jsonFields = ['sizes', 'soldOutSizes', 'colors'];

    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f] || (f === 'badge' ? null : req.body[f]); });
    numFields.forEach(f => { if (req.body[f] !== undefined) product[f] = Number(req.body[f]); });
    boolFields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f] === 'true' || req.body[f] === true; });
    jsonFields.forEach(f => { if (req.body[f] !== undefined) product[f] = typeof req.body[f] === 'string' ? JSON.parse(req.body[f]) : req.body[f]; });
    if (req.body.isNew !== undefined) product.isNewProduct = req.body.isNew === 'true' || req.body.isNew === true;
    if (req.body.oldPrice !== undefined) product.oldPrice = req.body.oldPrice ? Number(req.body.oldPrice) : null;

    await product.save();

    const out = product.toObject();
    out.isNew = out.isNewProduct; // tương thích frontend cũ đang đọc field "isNew"

    res.json({ success: true, product: out });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
  const result = await Product.deleteOne({ id: parseInt(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ success: true });
});

router.post('/products/:id/images', adminAuth, upload.array('images', 10), async (req, res) => {
  const product = await Product.findOne({ id: parseInt(req.params.id) });
  if (!product) return res.status(404).json({ error: 'Không tìm thấy' });
  const newImgs = req.files.map(f => `/images/${f.filename}`);
  product.images = [...(product.images || []), ...newImgs];
  await product.save();
  res.json({ success: true, images: product.images });
});

router.delete('/products/:id/images', adminAuth, async (req, res) => {
  const product = await Product.findOne({ id: parseInt(req.params.id) });
  if (!product) return res.status(404).json({ error: 'Không tìm thấy' });
  const { imageUrl } = req.body;
  const fp = path.join(__dirname, '../public/images', path.basename(imageUrl));
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  product.images = product.images.filter(i => i !== imageUrl);
  await product.save();
  res.json({ success: true, images: product.images });
});

// ══════════════════════════════════════════════════════════════════════
// HOMEPAGE
// ══════════════════════════════════════════════════════════════════════
router.get('/homepage', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  res.json(doc?.data || {});
});

router.put('/homepage/ticker', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  Object.assign(doc.data.ticker, req.body);
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, ticker: doc.data.ticker });
});

router.put('/homepage/hero', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  const { stats, ...rest } = req.body;
  Object.assign(doc.data.hero, rest);
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, hero: doc.data.hero });
});

router.post('/homepage/hero/media', adminAuth, uploadAny.single('media'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'Không có file' });
  const isVideo = /mp4|webm|mov/i.test(path.extname(f.originalname));
  const url = `/${isVideo ? 'videos' : 'images'}/${f.filename}`;

  const doc = await SiteContent.findOne({ key: 'homepage' });
  if (isVideo) { doc.data.hero.video = url; doc.data.hero.mediaType = 'video'; }
  else { doc.data.hero.image = url; doc.data.hero.mediaType = 'image'; }
  doc.markModified('data');
  await doc.save();

  res.json({ success: true, url, mediaType: doc.data.hero.mediaType });
});

router.delete('/homepage/hero/media', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  doc.data.hero.image = null;
  doc.data.hero.video = null;
  doc.data.hero.mediaType = 'default';
  doc.markModified('data');
  await doc.save();
  res.json({ success: true });
});

router.put('/homepage/marquee', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  Object.assign(doc.data.marquee, req.body);
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, marquee: doc.data.marquee });
});

router.put('/homepage/banner', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  Object.assign(doc.data.banner, req.body);
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, banner: doc.data.banner });
});

router.post('/homepage/banner/media', adminAuth, uploadAny.single('media'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'Không có file' });
  const isVideo = /mp4|webm|mov/i.test(path.extname(f.originalname));
  const url = `/${isVideo ? 'videos' : 'images'}/${f.filename}`;

  const doc = await SiteContent.findOne({ key: 'homepage' });
  if (isVideo) { doc.data.banner.video = url; doc.data.banner.mediaType = 'video'; }
  else { doc.data.banner.image = url; doc.data.banner.mediaType = 'image'; }
  doc.markModified('data');
  await doc.save();

  res.json({ success: true, url });
});

router.put('/homepage/about', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  const { stats, ...rest } = req.body;
  Object.assign(doc.data.about, rest);
  if (stats) doc.data.about.stats = typeof stats === 'string' ? JSON.parse(stats) : stats;
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, about: doc.data.about });
});

router.put('/homepage/countdown', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'homepage' });
  Object.assign(doc.data.countdown, req.body);
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, countdown: doc.data.countdown });
});

// ══════════════════════════════════════════════════════════════════════
// STORES
// ══════════════════════════════════════════════════════════════════════
router.get('/stores', adminAuth, async (req, res) => {
  const stores = await Store.find().sort({ id: 1 });
  res.json(stores);
});

router.post('/stores', adminAuth, async (req, res) => {
  const { name, addr, hours, mapUrl } = req.body;
  if (!name || !addr) return res.status(400).json({ error: 'Thiếu name, addr' });
  const last = await Store.findOne().sort({ id: -1 });
  const newId = last ? last.id + 1 : 1;
  const store = await Store.create({ id: newId, name, addr, hours: hours || '', mapUrl: mapUrl || '' });
  res.status(201).json({ success: true, store });
});

router.put('/stores/:id', adminAuth, async (req, res) => {
  const store = await Store.findOne({ id: parseInt(req.params.id) });
  if (!store) return res.status(404).json({ error: 'Không tìm thấy' });
  Object.assign(store, req.body);
  await store.save();
  res.json({ success: true, store });
});

router.delete('/stores/:id', adminAuth, async (req, res) => {
  const result = await Store.deleteOne({ id: parseInt(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// DISCOUNT CODES
// ══════════════════════════════════════════════════════════════════════
router.get('/discounts', adminAuth, async (req, res) => {
  const codes = await DiscountCode.find();
  res.json(codes);
});

router.post('/discounts', adminAuth, async (req, res) => {
  const { code, type, value, desc } = req.body;
  if (!code || !type || value === undefined) return res.status(400).json({ error: 'Thiếu thông tin' });
  const created = await DiscountCode.create({ code: code.toUpperCase(), type, value: Number(value), desc: desc || '' });
  res.status(201).json({ success: true, ...created.toObject() });
});

router.put('/discounts/:code', adminAuth, async (req, res) => {
  const code = req.params.code.toUpperCase();
  const discount = await DiscountCode.findOne({ code });
  if (!discount) return res.status(404).json({ error: 'Không tìm thấy' });
  const { type, value, desc } = req.body;
  if (type) discount.type = type;
  if (value !== undefined) discount.value = Number(value);
  if (desc !== undefined) discount.desc = desc;
  await discount.save();
  res.json({ success: true, ...discount.toObject() });
});

router.delete('/discounts/:code', adminAuth, async (req, res) => {
  const result = await DiscountCode.deleteOne({ code: req.params.code.toUpperCase() });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════════════
router.get('/orders', adminAuth, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/orders/:orderNumber/status', adminAuth, async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

  const wasAlreadyCancelled = order.status === 'cancelled';
  const isNowCancelled = req.body.status === 'cancelled';

  // Hoàn lại kho nếu đơn bị huỷ (và trước đó chưa từng huỷ, tránh hoàn 2 lần)
  if (isNowCancelled && !wasAlreadyCancelled) {
    for (const item of order.items) {
      await Product.updateOne({ id: item.productId }, { $inc: { stock: item.qty } });
    }
  }
  // Nếu đơn đang huỷ được khôi phục lại trạng thái khác, trừ kho lại
  if (!isNowCancelled && wasAlreadyCancelled) {
    for (const item of order.items) {
      await Product.updateOne({ id: item.productId }, { $inc: { stock: -item.qty } });
    }
  }

  order.status = req.body.status;
  await order.save();
  res.json({ success: true, order });
});

router.delete('/orders/:orderNumber', adminAuth, async (req, res) => {
  const result = await Order.deleteOne({ orderNumber: req.params.orderNumber });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════
router.get('/settings', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'settings' });
  res.json(doc?.data || {});
});

router.put('/settings', adminAuth, async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'settings' });
  const { social, seo, ...rest } = req.body;
  Object.assign(doc.data, rest);
  if (social) Object.assign(doc.data.social, typeof social === 'string' ? JSON.parse(social) : social);
  if (seo) Object.assign(doc.data.seo, typeof seo === 'string' ? JSON.parse(seo) : seo);
  doc.markModified('data');
  await doc.save();
  res.json({ success: true, settings: doc.data });
});

// ══════════════════════════════════════════════════════════════════════
// MEDIA LIBRARY (vẫn đọc/ghi trực tiếp ổ đĩa, không qua MongoDB)
// ══════════════════════════════════════════════════════════════════════
router.get('/media', adminAuth, (req, res) => {
  const imgDir = path.join(__dirname, '../public/images');
  const vidDir = path.join(__dirname, '../public/videos');
  const images = fs.existsSync(imgDir) ? fs.readdirSync(imgDir).map(f => ({ url: `/images/${f}`, type: 'image', name: f })) : [];
  const videos = fs.existsSync(vidDir) ? fs.readdirSync(vidDir).map(f => ({ url: `/videos/${f}`, type: 'video', name: f })) : [];
  res.json([...images, ...videos]);
});

router.post('/media/upload', adminAuth, uploadAny.array('files', 20), (req, res) => {
  const files = req.files.map(f => {
    const isVideo = /mp4|webm|mov/i.test(path.extname(f.originalname));
    return { url: `/${isVideo ? 'videos' : 'images'}/${f.filename}`, type: isVideo ? 'video' : 'image', name: f.filename };
  });
  res.json({ success: true, files });
});

router.delete('/media', adminAuth, (req, res) => {
  const { url } = req.body;
  const fp = path.join(__dirname, `../public${url}`);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════════
router.get('/categories', adminAuth, async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

router.post('/categories', adminAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Thiếu tên danh mục' });
  const exists = await Category.findOne({ name: name.trim() });
  if (exists) return res.status(409).json({ error: 'Danh mục đã tồn tại' });
  const category = await Category.create({ name: name.trim() });
  res.status(201).json({ success: true, category });
});

router.delete('/categories/:id', adminAuth, async (req, res) => {
  // Kiểm tra theo tên, không theo id, vì sản phẩm lưu category bằng tên
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục' });

  const productsUsingIt = await Product.countDocuments({ category: category.name });
  if (productsUsingIt > 0) {
    return res.status(409).json({ error: `Không thể xoá — đang có ${productsUsingIt} sản phẩm dùng danh mục này` });
  }

  await Category.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════════════════
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    const statusMap = {}
    ordersByStatus.forEach(s => { statusMap[s._id] = s.count })

    // Doanh thu
    const revenueToday = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const revenueWeek = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const revenueMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])

    // Doanh thu theo ngày trong tháng (cho biểu đồ)
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: { $dayOfMonth: '$createdAt' },
        total: { $sum: '$total' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ])

    // Khách hàng mới
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } })
    const newUsersWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } })
    const newUsersMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } })
    const totalUsers = await User.countDocuments({ role: 'user' })

    // Tổng đơn hàng
    const totalOrders = await Order.countDocuments()

    res.json({
      success: true,
      orders: {
        byStatus: statusMap,
        total: totalOrders
      },
      revenue: {
        today: revenueToday[0]?.total || 0,
        week: revenueWeek[0]?.total || 0,
        month: revenueMonth[0]?.total || 0,
        byDay: revenueByDay
      },
      users: {
        today: newUsersToday,
        week: newUsersWeek,
        month: newUsersMonth,
        total: totalUsers
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router;