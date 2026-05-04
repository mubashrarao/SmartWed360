const nodemailer = require('nodemailer');

console.log('Email Configuration:');
console.log('  Host:', process.env.EMAIL_HOST);
console.log('  Port:', process.env.EMAIL_PORT);
console.log('  User:', process.env.EMAIL_USER);
console.log('  Pass exists:', !!process.env.EMAIL_PASS);
console.log('  Secure:', process.env.EMAIL_SECURE);

// Create transporter for port 465 (SSL)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true' || true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4, // Force IPv4 - Important for Render
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error.message);
  } else {
    console.log('Email server is ready on port 465');
  }
});

// Send verification email with PIN code
const sendVerificationEmail = async (email, pinCode) => {
  console.log(`Attempting to send verification email to: ${email}`);
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
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
              <p> 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully. Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name, role) => {
  console.log(`Attempting to send welcome email to: ${email}`);
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
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
              <p> 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
    return false;
  }
};

// Send pending approval email
const sendPendingApprovalEmail = async (email, name) => {
  console.log(`Attempting to send pending approval email to: ${email}`);
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
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
              <p> 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Pending approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send pending approval email:', error.message);
    return false;
  }
};

// Send approval email
const sendApprovalEmail = async (email, name) => {
  console.log(`Attempting to send approval email to: ${email}`);
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
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
              <p> 2025 SmartWed 360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send approval email:', error.message);
    return false;
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendPendingApprovalEmail,
  sendApprovalEmail 
};