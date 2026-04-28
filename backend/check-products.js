require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const checkProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshcart');
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    
    products.forEach(p => {
      console.log(`- Name: ${p.name}, ImageUrl: ${p.imageUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkProducts();
