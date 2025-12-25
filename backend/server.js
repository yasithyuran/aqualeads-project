const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ------------------------
// CORS Configuration
// ------------------------
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ------------------------
// Body parser middleware
// ------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ------------------------
// Serve static uploads
// ------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------------
// Request logging
// ------------------------
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ------------------------
// Routes
// ------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/imex', require('./routes/imex'));
app.use('/api/interiors', require('./routes/interior'));
app.use('/api/products', require('./routes/product'));
app.use('/api/livestock', require('./routes/livestock'));
app.use('/api/accessories', require('./routes/accessory'));
app.use('/api/ariums', require('./routes/ariums'));

// ------------------------
// Health check
// ------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ------------------------
// 404 for APIs
// ------------------------
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
});

// ------------------------
// Global error handler
// ------------------------
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ success: false, message: err.message });
});

// ------------------------
// MongoDB connection (with retry)
// ------------------------
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // 5-second timeout for better error messages
      });
      console.log(`✅ MongoDB connected: ${mongoose.connection.db.databaseName}`);
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('🔄 Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };

  connectWithRetry();
};

connectDB();

// ------------------------
// Mongoose Connection Events
// ------------------------
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
});

// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`📁 Static uploads served from: ${path.join(__dirname, 'uploads')}`);
});
