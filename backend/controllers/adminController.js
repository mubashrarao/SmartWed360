const User = require('../models/User');
const Category = require('../models/Category');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendApprovalEmail } = require('../services/emailService');
const Notification = require('../models/Notification');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });
    
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all pending vendors (UC13 - Approve Vendors)
// @route   GET /api/admin/vendors/pending
// @access  Private/Admin
const getPendingVendors = async (req, res) => {
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
    console.error('Get pending vendors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject vendor (UC13 - Approve Vendors)
// @route   PUT /api/admin/vendors/:id
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await User.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    
    if (vendor.role !== 'vendor') {
      return res.status(400).json({ success: false, message: 'User is not a vendor' });
    }
    
    const previousStatus = vendor.status;
    vendor.status = status;
    await vendor.save();

    console.log(`✅ Vendor ${vendor.name} status updated from ${previousStatus} to: ${status}`);

    // ============ NOTIFICATION 1: Send email to vendor ============
    if (status === 'active') {
      console.log(`📧 Attempting to send approval email to: ${vendor.email}`);
      try {
        await sendApprovalEmail(vendor.email, vendor.name);
        console.log(`✅ Approval email sent successfully to ${vendor.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send approval email:', emailError.message);
      }
    }

    // ============ NOTIFICATION 2: In-app notification to vendor ============
    const Notification = require('../models/Notification');
    
    if (status === 'active') {
      await Notification.create({
        user: vendor._id,
        type: 'vendor_approved',
        title: '🎉 Account Approved!',
        message: `Congratulations ${vendor.name}! Your vendor account has been approved. You can now login and start listing your venues.`,
        data: { vendorId: vendor._id, status: 'active' },
        priority: 'high'
      });
      console.log(`✅ In-app notification sent to vendor: ${vendor.name}`);
    } else if (status === 'rejected') {
      await Notification.create({
        user: vendor._id,
        type: 'vendor_rejected',
        title: 'Account Update',
        message: `Dear ${vendor.name}, your vendor application has been reviewed. Unfortunately, it does not meet our current requirements. Please contact support for more information.`,
        data: { vendorId: vendor._id, status: 'rejected' },
        priority: 'high'
      });
      console.log(`✅ Rejection notification sent to vendor: ${vendor.name}`);
    }

    // ============ NOTIFICATION 3: Notify ALL admins about vendor approval ============
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'vendor_status_change',
        title: status === 'active' ? '✅ Vendor Approved' : '❌ Vendor Rejected',
        message: `${vendor.name} (${vendor.email}) has been ${status === 'active' ? 'approved' : 'rejected'} as a vendor.`,
        data: { 
          vendorId: vendor._id, 
          vendorName: vendor.name, 
          vendorEmail: vendor.email,
          status: status 
        },
        priority: 'medium'
      });
    }
    console.log(`✅ Notification sent to ${admins.length} admin(s) about vendor ${status}`);

    // ============ NOTIFICATION 4: Send email to admin (optional - for record) ============
    if (admins.length > 0 && process.env.ADMIN_EMAIL) {
      try {
        const { sendAdminNotificationEmail } = require('../services/emailService');
        await sendAdminNotificationEmail(
          process.env.ADMIN_EMAIL,
          `Vendor ${status === 'active' ? 'Approved' : 'Rejected'}`,
          `${vendor.name} (${vendor.email}) has been ${status} by ${req.user.name}`
        );
      } catch (emailError) {
        console.log('Admin email notification skipped:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: `Vendor ${status === 'active' ? 'approved' : 'rejected'} successfully`,
      data: vendor
    });
  } catch (error) {
    console.error('Vendor approval error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all vendors (with filters)
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getAllVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'vendor' };
    
    if (status) filter.status = status;
    
    const vendors = await User.find(filter)
      .select('-password')
      .sort('-createdAt');
      
    res.json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
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
    console.error('Get all customers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
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
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = async (req, res) => {
  try {
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
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
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
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
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
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const pendingVendors = await User.countDocuments({ role: 'vendor', status: 'pending' });
    const activeVendors = await User.countDocuments({ role: 'vendor', status: 'active' });
    
    const totalVenues = await Venue.countDocuments();
    const activeVenues = await Venue.countDocuments({ status: 'active' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    const totalCategories = await Category.countDocuments();
    
    const recentVendors = await User.find({ role: 'vendor' })
      .select('name email status createdAt')
      .sort('-createdAt')
      .limit(5);
      
    const recentBookings = await Booking.find()
      .populate('customer', 'name')
      .populate('venue', 'name')
      .sort('-createdAt')
      .limit(5);
    
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
        venues: {
          total: totalVenues,
          active: activeVenues
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          approved: approvedBookings,
          completed: completedBookings
        },
        categories: totalCategories,
        recentActivity: {
          vendors: recentVendors,
          bookings: recentBookings
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
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
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  adminLogin,
  getPendingVendors,
  updateVendorStatus,
  getAllVendors,
  getAllCustomers,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getDashboardStats,
  getAllBookings
};