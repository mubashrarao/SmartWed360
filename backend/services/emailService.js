const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Email Service: Resend initialized');
console.log('  From email:', process.env.RESEND_FROM_EMAIL);

// Send verification email with PIN code
const sendVerificationEmail = async (email, pinCode) => {
  console.log(`Sending verification email to: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Verify Your Email - SmartWed 360',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #800020; color: #D4AF37; padding: 20px; text-align: center; }
            .pin-code { font-size: 32px; font-weight: bold; padding: 20px; background: #f5f5f5; text-align: center; letter-spacing: 10px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartWed 360</h1>
            </div>
            <div class="pin-code">${pinCode}</div>
            <p>Your verification code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">
              <p>© 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    
    console.log('Verification email sent. ID:', data.id);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name, role) => {
  console.log(`Sending welcome email to: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Welcome to SmartWed 360${role === 'vendor' ? ' - Pending Approval' : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to SmartWed 360</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #800020; color: #D4AF37; padding: 20px; text-align: center; }
            .content { padding: 30px; border: 1px solid #ddd; }
            .button { background: #D4AF37; color: #800020; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartWed 360</h1>
            </div>
            <div class="content">
              <h2>Welcome ${name}!</h2>
              <p>Your email has been successfully verified.</p>
              <p>You are registered as a <strong>${role}</strong>.</p>
              ${role === 'vendor' ? '<p>Your account is pending admin approval. You will receive an email once approved.</p>' : '<p>You can now start browsing venues!</p>'}
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    
    console.log('Welcome email sent. ID:', data.id);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    return false;
  }
};

// Send pending approval email
const sendPendingApprovalEmail = async (email, name) => {
  console.log(`Sending pending approval email to: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'SmartWed 360 - Vendor Account Pending Approval',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Pending Approval</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #800020; color: #D4AF37; padding: 20px; text-align: center; }
            .pending-box { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartWed 360</h1>
            </div>
            <div class="pending-box">
              <h3>Account Status: Pending Approval</h3>
              <p>Your vendor account is pending admin approval.</p>
              <p>You will receive an email once approved.</p>
            </div>
            <div class="footer">
              <p>© 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    
    console.log('Pending approval email sent. ID:', data.id);
    return true;
  } catch (error) {
    console.error('Failed to send pending approval email:', error.message);
    return false;
  }
};

// Send approval confirmation email
const sendApprovalEmail = async (email, name) => {
  console.log(`Sending approval email to: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'SmartWed 360 - Your Vendor Account is Approved',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Account Approved</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #800020; color: #D4AF37; padding: 20px; text-align: center; }
            .success-box { background: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { background: #D4AF37; color: #800020; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartWed 360</h1>
            </div>
            <div class="success-box">
              <h3>Congratulations ${name}!</h3>
              <p>Your vendor account has been APPROVED.</p>
              <p>You can now login and start listing your venues.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
            </div>
            <div class="footer">
              <p>© 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    
    console.log('Approval email sent. ID:', data.id);
    return true;
  } catch (error) {
    console.error('Failed to send approval email:', error.message);
    return false;
  }
};
// Send payment confirmation email
const sendPaymentConfirmation = async (customer, booking) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Booking Confirmed - SmartWed 360</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #800020; color: #D4AF37; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #D4AF37; color: #800020; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SmartWed 360</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${customer.name}!</h2>
            <div class="success-box">
              <p><strong>Your booking has been CONFIRMED!</strong></p>
              <p>Venue: ${booking.venue.name}</p>
              <p>Event Date: ${new Date(booking.eventDate).toLocaleDateString()}</p>
              <p>Advance Payment: Rs. ${booking.advancePayment.toLocaleString()}</p>
              <p>Remaining Amount: Rs. ${(booking.totalPrice - booking.advancePayment).toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/customer/bookings" class="button">View My Bookings</a>
            </div>
          </div>
          <div class="footer">
            <p> 2025 SmartWed 360. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: 'Booking Confirmed - SmartWed 360',
      html
    });
    console.log('Payment confirmation email sent to:', customer.email);
    return true;
  } catch (error) {
    console.error('Payment confirmation email failed:', error.message);
    return false;
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendPendingApprovalEmail,
  sendApprovalEmail,
  sendPaymentConfirmation 
};