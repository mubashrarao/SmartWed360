const nodemailer = require('nodemailer');

// Log email configuration on startup
console.log('📧 Email Configuration:');
console.log('  Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
console.log('  Port:', process.env.EMAIL_PORT || 587);
console.log('  User:', process.env.EMAIL_USER);
console.log('  Pass exists:', !!process.env.EMAIL_PASS);
console.log('  From:', process.env.EMAIL_FROM);

// Create transporter - FIXED for port 587
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // MUST be false for port 587 (true is for port 465)
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
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - SmartWed 360',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: #800020; color: #D4AF37; padding: 20px; text-align: center;">
            <h1>SmartWed 360</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #ddd;">
            <h2>Verify Your Email</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; padding: 20px; background: #f5f5f5; text-align: center; letter-spacing: 5px;">
              ${pinCode}
            </div>
            <p>This code expires in 10 minutes.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', email, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to SmartWed 360${role === 'vendor' ? ' - Pending Approval' : ''}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: #800020; color: #D4AF37; padding: 20px; text-align: center;">
            <h1>SmartWed 360</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #ddd;">
            <h2>Welcome ${name}!</h2>
            <p>Your email has been successfully verified!</p>
            <p>You are registered as a <strong>${role}</strong>.</p>
            ${role === 'vendor' ? '<p>Your account is pending admin approval.</p>' : '<p>You can now start browsing venues!</p>'}
            <div style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/login" style="background: #D4AF37; color: #800020; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Login</a>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    return false;
  }
};

// Send pending approval email
const sendPendingApprovalEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SmartWed 360 - Vendor Account Pending Approval',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: #800020; color: #D4AF37; padding: 20px; text-align: center;">
            <h1>SmartWed 360</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #ddd;">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering as a vendor!</p>
            <div style="background: #fff3cd; padding: 15px; margin: 20px 0;">
              <strong>Account Status: Pending Approval</strong>
              <p>You will receive an email once approved.</p>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Pending approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Pending approval email failed:', error.message);
    return false;
  }
};

// Send approval confirmation email
const sendApprovalEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"SmartWed 360" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SmartWed 360 - Your Vendor Account is Approved',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: #800020; color: #D4AF37; padding: 20px; text-align: center;">
            <h1>SmartWed 360</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #ddd;">
            <h2>Congratulations ${name}!</h2>
            <div style="background: #d4edda; padding: 15px; margin: 20px 0;">
              <strong>Your vendor account has been APPROVED!</strong>
              <p>You can now login and start listing your venues.</p>
            </div>
            <div style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/login" style="background: #D4AF37; color: #800020; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Approval email failed:', error.message);
    return false;
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendPendingApprovalEmail,
  sendApprovalEmail 
};