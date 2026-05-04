const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  timeType: {
    type: String,
    enum: ['day', 'night'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  startTime: String,
  endTime: String
});

const EventTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mehendi', 'barat', 'walima', 'bridal_shower', 'birthday', 'get_together', 'corporate', 'engagement'],
    required: true
  },
  name: String,
  timeSlots: [TimeSlotSchema],
  isActive: { type: Boolean, default: true }
});

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['decor', 'music', 'photography', 'catering', 'fireworks', 'lighting', 'transport', 'accommodation'], default: 'decor' },
  isAvailable: { type: Boolean, default: true },
  image: String
});

const VenueSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Please add a venue name'], trim: true },
  description: { type: String, required: [true, 'Please add a description'] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  
  // FIX: Make basePrice NOT required (allow undefined)
  basePrice: { type: Number, default: 0 },
  
  capacity: { type: Number, required: [true, 'Please add maximum guest capacity'] },
  city: { type: String, required: [true, 'Please add city'], trim: true },
  address: { type: String, required: [true, 'Please add full address'], trim: true },
  contactPhone: { type: String, required: [true, 'Please add contact phone'] },
  contactEmail: { type: String, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'] },
  images: [{ url: String, publicId: String }],
  amenities: [String],
  
  eventTypes: [EventTypeSchema],
  facilities: [FacilitySchema],
  
  availability: [{
    date: Date,
    isAvailable: { type: Boolean, default: true },
    bookedEventType: String,
    bookedTimeSlot: String
  }],
  
  status: { type: String, enum: ['active', 'inactive', 'booked'], default: 'active' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for search
VenueSchema.index({ city: 1, basePrice: 1, capacity: 1, category: 1 });

module.exports = mongoose.model('Venue', VenueSchema);