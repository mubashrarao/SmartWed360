const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  completeBooking
} = require('../controllers/bookingController');

// All booking routes are protected
router.use(protect);

// Customer routes
router.post('/', authorize('customer'), createBooking);
router.get('/customer', authorize('customer'), getCustomerBookings);
router.put('/:id/cancel', authorize('customer'), cancelBooking);
router.put('/:id/complete', authorize('customer'), completeBooking);  // Customer can complete

// Vendor routes
router.get('/vendor', authorize('vendor'), getVendorBookings);
router.put('/:id/status', authorize('vendor'), updateBookingStatus);  // Only vendor for approve/reject

// Shared routes
router.get('/stats', authorize('admin', 'vendor'), getBookingStats);
router.get('/:id', getBookingById);

module.exports = router;