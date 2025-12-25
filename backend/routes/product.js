const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'product-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files for products
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed'));
    }
  }
});

// @route POST /api/products - Create new product
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log('POST /api/products - Request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? req.files.length : 0);

    const { name, shortDescription, availability, category, price, currency } = req.body;

    // Validation
    if (!name || !shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Product name and short description are required'
      });
    }

    if (shortDescription.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Short description must be less than 200 characters'
      });
    }

    // Process captions
    let captions = [];
    if (req.body.captions) {
      try {
        captions = JSON.parse(req.body.captions);
      } catch (error) {
        console.log('Failed to parse captions, using empty array');
        captions = [];
      }
    }

    // Process uploaded images
    const images = req.files ? req.files.map((file, index) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      caption: captions[index] || ''
    })) : [];

    console.log('Processed images:', images);

    // Build product object - only required fields
    const productData = {
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      category: category || 'fertilizer',
      images
    };

    // Add price only if provided (both price and currency)
    if (price && price.trim() !== '') {
      productData.price = parseFloat(price);
      productData.currency = currency || 'LKR';
    }

    // Add availability only if provided
    if (availability && availability.trim() !== '') {
      productData.availability = availability;
    }

    console.log('Product data to save:', productData);

    // Create product
    const product = new Product(productData);

    await product.save();

    console.log('Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });

  } catch (error) {
    console.error('Error adding product:', error);
    
    // Clean up uploaded files if creation failed
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add product' 
    });
  }
});

// @route GET /api/products - Get all products with filters
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products - Request received');
    
    const { category, availability, page = 1, limit = 12 } = req.query;

    // Build query
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    console.log(`Found ${products.length} products, page ${page}`);

    res.json({
      success: true,
      data: products,
      pagination: {
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
});

// @route GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product' 
    });
  }
});

// @route PUT /api/products/:id - Update product
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { name, shortDescription, availability, category, price, currency, imagesToDelete } = req.body;
    
    console.log('PUT /api/products/:id - Update request received');
    console.log('Request body:', req.body);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update basic fields
    if (name) product.name = name.trim();
    if (shortDescription) product.shortDescription = shortDescription.trim();
    if (category) product.category = category;

    // Update or remove availability
    if (availability !== undefined) {
      if (availability === '' || availability === null || availability === 'null') {
        // Remove availability if empty string or null
        product.set('availability', undefined, { strict: false });
        product.availability = undefined;
        console.log('Removing availability field');
      } else {
        product.availability = availability;
        console.log('Setting availability to:', availability);
      }
    }

    // Update or remove price
    if (price !== undefined) {
      if (price === '' || price === null || price === 'null') {
        // Remove price and currency if empty
        product.set('price', undefined, { strict: false });
        product.set('currency', undefined, { strict: false });
        product.price = undefined;
        product.currency = undefined;
        console.log('Removing price and currency fields');
      } else {
        product.price = parseFloat(price);
        product.currency = currency || 'LKR';
        console.log('Setting price to:', product.price, product.currency);
      }
    }

    // Handle image deletions
    if (imagesToDelete) {
      const idsToDelete = JSON.parse(imagesToDelete);
      product.images = product.images.filter(img => {
        if (idsToDelete.includes(img._id.toString())) {
          // Delete file from disk
          const filePath = path.join(uploadsDir, img.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return false;
        }
        return true;
      });
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      let captions = [];
      if (req.body.captions) {
        try {
          captions = JSON.parse(req.body.captions);
        } catch (error) {
          captions = [];
        }
      }

      const newImages = req.files.map((file, index) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        caption: captions[index] || ''
      }));

      product.images = [...product.images, ...newImages];
    }

    product.updatedAt = new Date();
    
    // Save with validation disabled for undefined fields
    await product.save({ validateBeforeSave: true });

    console.log('Product updated successfully');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update product' 
    });
  }
});

// @route DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated image files
    product.images.forEach(image => {
      const filePath = path.join(uploadsDir, image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product' 
    });
  }
});

// @route GET /api/products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ category })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments({ category });

    res.json({
      success: true,
      data: products,
      pagination: {
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products by category' 
    });
  }
});

module.exports = router;