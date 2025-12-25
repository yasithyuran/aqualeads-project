const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  mainDescription: { type: String, required: true },
  category: { type: String, enum: ['education', 'conservation', 'ariums'], default: 'education' },
  frontPic: {
    filename: String,
    path: String,
    caption: String
  },
  images: [
    {
      filename: String,
      path: String,
      caption: String
    }
  ],
  urls: [
    {
      title: String,
      link: String,
      description: String
    }
  ],
  author: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);