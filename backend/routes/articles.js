const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Article = require('../models/Article');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// CREATE article
router.post('/', upload.fields([{ name: 'frontPic', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const { title, shortDescription, mainDescription, category, frontPicCaption, captions, urls } = req.body;
    if (!title || !shortDescription || !mainDescription)
      return res.status(400).json({ success: false, message: 'Title, short and main descriptions are required' });

    let frontPic = null;
    if (req.files && req.files.frontPic && req.files.frontPic[0]) {
      const file = req.files.frontPic[0];
      frontPic = { filename: file.filename, path: file.path, caption: frontPicCaption || '' };
    }

    const images = [];
    if (req.files && req.files.images) {
      const captionsArray = captions ? JSON.parse(captions) : [];
      req.files.images.forEach((file, i) => {
        images.push({ filename: file.filename, path: file.path, caption: captionsArray[i] || '' });
      });
    }

    let urlsArray = [];
    if (urls) {
      try { urlsArray = JSON.parse(urls).filter(u => u.link && u.link.trim() !== ''); } 
      catch (err) { console.error(err); }
    }

    const article = new Article({ title, shortDescription, mainDescription, category, frontPic, images, urls: urlsArray });
    const saved = await article.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    if (req.files) {
      if (req.files.frontPic) req.files.frontPic.forEach(f => fs.unlink(f.path, () => {}));
      if (req.files.images) req.files.images.forEach(f => fs.unlink(f.path, () => {}));
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all articles (for admin management)
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET articles by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const total = await Article.countDocuments({ category });
    const articles = await Article.find({ category }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

    res.json({
      success: true,
      data: articles,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasPrev: page > 1,
        hasNext: page * limit < total
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET single article
router.get('/single/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update article (with image deletion support)
router.put('/:id', upload.fields([{ name: 'frontPic', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const { title, shortDescription, mainDescription, category, frontPicCaption, captions, deleteFrontPic, imagesToDelete } = req.body;
    
    if (!title || !shortDescription || !mainDescription) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, short and main descriptions are required' 
      });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Update text fields
    article.title = title;
    article.shortDescription = shortDescription;
    article.mainDescription = mainDescription;
    article.category = category;

    // Handle front pic deletion
    if (deleteFrontPic === 'true') {
      if (article.frontPic && article.frontPic.path) {
        fs.unlink(article.frontPic.path, (err) => {
          if (err) console.error('Error deleting front pic:', err);
        });
      }
      article.frontPic = null;
    }

    // Update front pic if new one uploaded
    if (req.files && req.files.frontPic && req.files.frontPic[0]) {
      // Delete old front pic
      if (article.frontPic && article.frontPic.path) {
        fs.unlink(article.frontPic.path, () => {});
      }
      
      const file = req.files.frontPic[0];
      article.frontPic = { 
        filename: file.filename, 
        path: file.path, 
        caption: frontPicCaption || '' 
      };
    }

    // Handle additional images deletion
    if (imagesToDelete) {
      const idsToDelete = JSON.parse(imagesToDelete);
      article.images = article.images.filter(img => {
        if (idsToDelete.includes(img._id.toString())) {
          // Delete file from disk
          if (img.path) {
            fs.unlink(img.path, (err) => {
              if (err) console.error('Error deleting image:', err);
            });
          }
          return false;
        }
        return true;
      });
    }

    // Add new additional images if uploaded
    if (req.files && req.files.images && req.files.images.length > 0) {
      const captionsArray = captions ? JSON.parse(captions) : [];
      req.files.images.forEach((file, i) => {
        article.images.push({ 
          filename: file.filename, 
          path: file.path, 
          caption: captionsArray[i] || '' 
        });
      });
    }

    article.updatedAt = new Date();

    const updatedArticle = await article.save();
    res.json({ success: true, data: updatedArticle });
  } catch (err) {
    console.error(err);
    if (req.files) {
      if (req.files.frontPic) req.files.frontPic.forEach(f => fs.unlink(f.path, () => {}));
      if (req.files.images) req.files.images.forEach(f => fs.unlink(f.path, () => {}));
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE article
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    
    // Delete front pic
    if (article.frontPic && article.frontPic.path) {
      fs.unlink(article.frontPic.path, (err) => {
        if (err) console.error('Error deleting front pic:', err);
      });
    }
    
    // Delete all additional images
    if (article.images && article.images.length > 0) {
      article.images.forEach(img => {
        if (img.path) {
          fs.unlink(img.path, (err) => {
            if (err) console.error('Error deleting image:', err);
          });
        }
      });
    }
    
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ success: false, message: err.message }); 
  }
});

module.exports = router;