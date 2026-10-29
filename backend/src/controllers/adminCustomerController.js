const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * GET /api/v1/admin/customers
 * Lists customers with calculated lifetime order counts and spend
 */
const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = { role: 'customer' };

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { phone: reg }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone addresses provider createdAt isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    // Aggregate spend and order count for these users
    const userIds = users.map((u) => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds }, status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpend: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const statsMap = new Map();
    orderStats.forEach((s) => statsMap.set(s._id.toString(), s));

    const formatted = users.map((u) => {
      const stats = statsMap.get(u._id.toString()) || {
        totalOrders: 0,
        totalSpend: 0,
        lastOrderDate: null
      };

      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || (u.addresses?.[0]?.phone || ''),
        provider: u.provider,
        isActive: u.isActive !== false,
        totalOrders: stats.totalOrders,
        totalSpend: stats.totalSpend,
        lastOrderDate: stats.lastOrderDate,
        addressCount: u.addresses?.length || 0,
        createdAt: u.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/customers/:id
 */
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
    }

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const totalSpend = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        customer: user,
        stats: {
          orderCount: orders.length,
          totalSpend
        },
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById
};
