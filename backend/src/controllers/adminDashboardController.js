const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const StockMovement = require('../models/StockMovement');

/**
 * GET /api/v1/admin/dashboard
 * Aggregates real operational metrics strictly from database records
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;

    // Date boundary filter
    const now = new Date();
    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else {
      // Default 30 days
      startDate.setDate(now.getDate() - 30);
    }

    // 1. Order status metrics
    const [
      totalOrdersCount,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      revenueAgg
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'PENDING_CONFIRMATION' }),
      Order.countDocuments({ status: 'CONFIRMED' }),
      Order.countDocuments({ status: 'PROCESSING' }),
      Order.countDocuments({ status: 'SHIPPED' }),
      Order.countDocuments({ status: 'DELIVERED' }),
      Order.countDocuments({ status: 'CANCELLED' }),
      // Calculate revenue from non-cancelled orders
      Order.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // 2. Inventory status metrics
    const [
      totalProductsCount,
      outOfStockCount,
      lowStockProducts,
      recentMovements
    ] = await Promise.all([
      Product.countDocuments({ status: { $ne: 'archived' } }),
      Product.countDocuments({
        status: { $ne: 'archived' },
        $or: [{ stockQuantity: { $lte: 0 } }, { inStock: false }]
      }),
      Product.find({
        status: { $ne: 'archived' },
        $expr: {
          $and: [
            { $gt: ['$stockQuantity', 0] },
            { $lte: ['$stockQuantity', { $ifNull: ['$lowStockThreshold', 5] }] }
          ]
        }
      })
        .select('id name stockQuantity lowStockThreshold price image')
        .limit(10)
        .lean(),
      StockMovement.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    const inStockCount = Math.max(0, totalProductsCount - outOfStockCount);

    // 3. Recent 8 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('user', 'name email')
      .lean();

    // 4. Customer counts
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 5. Sales over time (daily buckets for range)
    const salesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders: totalOrdersCount,
          totalRevenue,
          totalCustomers,
          inStockProducts: inStockCount,
          lowStockCount: lowStockProducts.length,
          outOfStockProducts: outOfStockCount
        },
        orderStatuses: {
          pendingConfirmation: pendingCount,
          confirmed: confirmedCount,
          processing: processingCount,
          shipped: shippedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount
        },
        lowStockAlerts: lowStockProducts,
        recentOrders: recentOrders.map((o) => ({
          id: o.orderId,
          orderId: o.orderId,
          customerName: o.shippingAddress?.fullName || o.user?.name || 'Customer',
          totalAmount: o.totalAmount,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          itemCount: o.items?.length || 0,
          createdAt: o.createdAt
        })),
        recentMovements,
        salesChart: salesOverTime
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics
};
