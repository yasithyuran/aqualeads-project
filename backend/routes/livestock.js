const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const LiveItem = require('../models/LiveItem');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aqualeads-livestock',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// CREATE
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, itemType, subType, price, currency, unit, availability } = req.body;

    // Only name, itemType, and subType are required
    if (!name || !itemType || !subType) {
      return res.status(400).json({ success: false, message: 'name, itemType, and subType are required' });
    }

    const image = req.file
      ? { 
          filename: req.file.filename,
          path: req.file.path  // Cloudinary full URL
        }
      : undefined;

    // Build document object - only include fields that are provided
    const docData = {
      name: name.trim(),
      itemType,
      subType,
      image,
    };

    // Only add pricing fields if price is provided
    if (price && price !== '') {
      docData.price = Number(price);
      docData.currency = currency || 'LKR';
      docData.unit = unit || 'each';
    }

    // Only add availability if it's explicitly provided
    if (availability !== undefined && availability !== '') {
      docData.availability = availability === 'true' || availability === true;
    }

    const doc = await LiveItem.create(docData);

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('Create live item error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// LIST (with filters + pagination)
router.get('/', async (req, res) => {
  try {
    const {
      itemType,
      subType,
      available,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const q = {};
    if (itemType) q.itemType = itemType;
    if (subType) q.subType = subType;
    if (available === 'true') q.availability = true;
    if (available === 'false') q.availability = false;
    if (search) q.name = { $regex: search, $options: 'i' };

    const total = await LiveItem.countDocuments(q);
    const items = await LiveItem.find(q)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        hasPrev: Number(page) > 1,
        hasNext: Number(page) * Number(limit) < total,
      }
    });
  } catch (err) {
    console.error('List live items error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await LiveItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, itemType, subType, price, currency, unit, availability, deleteImage } = req.body;

    // Only name, itemType, and subType are required
    if (!name || !itemType || !subType) {
      return res.status(400).json({ success: false, message: 'name, itemType, and subType are required' });
    }

    const item = await LiveItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update text fields
    item.name = name.trim();
    item.itemType = itemType;
    item.subType = subType;

    // Handle pricing fields - only update if provided, otherwise remove them
    if (price && price !== '') {
      item.price = Number(price);
      item.currency = currency || 'LKR';
      item.unit = unit || 'each';
    } else {
      // Remove pricing fields if price is not provided
      item.price = undefined;
      item.currency = undefined;
      item.unit = undefined;
    }

    // Handle availability - only update if explicitly provided
    if (availability !== undefined && availability !== '') {
      item.availability = availability === 'true' || availability === true;
    } else {
      item.availability = undefined;
    }

    // Handle image deletion
    if (deleteImage === 'true') {
      if (item.image?.filename) {
        // Delete from Cloudinary
        const publicId = item.image.filename.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`aqualeads-livestock/${publicId}`);
        } catch (err) {
          console.error('Error deleting from Cloudinary:', err);
        }
      }
      item.image = undefined;
    }

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary
      if (item.image?.filename) {
        const publicId = item.image.filename.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`aqualeads-livestock/${publicId}`);
        } catch (err) {
          console.error('Error deleting old image from Cloudinary:', err);
        }
      }
      // Add new image
      item.image = {
        filename: req.file.filename,
        path: req.file.path  // Cloudinary full URL
      };
    }

    item.updatedAt = new Date();

    const savedItem = await item.save();
    res.json({ success: true, data: savedItem });
  } catch (err) {
    console.error('Update live item error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await LiveItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    if (item.image?.filename) {
      // Delete from Cloudinary
      const publicId = item.image.filename.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`aqualeads-livestock/${publicId}`);
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }
    
    await LiveItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

module.exports = router;