const nodemailer = require('nodemailer');

// Log email configuration on startup
console.log('📧 Email Configuration:');
console.log('  Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
console.log('  Port:', process.env.EMAIL_PORT || 465);
console.log('  User:', process.env.EMAIL_USER);
console.log('  Pass exists:', !!process.env.EMAIL_PASS);
console.log('  From:', process.env.EMAIL_FROM);

// Create transporter with Render-compatible settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4, // Force IPv4 - CRITICAL for Render!
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
    console.error('❌ Email transporter error:', error.message);
    console.error('   Please check your EMAIL_USER and EMAIL_PASS');
  } else {
    console.log('✅ Email server is ready to send emails');
  }
});

// Send verification email with PIN code
const sendVerificationEmail = async (email, pinCode) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email - SmartWed 360</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background: #800020; color: #D4AF37; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
        .pin-code { font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 10px; 
                    padding: 20px; background: #f5f5f5; border-radius: 10px; margin: 20px 0; color: #800020; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartWed 360</h1>
          <p>Your Perfect Wedding Partner</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering with SmartWed 360! Please use the following verification code:</p>
          <div class="pin-code">${pinCode}</div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 SmartWed 360. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - SmartWed 360',
    html
  };

  return transporter.sendMail(mailOptions);
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name, role) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Welcome to SmartWed 360</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background: #800020; color: #D4AF37; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartWed 360</h1>
        </div>
        <div class="content">
          <h2>Welcome ${name}!</h2>
          <div class="success-box">
            <p><strong>Your email has been successfully verified!</strong></p>
            <p>You are registered as a <strong>${role}</strong> on SmartWed 360.</p>
          </div>
          ${role === 'vendor' ? '<p>Your account is pending admin approval. You will receive an email once approved.</p>' : '<p>You can now start browsing venues!</p>'}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #D4AF37; color: #800020; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2025 SmartWed 360. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to SmartWed 360${role === 'vendor' ? ' - Pending Approval' : ''}`,
    html
  };

  return transporter.sendMail(mailOptions);
};

// Send pending approval email to vendor
const sendPendingApprovalEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Account Pending Approval - SmartWed 360</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background: #800020; color: #D4AF37; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
        .pending-box { background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartWed 360</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for registering as a vendor!</p>
          <div class="pending-box">
            <p><strong>Account Status: Pending Approval</strong></p>
            <p>Your vendor account is pending admin approval. You will receive an email once approved.</p>
          </div>
        </div>
        <div class="footer">
          <p>© 2025 SmartWed 360. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'SmartWed 360 - Vendor Account Pending Approval',
    html
  };

  return transporter.sendMail(mailOptions);
};

// Send approval confirmation email to vendor
const sendApprovalEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Account Approved - SmartWed 360</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background: #800020; color: #D4AF37; border-radius: 10px 10px 0 0; }
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
          <h2>Congratulations ${name}!</h2>
          <div class="success-box">
            <p><strong>Your vendor account has been APPROVED!</strong></p>
            <p>You can now login and start listing your venues.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2025 SmartWed 360. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'SmartWed 360 - Your Vendor Account is Approved',
    html
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendPendingApprovalEmail,
  sendApprovalEmail 
};