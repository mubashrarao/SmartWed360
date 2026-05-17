const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendPendingApprovalEmail, 
  sendApprovalEmail         
} = require('../services/emailService');


// Generate random 4-digit PIN
const generatePinCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// ============= REGISTRATION WITH EMAIL VERIFICATION =============

// @desc    Send verification code
// @route   POST /api/auth/send-verification
// @access  Public
const sendVerificationCode = async (req, res) => {
  try {
    const { email, name, password, role, phone } = req.body;

    console.log('Send verification for:', { email, name, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate PIN code
    const pinCode = generatePinCode();

    // Delete any existing verification for this email
    await EmailVerification.deleteMany({ email });

    // Save verification request
    await EmailVerification.create({
      email,
      pinCode,
      userData: { 
        name, 
        email, 
        password, 
        role: role || 'customer', 
        phone: phone || '' 
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Show PIN in console for testing
    console.log('\n' + '='.repeat(50));
    console.log(`📧 VERIFICATION CODE FOR ${email}`);
    console.log(`🔐 YOUR PIN: ${pinCode}`);
    console.log('='.repeat(50) + '\n');

    // Try to send email if configured
    try {
      await sendVerificationEmail(email, pinCode);
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.log('⚠️ Email not configured - PIN shown in console only');
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
};

// @desc    Verify email and complete registration
// @route   POST /api/auth/verify-email
// @access  Public

const verifyEmail = async (req, res) => {
  try {
    const { email, pinCode } = req.body;

    // Find verification record
    const verification = await EmailVerification.findOne({ email, pinCode });
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    const { name, password, role, phone } = verification.userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set status based on role
    let status = 'active';
    if (role === 'vendor') {
      status = 'pending';  // Vendors need admin approval
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      status
    });

    // Delete verification record
    await EmailVerification.deleteOne({ _id: verification._id });

    // Generate token only for active users (not for pending vendors)
    let token = null;
    if (status === 'active') {
      token = generateToken(user._id);
    }

    // Send welcome emails
    try {
      if (role === 'vendor') {
        await sendWelcomeEmail(email, name, role);
        await sendPendingApprovalEmail(email, name);  // Now this will work
        console.log(`✅ Pending approval email sent to ${email}`);
      } else {
        await sendWelcomeEmail(email, name, role);
      }
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: role === 'vendor' 
        ? 'Vendor registered successfully. Please wait for admin approval. You will receive an email once approved.' 
        : 'Registration successful!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await EmailVerification.findOne({ email });
    
    if (!existing) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found'
      });
    }

    const newPinCode = generatePinCode();
    existing.pinCode = newPinCode;
    existing.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await existing.save();

    // Show PIN in console
    console.log('\n' + '='.repeat(50));
    console.log(`📧 NEW VERIFICATION CODE FOR ${email}`);
    console.log(`🔐 YOUR PIN: ${newPinCode}`);
    console.log('='.repeat(50) + '\n');

    try {
      await sendVerificationEmail(email, newPinCode);
    } catch (emailError) {
      console.log('Email not configured - PIN shown in console');
    }

    res.json({
      success: true,
      message: 'New verification code sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend code'
    });
  }
};

// ============= LOGIN =============

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if vendor is approved
    if (user.role === 'vendor' && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is pending approval from admin'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected'
      });
    }

    // ============ CHECK IF 2FA IS ENABLED ============
    if (user.isTwoFactorEnabled) {
      // Return requiresTwoFactor flag instead of token
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: '2FA verification required',
        email: user.email
      });
    }

    // Generate token for users without 2FA
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============= PROFILE =============

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  sendVerificationCode,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  getProfile,
  updateProfile
};