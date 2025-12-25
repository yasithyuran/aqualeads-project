const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['hardscape', 'lights', 'filters', 'equipments']
  },
  subCategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  availability: {
    type: Boolean,
    default: undefined
  },
  stock: {
    type: Number,
    default: undefined
  },
  featured: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: undefined
  },
  currency: {
    type: String,
    default: undefined
  },
  unit: {
    type: String
  },
  brand: {
    type: String
  },
  specifications: {
    flowRate: String,
    powerConsumption: String,
    dimensions: String,
    weight: String
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
accessorySchema.index({ category: 1 });
accessorySchema.index({ subCategory: 1 });
accessorySchema.index({ featured: 1 });
accessorySchema.index({ availability: 1 });

const Accessory = mongoose.model('Accessory', accessorySchema);

module.exports = Accessory;