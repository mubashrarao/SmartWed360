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
const { 
  enableTwoFactor, 
  verifyTwoFactor, 
  twoFactorLogin,
  disableTwoFactor
} = require('../controllers/twoFactorController');

// Public routes
router.post('/send-verification', sendVerificationCode);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', loginUser);

// ============ 2FA ROUTES ============
router.post('/2fa/login', twoFactorLogin);  

// Protected routes (require login)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/2fa/enable', protect, enableTwoFactor);
router.post('/2fa/verify', protect, verifyTwoFactor);
router.post('/2fa/disable', protect, disableTwoFactor);

module.exports = router;