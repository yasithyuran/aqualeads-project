const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ImEx = require('../models/ImEx');

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
    folder: 'aqualeads-imex',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

// CREATE ImEx post
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, shortDescription, type, captions } = req.body;
    if (!title || !shortDescription)
      return res.status(400).json({ success: false, message: 'Title and description required' });

    const images = [];
    const captionsArray = captions ? JSON.parse(captions) : [];

    req.files?.forEach((file, i) => {
      images.push({
        filename: file.filename,
        path: file.path,  // Cloudinary full URL
        caption: captionsArray[i] || ''
      });
    });

    const newPost = await ImEx.create({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      type: type || 'import',
      images,
      author: 'Admin'
    });

    res.status(201).json({ success: true, message: 'Post created', data: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create post', error: err.message });
  }
});

// GET all ImEx posts (for admin management)
router.get('/all', async (req, res) => {
  try {
    const posts = await ImEx.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET list with pagination (for public view)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const type = req.query.type;

    const query = {};
    if (type && ['import', 'export'].includes(type)) query.type = type;

    const total = await ImEx.countDocuments(query);
    const posts = await ImEx.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: posts,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasPrev: page > 1,
        hasNext: page * limit < total,
        total
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts', error: err.message });
  }
});

// GET single ImEx post
router.get('/single/:id', async (req, res) => {
  try {
    const post = await ImEx.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE ImEx post (with image deletion support)
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { title, shortDescription, type, imagesToDelete, captions } = req.body;
    
    if (!title || !shortDescription) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and description are required' 
      });
    }

    const post = await ImEx.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Update text fields
    post.title = title.trim();
    post.shortDescription = shortDescription.trim();
    post.type = type || post.type;

    // Handle image deletions
    if (imagesToDelete) {
      const idsToDelete = JSON.parse(imagesToDelete);
      post.images = post.images.filter(img => {
        if (idsToDelete.includes(img._id.toString())) {
          // Delete from Cloudinary
          const urlParts = img.path.split('/');
          const fileWithExt = urlParts[urlParts.length - 1];
          const publicId = `aqualeads-imex/${fileWithExt.split('.')[0]}`;
          
          cloudinary.uploader.destroy(publicId).catch(err => {
            console.error('Error deleting from Cloudinary:', err);
          });
          
          return false;
        }
        return true;
      });
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const captionsArray = captions ? JSON.parse(captions) : [];
      req.files.forEach((file, i) => {
        post.images.push({
          filename: file.filename,
          path: file.path,  // Cloudinary full URL
          caption: captionsArray[i] || ''
        });
      });
    }

    post.updatedAt = new Date();

    const updatedPost = await post.save();
    res.json({ success: true, data: updatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE ImEx post
router.delete('/:id', async (req, res) => {
  try {
    const post = await ImEx.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    // Delete associated images from Cloudinary
    if (post.images && post.images.length > 0) {
      post.images.forEach(img => {
        const urlParts = img.path.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `aqualeads-imex/${fileWithExt.split('.')[0]}`;
        
        cloudinary.uploader.destroy(publicId).catch(err => {
          console.error('Error deleting from Cloudinary:', err);
        });
      });
    }
    
    await ImEx.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;