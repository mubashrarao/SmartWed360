const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy (for Render/Heroku deployment)
app.set('trust proxy', 1);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://smartwed360.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all in production temporarily
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ==================== API ROUTES ====================
// PUBLIC ROUTES - No authentication required
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/venues', require('./routes/venuePublicRoutes'));

// PROTECTED ROUTES - Authentication required
app.use('/api/admin', require('./routes/adminRoutes'));      // Admin only
app.use('/api/vendor', require('./routes/vendorRoutes'));    // Vendor only
app.use('/api/customer', require('./routes/customerRoutes')); // Customer only
app.use('/api/bookings', require('./routes/bookingRoutes'));  // All authenticated users
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== PRODUCTION STATIC FILE SERVING ====================
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend app
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDistPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Skip API routes that weren't caught above
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.path}`
      });
    }
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
} else {
  // Development - 404 handler for non-API routes
  app.use((req, res) => {
    if (!req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: `Cannot find ${req.method} ${req.url}`
      });
    }
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.path}`
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Error: ${err.message}`);
  process.exit(1);
});