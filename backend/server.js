const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

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

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// ✅ CORRECTED 404 handler - NO '*' wildcard
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.url}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});