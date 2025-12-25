const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Interior = require('../models/Interior');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `interior-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

// CREATE interior
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, location, budget, shortDescription, imageCaptions } = req.body;

    if (!title || !location || !shortDescription) {
      return res.status(400).json({ success: false, message: 'Title, location, and short description are required' });
    }

    let captionsArray = [];
    if (imageCaptions) {
      if (Array.isArray(imageCaptions)) captionsArray = imageCaptions;
      else if (typeof imageCaptions === 'string') {
        try { captionsArray = JSON.parse(imageCaptions); } 
        catch { captionsArray = [imageCaptions]; }
      }
    }

    const images = req.files?.map((file, index) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      caption: captionsArray[index] || ''
    })) || [];

    const newInterior = await Interior.create({
      title: title.trim(),
      location: location.trim(),
      budget: budget ? budget.trim() : '',
      shortDescription: shortDescription.trim(),
      images,
      author: 'Admin'
    });

    res.status(201).json({ success: true, message: 'Interior created successfully', data: newInterior });
  } catch (err) {
    console.error('Error creating interior:', err);
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    res.status(500).json({ success: false, message: 'Failed to create interior', error: err.message });
  }
});

// GET all interiors (admin)
router.get('/all', async (req, res) => {
  try {
    const interiors = await Interior.find().sort({ createdAt: -1 });
    res.json({ success: true, interiors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET paginated interiors (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await Interior.countDocuments();
    const interiors = await Interior.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      success: true,
      data: interiors,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasPrev: page > 1,
        hasNext: page * limit < total,
        total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single interior by ID
router.get('/single/:id', async (req, res) => {
  try {
    const interior = await Interior.findById(req.params.id);
    if (!interior) return res.status(404).json({ success: false, message: 'Interior not found' });
    res.json({ success: true, data: interior });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE interior (with proper image deletion support)
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const interior = await Interior.findById(req.params.id);
    if (!interior) return res.status(404).json({ success: false, message: 'Interior not found' });

    const { title, location, budget, shortDescription, imagesToDelete, captions } = req.body;

    if (!title || !location || !shortDescription) {
      return res.status(400).json({ success: false, message: 'Title, location, and description are required' });
    }

    // Update text fields
    interior.title = title.trim();
    interior.location = location.trim();
    interior.budget = budget ? budget.trim() : '';
    interior.shortDescription = shortDescription.trim();

    // Handle image deletions
    if (imagesToDelete) {
      const idsToDelete = JSON.parse(imagesToDelete);
      interior.images = interior.images.filter(img => {
        if (idsToDelete.includes(img._id.toString())) {
          // Delete file from disk
          const filePath = path.join(__dirname, '../uploads', img.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return false;
        }
        return true;
      });
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const captionsArray = captions ? JSON.parse(captions) : [];
      req.files.forEach((file, i) => {
        interior.images.push({
          filename: file.filename,
          path: `/uploads/${file.filename}`,
          caption: captionsArray[i] || ''
        });
      });
    }

    interior.updatedAt = new Date();

    const savedInterior = await interior.save();
    res.json({ success: true, data: savedInterior });
  } catch (err) {
    console.error('Error updating interior:', err);
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    res.status(500).json({ success: false, message: 'Failed to update interior', error: err.message });
  }
});

// DELETE interior
router.delete('/:id', async (req, res) => {
  try {
    const interior = await Interior.findById(req.params.id);
    if (!interior) return res.status(404).json({ success: false, message: 'Interior not found' });

    interior.images.forEach(img => {
      const filePath = path.join(__dirname, '../uploads', img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Interior.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interior deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;