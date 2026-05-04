const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const Category = require('../models/Category');

// @desc    Get all venues (public - no login required)
// @route   GET /api/venues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, capacity, page = 1, limit = 9 } = req.query;
    
    const filter = { status: 'active' };
    
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const venues = await Venue.find(filter)
      .populate('category', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');
      
    const total = await Venue.countDocuments(filter);
    
    res.json({
      success: true,
      count: venues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: venues
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single venue (public)
// @route   GET /api/venues/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOne({ _id: req.params.id, status: 'active' })
      .populate('category', 'name')
      .populate('vendor', 'name phone email');
      
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    
    res.json({ success: true, data: venue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;