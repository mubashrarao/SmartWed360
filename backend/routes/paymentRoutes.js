const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  stripeWebhook
} = require('../controllers/paymentController');

// Webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/status/:bookingId', protect, getPaymentStatus);

module.exports = router;