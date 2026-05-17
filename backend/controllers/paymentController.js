const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
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
    
    // Calculate advance amount (20% of total by default)
    const advanceAmount = (booking.totalPrice * advancePercentage) / 100;
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(advanceAmount * 100), // Convert to cents/paisa
      currency: 'pkr',
      metadata: {
        bookingId: booking._id.toString(),
        customerId: booking.customer._id.toString(),
        vendorId: booking.vendor.toString()
      },
      description: `Advance payment for ${booking.venue.name} on ${new Date(booking.eventDate).toLocaleDateString()}`
    });
    
    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user.id,
      vendor: booking.vendor,
      amount: booking.totalPrice,
      advanceAmount: advanceAmount,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });
    
    // Update booking with payment info
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
    payment.status = 'paid';
    payment.transactionId = paymentIntent.id;
    await payment.save();
    
    // Update booking
    const booking = await Booking.findById(bookingId);
    booking.paymentStatus = 'paid';
    await booking.save();
    
    // Send confirmation email
    await sendPaymentConfirmation(booking.customer, booking);
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
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

// Webhook to handle Stripe events
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
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`Payment failed: ${failedPayment.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  stripeWebhook
};