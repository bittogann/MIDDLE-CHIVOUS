// models/Store.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  addr: { type: String, required: true },
  hours: { type: String, default: '' },
  mapUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Store', StoreSchema);