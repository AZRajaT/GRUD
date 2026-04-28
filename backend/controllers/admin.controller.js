const Order = require('../models/order.model');
const Product = require('../models/product.model');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const activeProducts = await Product.countDocuments({ isActive: true, isDeleted: false });
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 }, isDeleted: false });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        activeProducts,
        lowStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};
