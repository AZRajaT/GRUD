require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const groceryKitRoutes = require('./routes/groceryKit.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const connectDB = require('./config/db');
const initDB = require('./utils/init-db');

// Connect to Database
connectDB().then(() => {
  // Initialize database with admin and sample data if needed
  initDB();
});

// --- 1. API ROUTES ---
const dbCheck = require('./middleware/db-check.middleware');
app.use('/api', dbCheck);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/kits', groceryKitRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// --- 2. FRONTEND SERVING ---
// Neenga sonna accurate path: freshcart/browser
const frontendPath = path.join(__dirname, '../frontend/dist/freshcart/browser');

// Static files (CSS, JS, Images) serve panna
app.use(express.static(frontendPath));

// Browser refresh panna 404 varama irukka catch-all route
// API routes-ku keela irukanum, error handler-ku mela irukanum
app.get('*', (req, res) => {
  // Request API-ku illana mattum index.html anuppu
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// --- 3. ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Final 404 handler (API-kku mattum)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});