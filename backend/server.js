// server.js — MIDFINGER Backend API
// server.js — MIDFINGER Backend API
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security & Middleware ──────────────────────────────────────────────
// app.use(helmet({...}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Embedder-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth requests' });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── Routes ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use(express.static(require('path').join(__dirname, 'public')));
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/misc'));
// Public routes — không cần auth
app.get('/api/homepage', async (req, res) => {
  const SiteContent = require('./models/SiteContent');
  const doc = await SiteContent.findOne({ key: 'homepage' });
  res.json(doc?.data || {});
});
app.get('/api/settings', async (req, res) => {
  const SiteContent = require('./models/SiteContent');
  const doc = await SiteContent.findOne({ key: 'settings' });
  res.json(doc?.data || {});
});
app.get('/api/stores', async (req, res) => {
  const Store = require('./models/Store');
  const stores = await Store.find().sort({ id: 1 });
  res.json(stores);
});
app.use('/api/admin', require('./routes/admin'));
app.use('/images', express.static(require('path').join(__dirname, 'public/images')));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const { WebSocketServer } = require('ws')

const server = app.listen(PORT, () => {
  console.log(`\n🔥 MIDWISE API running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/products | /api/auth | /api/orders\n`);
});

const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('🔌 Admin connected via WebSocket')
  ws.on('close', () => console.log('🔌 Admin disconnected'))
})

global.notifyAdmins = (event, data) => {
  const msg = JSON.stringify({ event, data, time: new Date() })
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg)
  })
}
