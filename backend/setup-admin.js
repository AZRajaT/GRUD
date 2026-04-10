require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/user.model');

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshcart');
    console.log('Connected to MongoDB');

    // Check if admin exists
    let admin = await User.findOne({ username: 'admin' });
    
    if (admin) {
      console.log('Admin user already exists');
      console.log('Admin ID:', admin._id);
      console.log('Admin role:', admin.role);
      console.log('Admin isActive:', admin.isActive);
      
      // Update password to ensure it's correct
      admin.password = 'admin123';
      await admin.save();
      console.log('Admin password reset to: admin123');
    } else {
      // Create admin user
      admin = await User.create({
        username: 'admin',
        email: 'admin@freshcart.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created successfully!');
    }

    console.log('\n=== ADMIN CREDENTIALS ===');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

setupAdmin();
