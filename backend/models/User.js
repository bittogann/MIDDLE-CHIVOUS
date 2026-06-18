// models/User.js
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  addr: String,
  city: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: AddressSchema, default: {} },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);