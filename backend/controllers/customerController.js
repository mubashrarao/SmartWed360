const Venue = require('../models/Venue');
const Category = require('../models/Category');

// @desc    Get all venues with filters
// @route   GET /api/customer/venues
// @access  Public
const getAllVenues = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      minCapacity,
      category,
      search,
      sortBy,
      page = 1,
      limit = 9
    } = req.query;

    console.log('Filters received:', { city, minPrice, maxPrice, minCapacity, category });

    // Build filter object
    const filter = { status: 'active' };

    // City filter
    if (city && city !== '') {
      filter.city = { $regex: city, $options: 'i' };
    }

    // Category filter
    if (category && category !== '') {
      filter.category = category;
    }

    // FIX: Use basePrice instead of price
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice && minPrice !== '') {
        filter.basePrice.$gte = Number(minPrice);
      }
      if (maxPrice && maxPrice !== '') {
        filter.basePrice.$lte = Number(maxPrice);
      }
    }

    // Capacity filter
    if (minCapacity && minCapacity !== '') {
      filter.capacity = { $gte: Number(minCapacity) };
    }
    
    // Search by name or description
    if (search && search !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('MongoDB filter:', JSON.stringify(filter));

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { basePrice: 1 };
        break;
      case 'price_desc':
        sort = { basePrice: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'capacity':
        sort = { capacity: -1 };
        break;
      default:
        sort = { featured: -1, createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const venues = await Venue.find(filter)
      .populate('category', 'name icon color')
      .populate('vendor', 'name phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Venue.countDocuments(filter);

    // Get unique cities for filter dropdown
    const cities = await Venue.distinct('city', { status: 'active' });

    // Get price range for filter (using basePrice)
    const priceRange = await Venue.aggregate([
      { $match: { status: 'active' } },
      { $group: {
        _id: null,
        minPrice: { $min: '$basePrice' },
        maxPrice: { $max: '$basePrice' }
      }}
    ]);

    res.json({
      success: true,
      count: venues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      filters: {
        cities: cities.sort(),
        minPrice: priceRange[0]?.minPrice || 0,
        maxPrice: priceRange[0]?.maxPrice || 1000000
      },
      data: venues
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single venue details
// @route   GET /api/customer/venues/:id
// @access  Public
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findOne({ 
      _id: req.params.id, 
      status: 'active' 
    })
      .populate('category', 'name icon color description')
      .populate('vendor', 'name phone email profileImage');

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Get similar venues (same city or category)
    const similarVenues = await Venue.find({
      _id: { $ne: venue._id },
      status: 'active',
      $or: [
        { city: venue.city },
        { category: venue.category }
      ]
    })
      .populate('category', 'name')
      .limit(4)
      .select('name basePrice capacity city images');

    res.json({
      success: true,
      data: {
        ...venue.toObject(),
        similarVenues
      }
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all active categories
// @route   GET /api/customer/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' })
      .select('name description icon color')
      .sort('name');

    // Get venue count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Venue.countDocuments({ 
          category: category._id, 
          status: 'active' 
        });
        return {
          ...category.toObject(),
          venueCount: count
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search venues with autocomplete
// @route   GET /api/customer/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await Venue.find({
      status: 'active',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(5)
      .select('name city images basePrice');

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check venue availability
// @route   POST /api/customer/venues/:id/check-availability
// @access  Public
const checkAvailability = async (req, res) => {
  try {
    const { date } = req.body;
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Check if date is available
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);
    
    const isAvailable = !venue.availability?.some(
      a => {
        const availDate = new Date(a.date);
        availDate.setHours(0, 0, 0, 0);
        return availDate.getTime() === requestedDate.getTime() && !a.isAvailable;
      }
    );

    res.json({
      success: true,
      data: {
        date: requestedDate,
        isAvailable: isAvailable !== false,
        venue: venue.name
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  getAllCategories,
  getSearchSuggestions,
  checkAvailability
};