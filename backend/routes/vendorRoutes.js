const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getVendorStats,
  getVendorVenues,
  getVendorVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  uploadVenueImages,
  getVendorBookings,
  updateBookingStatus,
  getCategories
} = require('../controllers/vendorController');

// All vendor routes require authentication and vendor role
router.use(protect);
router.use(authorize('vendor'));

// Dashboard stats
router.get('/stats', getVendorStats);

// Categories for dropdown
router.get('/categories', getCategories);

// Venue management
router.route('/venues')
  .get(getVendorVenues)
  .post(upload.array('images', 5), createVenue);  // Fixed: use upload here

router.route('/venues/:id')
  .get(getVendorVenue)
  .put(updateVenue)
  .delete(deleteVenue);

// Image upload
router.post('/venues/:id/images', upload.array('images', 5), uploadVenueImages);

// Booking management
router.get('/bookings', getVendorBookings);
router.put('/bookings/:id', updateBookingStatus);

module.exports = router;