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
const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow but log warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight across-the-board
app.options('*', cors());

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
// Request logging middleware
// ------------------------
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========================
// ROOT ROUTES
// ========================

app.get('/', (req, res) => {
  res.json({
    message: '🐠 AquaLeads API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api/docs',
    health: '/api/health',
    status_check: '/status'
  });
});

app.get('/status', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    api: 'running ✅',
    database: dbStates[mongoose.connection.readyState],
    databaseConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// ========================
// API ROUTES
// ========================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/imex', require('./routes/imex'));
app.use('/api/interiors', require('./routes/interior'));
app.use('/api/products', require('./routes/product'));
app.use('/api/livestock', require('./routes/livestock'));
app.use('/api/accessories', require('./routes/accessory'));
app.use('/api/ariums', require('./routes/ariums'));

// ========================
// ERROR HANDLING
// ========================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found`,
    path: req.originalUrl,
    method: req.method
  });
});

// Catch-all for non-API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: {
      root: '/',
      health: '/api/health',
      status: '/status'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================
// MONGODB CONNECTION
// ========================

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aqualead';

  const connectWithRetry = async (attempt = 1) => {
    try {
      console.log(`🔄 Attempting MongoDB connection (attempt ${attempt})...`);
      
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority'
      });

      console.log(`✅ MongoDB connected successfully`);
      console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
      console.log(`🗄️  Collections: ${await mongoose.connection.db?.listCollections().toArray()}`);
    } catch (err) {
      console.error(`❌ MongoDB connection error (attempt ${attempt}):`, err.message);
      
      if (attempt < 5) {
        const retryDelay = Math.min(5000 * attempt, 30000); // Max 30 seconds
        console.log(`🔄 Retrying in ${retryDelay / 1000} seconds...`);
        setTimeout(() => connectWithRetry(attempt + 1), retryDelay);
      } else {
        console.error('❌ Failed to connect to MongoDB after 5 attempts');
        console.error('⚠️  Server running in degraded mode without database');
      }
    }
  };

  connectWithRetry();
};

// Start database connection
connectDB();

// Mongoose Connection Events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 AquaLeads API Server Started');
  console.log('='.repeat(60));
  console.log(`📍 Server: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`📁 Uploads: ${path.join(__dirname, 'uploads')}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}`);
  console.log('='.repeat(60) + '\n');
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

module.exports = app;