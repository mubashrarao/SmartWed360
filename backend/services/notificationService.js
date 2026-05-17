const Notification = require('../models/Notification');
const { sendVerificationEmail, sendApprovalEmail, sendPaymentConfirmation } = require('./emailService');

// Create notification (in-app only)
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
    console.log(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Send notification with email (simplified - just create notification)
// Email is sent separately via dedicated email functions
const sendNotification = async (user, type, title, message, data = {}, priority = 'medium') => {
  try {
    // Create in-app notification only
    const notification = await createNotification(
      user._id,
      type,
      title,
      message,
      data,
      priority
    );
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
      customerName: booking.customer?.name || 'Customer',
      eventDate: booking.eventDate?.toLocaleDateString(),
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      specialRequests: booking.specialRequests
    },
    'high'
  );
};

// Send booking waiting for payment notification to customer
const notifyCustomerWaitingPayment = async (customer, booking) => {
  const title = 'Payment Required';
  const message = `Your booking for ${booking.venue.name} has been approved. Please pay 20% advance to confirm.`;
  
  return sendNotification(
    customer,
    'payment_required',
    title,
    message,
    {
      bookingId: booking._id,
      venueName: booking.venue.name,
      eventDate: booking.eventDate?.toLocaleDateString(),
      totalPrice: booking.totalPrice,
      advanceAmount: Math.round(booking.totalPrice * 0.2),
      vendorNotes: booking.vendorNotes
    },
    'high'
  );
};

// Send booking confirmed notification to customer
const notifyCustomerBookingConfirmed = async (customer, booking) => {
  const title = 'Booking Confirmed!';
  const message = `Your booking for ${booking.venue.name} has been confirmed. Advance payment received.`;
  
  return sendNotification(
    customer,
    'booking_confirmed',
    title,
    message,
    {
      bookingId: booking._id,
      venueName: booking.venue.name,
      eventDate: booking.eventDate?.toLocaleDateString(),
      totalPrice: booking.totalPrice,
      advancePaid: booking.advancePayment
    },
    'high'
  );
};

// Send payment received notification to vendor
const notifyVendorPaymentReceived = async (vendor, customer, booking) => {
  const title = 'Payment Received';
  const message = `Customer ${customer.name} has paid advance for booking at ${booking.venue.name}. Booking is now confirmed.`;
  
  return sendNotification(
    vendor,
    'payment_received',
    title,
    message,
    {
      bookingId: booking._id,
      customerName: customer.name,
      venueName: booking.venue.name,
      eventDate: booking.eventDate?.toLocaleDateString(),
      advanceAmount: booking.advancePayment
    },
    'high'
  );
};

// Send vendor approved notification
const notifyVendorApproved = async (vendor) => {
  const title = 'Account Approved';
  const message = 'Congratulations! Your vendor account has been approved. You can now login and start listing your venues.';
  
  // Send email separately
  try {
    await sendApprovalEmail(vendor.email, vendor.name);
  } catch (emailError) {
    console.error('Approval email failed:', emailError.message);
  }
  
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
      eventDate: booking.eventDate?.toLocaleDateString(),
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
  notifyCustomerWaitingPayment,
  notifyCustomerBookingConfirmed,
  notifyVendorPaymentReceived,
  notifyVendorApproved,
  sendBookingReminder
};