const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Helper to populate cart items with authoritative database product data and calculate totals
 */
const buildCartResponse = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      items: [],
      data: [],
      totalCount: 0,
      totalMRP: 0,
      totalPrice: 0,
      totalDiscount: 0
    };
  }

  const productIds = cart.items.map((item) => item.productId);
  const objectIds = productIds.filter((id) => mongoose.isValidObjectId(id));

  const products = await Product.find({
    status: 'active',
    $or: [
      { id: { $in: productIds } },
      { _id: { $in: objectIds } }
    ]
  }).lean();

  let totalMRP = 0;
  let totalPrice = 0;
  let totalCount = 0;

  const populatedItems = [];

  for (const item of cart.items) {
    const product = products.find(
      (p) => p.id === item.productId || p._id.toString() === item.productId
    );

    if (!product) {
      // Product may have been deleted or invalid
      continue;
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

    // Check size-specific pricing if applicable
    let unitPrice = product.price;
    let unitMRP = product.originalPrice || product.price;
    let selectedImage = product.image;

    if (item.size && Array.isArray(product.availableSizes)) {
      const sizeVariant = product.availableSizes.find(
        (s) => s.size.toLowerCase() === item.size.toLowerCase()
      );
      if (sizeVariant) {
        if (sizeVariant.price) unitPrice = sizeVariant.price;
        if (sizeVariant.originalPrice) unitMRP = sizeVariant.originalPrice;
        if (sizeVariant.image) selectedImage = sizeVariant.image;
      }
    }

    const itemMRP = unitMRP * qty;
    const itemTotal = unitPrice * qty;
    const itemSavings = itemMRP - itemTotal;

    totalMRP += itemMRP;
    totalPrice += itemTotal;
    totalCount += qty;

    populatedItems.push({
      productId: product.id || item.productId,
      size: item.size || '',
      quantity: qty,
      product: {
        id: product.id,
        _id: product._id,
        name: product.name,
        shortName: product.shortName,
        price: unitPrice,
        originalPrice: unitMRP,
        discountPercent: product.discountPercent,
        image: selectedImage,
        inStock: product.inStock !== false,
        category: product.category,
        brand: product.brand || 'ASM SHINE'
      },
      itemMRP,
      itemTotal,
      itemSavings
    });
  }

  const totalDiscount = Math.max(0, totalMRP - totalPrice);

  return {
    items: populatedItems,
    data: populatedItems,
    totalCount,
    totalMRP,
    totalPrice,
    totalDiscount
  };
};

/**
 * GET /api/v1/cart
 * Returns authenticated user's cart populated with live database prices
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const cartData = await buildCartResponse(cart);

    // If any items were dropped because they were deleted from DB, persist cleaned cart
    if (cart.items.length !== cartData.items.length) {
      cart.items = cart.items.filter((item) =>
        cartData.items.some((pi) => pi.productId === item.productId || (pi.product?._id && pi.product._id.toString() === item.productId))
      );
      await cart.save().catch(() => {});
    }

    res.status(200).json({
      success: true,
      ...cartData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/cart/add
 * Adds an item to the authenticated user's cart with live DB validation
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = '' } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required.'
      });
    }

    const numQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Validate product exists and is active in MongoDB
    const isObjectId = mongoose.isValidObjectId(productId);
    const product = await Product.findOne({
      status: 'active',
      $or: [
        { id: productId },
        { _id: isObjectId ? productId : null }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'This product is no longer available or has been discontinued.'
      });
    }

    if (product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently out of stock.'
      });
    }

    // If size/variant is specified, check variant-specific stock
    if (size && Array.isArray(product.availableSizes)) {
      const variant = product.availableSizes.find(
        (v) => v.size && v.size.toLowerCase() === size.trim().toLowerCase()
      );
      if (variant && (variant.inStock === false || (variant.stockQuantity !== undefined && variant.stockQuantity <= 0))) {
        return res.status(400).json({
          success: false,
          message: `The '${size}' size for this product is currently out of stock.`
        });
      }
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const cleanProductId = product.id || productId;
    const existingIndex = cart.items.findIndex(
      (i) => i.productId === cleanProductId && (i.size || '') === (size || '')
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += numQty;
    } else {
      cart.items.push({
        productId: cleanProductId,
        size: size || '',
        quantity: numQty
      });
    }

    await cart.save();

    const cartData = await buildCartResponse(cart);

    res.status(200).json({
      success: true,
      message: 'Product added to cart.',
      ...cartData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/cart/update
 * Updates quantity of an item in the authenticated user's cart
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, quantity, size = '' } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'productId and quantity are required.'
      });
    }

    const numQty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    if (numQty <= 0) {
      // Remove item
      cart.items = cart.items.filter(
        (i) => !(i.productId === productId && (i.size || '') === (size || ''))
      );
    } else {
      const existingIndex = cart.items.findIndex(
        (i) => i.productId === productId && (i.size || '') === (size || '')
      );
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = numQty;
      } else {
        cart.items.push({
          productId,
          size: size || '',
          quantity: numQty
        });
      }
    }

    await cart.save();

    const cartData = await buildCartResponse(cart);

    res.status(200).json({
      success: true,
      message: numQty <= 0 ? 'Item removed from cart.' : 'Cart updated.',
      ...cartData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/cart/remove/:productId
 * Removes an item from the authenticated user's cart
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const size = req.query.size || '';

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty.',
        items: [],
        totalCount: 0
      });
    }

    cart.items = cart.items.filter(
      (i) => !(i.productId === productId && (!size || (i.size || '') === size))
    );

    await cart.save();

    const cartData = await buildCartResponse(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      ...cartData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/cart/clear
 * Clears all items from the authenticated user's cart
 */
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      items: [],
      data: [],
      totalCount: 0,
      totalMRP: 0,
      totalPrice: 0,
      totalDiscount: 0
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/cart/sync
 * Merges guest cart items into authenticated user's server cart after login/register
 */
const syncGuestCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      const existing = await Cart.findOne({ user: req.user._id });
      const cartData = await buildCartResponse(existing);
      return res.status(200).json({
        success: true,
        message: 'No guest items to merge.',
        ...cartData
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const guestItem of items) {
      if (!guestItem || !guestItem.productId) continue;

      const pid = guestItem.productId.trim();
      const qty = Math.max(1, parseInt(guestItem.quantity, 10) || 1);
      const size = (guestItem.size || '').trim();

      // Verify product exists in DB
      const isObjectId = mongoose.isValidObjectId(pid);
      const product = await Product.findOne({
        $or: [
          { id: pid },
          { _id: isObjectId ? pid : null }
        ]
      });

      if (!product || product.inStock === false) continue;

      const cleanPid = product.id || pid;
      const existingIndex = cart.items.findIndex(
        (i) => i.productId === cleanPid && (i.size || '') === size
      );

      if (existingIndex > -1) {
        // Increment quantity, capping at 10 for safety
        cart.items[existingIndex].quantity = Math.min(
          cart.items[existingIndex].quantity + qty,
          10
        );
      } else {
        cart.items.push({
          productId: cleanPid,
          size,
          quantity: Math.min(qty, 10)
        });
      }
    }

    await cart.save();

    const cartData = await buildCartResponse(cart);

    res.status(200).json({
      success: true,
      message: 'Guest cart merged successfully.',
      ...cartData
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  syncGuestCart
};
