const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Enable 2FA for user
const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SmartWed360:${user.email}`
    });
    
    // Save secret temporarily
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify and confirm 2FA setup
const verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });
    
    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login with 2FA
const twoFactorLogin = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // If 2FA enabled, verify token
    if (user.isTwoFactorEnabled) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token
      });
      
      if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
      }
    }
    
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.json({
      success: true,
      data: {
        token: authToken,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Disable 2FA
const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();
    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  enableTwoFactor,
  verifyTwoFactor,
  twoFactorLogin,
  disableTwoFactor
};