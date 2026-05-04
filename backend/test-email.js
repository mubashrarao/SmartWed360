const { sendApprovalEmail } = require('./services/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email sending...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  
  try {
    const result = await sendApprovalEmail('your-test-email@gmail.com', 'Test Vendor');
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();