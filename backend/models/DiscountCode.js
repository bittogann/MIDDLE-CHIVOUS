// models/DiscountCode.js
const mongoose = require('mongoose');

const DiscountCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true },
  type: { type: String, enum: ['percent', 'fixed', 'freeship'], required: true },
  value: { type: Number, default: 0 },
  desc: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);