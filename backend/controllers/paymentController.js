const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPaymentConfirmation } = require('../services/emailService');

// Create payment intent for booking advance
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, advancePercentage = 20 } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('venue')
      .populate('customer');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    const advanceAmount = (booking.totalPrice * advancePercentage) / 100;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(advanceAmount * 100),
      currency: 'pkr',
      metadata: {
        bookingId: booking._id.toString(),
        customerId: booking.customer._id.toString(),
        vendorId: booking.vendor.toString()
      },
      description: `Advance payment for ${booking.venue.name}`
    });
    
    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user.id,
      vendor: booking.vendor,
      amount: booking.totalPrice,
      advanceAmount: advanceAmount,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });
    
    booking.advancePayment = advanceAmount;
    booking.paymentStatus = 'partial';
    booking.paymentId = payment._id;
    await booking.save();
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      advanceAmount: advanceAmount,
      totalAmount: booking.totalPrice
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm payment after successful charge
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }
    
    // Update payment record
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    
    payment.status = 'paid';
    payment.transactionId = paymentIntent.id;
    await payment.save();
    
    // Update booking
    const booking = await Booking.findById(bookingId)
      .populate('customer')
      .populate('venue')
      .populate('vendor');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    booking.paymentStatus = 'paid';
    booking.advancePayment = payment.advanceAmount;
    booking.status = 'approved';
    await booking.save();
    
    // Send confirmation email
    try {
      await sendPaymentConfirmation(booking.customer, booking);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }
    
    // Send notification to customer
    await Notification.create({
      user: booking.customer._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking for ${booking.venue.name} has been confirmed. Your advance payment of Rs. ${payment.advanceAmount.toLocaleString()} has been received.`,
      data: { bookingId: booking._id },
      priority: 'high'
    });
    
    // Send notification to vendor
    await Notification.create({
      user: booking.vendor._id,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Customer ${booking.customer.name} has paid advance for booking at ${booking.venue.name}. Booking is now confirmed.`,
      data: { bookingId: booking._id },
      priority: 'high'
    });
    
    res.json({
      success: true,
      message: 'Payment confirmed! Your booking is now confirmed.',
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    
    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      advanceAmount: booking.advancePayment,
      totalAmount: booking.totalPrice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Webhook handler
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log(`PaymentIntent succeeded: ${event.data.object.id}`);
      break;
    case 'payment_intent.payment_failed':
      console.log(`Payment failed: ${event.data.object.id}`);
      break;
  }
  
  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  stripeWebhook
};