const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Accessory = require('../models/accessory');

const router = express.Router();

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
    folder: 'aqualeads-accessories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

/**
 * CREATE Accessory
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.name || !data.category || !data.description) {
      return res.status(400).json({ success: false, message: 'name, category, description are required' });
    }

    if (req.file) {
      data.image = {
        filename: req.file.filename,
        path: req.file.path,  // Cloudinary full URL
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    // Handle boolean fields - only set if provided
    if (data.availability !== undefined && data.availability !== '') {
      data.availability = data.availability === 'true' || data.availability === true;
    } else {
      delete data.availability;
    }

    if (data.featured !== undefined && data.featured !== '') {
      data.featured = data.featured === 'true' || data.featured === true;
    } else {
      delete data.featured;
    }

    // Handle numeric fields - only set if provided and not empty
    if (data.stock === '' || data.stock === undefined) {
      delete data.stock;
    } else {
      data.stock = parseInt(data.stock);
    }

    if (data.price === '' || data.price === undefined) {
      delete data.price;
    } else {
      data.price = parseFloat(data.price);
    }

    // Only include currency if price exists
    if (!data.price) {
      delete data.currency;
    }

    const accessory = await Accessory.create(data);
    res.status(201).json({ success: true, data: accessory });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * READ Accessories (with optional category/subCategory filtering)
 */
router.get('/', async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    const query = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    console.log('Fetching accessories with query:', query);
    const accessories = await Accessory.find(query).sort({ createdAt: -1 });
    console.log(`Found ${accessories.length} accessories`);
    
    res.json(accessories);
  } catch (err) {
    console.error('GET /api/accessories failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET single Accessory by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ success: false, message: 'Accessory not found' });
    }
    res.json({ success: true, data: accessory });
  } catch (err) {
    console.error('GET /api/accessories/:id failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * UPDATE Accessory
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, category, subCategory, description, availability, stock, featured, price, currency, deleteImage } = req.body;

    if (!name || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and description are required' 
      });
    }

    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ success: false, message: 'Accessory not found' });
    }

    // Update text fields
    accessory.name = name.trim();
    accessory.category = category || accessory.category;
    accessory.subCategory = subCategory || '';
    accessory.description = description.trim();

    // Handle availability - only update if provided
    if (availability !== undefined && availability !== '') {
      accessory.availability = availability === 'true' || availability === true;
    } else {
      accessory.availability = undefined;
    }

    // Handle stock - only update if provided
    if (stock !== undefined && stock !== '') {
      accessory.stock = parseInt(stock);
    } else {
      accessory.stock = undefined;
    }

    // Handle featured
    if (featured !== undefined && featured !== '') {
      accessory.featured = featured === 'true' || featured === true;
    } else {
      accessory.featured = undefined;
    }

    // Handle price and currency - only update if price is provided
    if (price !== undefined && price !== '') {
      accessory.price = parseFloat(price);
      accessory.currency = currency || 'LKR';
    } else {
      accessory.price = undefined;
      accessory.currency = undefined;
    }

    // Handle image deletion
    if (deleteImage === 'true' && accessory.image?.path) {
      const urlParts = accessory.image.path.split('/');
      const fileWithExt = urlParts[urlParts.length - 1];
      const publicId = `aqualeads-accessories/${fileWithExt.split('.')[0]}`;
      
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
      accessory.image = undefined;
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (accessory.image?.path) {
        const urlParts = accessory.image.path.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `aqualeads-accessories/${fileWithExt.split('.')[0]}`;
        
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting old image from Cloudinary:', err);
        }
      }

      // Set new image
      accessory.image = {
        filename: req.file.filename,
        path: req.file.path,  // Cloudinary full URL
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    accessory.updatedAt = new Date();

    const updatedAccessory = await accessory.save();
    res.json({ success: true, data: updatedAccessory });
  } catch (err) {
    console.error('PUT /api/accessories/:id failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE Accessory
 */
router.delete('/:id', async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ success: false, message: 'Accessory not found' });
    }

    // Delete associated image from Cloudinary
    if (accessory.image?.path) {
      const urlParts = accessory.image.path.split('/');
      const fileWithExt = urlParts[urlParts.length - 1];
      const publicId = `aqualeads-accessories/${fileWithExt.split('.')[0]}`;
      
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }

    await Accessory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Accessory deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/accessories/:id failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;