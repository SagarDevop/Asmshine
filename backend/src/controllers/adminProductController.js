const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const StockMovement = require('../models/StockMovement');
const { logAdminAction } = require('../services/auditService');

/**
 * GET /api/v1/admin/products
 * Search, filter by category/status/stock, and paginate
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      status = '',
      stock = ''
    } = req.query;

    const query = { status: { $ne: 'archived' } };

    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { id: reg }, { sku: reg }, { category: reg }];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (stock === 'in_stock') {
      query.stockQuantity = { $gt: 0 };
    } else if (stock === 'out_of_stock') {
      query.$or = [{ stockQuantity: { $lte: 0 } }, { inStock: false }];
    } else if (stock === 'low_stock') {
      query.$expr = {
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', { $ifNull: ['$lowStockThreshold', 5] }] }
        ]
      };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: products.map((p) => ({
        ...p,
        availableStock: Math.max(0, (p.stockQuantity || 0) - (p.reservedQuantity || 0))
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const product = await Product.findOne({
      $or: [{ id }, { _id: isObjectId ? id : null }]
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...product,
        availableStock: Math.max(0, (product.stockQuantity || 0) - (product.reservedQuantity || 0))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/products
 * Create product with server-side validation and stock initialization
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      id,
      sku,
      category,
      section = 'everyday_essentials',
      size = '500ml',
      price,
      originalPrice,
      costPrice = 0,
      stockQuantity = 20,
      lowStockThreshold = 5,
      image,
      description = '',
      highlights = [],
      specifications = {},
      status = 'active',
      badge = '',
      availableSizes = []
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and selling price are required.'
      });
    }

    const numPrice = Number(price);
    const numMRP = Number(originalPrice || price);
    const numStock = Math.max(0, parseInt(stockQuantity, 10) || 0);

    if (numPrice < 0 || numMRP < 0) {
      return res.status(400).json({
        success: false,
        message: 'Prices must be non-negative values.'
      });
    }

    // Auto-generate slug ID if not provided
    const baseSlug = (id || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    let finalId = baseSlug;
    const existingSlug = await Product.findOne({ id: finalId });
    if (existingSlug) {
      finalId = `${baseSlug}_${Date.now().toString().slice(-4)}`;
    }

    // Auto-generate SKU if not provided
    const finalSku = (sku || `SKU-${finalId.toUpperCase()}`).trim();
    const existingSku = await Product.findOne({ sku: finalSku });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: `SKU '${finalSku}' already exists. Please choose a unique SKU.`
      });
    }

    const discountPercent = numMRP > numPrice ? Math.round(((numMRP - numPrice) / numMRP) * 100) : 0;

    let normalizedSizes = [];
    if (Array.isArray(availableSizes) && availableSizes.length > 0) {
      normalizedSizes = availableSizes.map((s, idx) => {
        const sPrice = Number(s.price || numPrice);
        const sMRP = Number(s.originalPrice || sPrice);
        const sStock = s.stockQuantity !== undefined ? Math.max(0, parseInt(s.stockQuantity, 10) || 0) : numStock;
        const sDisc = sMRP > sPrice ? `${Math.round(((sMRP - sPrice) / sMRP) * 100)}% off` : (s.discount || '');
        return {
          size: (s.size || `Variant ${idx + 1}`).trim(),
          sku: (s.sku || `${finalSku}-${idx + 1}`).trim(),
          price: sPrice,
          originalPrice: sMRP,
          discount: sDisc,
          stockQuantity: sStock,
          inStock: sStock > 0,
          image: (s.image || image || '').trim()
        };
      });
    } else {
      normalizedSizes = [];
    }

    const cleanHighlights = Array.isArray(highlights)
      ? highlights.map((h) => String(h).trim()).filter(Boolean)
      : [];

    let cleanSpecifications = {};
    if (specifications && typeof specifications === 'object') {
      if (Array.isArray(specifications)) {
        specifications.forEach((item) => {
          if (item && item.key && item.value) {
            cleanSpecifications[String(item.key).trim()] = String(item.value).trim();
          }
        });
      } else {
        cleanSpecifications = specifications;
      }
    }

    const newProduct = new Product({
      id: finalId,
      name: name.trim(),
      sku: finalSku,
      category: category.trim(),
      section,
      size,
      price: numPrice,
      originalPrice: numMRP,
      costPrice: Number(costPrice) || 0,
      discountPercent,
      stockQuantity: numStock,
      reservedQuantity: 0,
      lowStockThreshold: Math.max(0, parseInt(lowStockThreshold, 10) || 5),
      inStock: numStock > 0,
      image: image || '/images/products/all_shine_dishwash_gel_500ml.png',
      description,
      availableSizes: normalizedSizes,
      highlights: cleanHighlights,
      specifications: cleanSpecifications,
      status,
      badge: badge.trim()
    });

    await newProduct.save();

    // Initial stock movement record
    if (numStock > 0) {
      await StockMovement.create({
        product: newProduct._id,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: finalSku,
        previousQuantity: 0,
        changeQuantity: numStock,
        newQuantity: numStock,
        type: 'RESTOCK',
        reason: 'Initial inventory creation',
        performedBy: req.user._id,
        performedByName: req.user.name || 'Admin'
      });
    }

    await logAdminAction({
      req,
      action: 'PRODUCT_CREATE',
      resourceType: 'Product',
      resourceId: newProduct.id,
      details: { name: newProduct.name, price: numPrice, stock: numStock }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const product = await Product.findOne({
      $or: [{ id }, { _id: isObjectId ? id : null }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      category,
      section,
      size,
      price,
      originalPrice,
      costPrice,
      stockQuantity,
      lowStockThreshold,
      image,
      description,
      highlights,
      specifications,
      status,
      badge,
      sku,
      inStock,
      availableSizes
    } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (section) product.section = section;
    if (size) product.size = size;
    if (description !== undefined) product.description = description;
    if (badge !== undefined) product.badge = badge.trim();
    if (image) product.image = image;
    if (status) product.status = status;
    if (highlights !== undefined) {
      product.highlights = Array.isArray(highlights)
        ? highlights.map((h) => String(h).trim()).filter(Boolean)
        : [];
    }

    if (specifications !== undefined) {
      let cleanSpecifications = {};
      if (specifications && typeof specifications === 'object') {
        if (Array.isArray(specifications)) {
          specifications.forEach((item) => {
            if (item && item.key && item.value) {
              cleanSpecifications[String(item.key).trim()] = String(item.value).trim();
            }
          });
        } else {
          cleanSpecifications = specifications;
        }
      }
      product.specifications = cleanSpecifications;
      product.markModified('specifications');
    }

    if (price !== undefined) {
      const numP = Number(price);
      if (numP < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      product.price = numP;
    }

    if (originalPrice !== undefined) {
      const numMRP = Number(originalPrice);
      if (numMRP < 0) return res.status(400).json({ success: false, message: 'MRP cannot be negative.' });
      product.originalPrice = numMRP;
    }

    if (costPrice !== undefined) {
      product.costPrice = Math.max(0, Number(costPrice) || 0);
    }

    if (product.originalPrice > product.price) {
      product.discountPercent = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    } else {
      product.discountPercent = 0;
    }

    if (sku && sku !== product.sku) {
      const checkSku = await Product.findOne({ sku: sku.trim(), _id: { $ne: product._id } });
      if (checkSku) {
        return res.status(400).json({ success: false, message: `SKU '${sku}' already taken.` });
      }
      product.sku = sku.trim();
    }

    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = Math.max(0, parseInt(lowStockThreshold, 10) || 5);
    }

    // Direct stock update if explicitly edited
    if (stockQuantity !== undefined) {
      const targetStock = Math.max(0, parseInt(stockQuantity, 10) || 0);
      const delta = targetStock - (product.stockQuantity || 0);

      if (delta !== 0) {
        await StockMovement.create({
          product: product._id,
          productId: product.id,
          productName: product.name,
          sku: product.sku || '',
          previousQuantity: product.stockQuantity || 0,
          changeQuantity: delta,
          newQuantity: targetStock,
          type: 'ADJUSTMENT',
          reason: 'Manual adjustment via Product Edit Screen',
          performedBy: req.user._id,
          performedByName: req.user.name || 'Admin'
        });
      }

      product.stockQuantity = targetStock;
      product.inStock = targetStock > 0;
    }

    if (inStock !== undefined) {
      product.inStock = Boolean(inStock);
    }

    if (availableSizes !== undefined && Array.isArray(availableSizes)) {
      product.availableSizes = availableSizes.map((s, idx) => {
        const sPrice = Number(s.price || product.price);
        const sMRP = Number(s.originalPrice || sPrice);
        const sStock = s.stockQuantity !== undefined ? Math.max(0, parseInt(s.stockQuantity, 10) || 0) : (product.stockQuantity || 0);
        const sDisc = sMRP > sPrice ? `${Math.round(((sMRP - sPrice) / sMRP) * 100)}% off` : (s.discount || '');
        return {
          size: (s.size || `Variant ${idx + 1}`).trim(),
          sku: (s.sku || `${product.sku || 'SKU'}-${idx + 1}`).trim(),
          price: sPrice,
          originalPrice: sMRP,
          discount: sDisc,
          stockQuantity: sStock,
          inStock: sStock > 0,
          image: (s.image || product.image || '').trim()
        };
      });
    }

    // Auto-sync inStock with stockQuantity if stock is 0
    if (product.stockQuantity <= 0) {
      product.inStock = false;
    }

    await product.save();

    await logAdminAction({
      req,
      action: 'PRODUCT_UPDATE',
      resourceType: 'Product',
      resourceId: product.id,
      details: { name: product.name, price: product.price, stock: product.stockQuantity }
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/products/:id/status
 * Toggle product active/inactive
 */
const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const product = await Product.findOne({
      $or: [{ id }, { _id: isObjectId ? id : null }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();

    await logAdminAction({
      req,
      action: 'PRODUCT_STATUS_TOGGLE',
      resourceType: 'Product',
      resourceId: product.id,
      details: { newStatus: product.status }
    });

    res.status(200).json({
      success: true,
      message: `Product is now ${product.status}.`,
      status: product.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/products/:id
 * Safeguard: If product has ever been purchased, archive it rather than destroying historical orders!
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const product = await Product.findOne({
      $or: [{ id }, { _id: isObjectId ? id : null }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if referenced in historical orders
    const orderCount = await Order.countDocuments({
      'items.productId': product.id
    });

    if (orderCount > 0) {
      // Archive product safely to protect order history integrity
      product.status = 'archived';
      product.inStock = false;
      await product.save();

      await logAdminAction({
        req,
        action: 'PRODUCT_ARCHIVE',
        resourceType: 'Product',
        resourceId: product.id,
        details: { reason: `Referenced by ${orderCount} existing orders` }
      });

      return res.status(200).json({
        success: true,
        message: `Product has been archived rather than permanently deleted because it is referenced in ${orderCount} historical orders.`
      });
    }

    // Fresh product with zero orders can be safely deleted
    await Product.findByIdAndDelete(product._id);

    await logAdminAction({
      req,
      action: 'PRODUCT_DELETE',
      resourceType: 'Product',
      resourceId: product.id,
      details: { name: product.name }
    });

    res.status(200).json({
      success: true,
      message: 'Product permanently deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
};
