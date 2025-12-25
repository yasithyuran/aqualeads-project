const mongoose = require('mongoose');

const imExSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true, trim: true },
  type: { type: String, enum: ['import', 'export'], default: 'import' },
  images: [{ filename: String, path: String, caption: String }],
  author: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

imExSchema.index({ type: 1 });
imExSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ImEx', imExSchema);
