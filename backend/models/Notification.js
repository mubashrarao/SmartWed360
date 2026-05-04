const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'booking_request',      // Customer sent booking request
      'booking_approved',      // Vendor approved booking
      'booking_rejected',      // Vendor rejected booking
      'booking_cancelled',     // Customer cancelled booking
      'vendor_approved',       // Admin approved vendor
      'vendor_rejected',       // Admin rejected vendor
      'event_reminder',        // Upcoming event reminder
      'payment_received',      // Payment received
      'system_alert'           // System notifications
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);