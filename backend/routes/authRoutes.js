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

// ============ 2FA ROUTES (Commented out until controller is complete) ============
// Uncomment these when twoFactorController.js is fully implemented
// const { 
//   enableTwoFactor, 
//   verifyTwoFactor, 
//   twoFactorLogin 
// } = require('../controllers/twoFactorController');
// router.post('/2fa/enable', protect, enableTwoFactor);
// router.post('/2fa/verify', protect, verifyTwoFactor);
// router.post('/2fa/login', twoFactorLogin);

module.exports = router;