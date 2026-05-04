const Venue = require('../models/Venue');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Category = require('../models/Category');

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
    const { 
      name, description, category, basePrice, capacity, city, 
      address, contactPhone, contactEmail, amenities, eventTypes, facilities 
    } = req.body;
    
    // Check if vendor is approved
    const vendor = await User.findById(req.user.id);
    if (vendor.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is not approved yet' 
      });
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    // Parse arrays if they come as strings
    let amenitiesArray = amenities;
    let eventTypesArray = eventTypes;
    let facilitiesArray = facilities;
    
    if (typeof amenities === 'string') {
      try {
        amenitiesArray = JSON.parse(amenities);
      } catch (e) {
        amenitiesArray = amenities ? [amenities] : [];
      }
    }
    
    if (typeof eventTypes === 'string') {
      try {
        eventTypesArray = JSON.parse(eventTypes);
      } catch (e) {
        eventTypesArray = [];
      }
    }
    
    if (typeof facilities === 'string') {
      try {
        facilitiesArray = JSON.parse(facilities);
      } catch (e) {
        facilitiesArray = [];
      }
    }

    const venueData = {
      vendor: req.user.id,
      name,
      description,
      category,
      capacity: Number(capacity),
      city,
      address,
      contactPhone,
      contactEmail: contactEmail || '',
      amenities: amenitiesArray || [],
      images,
      eventTypes: eventTypesArray || [],
      facilities: facilitiesArray || []
    };
    
    // Only add basePrice if provided
    if (basePrice) {
      venueData.basePrice = Number(basePrice);
    }

    const venue = await Venue.create(venueData);

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      data: venue
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message,
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

// @desc    Upload venue images
const uploadVenueImages = async (req, res) => {
  try {
    const venue = await Venue.findOne({ 
      _id: req.params.id, 
      vendor: req.user.id 
    });

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get vendor bookings
const getVendorBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { vendor: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('venue', 'name price capacity city images')
      .sort('-createdAt');

    const pendingCount = await Booking.countDocuments({ vendor: req.user.id, status: 'pending' });
    const approvedCount = await Booking.countDocuments({ vendor: req.user.id, status: 'approved' });
    const completedCount = await Booking.countDocuments({ vendor: req.user.id, status: 'completed' });

    res.json({
      success: true,
      count: bookings.length,
      stats: { pending: pendingCount, approved: approvedCount, completed: completedCount, total: bookings.length },
      data: bookings
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { status, vendorNotes } = req.body;
    
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      vendor: req.user.id 
    }).populate('customer').populate('venue');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const validTransitions = {
      'pending': ['approved', 'rejected'],
      'approved': ['completed', 'cancelled'],
      'rejected': [],
      'cancelled': [],
      'completed': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    if (vendorNotes) booking.vendorNotes = vendorNotes;
    await booking.save();

    res.json({ success: true, message: `Booking ${status} successfully`, data: booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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