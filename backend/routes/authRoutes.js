const express = require('express');
const router = express.Router();
const { 
  sendVerificationCode,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/send-verification', sendVerificationCode);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;