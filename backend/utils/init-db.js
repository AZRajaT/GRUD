require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const GroceryKit = require('../models/groceryKit.model');

const initDB = async () => {
  try {
    // Ensure database is connected
    await connectDB();

    // 1. Ensure Admin User
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@freshcart.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created');
    }

    // 2. Ensure Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Premium Basmati Rice',
          price: 150,
          quantity: 100,
          description: 'Long grain aromatic basmati rice perfect for biryani.',
          category: 'rice',
          imageUrl: 'assets/images/basmathi.png',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Organic Toor Dal',
          price: 120,
          quantity: 80,
          description: 'Protein rich organic toor dal.',
          category: 'dal',
          imageUrl: 'assets/images/dalandpulses.jpeg',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Pure Sunflower Oil',
          price: 180,
          quantity: 50,
          description: 'Heart healthy refined sunflower oil.',
          category: 'oil',
          imageUrl: 'assets/images/sunfloweroil.jpeg',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Kitchen King Masala',
          price: 45,
          quantity: 200,
          description: 'Authentic blend of spices for all your dishes.',
          category: 'masala',
          imageUrl: 'assets/images/masalas.jpeg',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Premium Rice & Grains',
          price: 85,
          quantity: 150,
          description: 'High quality grains for daily use.',
          category: 'rice',
          imageUrl: 'assets/images/riceandgrains.jpeg',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Pure Ghee',
          price: 550,
          quantity: 40,
          description: 'Pure cow ghee with traditional aroma.',
          category: 'oil',
          imageUrl: 'assets/images/oilandghee.jpeg',
          isActive: true,
          createdBy: admin._id
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log(`${sampleProducts.length} sample products created`);
    }

    // 3. Ensure Kits
    const kitCount = await GroceryKit.countDocuments();
    if (kitCount === 0) {
      // Get some products for the kit
      const products = await Product.find().limit(3);
      
      if (products.length > 0) {
        const sampleKits = [
          {
            name: 'Essential Monthly Kit',
            description: 'All your monthly essentials in one box.',
            price: 1200,
            originalPrice: 1500,
            imageUrl: 'assets/images/riceandgrains.jpeg',
            category: 'Grocery Kits',
            isActive: true,
            popular: true,
            createdBy: admin._id,
            items: products.map(p => ({ product: p._id, quantity: 2 }))
          },
          {
            name: 'Spices & Oil Combo',
            description: 'Perfect combo of premium oils and spices.',
            price: 450,
            originalPrice: 550,
            imageUrl: 'assets/images/masalas.jpeg',
            category: 'Grocery Kits',
            isActive: true,
            popular: true,
            createdBy: admin._id,
            items: products.slice(0, 2).map(p => ({ product: p._id, quantity: 1 }))
          }
        ];

        await GroceryKit.insertMany(sampleKits);
        console.log(`${sampleKits.length} sample kits created`);
      }
    }

    console.log('Database initialization check completed');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = initDB;
