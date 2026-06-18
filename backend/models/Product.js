// models/Product.js
const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  hex: String,
  name: String
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  colors: { type: [ColorSchema], default: [] },
  sizes: { type: [String], default: [] },
  soldOutSizes: { type: [String], default: [] },
  badge: { type: String, default: null },
  isNewProduct: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  desc: { type: String, default: '' },
  care: { type: String, default: '' },
  material: { type: String, default: '' },
  images: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);