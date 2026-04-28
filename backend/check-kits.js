require('dotenv').config();
const mongoose = require('mongoose');
const GroceryKit = require('./models/groceryKit.model');

const checkKits = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshcart');
    console.log('Connected to MongoDB');

    const kits = await GroceryKit.find({});
    console.log(`Found ${kits.length} kits:`);
    
    kits.forEach(k => {
      console.log(`- Name: ${k.name}, ImageUrl: ${k.imageUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkKits();
