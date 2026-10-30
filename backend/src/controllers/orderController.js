const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const StoreSettings = require('../models/StoreSettings');
const inventoryService = require('../services/inventoryService');

/**
 * POST /api/v1/orders
 * Creates an authoritative order backed by MongoDB with server-side price validation
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'cod',
      couponCode = ''
    } = req.body;

    // 1. Validate items presence
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // 2. Validate shipping address fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required.'
      });
    }

    const recipientName = (shippingAddress.fullName || shippingAddress.name || '').trim();
    const phone = (shippingAddress.phone || '').trim();
    const pincode = (shippingAddress.pincode || '').trim();
    const street = (shippingAddress.street || '').trim();
    const city = (shippingAddress.city || '').trim();
    const state = (shippingAddress.state || '').trim();
    const type = (shippingAddress.type || 'HOME').toUpperCase();

    if (!recipientName || !phone || !pincode || !street || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields (full name, phone, pincode, street, city, state) are required.'
      });
    }

    // 3. Collect product IDs from items
    const rawIds = items.map((i) => (i.productId || i.product?.id || i.product?._id || '').toString()).filter(Boolean);
    const objectIds = rawIds.filter((id) => mongoose.isValidObjectId(id));

    const dbProducts = await Product.find({
      $or: [
        { id: { $in: rawIds } },
        { _id: { $in: objectIds } }
      ]
    }).lean();

    // 4. Validate each item and calculate prices strictly from DB
    let totalMRP = 0;
    let itemsSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pid = (item.productId || item.product?.id || item.product?._id || '').toString();
      const product = dbProducts.find(
        (p) => p.id === pid || p._id.toString() === pid
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product '${pid}' is no longer available in the catalogue.`
        });
      }

      if (product.inStock === false) {
        return res.status(400).json({
          success: false,
          message: `Product '${product.name}' is currently out of stock.`
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Resolve size-specific price if specified
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

      const itemTotal = unitPrice * qty;
      const itemMRP = unitMRP * qty;

      itemsSubtotal += itemTotal;
      totalMRP += itemMRP;

      verifiedItems.push({
        productId: product.id || pid,
        name: product.name,
        image: selectedImage,
        size: item.size || product.size || '',
        quantity: qty,
        unitPrice,
        unitMRP,
        totalPrice: itemTotal,
        totalMRP: itemMRP
      });
    }

    const productDiscount = Math.max(0, totalMRP - itemsSubtotal);

    // 5. Calculate coupon discount dynamically from MongoDB
    let couponDiscount = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon) {
      try {
        const dbCoupon = await Coupon.findOne({ code: cleanCoupon, isActive: true });
        if (dbCoupon) {
          const check = dbCoupon.isValidForOrder(itemsSubtotal);
          if (check.valid) {
            couponDiscount = dbCoupon.calculateDiscount(itemsSubtotal);
            await Coupon.findByIdAndUpdate(dbCoupon._id, { $inc: { usedCount: 1 } });
          }
        }
      } catch (couponErr) {
        console.warn('[Order] Coupon validation error:', couponErr.message);
      }
    }

    // 6. Calculate payment method discount (5% instant discount on UPI prepaid)
    const validPaymentMethods = ['upi', 'card', 'netbanking', 'cod'];
    const chosenPayment = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'cod';
    let prepaidDiscount = 0;
    if (chosenPayment === 'upi') {
      prepaidDiscount = Math.round((itemsSubtotal - couponDiscount) * 0.05);
    }

    // 7. Calculate dynamic delivery fee from StoreSettings
    const storeSettings = await StoreSettings.getSettings();
    const threshold = Number(storeSettings?.freeShippingThreshold) || 499;
    const standardFee = Number(storeSettings?.standardDeliveryFee) || 49;
    const netOrderValue = Math.max(0, itemsSubtotal - couponDiscount);
    const deliveryFee = netOrderValue >= threshold ? 0 : standardFee;

    const finalAmount = Math.max(0, itemsSubtotal - couponDiscount - prepaidDiscount + deliveryFee);

    // 8. Generate genuine ASM- order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ASM-${dateStr}-${randPart}`;

    // 9. Atomically deduct inventory before committing order (concurrency protected)
    await inventoryService.deductOrderStock(verifiedItems, orderId, req.user);

    // 10. Create and save Order in MongoDB
    const newOrder = new Order({
      orderId,
      user: req.user._id,
      items: verifiedItems,
      shippingAddress: {
        fullName: recipientName,
        phone,
        pincode,
        street,
        city,
        state,
        type: ['HOME', 'WORK', 'OTHER'].includes(type) ? type : 'HOME'
      },
      pricing: {
        totalMRP,
        itemsSubtotal,
        productDiscount,
        couponDiscount,
        prepaidDiscount,
        deliveryFee,
        finalAmount
      },
      totalAmount: finalAmount,
      status: 'CONFIRMED',
      paymentMethod: chosenPayment,
      paymentStatus: 'pending', // Transparent honest status: no payment gateway simulated
      coupon: {
        code: cleanCoupon,
        discountAmount: couponDiscount
      },
      timeline: [
        {
          status: 'CONFIRMED',
          title: 'Order Placed',
          note: `Order placed via ${chosenPayment.toUpperCase()}`,
          timestamp: new Date(),
          updatedBy: req.user.name || 'Customer'
        }
      ]
    });

    await newOrder.save();

    // 9. Clear user's active cart in MongoDB after successful order placement
    try {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [] }
      );
    } catch (cartErr) {
      console.warn('[Order] Could not clear cart after order placement:', cartErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: {
        id: newOrder.orderId,
        orderId: newOrder.orderId,
        _id: newOrder._id,
        items: newOrder.items,
        shippingAddress: newOrder.shippingAddress,
        pricing: newOrder.pricing,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        createdAt: newOrder.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders
 * Returns orders placed by the currently authenticated user
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o) => ({
      id: o.orderId,
      orderId: o.orderId,
      _id: o._id,
      items: (o.items || []).map((it) => ({
        ...it,
        price: it.unitPrice || it.price || 0
      })),
      shippingAddress: o.shippingAddress,
      pricing: o.pricing,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      shippingDetails: o.shippingDetails || {},
      cancellation: o.cancellation || null,
      timeline: o.timeline || []
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
      data: formattedOrders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/:id
 * Retrieve details for a specific order owned by authenticated user
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.isValidObjectId(id);

    const order = await Order.findOne({
      $or: [
        { orderId: id },
        { _id: isObjectId ? id : null }
      ],
      user: req.user._id
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        _id: order._id,
        items: (order.items || []).map((it) => ({
          ...it,
          price: it.unitPrice || it.price || 0
        })),
        shippingAddress: order.shippingAddress,
        pricing: order.pricing,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingDetails: order.shippingDetails || {},
        cancellation: order.cancellation || null,
        timeline: order.timeline || []
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/orders/:id/cancel
 * Allows authenticated customers to cancel eligible orders (CONFIRMED/PENDING_CONFIRMATION)
 * and safely restores inventory.
 */
const cancelCustomerOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const isObjectId = mongoose.isValidObjectId(id);
    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: isObjectId ? id : null }],
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it has been shipped or completed. Current status is '${order.status}'. Please contact support.`
      });
    }

    order.status = 'CANCELLED';
    order.cancellation = {
      cancelledAt: new Date(),
      reason: reason.trim(),
      cancelledBy: req.user._id,
      stockRestored: true
    };
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: 'CANCELLED',
      title: 'Order Cancelled',
      note: reason.trim(),
      timestamp: new Date(),
      updatedBy: req.user.name || 'Customer'
    });

    await order.save();

    // Safely restore stock (idempotent)
    await inventoryService.restoreOrderStock(order, reason.trim(), req.user);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/track/:id
 * Public or authenticated live order tracking
 */
const publicTrackOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const isObjectId = mongoose.isValidObjectId(id.trim());
    const order = await Order.findOne({
      $or: [{ orderId: id.trim() }, { _id: isObjectId ? id.trim() : null }]
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with reference ID #${id}`
      });
    }

    const isAuthenticated = req.user && req.user._id && order.user && order.user.toString() === req.user._id.toString();

    res.status(200).json({
      success: true,
      order: {
        id: order.orderId,
        orderId: order.orderId,
        _id: order._id,
        items: (order.items || []).map((it) => ({
          name: it.name,
          image: it.image,
          size: it.size,
          quantity: it.quantity,
          unitPrice: it.unitPrice || it.price || 0,
          price: it.unitPrice || it.price || 0,
          totalPrice: it.totalPrice || ((it.unitPrice || it.price || 0) * (it.quantity || 1)),
          totalMRP: it.totalMRP
        })),
        shippingAddress: {
          fullName: isAuthenticated ? order.shippingAddress.fullName : (order.shippingAddress.fullName ? order.shippingAddress.fullName.split(' ')[0] + ' ***' : 'Customer'),
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.pincode,
          street: isAuthenticated ? order.shippingAddress.street : (order.shippingAddress.city + ', ' + order.shippingAddress.state),
          phone: isAuthenticated ? order.shippingAddress.phone : (order.shippingAddress.phone ? '******' + order.shippingAddress.phone.slice(-4) : '')
        },
        pricing: order.pricing,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingDetails: order.shippingDetails || {},
        cancellation: order.cancellation || null,
        timeline: order.timeline || []
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelCustomerOrder,
  publicTrackOrder
};

