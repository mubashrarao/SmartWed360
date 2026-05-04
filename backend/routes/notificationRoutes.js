const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');

// All notification routes are protected
router.use(protect);

// Get notifications
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);

// Update notifications
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;