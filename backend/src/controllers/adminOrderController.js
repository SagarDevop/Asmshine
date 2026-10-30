const mongoose = require('mongoose');
const Order = require('../models/Order');
const { restoreOrderStock } = require('../services/inventoryService');
const { logAdminAction } = require('../services/auditService');
const realtimeHub = require('../services/realtimeHub');

/**
 * Valid order status transitions map
 */
const VALID_TRANSITIONS = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'DELIVERED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED', 'CANCELLED'],
  DELIVERED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: []
};

/**
 * GET /api/v1/admin/orders
 * Filter, search, and paginate orders
 */
const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      paymentMethod = '',
      paymentStatus = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const query = {};

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderId: reg },
        { 'shippingAddress.fullName': reg },
        { 'shippingAddress.phone': reg },
        { 'shippingAddress.city': reg }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email phone')
        .lean(),
      Order.countDocuments(query)
    ]);

    const formatted = orders.map((o) => ({
      id: o.orderId,
      orderId: o.orderId,
      _id: o._id,
      customerName: o.shippingAddress?.fullName || o.user?.name || 'Customer',
      customerPhone: o.shippingAddress?.phone || o.user?.phone || '',
      customerEmail: o.user?.email || '',
      itemCount: o.items?.length || 0,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      shippingCity: o.shippingAddress?.city || '',
      shippingState: o.shippingAddress?.state || ''
    }));

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
 * GET /api/v1/admin/orders/:id
 * Full order details with customer, items, shipping, timeline, and actions
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: isObjectId ? id : null }]
    })
      .populate('user', 'name email phone createdAt')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Validates transition, records tracking details, and updates order timeline
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      carrier = '',
      trackingNumber = '',
      trackingUrl = '',
      note = ''
    } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Target status is required.' });
    }

    const isObjectId = mongoose.isValidObjectId(id);
    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: isObjectId ? id : null }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = order.status;
    const allowedTargets = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTargets.includes(status) && currentStatus !== status) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed: [${allowedTargets.join(', ')}]`
      });
    }

    order.status = status;

    // Attach shipping information when dispatched
    if (status === 'SHIPPED') {
      if (!order.shippingDetails) order.shippingDetails = {};
      if (carrier) order.shippingDetails.carrier = carrier.trim();
      if (trackingNumber) order.shippingDetails.trackingNumber = trackingNumber.trim();
      if (trackingUrl) order.shippingDetails.trackingUrl = trackingUrl.trim();
      order.shippingDetails.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      if (!order.shippingDetails) order.shippingDetails = {};
      order.shippingDetails.deliveredAt = new Date();
      // For COD orders, delivery implies successful payment collection
      if (order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
        order.paymentStatus = 'completed';
      }
    }

    // Add timeline record
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status,
      title: `Status updated to ${status}`,
      note: note.trim() || (trackingNumber ? `Shipped via ${carrier} (Tracking: ${trackingNumber})` : ''),
      timestamp: new Date(),
      updatedBy: req.user.name || 'Admin'
    });

    await order.save();

    try {
      realtimeHub.notifyOrderStatusChanged(order.orderId, status);
    } catch (rtErr) {
      console.warn('[Realtime] Status update broadcast error:', rtErr.message);
    }

    await logAdminAction({
      req,
      action: 'ORDER_STATUS_UPDATE',
      resourceType: 'Order',
      resourceId: order.orderId,
      details: { from: currentStatus, to: status, carrier, trackingNumber }
    });

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to '${status}'.`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/orders/:id/cancel
 * Cancel order with mandatory reason and idempotent stock restoration
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, refundPayment = false } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A cancellation reason is required.'
      });
    }

    const isObjectId = mongoose.isValidObjectId(id);
    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: isObjectId ? id : null }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order in '${order.status}' status cannot be cancelled.`
      });
    }

    const prevStatus = order.status;
    order.status = 'CANCELLED';

    order.cancellation = {
      cancelledAt: new Date(),
      reason: reason.trim(),
      cancelledBy: req.user._id,
      stockRestored: true
    };

    if (refundPayment && order.paymentStatus === 'completed') {
      order.paymentStatus = 'refunded';
    }

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: 'CANCELLED',
      title: 'Order Cancelled by Admin',
      note: reason.trim(),
      timestamp: new Date(),
      updatedBy: req.user.name || 'Admin'
    });

    await order.save();

    try {
      realtimeHub.notifyOrderStatusChanged(order.orderId, 'CANCELLED', { reason: reason.trim() });
    } catch (rtErr) {
      console.warn('[Realtime] Cancel broadcast error:', rtErr.message);
    }

    // Safely restore stock (idempotent)
    const restoreResult = await restoreOrderStock(order, reason.trim(), req.user);

    await logAdminAction({
      req,
      action: 'ORDER_CANCEL',
      resourceType: 'Order',
      resourceId: order.orderId,
      details: {
        previousStatus: prevStatus,
        reason: reason.trim(),
        stockRestoredItems: restoreResult.restoredCount
      }
    });

    res.status(200).json({
      success: true,
      message: `Order #${order.orderId} cancelled and stock safely restored.`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
