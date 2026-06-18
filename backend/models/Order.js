// models/Order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  price: Number,
  size: String,
  color: String,
  qty: Number,
  image: String
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  city: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  userId: { type: String, default: null },
  customer: { type: CustomerSchema, required: true },
  items: { type: [OrderItemSchema], default: [] },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], default: 'pending' },
  discountCode: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);