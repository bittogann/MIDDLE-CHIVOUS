// routes/misc.js
const express = require('express');
const router = express.Router();
const DiscountCode = require('../models/DiscountCode');

// POST /api/discount/validate
router.post('/discount/validate', async (req, res) => {
  const { code, subtotal, shippingFee } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Thiếu mã.' });

  const entry = await DiscountCode.findOne({ code: code.toUpperCase() });
  if (!entry) return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ.' });

  let saved = 0;
  if (entry.type === 'percent') saved = Math.round((subtotal || 0) * entry.value / 100);
  if (entry.type === 'freeship') saved = shippingFee || 30000;

  res.json({ success: true, code: entry.code, type: entry.type, value: entry.value, desc: entry.desc, saved });
});

// POST /api/newsletter/subscribe
const subscribers = new Set();
router.post('/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
  if (subscribers.has(email)) return res.status(409).json({ success: false, message: 'Email đã đăng ký.' });
  subscribers.add(email);
  res.json({ success: true, message: 'Đăng ký thành công!' });
});

module.exports = router;