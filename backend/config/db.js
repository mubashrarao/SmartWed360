const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      console.error('📝 Please check your .env file and make sure MONGO_URI is set');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📊 Using database:', process.env.MONGO_URI.split('@')[1]?.split('/')[0] || 'MongoDB Atlas');
    
    // Remove the deprecated options - Mongoose 6+ doesn't need them
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // More specific error messages
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('🔐 Authentication failed. Check your username and password in MONGO_URI');
      console.error('   Make sure special characters in password are properly encoded (like %40 for @)');
      console.error('   Current connection string format: mongodb+srv://username:password@cluster/...');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('🌐 Network error. Check your cluster name in MONGO_URI');
    } else if (error.message.includes('timed out')) {
      console.error('⏱️ Connection timeout. Check your network and firewall settings');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;