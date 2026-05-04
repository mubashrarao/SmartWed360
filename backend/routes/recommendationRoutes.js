const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getRecommendations,
  getTopPicks,
  getQuickRecommendations
} = require('../controllers/recommendationController');
const Venue = require('../models/Venue');

// Public routes
router.post('/quick', getQuickRecommendations);

// Protected routes (require customer login)
router.get('/', protect, authorize('customer'), getRecommendations);
router.get('/top-picks', protect, authorize('customer'), getTopPicks);

// For testing - public recommendations without login
router.get('/public', async (req, res) => {
  try {
    const { budget, city, guestCount, limit = 6 } = req.query;
    
    const query = { status: 'active' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (budget) query.basePrice = { $lte: parseInt(budget) };
    if (guestCount) query.capacity = { $gte: parseInt(guestCount) };

    const venues = await Venue.find(query)
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, count: venues.length, data: venues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;