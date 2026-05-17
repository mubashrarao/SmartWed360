const Venue = require('../models/Venue');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Notification = require('../models/Notification');

// @desc    Get vendor dashboard stats
const getVendorStats = async (req, res) => {
  try {
    const totalVenues = await Venue.countDocuments({ vendor: req.user.id });
    const activeVenues = await Venue.countDocuments({ vendor: req.user.id, status: 'active' });
    
    const totalBookings = await Booking.countDocuments({ vendor: req.user.id });
    const pendingBookings = await Booking.countDocuments({ 
      vendor: req.user.id, 
      status: 'pending' 
    });
    const waitingPaymentBookings = await Booking.countDocuments({ 
      vendor: req.user.id, 
      status: 'waiting_payment' 
    });
    const approvedBookings = await Booking.countDocuments({ 
      vendor: req.user.id, 
      status: 'approved' 
    });

    res.json({
      success: true,
      data: {
        totalVenues,
        activeVenues,
        totalBookings,
        pendingBookings,
        waitingPaymentBookings,
        approvedBookings
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all venues for vendor
const getVendorVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ vendor: req.user.id })
      .populate('category', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    console.error('Get vendor venues error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single venue
const getVendorVenue = async (req, res) => {
  try {
    const venue = await Venue.findOne({ 
      _id: req.params.id, 
      vendor: req.user.id 
    }).populate('category', 'name');

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    res.json({ success: true, data: venue });
  } catch (error) {
    console.error('Get vendor venue error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new venue
const createVenue = async (req, res) => {
  try {
    const { name, description, category, price, capacity, city, address, contactPhone, contactEmail, amenities } = req.body;
    
    const vendor = await User.findById(req.user.id);
    if (vendor.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is not approved yet' 
      });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    let amenitiesArray = amenities;
    if (typeof amenities === 'string') {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch (e) {
        amenitiesArray = amenities ? [amenities] : [];
      }
    }

    const venue = await Venue.create({
      vendor: req.user.id,
      name,
      description,
      category,
      price: Number(price),
      capacity: Number(capacity),
      city,
      address,
      contactPhone,
      contactEmail,
      amenities: amenitiesArray || [],
      images
    });

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      data: venue
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update venue
const updateVenue = async (req, res) => {
  try {
    let venue = await Venue.findOne({ 
      _id: req.params.id, 
      vendor: req.user.id 
    });

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    venue = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Venue updated successfully', data: venue });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete venue
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findOne({ 
      _id: req.params.id, 
      vendor: req.user.id 
    });

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    await venue.deleteOne();
    res.json({ success: true, message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload venue images (FIXED - added this function)
const uploadVenueImages = async (req, res) => {
  try {
    const venue = await Venue.findOne({ 
      _id: req.params.id, 
      vendor: req.user.id 
    });

    if (!venue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Venue not found' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload at least one image' 
      });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    venue.images = [...venue.images, ...images];
    await venue.save();

    res.json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      data: venue
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get vendor bookings
const getVendorBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { vendor: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('venue', 'name price capacity city images')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    const stats = {
      pending: await Booking.countDocuments({ vendor: req.user.id, status: 'pending' }),
      waiting_payment: await Booking.countDocuments({ vendor: req.user.id, status: 'waiting_payment' }),
      approved: await Booking.countDocuments({ vendor: req.user.id, status: 'approved' }),
      completed: await Booking.countDocuments({ vendor: req.user.id, status: 'completed' }),
      total: bookings.length
    };

    res.json({
      success: true,
      count: bookings.length,
      total,
      stats,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update booking status (Vendor)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, vendorNotes } = req.body;
    
    console.log('Updating booking:', req.params.id, 'to status:', status);
    
    const booking = await Booking.findById(req.params.id)
      .populate('customer')
      .populate('venue')
      .populate('vendor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is the vendor
    if (booking.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Determine final status
    let finalStatus = status;
    if (status === 'approved') {
      finalStatus = 'waiting_payment';
    }

    // Update booking
    booking.status = finalStatus;
    if (vendorNotes) booking.vendorNotes = vendorNotes;
    await booking.save();

    console.log('Booking updated successfully to:', finalStatus);

    res.json({ 
      success: true, 
      message: status === 'approved' ? 'Booking approved. Waiting for customer payment.' : `Booking ${status}`,
      data: booking 
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get categories for dropdown
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getVendorStats,
  getVendorVenues,
  getVendorVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  uploadVenueImages,  
  getVendorBookings,
  updateBookingStatus,
  getCategories
};