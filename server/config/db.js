const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if we already have a connection (Essential for Vercel)
  if (mongoose.connections[0].readyState) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Forces IPv4 - helps bypass local "Whitelist" errors
    });
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // We don't exit(1) here so nodemon keeps running while you fix things
  }
};

module.exports = connectDB; // Changed from 'export default' to 'module.exports'