const recommendationService = require('../services/recommendationService');

// @desc    Get personalized recommendations
// @route   GET /api/recommendations
// @access  Private (Customer)
const getRecommendations = async (req, res) => {
  try {
    const {
      eventType,
      timeSlot,
      budget,
      city,
      guestCount,
      facilities,
      limit
    } = req.query;

    const preferences = {
      eventType: eventType || null,
      timeSlot: timeSlot || null,
      budget: budget ? parseInt(budget) : null,
      city: city || null,
      guestCount: guestCount ? parseInt(guestCount) : null,
      requiredFacilities: facilities ? facilities.split(',') : null,
      limit: limit ? parseInt(limit) : 6
    };

    console.log('Recommendation request:', preferences);

    const recommendations = await recommendationService.getRecommendations(
      req.user.id,
      preferences
    );

    res.json({
      success: true,
      ...recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get top picks for customer
// @route   GET /api/recommendations/top-picks
// @access  Private (Customer)
const getTopPicks = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const topPicks = await recommendationService.getTopPicks(
      req.user.id,
      limit ? parseInt(limit) : 4
    );

    res.json({
      success: true,
      ...topPicks
    });
  } catch (error) {
    console.error('Get top picks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get quick recommendations based on simple input
// @route   POST /api/recommendations/quick
// @access  Public
const getQuickRecommendations = async (req, res) => {
  try {
    const { budget, city, guestCount, eventType, timeSlot } = req.body;

    const query = {
      status: 'active',
      capacity: { $gte: parseInt(guestCount) || 0 }
    };
    
    if (city) query.city = { $regex: city, $options: 'i' };
    if (budget) query.basePrice = { $lte: parseInt(budget) };

    const venues = await Venue.find(query)
      .populate('category', 'name')
      .limit(10)
      .lean();

    // Calculate match scores
    const recommendations = venues.map(venue => {
      let matchScore = 50; // Base score
      let reasons = [];

      // Budget match
      if (budget && venue.basePrice) {
        const budgetRatio = venue.basePrice / budget;
        if (budgetRatio <= 0.8) {
          matchScore += 20;
          reasons.push('Excellent budget fit');
        } else if (budgetRatio <= 1) {
          matchScore += 15;
          reasons.push('Within budget');
        } else if (budgetRatio <= 1.2) {
          matchScore += 5;
          reasons.push('Slightly above budget');
        }
      }

      // Capacity match
      if (guestCount) {
        if (venue.capacity >= guestCount) {
          matchScore += 15;
          reasons.push('Can accommodate your guests');
        }
      }

      // Event type match
      if (eventType && venue.eventTypes) {
        const hasEventType = venue.eventTypes.some(et => et.type === eventType);
        if (hasEventType) {
          matchScore += 15;
          reasons.push(`Supports ${eventType}`);
        }
      }

      return {
        ...venue,
        matchScore: Math.min(100, matchScore),
        matchReason: reasons.join(', ') || 'Good match',
        recommendationReasons: reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('Get quick recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations,
  getTopPicks,
  getQuickRecommendations
};