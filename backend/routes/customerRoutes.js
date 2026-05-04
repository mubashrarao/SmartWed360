const express = require('express');
const router = express.Router();
const {
  getAllVenues,
  getVenueById,
  getAllCategories,
  getSearchSuggestions,
  checkAvailability
} = require('../controllers/customerController');

// Public routes (no authentication required)
router.get('/venues', getAllVenues);
router.get('/venues/:id', getVenueById);
router.get('/categories', getAllCategories);
router.get('/search/suggestions', getSearchSuggestions);
router.post('/venues/:id/check-availability', checkAvailability);

module.exports = router;