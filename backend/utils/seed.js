require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshcart');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@freshcart.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user:', adminUser.username);

    // Create sample products
    const sampleProducts = [
      {
        name: 'Basmati Rice',
        price: 150,
        quantity: 100,
        description: 'Premium quality basmati rice, 1kg pack',
        category: 'Rice',
        isActive: true
      },
      {
        name: 'Toor Dal',
        price: 120,
        quantity: 80,
        description: 'Organic toor dal, 500g pack',
        category: 'Dal',
        isActive: true
      },
      {
        name: 'Sunflower Oil',
        price: 180,
        quantity: 50,
        description: 'Refined sunflower oil, 1L bottle',
        category: 'Oil & Ghee',
        isActive: true
      },
      {
        name: 'Garam Masala',
        price: 45,
        quantity: 200,
        description: 'Premium garam masala powder, 100g',
        category: 'Masalas',
        isActive: true
      },
      {
        name: 'Monthly Grocery Kit',
        price: 2500,
        quantity: 30,
        description: 'Complete monthly grocery kit for family of 4',
        category: 'Grocery Kits',
        isActive: true
      },
      {
        name: 'Wheat Flour',
        price: 55,
        quantity: 150,
        description: 'Whole wheat flour, 5kg pack',
        category: 'Flour',
        isActive: true
      },
      {
        name: 'Sugar',
        price: 45,
        quantity: 120,
        description: 'White sugar, 1kg pack',
        category: 'Sugar & Salt',
        isActive: true
      },
      {
        name: 'Turmeric Powder',
        price: 35,
        quantity: 100,
        description: 'Pure turmeric powder, 100g',
        category: 'Masalas',
        isActive: true
      }
    ];

    for (const productData of sampleProducts) {
      const product = await Product.create({
        ...productData,
        createdBy: adminUser._id
      });
      console.log('Created product:', product.name);
    }

    console.log('\nSeeding completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
