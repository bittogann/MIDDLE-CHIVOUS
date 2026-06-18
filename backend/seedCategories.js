// seedCategories.js — chạy 1 lần để nạp category mặc định, không động tới dữ liệu khác
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const defaultCategories = ['Tee', 'Hoodie', 'Pants', 'Accessories'];

  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name });
      console.log(`✓ Đã thêm danh mục: ${name}`);
    } else {
      console.log(`– Danh mục "${name}" đã tồn tại, bỏ qua`);
    }
  }

  console.log('\n🎉 Hoàn tất nạp danh mục!');
  process.exit(0);
}

run().catch(err => {
  console.error('✗ Lỗi:', err);
  process.exit(1);
});