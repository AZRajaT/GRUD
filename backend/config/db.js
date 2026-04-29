const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in production environment variables!');
    console.error('Please add MONGODB_URI to your deployment platform (e.g., Render/Vercel) settings.');
    // We don't throw here so the server can at least boot and respond with 503 via middleware
  }

  const connectionString = uri || 'mongodb://127.0.0.1:27017/freshcart';

  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Set global options
    mongoose.set('strictQuery', false);
    // Disable buffering so we fail fast if not connected
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(connectionString, {
      // These are default in newer Mongoose versions but good for clarity
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // We don't exit/throw so the server stays alive and can respond with 503
    return null;
  }
};

module.exports = connectDB;
