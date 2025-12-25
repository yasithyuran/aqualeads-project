const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    filename: String,
    path: String,
    caption: String
  }],
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  price: {
    type: Number,
    min: 0
    // Optional field - no 'required' property
  },
  currency: {
    type: String,
    enum: ['LKR', 'USD', 'EUR', 'GBP']
    // Optional field - removed default value
  },
  availability: {
    type: String,
    enum: ['IN STOCK', 'OUT OF STOCK', 'LIMITED']
    // Optional field - removed default value
  },
  category: {
    type: String,
    enum: ['fertilizer', 'animal_food', 'equipment', 'medicine', 'terrarium', 'other'],
    default: 'fertilizer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);