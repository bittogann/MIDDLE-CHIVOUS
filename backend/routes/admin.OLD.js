// routes/admin.js — Full Admin API
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../data/db');
const { PRODUCTS, USERS, ORDERS, DISCOUNT_CODES, HOMEPAGE, STORES, SETTINGS, saveData } = db;

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

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/videos');
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

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /mp4|webm|mov/i.test(path.extname(file.originalname)) ? cb(null, true) : cb(new Error('Chỉ cho phép video MP4/WebM/MOV'));
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dangbaohuy2003';
const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  if (req.headers['x-admin-token'] === ADMIN_PASSWORD) return next();
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = USERS.find(u => u.id === decoded.id);
      if (user?.role === 'admin') return next();
    } catch {}
  }
  return res.status(403).json({ error: 'Không có quyền truy cập' });
}

// ══════════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════════
router.get('/products', adminAuth, (req, res) => res.json(PRODUCTS));

router.post('/products', adminAuth, (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) return res.status(400).json({ error: 'Thiếu name, price, category' });
  const newId = PRODUCTS.length ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const p = {
    id: newId, slug, name, category, price: Number(price),
    oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : null,
    colors: req.body.colors ? (typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors) : [],
    sizes: req.body.sizes ? JSON.parse(req.body.sizes) : ['S', 'M', 'L'],
    soldOutSizes: [], badge: req.body.badge || null,
    isNew: true, isSale: false, stock: Number(req.body.stock) || 0,
    desc: req.body.desc || '', care: req.body.care || '', material: req.body.material || '', images: []
  };
  PRODUCTS.push(p);
  saveData();
  res.status(201).json({ success: true, product: p });
});

router.put('/products/:id', adminAuth, (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  const fields = ['name', 'category', 'badge', 'desc', 'care', 'material'];
  const numFields = ['price', 'stock'];
  const boolFields = ['isNew', 'isSale'];
  const jsonFields = ['sizes', 'soldOutSizes', 'colors'];
  fields.forEach(f => { if (req.body[f] !== undefined) PRODUCTS[idx][f] = req.body[f] || (f === 'badge' ? null : req.body[f]); });
  numFields.forEach(f => { if (req.body[f] !== undefined) PRODUCTS[idx][f] = Number(req.body[f]); });
  boolFields.forEach(f => { if (req.body[f] !== undefined) PRODUCTS[idx][f] = req.body[f] === 'true' || req.body[f] === true; });
  jsonFields.forEach(f => { if (req.body[f] !== undefined) PRODUCTS[idx][f] = typeof req.body[f] === 'string' ? JSON.parse(req.body[f]) : req.body[f]; });
  if (req.body.oldPrice !== undefined) PRODUCTS[idx].oldPrice = req.body.oldPrice ? Number(req.body.oldPrice) : null;
  saveData();
  res.json({ success: true, product: PRODUCTS[idx] });
});

router.delete('/products/:id', adminAuth, (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  PRODUCTS.splice(idx, 1);
  saveData();
  res.json({ success: true });
});

router.post('/products/:id/images', adminAuth, upload.array('images', 10), (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  const newImgs = req.files.map(f => `/images/${f.filename}`);
  PRODUCTS[idx].images = [...(PRODUCTS[idx].images || []), ...newImgs];
  saveData();
  res.json({ success: true, images: PRODUCTS[idx].images });
});

router.delete('/products/:id/images', adminAuth, (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  const { imageUrl } = req.body;
  const fp = path.join(__dirname, '../public/images', path.basename(imageUrl));
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  PRODUCTS[idx].images = PRODUCTS[idx].images.filter(i => i !== imageUrl);
  saveData();
  res.json({ success: true, images: PRODUCTS[idx].images });
});

// ══════════════════════════════════════════════════════════════════════
// HOMEPAGE
// ══════════════════════════════════════════════════════════════════════
router.get('/homepage', adminAuth, (req, res) => res.json(HOMEPAGE));

router.put('/homepage/ticker', adminAuth, (req, res) => {
  Object.assign(HOMEPAGE.ticker, req.body);
  saveData();
  res.json({ success: true, ticker: HOMEPAGE.ticker });
});

router.put('/homepage/hero', adminAuth, (req, res) => {
  const { stats, ...rest } = req.body;
  Object.assign(HOMEPAGE.hero, rest);
  saveData();
  res.json({ success: true, hero: HOMEPAGE.hero });
});

router.post('/homepage/hero/media', adminAuth, uploadAny.single('media'), (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'Không có file' });
  const isVideo = /mp4|webm|mov/i.test(path.extname(f.originalname));
  const url = `/${isVideo ? 'videos' : 'images'}/${f.filename}`;
  if (isVideo) { HOMEPAGE.hero.video = url; HOMEPAGE.hero.mediaType = 'video'; }
  else { HOMEPAGE.hero.image = url; HOMEPAGE.hero.mediaType = 'image'; }
  saveData();
  res.json({ success: true, url, mediaType: HOMEPAGE.hero.mediaType });
});

router.delete('/homepage/hero/media', adminAuth, (req, res) => {
  HOMEPAGE.hero.image = null;
  HOMEPAGE.hero.video = null;
  HOMEPAGE.hero.mediaType = 'default';
  saveData();
  res.json({ success: true });
});

router.put('/homepage/marquee', adminAuth, (req, res) => {
  Object.assign(HOMEPAGE.marquee, req.body);
  saveData();
  res.json({ success: true, marquee: HOMEPAGE.marquee });
});

router.put('/homepage/banner', adminAuth, (req, res) => {
  Object.assign(HOMEPAGE.banner, req.body);
  saveData();
  res.json({ success: true, banner: HOMEPAGE.banner });
});

router.post('/homepage/banner/media', adminAuth, uploadAny.single('media'), (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'Không có file' });
  const isVideo = /mp4|webm|mov/i.test(path.extname(f.originalname));
  const url = `/${isVideo ? 'videos' : 'images'}/${f.filename}`;
  if (isVideo) { HOMEPAGE.banner.video = url; HOMEPAGE.banner.mediaType = 'video'; }
  else { HOMEPAGE.banner.image = url; HOMEPAGE.banner.mediaType = 'image'; }
  saveData();
  res.json({ success: true, url });
});

router.put('/homepage/about', adminAuth, (req, res) => {
  const { stats, ...rest } = req.body;
  Object.assign(HOMEPAGE.about, rest);
  if (stats) HOMEPAGE.about.stats = typeof stats === 'string' ? JSON.parse(stats) : stats;
  saveData();
  res.json({ success: true, about: HOMEPAGE.about });
});

router.put('/homepage/countdown', adminAuth, (req, res) => {
  Object.assign(HOMEPAGE.countdown, req.body);
  saveData();
  res.json({ success: true, countdown: HOMEPAGE.countdown });
});

// ══════════════════════════════════════════════════════════════════════
// STORES
// ══════════════════════════════════════════════════════════════════════
router.get('/stores', adminAuth, (req, res) => res.json(STORES));

router.post('/stores', adminAuth, (req, res) => {
  const { name, addr, hours, mapUrl } = req.body;
  if (!name || !addr) return res.status(400).json({ error: 'Thiếu name, addr' });
  const newId = STORES.length ? Math.max(...STORES.map(s => s.id)) + 1 : 1;
  const store = { id: newId, name, addr, hours: hours || '', mapUrl: mapUrl || '' };
  STORES.push(store);
  saveData();
  res.status(201).json({ success: true, store });
});

router.put('/stores/:id', adminAuth, (req, res) => {
  const idx = STORES.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  Object.assign(STORES[idx], req.body);
  saveData();
  res.json({ success: true, store: STORES[idx] });
});

router.delete('/stores/:id', adminAuth, (req, res) => {
  const idx = STORES.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  STORES.splice(idx, 1);
  saveData();
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// DISCOUNT CODES
// ══════════════════════════════════════════════════════════════════════
router.get('/discounts', adminAuth, (req, res) => {
  const list = Object.entries(DISCOUNT_CODES).map(([code, val]) => ({ code, ...val }));
  res.json(list);
});

router.post('/discounts', adminAuth, (req, res) => {
  const { code, type, value, desc } = req.body;
  if (!code || !type || value === undefined) return res.status(400).json({ error: 'Thiếu thông tin' });
  DISCOUNT_CODES[code.toUpperCase()] = { type, value: Number(value), desc: desc || '' };
  saveData();
  res.status(201).json({ success: true, code: code.toUpperCase(), ...DISCOUNT_CODES[code.toUpperCase()] });
});

router.put('/discounts/:code', adminAuth, (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!DISCOUNT_CODES[code]) return res.status(404).json({ error: 'Không tìm thấy' });
  const { type, value, desc } = req.body;
  if (type) DISCOUNT_CODES[code].type = type;
  if (value !== undefined) DISCOUNT_CODES[code].value = Number(value);
  if (desc !== undefined) DISCOUNT_CODES[code].desc = desc;
  saveData();
  res.json({ success: true, code, ...DISCOUNT_CODES[code] });
});

router.delete('/discounts/:code', adminAuth, (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!DISCOUNT_CODES[code]) return res.status(404).json({ error: 'Không tìm thấy' });
  delete DISCOUNT_CODES[code];
  saveData();
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════════════
router.get('/orders', adminAuth, (req, res) => {
  const sorted = [...ORDERS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

router.put('/orders/:orderNumber/status', adminAuth, (req, res) => {
  const order = ORDERS.find(o => o.orderNumber === req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  order.status = req.body.status;
  saveData();
  res.json({ success: true, order });
});

router.delete('/orders/:orderNumber', adminAuth, (req, res) => {
  const idx = ORDERS.findIndex(o => o.orderNumber === req.params.orderNumber);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  ORDERS.splice(idx, 1);
  saveData();
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════
router.get('/settings', adminAuth, (req, res) => res.json(SETTINGS));

router.put('/settings', adminAuth, (req, res) => {
  const { social, seo, ...rest } = req.body;
  Object.assign(SETTINGS, rest);
  if (social) Object.assign(SETTINGS.social, typeof social === 'string' ? JSON.parse(social) : social);
  if (seo) Object.assign(SETTINGS.seo, typeof seo === 'string' ? JSON.parse(seo) : seo);
  saveData();
  res.json({ success: true, settings: SETTINGS });
});

// ══════════════════════════════════════════════════════════════════════
// MEDIA LIBRARY
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

module.exports = router;