require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshcart');
    console.log('Connected to MongoDB\n');

    const username = 'azhagu';
    const password = 'azhagu123';

    console.log('=== TESTING LOGIN ===');
    console.log('Username:', username);
    console.log('Password:', password);

    // Find user
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      console.log('❌ User NOT found');
      process.exit(1);
    }
    
    console.log('✓ User found');
    console.log('  - ID:', user._id);
    console.log('  - Role:', user.role);
    console.log('  - isActive:', user.isActive);
    console.log('  - Has password hash:', user.password ? 'YES' : 'NO');
    console.log('  - Password hash length:', user.password?.length);

    // Test password comparison manually
    console.log('\n=== TESTING PASSWORD ===');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does NOT match');
      
      // Let's test creating a new hash to compare
      console.log('\n=== DEBUG ===');
      const testHash = await bcrypt.hash(password, 10);
      console.log('Test hash of "admin123":', testHash);
      const testMatch = await bcrypt.compare(password, testHash);
      console.log('Test comparison with new hash:', testMatch);
      
      // Reset the password
      console.log('\n=== RESETTING PASSWORD ===');
      user.password = password;
      await user.save();
      console.log('✓ Password reset to: admin123');
      
      // Test again
      const user2 = await User.findOne({ username }).select('+password');
      const isMatch2 = await bcrypt.compare(password, user2.password);
      console.log('Password match after reset:', isMatch2);
    } else {
      console.log('✓ Password MATCHES');
    }

    console.log('\n=== FINAL CHECK ===');
    const finalUser = await User.findOne({ username }).select('+password');
    const finalMatch = await bcrypt.compare(password, finalUser.password);
    console.log('Login should work:', finalMatch ? '✓ YES' : '❌ NO');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
