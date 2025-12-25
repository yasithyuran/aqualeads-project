const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Arium = require('../models/arium');

const router = express.Router();

// Multer config for multiple images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/ariums');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `arium-${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * CREATE Arium
 */
router.post('/', upload.array('images', 20), async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.title || !data.mainCategory) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path, () => {});
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Title and main category are required' 
      });
    }

    // Validate category hierarchy
    if (data.mainCategory === 'aquarium' && !data.subCategory) {
      if (req.files) {
        req.files.forEach(file => fs.unlink(file.path, () => {}));
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Aquarium type (Marine/Freshwater) is required' 
      });
    }

    if (data.subCategory === 'freshwater' && !data.subSubCategory) {
      if (req.files) {
        req.files.forEach(file => fs.unlink(file.path, () => {}));
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Freshwater type is required' 
      });
    }

    // Process images
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/ariums/${file.filename}`,
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
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, () => {});
      });
    }
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
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => fs.unlink(file.path, () => {}));
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Title and main category are required' 
      });
    }

    const arium = await Arium.findById(req.params.id);
    if (!arium) {
      if (req.files) {
        req.files.forEach(file => fs.unlink(file.path, () => {}));
      }
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
        // Filter out images to delete and remove from filesystem
        arium.images = arium.images.filter(img => {
          if (idsToDelete.includes(img._id.toString())) {
            // Delete file from filesystem
            const filePath = path.join(__dirname, '../uploads/ariums', img.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log('Deleted image:', img.filename);
            }
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
        path: `/uploads/ariums/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      }));
      arium.images.push(...newImages);
    }

    // Validate at least one image remains
    if (!arium.images || arium.images.length === 0) {
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/ariums', file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
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
    // Clean up any newly uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads/ariums', file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
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

    // Delete all associated images
    if (arium.images && arium.images.length > 0) {
      arium.images.forEach(img => {
        const filePath = path.join(__dirname, '../uploads/ariums', img.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Deleted image:', img.filename);
        }
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