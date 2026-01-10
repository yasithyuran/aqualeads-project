const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Arium = require('../models/arium');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration for multiple images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aqualeads-ariums',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

/**
 * CREATE Arium
 */
router.post('/', upload.array('images', 20), async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.title || !data.mainCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and main category are required' 
      });
    }

    // Validate category hierarchy
    if (data.mainCategory === 'aquarium' && !data.subCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aquarium type (Marine/Freshwater) is required' 
      });
    }

    if (data.subCategory === 'freshwater' && !data.subSubCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Freshwater type is required' 
      });
    }

    // Process images
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(file => ({
        filename: file.filename,
        path: file.path,  // Cloudinary full URL
        mimetype: file.mimetype,
        size: file.size
      }));
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required' 
      });
    }

    const arium = await Arium.create(data);
    res.status(201).json({ success: true, data: arium });
  } catch (err) {
    console.error('POST /api/ariums error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * READ Ariums (with optional filtering by categories)
 */
router.get('/', async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory, subSubSubCategory, type } = req.query;
    const query = {};
    
    if (mainCategory) query.mainCategory = mainCategory;
    if (subCategory) query.subCategory = subCategory;
    if (subSubCategory) query.subSubCategory = subSubCategory;
    if (subSubSubCategory) query.subSubSubCategory = subSubSubCategory;
    if (type) query.type = type;

    console.log('Fetching ariums with query:', query);
    const ariums = await Arium.find(query).sort({ createdAt: -1 });
    console.log(`Found ${ariums.length} ariums`);
    
    res.json(ariums);
  } catch (err) {
    console.error('GET /api/ariums failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET single Arium by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const arium = await Arium.findById(req.params.id);
    if (!arium) {
      return res.status(404).json({ success: false, message: 'Arium not found' });
    }
    res.json({ success: true, data: arium });
  } catch (err) {
    console.error('GET /api/ariums/:id failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * UPDATE Arium
 */
router.put('/:id', upload.array('images', 20), async (req, res) => {
  try {
    const { title, mainCategory, subCategory, subSubCategory, subSubSubCategory, type, description, imagesToDelete } = req.body;

    if (!title || !mainCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and main category are required' 
      });
    }

    const arium = await Arium.findById(req.params.id);
    if (!arium) {
      return res.status(404).json({ success: false, message: 'Arium not found' });
    }

    // Update text fields
    arium.title = title.trim();
    arium.mainCategory = mainCategory;
    arium.subCategory = subCategory || '';
    arium.subSubCategory = subSubCategory || '';
    arium.subSubSubCategory = subSubSubCategory || '';
    arium.type = type || 'gallery';
    arium.description = description ? description.trim() : '';

    // Handle image deletion
    if (imagesToDelete) {
      let idsToDelete = [];
      try {
        idsToDelete = JSON.parse(imagesToDelete);
      } catch (e) {
        console.error('Failed to parse imagesToDelete:', e);
      }

      if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
        // Filter out images to delete and remove from Cloudinary
        arium.images = arium.images.filter(img => {
          if (idsToDelete.includes(img._id.toString())) {
            // Delete from Cloudinary
            const urlParts = img.path.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const publicId = `aqualeads-ariums/${fileWithExt.split('.')[0]}`;
            
            cloudinary.uploader.destroy(publicId).catch(err => {
              console.error('Error deleting from Cloudinary:', err);
            });
            
            console.log('Deleted image:', img.filename);
            return false; // Remove from array
          }
          return true; // Keep in array
        });
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        path: file.path,  // Cloudinary full URL
        mimetype: file.mimetype,
        size: file.size
      }));
      arium.images.push(...newImages);
    }

    // Validate at least one image remains
    if (!arium.images || arium.images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one image is required' 
      });
    }

    arium.updatedAt = new Date();

    const updatedArium = await arium.save();
    res.json({ success: true, data: updatedArium });
  } catch (err) {
    console.error('PUT /api/ariums/:id failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE Arium
 */
router.delete('/:id', async (req, res) => {
  try {
    const arium = await Arium.findById(req.params.id);
    if (!arium) {
      return res.status(404).json({ success: false, message: 'Arium not found' });
    }

    // Delete all associated images from Cloudinary
    if (arium.images && arium.images.length > 0) {
      arium.images.forEach(img => {
        const urlParts = img.path.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `aqualeads-ariums/${fileWithExt.split('.')[0]}`;
        
        cloudinary.uploader.destroy(publicId).catch(err => {
          console.error('Error deleting from Cloudinary:', err);
        });
        
        console.log('Deleted image:', img.filename);
      });
    }

    await Arium.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Arium deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/ariums/:id failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;