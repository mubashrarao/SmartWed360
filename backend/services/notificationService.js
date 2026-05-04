const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');

// Create notification
const createNotification = async (userId, type, title, message, data = {}, priority = 'medium') => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      priority
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Send notification with email
const sendNotification = async (user, type, title, message, data = {}, priority = 'medium') => {
  try {
    // Create in-app notification
    const notification = await createNotification(
      user._id,
      type,
      title,
      message,
      data,
      priority
    );

    // Send email if user has email
    if (user.email) {
      const emailSent = await sendEmail(user.email, type, {
        ...data,
        customerName: user.name,
        vendorName: user.name
      });

      // Update notification if email was sent
      if (emailSent && notification) {
        notification.isEmailSent = true;
        await notification.save();
      }
    }

    return notification;
  } catch (error) {
    console.error('Send notification error:', error);
    return null;
  }
};

// Send booking request notification to vendor
const notifyVendorNewBooking = async (vendor, booking) => {
  const title = 'New Booking Request';
  const message = `You have a new booking request for ${booking.venue.name}`;
  
  return sendNotification(
    vendor,
    'booking_request',
    title,
    message,
    {
      bookingId: booking._id,
      venueName: booking.venue.name,
      customerName: booking.customer.name,
      eventDate: booking.eventDate.toLocaleDateString(),
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      specialRequests: booking.specialRequests
    },
    'high'
  );
};

// Send booking approved notification to customer
const notifyCustomerBookingApproved = async (customer, booking) => {
  const title = 'Booking Approved!';
  const message = `Your booking for ${booking.venue.name} has been approved`;
  
  return sendNotification(
    customer,
    'booking_approved',
    title,
    message,
    {
      bookingId: booking._id,
      venueName: booking.venue.name,
      eventDate: booking.eventDate.toLocaleDateString(),
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      vendorNotes: booking.vendorNotes
    },
    'high'
  );
};

// Send booking rejected notification to customer
const notifyCustomerBookingRejected = async (customer, booking) => {
  const title = 'Booking Update';
  const message = `Your booking request for ${booking.venue.name} has been declined`;
  
  return sendNotification(
    customer,
    'booking_rejected',
    title,
    message,
    {
      bookingId: booking._id,
      venueName: booking.venue.name,
      eventDate: booking.eventDate.toLocaleDateString(),
      vendorNotes: booking.vendorNotes || 'No specific reason provided'
    },
    'high'
  );
};

// Send vendor approved notification
const notifyVendorApproved = async (vendor) => {
  const title = 'Account Approved!';
  const message = 'Congratulations! Your vendor account has been approved';
  
  return sendNotification(
    vendor,
    'vendor_approved',
    title,
    message,
    {
      vendorId: vendor._id,
      vendorName: vendor.name
    },
    'high'
  );
};

// Send booking reminder (24 hours before event)
const sendBookingReminder = async (customer, booking) => {
  const title = 'Upcoming Event Reminder';
  const message = `Reminder: Your event at ${booking.venue.name} is tomorrow!`;
  
  return sendNotification(
    customer,
    'event_reminder',
    title,
    message,
    {
      bookingId: booking._id,
      venueName: booking.venue.name,
      eventDate: booking.eventDate.toLocaleDateString(),
      venueAddress: booking.venue.address,
      venueContact: booking.venue.contactPhone
    },
    'medium'
  );
};

module.exports = {
  createNotification,
  sendNotification,
  notifyVendorNewBooking,
  notifyCustomerBookingApproved,
  notifyCustomerBookingRejected,
  notifyVendorApproved,
  sendBookingReminder
};