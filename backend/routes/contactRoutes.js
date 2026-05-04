const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  submitContactForm,
  getContactMessages,
  updateMessageStatus
} = require('../controllers/contactController');

// Public route - anyone can submit contact form
router.post('/', submitContactForm);

// Admin only routes
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id', protect, authorize('admin'), updateMessageStatus);

module.exports = router;