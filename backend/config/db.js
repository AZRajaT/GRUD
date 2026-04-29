const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri && process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is not defined in production environment variables');
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
    // Don't exit process in serverless, but throw so the request fails
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
