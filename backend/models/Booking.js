const mongoose = require('mongoose');

const SelectedFacilitySchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
});

const BookingSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Event Details
  eventType: {
    type: String,
    enum: ['mehendi', 'barat', 'walima', 'bridal_shower', 'birthday', 'get_together', 'corporate', 'engagement'],
    required: true
  },
  timeSlot: {
    type: String,
    enum: ['day', 'night'],
    required: true
  },
  eventDate: { type: Date, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  
  // Pricing
  venuePrice: { type: Number, required: true },
  selectedFacilities: [SelectedFacilitySchema],
  facilitiesTotal: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  
  // Special Requests
  specialRequests: { type: String, maxlength: 500 },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'waiting_payment', 'approved', 'rejected', 'cancelled', 'completed', 'postponed'],
    default: 'pending'
  },
  
  // Cancellation/Postponement
  cancellationReason: { type: String, maxlength: 200 },
  cancelledAt: Date,
  postponedToDate: Date,
  postponementReason: String,
  
  // Vendor Response
  vendorNotes: { type: String, maxlength: 500 },
  
  // ===== PAYMENT FIELDS (Added) =====
  advancePayment: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  // ===== END OF PAYMENT FIELDS =====
  
  // Auto-completion tracking
  autoCompleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index for efficient queries
BookingSchema.index({ venue: 1, eventDate: 1, timeSlot: 1, status: 1 });
BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ vendor: 1, createdAt: -1 });
BookingSchema.index({ eventDate: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);