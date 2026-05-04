const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

console.log('Testing User model without hooks...');

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Hash password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Try to create a test user with pre-hashed password
      const testUser = new User({
        name: 'No Hook Test',
        email: 'nohook@test.com',
        password: hashedPassword, // Already hashed
        role: 'customer',
        status: 'active'
      });
      
      console.log('Attempting to save user...');
      await testUser.save();
      console.log('✅ User saved successfully!');
      console.log('User ID:', testUser._id);
      
      // Clean up
      await User.deleteOne({ email: 'nohook@test.com' });
      console.log('✅ Test user cleaned up');
      
    } catch (error) {
      console.error('❌ Error saving user:', error);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });