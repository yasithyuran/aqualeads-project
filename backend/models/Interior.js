const mongoose = require('mongoose');

const interiorSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  budget: { type: String, trim: true, default: '' },
  shortDescription: { type: String, required: true, trim: true },
  images: [{ filename: String, path: String, caption: String }],
  author: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
interiorSchema.index({ createdAt: -1 });
interiorSchema.index({ title: 'text', location: 'text', shortDescription: 'text' });

module.exports = mongoose.model('Interior', interiorSchema);
