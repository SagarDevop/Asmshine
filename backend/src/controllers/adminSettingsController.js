const StoreSettings = require('../models/StoreSettings');
const AuditLog = require('../models/AuditLog');
const Order = require('../models/Order');
const { logAdminAction } = require('../services/auditService');

/**
 * GET /api/v1/admin/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await StoreSettings.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const settings = await StoreSettings.getSettings();
    const {
      storeName,
      tagline,
      supportEmail,
      supportPhone,
      freeShippingThreshold,
      standardDeliveryFee,
      defaultLowStockThreshold,
      businessAddress,
      enableEmailNotifications
    } = req.body;

    if (storeName) settings.storeName = storeName.trim();
    if (tagline !== undefined) settings.tagline = tagline.trim();
    if (supportEmail) settings.supportEmail = supportEmail.trim();
    if (supportPhone) settings.supportPhone = supportPhone.trim();
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (standardDeliveryFee !== undefined) settings.standardDeliveryFee = Number(standardDeliveryFee);
    if (defaultLowStockThreshold !== undefined) settings.defaultLowStockThreshold = Number(defaultLowStockThreshold);
    if (businessAddress) settings.businessAddress = { ...settings.businessAddress, ...businessAddress };
    if (enableEmailNotifications !== undefined) settings.enableEmailNotifications = Boolean(enableEmailNotifications);

    await settings.save();

    await logAdminAction({
      req,
      action: 'SETTINGS_UPDATE',
      resourceType: 'StoreSettings',
      resourceId: settings._id.toString(),
      details: { storeName: settings.storeName, freeShippingThreshold: settings.freeShippingThreshold }
    });

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully.',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action = '' } = req.query;

    const query = {};
    if (action) {
      query.action = action;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: logs,
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
 * GET /api/v1/admin/reports/export-orders
 * Streams orders as downloadable CSV
 */
const exportOrdersCsv = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'email')
      .lean();

    // Generate CSV Header
    let csv = 'Order ID,Date,Customer Name,Phone,Email,City,State,Items Count,Total Amount,Payment Method,Payment Status,Order Status\n';

    orders.forEach((o) => {
      const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      const date = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '';
      const name = escape(o.shippingAddress?.fullName || 'Customer');
      const phone = escape(o.shippingAddress?.phone || '');
      const email = escape(o.user?.email || '');
      const city = escape(o.shippingAddress?.city || '');
      const state = escape(o.shippingAddress?.state || '');
      const itemsCount = o.items?.length || 0;
      const total = o.totalAmount || 0;
      const method = escape(o.paymentMethod || 'cod');
      const payStatus = escape(o.paymentStatus || 'pending');
      const ordStatus = escape(o.status || 'CONFIRMED');

      csv += `${o.orderId},${date},${name},${phone},${email},${city},${state},${itemsCount},${total},${method},${payStatus},${ordStatus}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="asm_shine_orders_${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getAuditLogs,
  exportOrdersCsv
};
