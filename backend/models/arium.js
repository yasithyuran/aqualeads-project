const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: String,
  size: Number
});

const ariumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  mainCategory: {
    type: String,
    required: true,
    enum: ['aquarium', 'paludarium', 'terrarium', 'vivarium', 'scenarium', 'pond', 'landscape']
  },
  subCategory: {
    type: String,
    enum: ['marine', 'freshwater', ''],
    default: ''
  },
  subSubCategory: {
    type: String,
    enum: ['biotope', 'planted', 'aquascaping', ''],
    default: ''
  },
  subSubSubCategory: {
    type: String,
    enum: ['zero', 'highm', 'lowm', 'hight', 'lowt', ''],
    default: ''
  },
  type: {
    type: String,
    enum: ['gallery', 'project'],
    default: 'gallery'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  images: [imageSchema]
}, {
  timestamps: true
});

// Create indexes for better query performance
ariumSchema.index({ mainCategory: 1 });
ariumSchema.index({ subCategory: 1 });
ariumSchema.index({ subSubCategory: 1 });
ariumSchema.index({ subSubSubCategory: 1 });
ariumSchema.index({ type: 1 });
ariumSchema.index({ createdAt: -1 });

const Arium = mongoose.model('Arium', ariumSchema);

module.exports = Arium;