const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { adjustStock } = require('../services/inventoryService');
const { logAdminAction } = require('../services/auditService');

/**
 * GET /api/v1/admin/inventory
 * Retrieves inventory levels, stock alerts, and threshold configurations
 */
const getInventory = async (req, res, next) => {
  try {
    const { search = '', filter = '', page = 1, limit = 25 } = req.query;

    const query = { status: { $ne: 'archived' } };

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { id: reg }, { sku: reg }, { category: reg }];
    }

    if (filter === 'low') {
      query.$expr = {
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', { $ifNull: ['$lowStockThreshold', 5] }] }
        ]
      };
    } else if (filter === 'out') {
      query.$or = [{ stockQuantity: { $lte: 0 } }, { inStock: false }];
    } else if (filter === 'in') {
      query.$expr = {
        $gt: ['$stockQuantity', { $ifNull: ['$lowStockThreshold', 5] }]
      };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(query)
        .select('id name sku category size price stockQuantity reservedQuantity lowStockThreshold inStock status image')
        .sort({ stockQuantity: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    const formatted = items.map((p) => {
      const onHand = p.stockQuantity || 0;
      const reserved = p.reservedQuantity || 0;
      const available = Math.max(0, onHand - reserved);
      const threshold = p.lowStockThreshold || 5;

      let stockStatus = 'IN_STOCK';
      if (onHand <= 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (onHand <= threshold) {
        stockStatus = 'LOW_STOCK';
      }

      return {
        id: p.id,
        _id: p._id,
        name: p.name,
        sku: p.sku || `SKU-${p.id.toUpperCase()}`,
        category: p.category,
        size: p.size,
        price: p.price,
        image: p.image,
        onHand,
        reserved,
        available,
        threshold,
        stockStatus,
        isActive: p.status === 'active'
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
 * POST /api/v1/admin/inventory/adjust
 * Atomically adjust stock with mandatory reason and audit entry
 */
const performStockAdjustment = async (req, res, next) => {
  try {
    const {
      productId,
      changeQuantity,
      newQuantity,
      type = 'ADJUSTMENT',
      reason
    } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A mandatory reason must be provided for all inventory adjustments.'
      });
    }

    const { product, movement } = await adjustStock({
      productId,
      changeQuantity,
      newQuantity,
      type,
      reason: reason.trim(),
      adminUser: req.user
    });

    await logAdminAction({
      req,
      action: 'STOCK_ADJUSTMENT',
      resourceType: 'Product',
      resourceId: product.id,
      details: {
        type,
        reason: reason.trim(),
        previousStock: movement.previousQuantity,
        change: movement.changeQuantity,
        newStock: movement.newQuantity
      }
    });

    res.status(200).json({
      success: true,
      message: `Stock successfully adjusted for '${product.name}'. New quantity: ${product.stockQuantity}.`,
      data: {
        product: {
          id: product.id,
          name: product.name,
          stockQuantity: product.stockQuantity,
          inStock: product.inStock
        },
        movement
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/inventory/movements
 * Immutable audit log of all stock deductions, restorations, and adjustments
 */
const getMovements = async (req, res, next) => {
  try {
    const { productId = '', type = '', page = 1, limit = 30 } = req.query;

    const query = {};
    if (productId) {
      query.productId = productId;
    }
    if (type) {
      query.type = type;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [movements, total] = await Promise.all([
      StockMovement.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      StockMovement.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: movements,
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

module.exports = {
  getInventory,
  performStockAdjustment,
  getMovements
};
