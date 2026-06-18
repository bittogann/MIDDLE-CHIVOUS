// data/db.js — in-memory database (replace with MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const PRODUCTS = [
  {
    id: 1, slug: 'mf-classic-tee', name: 'MF Classic Tee', category: 'Tee',
    price: 350000, oldPrice: null,
    colors: [{ hex: '#111', name: 'Đen' }, { hex: '#fff', name: 'Trắng' }, { hex: '#c8b89a', name: 'Beige' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], soldOutSizes: [], badge: 'New', isNew: true, isSale: false, stock: 50,
    desc: 'Áo tee basic signature của MIDFINGER. Chất cotton 240gsm, form unisex oversize nhẹ, in logo tay trái và back print lớn.',
    care: 'Giặt máy 30°C. Không sấy. Lộn trái khi giặt.', material: '100% Cotton 240gsm', images: []
  },
  {
    id: 2, slug: 'big-kids-hoodie', name: 'Big Kids Hoodie', category: 'Hoodie',
    price: 650000, oldPrice: null,
    colors: [{ hex: '#c8b89a', name: 'Beige' }, { hex: '#111', name: 'Đen' }, { hex: '#6b8e6b', name: 'Olive' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], soldOutSizes: [], badge: 'Drop', isNew: true, isSale: false, stock: 30,
    desc: 'Hoodie SS25 collection "Big Kids". Nỉ bông dày 380gsm, form boxy oversize, cổ đứng.',
    care: 'Giặt tay. Phơi tránh nắng trực tiếp. Không tẩy.', material: '80% Cotton / 20% Polyester 380gsm', images: []
  },
  {
    id: 3, slug: 'circle-logo-tee', name: 'Circle Logo Tee', category: 'Tee',
    price: 320000, oldPrice: 380000,
    colors: [{ hex: '#fff', name: 'Trắng' }, { hex: '#111', name: 'Đen' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], soldOutSizes: [], badge: null, isNew: false, isSale: true, stock: 40,
    desc: 'Áo tee in logo vòng tròn đặc trưng của MIDFINGER.', care: 'Giặt máy 30°C. Không sấy.', material: '100% Cotton 220gsm', images: []
  },
  {
    id: 4, slug: 'mf-cargo-pants', name: 'MF Cargo Pants', category: 'Pants',
    price: 690000, oldPrice: 820000,
    colors: [{ hex: '#111', name: 'Đen' }, { hex: '#6b8e6b', name: 'Olive' }, { hex: '#8b7d7b', name: 'Xám' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], soldOutSizes: [], badge: 'Sale', isNew: false, isSale: true, stock: 25,
    desc: 'Quần cargo 6 túi. Chất kaki dày dặn, ống rộng.', care: 'Giặt máy 30°C. Phơi thẳng.', material: '100% Cotton Kaki 300gsm', images: []
  },
  {
    id: 5, slug: 'mf-bomber-jacket', name: 'MF Bomber Jacket', category: 'Hoodie',
    price: 1200000, oldPrice: null,
    colors: [{ hex: '#111', name: 'Đen' }, { hex: '#2f4f8f', name: 'Navy' }],
    sizes: ['S', 'M', 'L', 'XL'], soldOutSizes: [], badge: 'New', isNew: true, isSale: false, stock: 15,
    desc: 'Bomber jacket với lớp lót quilted ấm.', care: 'Giặt tay. Không sấy. Phơi treo.', material: 'Shell: Polyester. Lining: Nylon quilted', images: []
  },
  {
    id: 6, slug: 'wide-leg-pants', name: 'Wide Leg Pants', category: 'Pants',
    price: 580000, oldPrice: null,
    colors: [{ hex: '#8b7d7b', name: 'Xám' }, { hex: '#111', name: 'Đen' }, { hex: '#c8b89a', name: 'Beige' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], soldOutSizes: [], badge: null, isNew: true, isSale: false, stock: 20,
    desc: 'Quần ống suông rộng cao cấp.', care: 'Giặt máy 30°C. Phơi thẳng.', material: '65% Polyester / 35% Viscose Twill', images: []
  },
  {
    id: 7, slug: 'logo-cap', name: 'Logo Cap', category: 'Accessories',
    price: 250000, oldPrice: null,
    colors: [{ hex: '#111', name: 'Đen' }, { hex: '#fff', name: 'Trắng' }, { hex: '#c8b89a', name: 'Beige' }],
    sizes: ['Free size'], soldOutSizes: [], badge: null, isNew: false, isSale: false, stock: 60,
    desc: 'Mũ 6 panel cấu trúc cứng.', care: 'Giặt tay. Không vắt.', material: '100% Cotton Canvas', images: []
  },
  {
    id: 8, slug: 'crop-tee-ss25', name: 'Crop Tee SS25', category: 'Tee',
    price: 320000, oldPrice: null,
    colors: [{ hex: '#fff', name: 'Trắng' }, { hex: '#c8b89a', name: 'Beige' }, { hex: '#6b8e6b', name: 'Olive' }],
    sizes: ['XS', 'S', 'M', 'L'], soldOutSizes: [], badge: 'New', isNew: true, isSale: false, stock: 35,
    desc: 'Áo croptee cạp cao, tay raglan ngắn.', care: 'Giặt tay lạnh. Không sấy.', material: '100% Cotton Jersey 180gsm', images: []
  }
];

const USERS = [
  {
    id: 'admin-001',
    email: 'admin@midwise.com',
    password: bcrypt.hashSync('dangbaohuy2003', 12),
    firstName: 'Admin',
    lastName: 'Midwise',
    phone: '',
    address: {},
    role: 'admin',
    createdAt: new Date()
  }
];
const ORDERS = [];

const DISCOUNT_CODES = {
  MIDFINGER10: { type: 'percent', value: 10, desc: 'Giảm 10%' },
  FREESHIP: { type: 'freeship', value: 0, desc: 'Miễn phí vận chuyển' },
  NEWKID20: { type: 'percent', value: 20, desc: 'Giảm 20% cho khách mới' }
};

// ── Homepage content ───────────────────────────────────────────────────
const HOMEPAGE = {
  ticker: {
    enabled: true,
    items: [
      'FREE SHIP ĐƠN TỪ 500K',
      'NEW DROP: SS25 "BIG KIDS"',
      'ĐÀ NẴNG',
      'IF WE VIBE, WE VIBE'
    ]
  },
  hero: {
    eyebrow: 'SS25 Collection — The Big Kids',
    title: 'WE ARE\nALL\nTHE BIG\nKIDS',
    subtitle: 'Trong mỗi chúng ta luôn tồn tại một đứa trẻ tự do, tràn đầy năng lượng. MIDFINGER là nơi đánh thức và nuôi dưỡng tinh thần ấy.',
    btnPrimary: 'Shop Now',
    btnSecondary: 'Xem New Drop',
    image: null,    // URL ảnh (null = dùng SVG mặc định)
    video: null,    // URL video
    mediaType: 'default' // 'default' | 'image' | 'video'
  },
  marquee: {
    enabled: true,
    row1: ['IF WE VIBE, WE VIBE', 'STREETWEAR VIETNAM'],
    row2: ['ART — HIP-HOP — FASHION', 'SINCE 2020']
  },
  banner: {
    enabled: false,
    title: 'NEW DROP',
    subtitle: 'SS25 Collection — Có mặt ngay hôm nay',
    btnText: 'Xem ngay',
    btnLink: '/shop',
    image: null,
    video: null,
    mediaType: 'none' // 'none' | 'image' | 'video'
  },
  about: {
    eyebrow: 'Về chúng tôi',
    title: 'Born in\nSaigon.',
    desc: 'MIDFINGER ra đời năm 2020 từ tình yêu với văn hoá hip-hop, skateboarding và nghệ thuật đường phố Sài Gòn.',
    stats: [
      { num: '2020', label: 'Thành lập' },
      { num: '2 Stores', label: 'HCMC' },
      { num: '50+', label: 'Thiết kế mỗi năm' },
      { num: '10K+', label: 'Khách hàng' }
    ]
  },
  countdown: {
    enabled: true,
    title: 'SS25\n"BIG KIDS"\nCollection',
    desc: 'Bộ sưu tập mùa hè 2025 — lấy cảm hứng từ tinh thần tự do không giới hạn.',
    targetDate: new Date(Date.now() + (4 * 24 * 3600 + 8 * 3600 + 45 * 60) * 1000).toISOString()
  }
};

// ── Stores ─────────────────────────────────────────────────────────────
const STORES = [
  {
    id: 1,
    name: 'MIDFINGER — ĐÀ NẴNG',
    addr: 'Địa chỉ tại Đà Nẵng',
    hours: 'T2–T7: 10:00 – 21:00 · CN: 11:00 – 20:00',
    mapUrl: ''
  },
  {
    id: 2,
    name: 'MIDFINGER — Q.1',
    addr: '214 Hai Bà Trưng, P. Đa Kao, Quận 1, HCMC',
    hours: 'T2–CN: 10:00 – 21:30',
    mapUrl: ''
  }
];

// ── Site settings ──────────────────────────────────────────────────────
const SETTINGS = {
  brandName: 'MIDFINGER',
  slogan: 'If we vibe, we vibe',
  footerDesc: 'Streetwear brand sinh ra từ đường phố Sài Gòn. EST. 2020.',
  estYear: '2020',
  social: {
    instagram: '#',
    tiktok: '#',
    facebook: '#'
  },
  seo: {
    title: 'MIDFINGER — Streetwear Vietnam',
    description: 'Streetwear brand sinh ra từ đường phố Sài Gòn. EST. 2020.',
    keywords: 'streetwear, vietnam, midfinger, fashion'
  },
  freeShipThreshold: 500000
};

// Thay dòng module.exports cuối cùng thành:
const fs = require('fs');
const DATA_FILE = __dirname + '/data.json';

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ PRODUCTS, USERS, ORDERS, DISCOUNT_CODES, HOMEPAGE, STORES, SETTINGS }, null, 2));
  } catch(e) {}
}

// Load từ file nếu có
if (fs.existsSync(DATA_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(DATA_FILE));
    if (saved.PRODUCTS) PRODUCTS.splice(0, PRODUCTS.length, ...saved.PRODUCTS);
    if (saved.USERS) USERS.splice(0, USERS.length, ...saved.USERS);
    if (saved.ORDERS) ORDERS.splice(0, ORDERS.length, ...saved.ORDERS);
    if (saved.DISCOUNT_CODES) Object.assign(DISCOUNT_CODES, saved.DISCOUNT_CODES);
    if (saved.HOMEPAGE) Object.assign(HOMEPAGE, saved.HOMEPAGE);
    if (saved.STORES) STORES.splice(0, STORES.length, ...saved.STORES);
    if (saved.SETTINGS) Object.assign(SETTINGS, saved.SETTINGS);
  } catch(e) {}
}

module.exports = { PRODUCTS, USERS, ORDERS, DISCOUNT_CODES, HOMEPAGE, STORES, SETTINGS, saveData };