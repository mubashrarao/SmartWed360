const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking'); // 👈 Add this
const { protect, authorize } = require('../middleware/authMiddleware');

// ============= PUBLIC ADMIN ROUTE =============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ 
      email, 
      role: 'admin' 
    }).select('+password');

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

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// All routes below require admin authentication
router.use(protect);
router.use(authorize('admin'));

// ============= DASHBOARD =============
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const pendingVendors = await User.countDocuments({ role: 'vendor', status: 'pending' });
    const activeVendors = await User.countDocuments({ role: 'vendor', status: 'active' });
    
    const recentVendors = await User.find({ role: 'vendor' })
      .select('name email status createdAt')
      .sort('-createdAt')
      .limit(5);

    // Add booking stats
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          vendors: {
            total: totalVendors,
            pending: pendingVendors,
            active: activeVendors
          }
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          approved: approvedBookings
        },
        recentActivity: {
          vendors: recentVendors
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= VENDOR MANAGEMENT =============
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' })
      .select('-password')
      .sort('-createdAt');
      
    res.json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/vendors/pending', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', status: 'pending' })
      .select('-password')
      .sort('-createdAt');
      
    res.json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/vendors/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const vendor = await User.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    
    if (vendor.role !== 'vendor') {
      return res.status(400).json({ success: false, message: 'User is not a vendor' });
    }
    
    vendor.status = status;
    await vendor.save();
    
    res.json({
      success: true,
      message: `Vendor ${status === 'active' ? 'approved' : 'rejected'} successfully`,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= CATEGORY MANAGEMENT =============
router.post('/categories', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category already exists' 
      });
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find().sort('name');
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const Venue = require('../models/Venue');
    
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    const venuesUsingCategory = await Venue.countDocuments({ category: req.params.id });
    
    if (venuesUsingCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category that is being used by venues' 
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============= BOOKING MANAGEMENT - FIXED =============
// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(filter)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .populate({
        path: 'venue',
        select: 'name price city images'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');
      
    const total = await Booking.countDocuments(filter);
    
    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ============= CUSTOMER MANAGEMENT =============
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort('-createdAt');
      
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;