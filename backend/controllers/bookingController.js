const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

// ==================== CREATE BOOKING ====================
const createBooking = async (req, res) => {
  try {
    const { venueId, eventType, timeSlot, eventDate, guestCount, specialRequests, selectedFacilities } = req.body;

    if (!venueId || !eventDate || !guestCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide venueId, eventDate, and guestCount'
      });
    }

    const venue = await Venue.findById(venueId).populate('vendor');
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    if (venue.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This venue is not available for booking' });
    }

    if (guestCount > venue.capacity) {
      return res.status(400).json({ success: false, message: `Guest count exceeds venue capacity of ${venue.capacity}` });
    }

    let venuePrice = venue.basePrice;
    if (eventType && venue.eventTypes) {
      const eventTypeData = venue.eventTypes.find(et => et.type === eventType);
      if (eventTypeData && timeSlot) {
        const timeSlotData = eventTypeData.timeSlots.find(ts => ts.timeType === timeSlot);
        if (timeSlotData) {
          venuePrice = timeSlotData.price;
        }
      }
    }

    let facilitiesTotal = 0;
    const selectedFacilitiesList = [];

    if (selectedFacilities && selectedFacilities.length > 0 && venue.facilities) {
      for (const facility of selectedFacilities) {
        const venueFacility = venue.facilities.id(facility.facilityId);
        if (venueFacility && venueFacility.isAvailable) {
          const facilityPrice = venueFacility.price * (facility.quantity || 1);
          facilitiesTotal += facilityPrice;
          selectedFacilitiesList.push({
            facilityId: facility.facilityId,
            name: venueFacility.name,
            price: venueFacility.price,
            quantity: facility.quantity || 1
          });
        }
      }
    }

    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(eventDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingBooking = await Booking.findOne({
      venue: venueId,
      eventDate: { $gte: eventDateObj, $lt: nextDay },
      timeSlot: timeSlot,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'This date and time slot is already booked or has a pending request' });
    }

    const totalPrice = venuePrice + facilitiesTotal;

    const booking = await Booking.create({
      venue: venueId,
      customer: req.user.id,
      vendor: venue.vendor._id,
      eventType: eventType || 'barat',
      timeSlot: timeSlot || 'night',
      eventDate: eventDateObj,
      guestCount,
      specialRequests: specialRequests || '',
      venuePrice,
      selectedFacilities: selectedFacilitiesList,
      facilitiesTotal,
      totalPrice,
      status: 'pending'
    });

    await booking.populate([
      { path: 'venue', select: 'name price capacity city images' },
      { path: 'customer', select: 'name email phone' },
      { path: 'vendor', select: 'name email phone' }
    ]);

    // Send notification to vendor
    try {
      await notificationService.notifyVendorNewBooking(venue.vendor, booking);
      console.log('Notification sent to vendor');
    } catch (notifError) {
      console.error('Failed to send notification to vendor:', notifError);
    }

    // Notify admin about new booking
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'new_booking_request',
          title: 'New Booking Request',
          message: `New booking request from ${req.user.name} for ${venue.name} on ${eventDateObj.toLocaleDateString()}`,
          data: { 
            bookingId: booking._id,
            customerName: req.user.name,
            vendorName: venue.name,
            eventDate: eventDateObj,
            totalPrice: totalPrice
          },
          priority: 'high'
        });
      }
      console.log('Admin notified about new booking');
    } catch (adminError) {
      console.error('Failed to notify admin:', adminError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== GET CUSTOMER BOOKINGS ====================
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate({ path: 'venue', select: 'name price capacity city images' })
      .populate('vendor', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== GET VENDOR BOOKINGS ====================
const getVendorBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { vendor: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate({ path: 'venue', select: 'name price capacity city images' })
      .populate('customer', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    const stats = {
      pending: await Booking.countDocuments({ vendor: req.user.id, status: 'pending' }),
      approved: await Booking.countDocuments({ vendor: req.user.id, status: 'approved' }),
      completed: await Booking.countDocuments({ vendor: req.user.id, status: 'completed' }),
      cancelled: await Booking.countDocuments({ vendor: req.user.id, status: 'cancelled' }),
      total: await Booking.countDocuments({ vendor: req.user.id })
    };

    res.json({
      success: true,
      count: bookings.length,
      total,
      stats,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== GET SINGLE BOOKING ====================
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'venue', select: 'name price capacity city address images amenities' })
      .populate('customer', 'name email phone profileImage')
      .populate('vendor', 'name email phone profileImage');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer._id.toString() !== req.user.id && 
        booking.vendor._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UPDATE BOOKING STATUS (Vendor) ====================
const updateBookingStatus = async (req, res) => {
  try {
    const { status, vendorNotes } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('customer')
      .populate('venue')
      .populate('vendor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = status;
    if (vendorNotes) booking.vendorNotes = vendorNotes;
    await booking.save();

    // Send notification to customer 
    if (status === 'approved') {
      await Notification.create({
        user: booking.customer._id,
        type: 'booking_approved',
        title: 'Booking Approved',
        message: `Your booking for ${booking.venue.name} on ${new Date(booking.eventDate).toLocaleDateString()} has been approved.`,
        data: { bookingId: booking._id, status: 'approved' },
        priority: 'high'
      });
      console.log(`Customer notified: Booking ${booking._id} approved`);
    } else if (status === 'rejected') {
      await Notification.create({
        user: booking.customer._id,
        type: 'booking_rejected',
        title: 'Booking Update',
        message: `Your booking for ${booking.venue.name} has been declined. Reason: ${vendorNotes || 'Not specified'}`,
        data: { bookingId: booking._id, status: 'rejected' },
        priority: 'high'
      });
      console.log(`Customer notified: Booking ${booking._id} rejected`);
    }

    // Notify admin about vendor decision
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: status === 'approved' ? 'booking_approved_by_vendor' : 'booking_rejected_by_vendor',
        title: status === 'approved' ? 'Booking Confirmed by Vendor' : 'Booking Rejected by Vendor',
        message: `Booking for ${booking.venue.name} by ${booking.customer.name} has been ${status} by vendor ${booking.vendor.name}.`,
        data: { 
          bookingId: booking._id,
          customerName: booking.customer.name,
          vendorName: booking.vendor.name,
          status: status
        },
        priority: 'medium'
      });
    }

    res.json({ success: true, message: `Booking ${status} successfully`, data: booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CANCEL BOOKING ====================
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('vendor')
      .populate('venue')
      .populate('customer');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel booking with status: ${booking.status}` });
    }

    const today = new Date();
    const eventDate = new Date(booking.eventDate);
    
    if (eventDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot cancel past events' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    // Notify vendor
    await Notification.create({
      user: booking.vendor._id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Customer ${booking.customer.name} has cancelled the booking for ${booking.venue.name}. Reason: ${reason || 'Not specified'}`,
      data: { bookingId: booking._id, cancellationReason: reason },
      priority: 'high'
    });

    // Notify admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'booking_cancelled_by_customer',
        title: 'Booking Cancelled by Customer',
        message: `${booking.customer.name} cancelled booking for ${booking.venue.name}. Reason: ${reason || 'Not specified'}`,
        data: { bookingId: booking._id, customerName: booking.customer.name, venueName: booking.venue.name },
        priority: 'medium'
      });
    }

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== COMPLETE BOOKING ====================
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue')
      .populate('customer')
      .populate('vendor');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (booking.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved bookings can be marked as completed' });
    }
    
    const today = new Date();
    const eventDate = new Date(booking.eventDate);
    
    if (eventDate > today) {
      return res.status(400).json({ success: false, message: 'Cannot mark future events as completed' });
    }
    
    booking.status = 'completed';
    await booking.save();
    
    // Notify vendor
    await Notification.create({
      user: booking.vendor._id,
      type: 'event_completed',
      title: 'Event Completed',
      message: `${booking.customer.name} has marked the event at ${booking.venue.name} as completed.`,
      data: { bookingId: booking._id }
    });
    
    res.json({ success: true, message: 'Booking marked as completed' });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== GET BOOKING STATS ====================
const getBookingStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'vendor') filter.vendor = req.user.id;

    const stats = {
      total: await Booking.countDocuments(filter),
      pending: await Booking.countDocuments({ ...filter, status: 'pending' }),
      approved: await Booking.countDocuments({ ...filter, status: 'approved' }),
      rejected: await Booking.countDocuments({ ...filter, status: 'rejected' }),
      cancelled: await Booking.countDocuments({ ...filter, status: 'cancelled' }),
      completed: await Booking.countDocuments({ ...filter, status: 'completed' })
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  completeBooking,
  getBookingStats
};