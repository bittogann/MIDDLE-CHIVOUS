// seed.js — chạy 1 lần để nạp dữ liệu mẫu vào MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Store = require('./models/Store');
const DiscountCode = require('./models/DiscountCode');
const SiteContent = require('./models/SiteContent');
const Category = require('./models/Category');

const { PRODUCTS, USERS, DISCOUNT_CODES, HOMEPAGE, STORES, SETTINGS } = require('./data/db');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB for seeding');

  // Xoá dữ liệu cũ (nếu có) để tránh trùng lặp khi chạy lại
  await Product.deleteMany({});
  await User.deleteMany({});
  await Store.deleteMany({});
  await DiscountCode.deleteMany({});
  await SiteContent.deleteMany({});
  await Category.deleteMany({});

  // Nạp sản phẩm (đổi tên field isNew -> isNewProduct để tránh xung đột Mongoose)
const productsForDb = PRODUCTS.map(p => {
  const { isNew, ...rest } = p;
  return { ...rest, isNewProduct: isNew };
});
await Product.insertMany(productsForDb);
console.log(`✓ Đã nạp ${productsForDb.length} sản phẩm`);

  // Nạp users (giữ nguyên id, password đã hash sẵn)
  await User.insertMany(USERS);
  console.log(`✓ Đã nạp ${USERS.length} user`);

  // Nạp stores
  await Store.insertMany(STORES);
  console.log(`✓ Đã nạp ${STORES.length} cửa hàng`);

  // Nạp discount codes (chuyển từ object sang array)
  const discountArray = Object.entries(DISCOUNT_CODES).map(([code, val]) => ({ code, ...val }));
  await DiscountCode.insertMany(discountArray);
  console.log(`✓ Đã nạp ${discountArray.length} mã giảm giá`);

  // Nạp homepage và settings vào SiteContent
  await SiteContent.create({ key: 'homepage', data: HOMEPAGE });
  await SiteContent.create({ key: 'settings', data: SETTINGS });
  console.log('✓ Đã nạp homepage & settings');
  // Nạp category mặc định
  const defaultCategories = ['Tee', 'Hoodie', 'Pants', 'Accessories'];
  await Category.insertMany(defaultCategories.map(name => ({ name })));
  console.log(`✓ Đã nạp ${defaultCategories.length} danh mục`);
  console.log('\n🎉 Seed hoàn tất!');
  process.exit(0);
}

seed().catch(err => {
  console.error('✗ Lỗi seed:', err);
  process.exit(1);
});