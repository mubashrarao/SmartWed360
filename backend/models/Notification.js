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
      'booking_confirmed',     // Payment received, booking confirmed
      'payment_required',      // Customer needs to pay advance
      'payment_received',      // Vendor received payment
      'vendor_approved',       // Admin approved vendor
      'vendor_rejected',       // Admin rejected vendor
      'vendor_pending',        // New vendor registration
      'event_reminder',        // Upcoming event reminder
      'event_completed'        // Event marked as completed
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