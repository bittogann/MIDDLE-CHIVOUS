// models/SiteContent.js
const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true }, // 'homepage' | 'settings'
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', SiteContentSchema);