const crypto = require('crypto');
const mongoose = require('mongoose');
const { getRazorpayInstance } = require('../config/razorpay');
const Order = require('../models/Order');
const inventoryService = require('../services/inventoryService');
const realtimeHub = require('../services/realtimeHub');

/**
 * POST /api/create-order or /api/v1/payment/create-order
 * Creates an order in Razorpay
 * Request: { amount (paise), currency, receipt, notes }
 * Return: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const rawAmount = req.body.amount;

    if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
      return res.status(400).json({
        success: false,
        message: 'Amount is required.'
      });
    }

    const amountInPaise = Math.round(Number(rawAmount));

    // Validate amount >= 100 paise (₹1 minimum per Razorpay specifications)
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount is 100 paise (₹1.00).'
      });
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay API credentials are not configured on the server.'
      });
    }

    const razorpay = getRazorpayInstance();

    const currency = (req.body.currency || 'INR').toUpperCase();
    const rawReceipt = req.body.receipt || req.body.orderId || `rcpt_${Date.now().toString().slice(-8)}`;
    const receipt = String(rawReceipt).slice(0, 40); // Razorpay receipt max length: 40 chars

    const options = {
      amount: amountInPaise,
      currency,
      receipt,
      notes: req.body.notes || {}
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      key_id: keyId
    });
  } catch (error) {
    console.error('[Razorpay Create Order Error]:', error);

    // Handle authentication failures (HTTP 401)
    if (error.statusCode === 401 || error?.error?.code === 'BAD_REQUEST_ERROR' && error?.error?.description?.toLowerCase().includes('auth')) {
      return res.status(401).json({
        success: false,
        message: 'Razorpay authentication failed. Please verify API keys.'
      });
    }

    const errorMsg = error?.error?.description || error.message || 'Failed to create Razorpay order.';
    return res.status(500).json({
      success: false,
      message: errorMsg
    });
  }
};

/**
 * POST /api/verify-payment or /api/v1/payment/verify-payment
 * Verifies payment signature using HMAC-SHA256
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match. Signature mismatch: return 400, do NOT mark as paid.
 */
const verifyPaymentSignature = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      payment_id,
      signature,
      orderId
    } = req.body;

    const finalOrderId = razorpay_order_id || order_id;
    const finalPaymentId = razorpay_payment_id || payment_id;
    const finalSignature = razorpay_signature || signature;

    // Validate missing fields
    if (!finalOrderId || !finalPaymentId || !finalSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields (order_id, payment_id, signature).'
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret key is not configured on the server.'
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const data = `${finalOrderId}|${finalPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(data)
      .digest('hex');

    // Secure constant-time comparison
    const sigBuffer = Buffer.from(finalSignature, 'utf-8');
    const genBuffer = Buffer.from(generatedSignature, 'utf-8');

    const isMatch = sigBuffer.length === genBuffer.length && crypto.timingSafeEqual(sigBuffer, genBuffer);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Signature mismatch: payment verification failed. Payment was not recorded as paid.'
      });
    }

    // If matching order exists in database, update payment status and confirm fulfillment
    const targetOrderId = orderId || req.body.receipt;
    let updatedOrder = null;

    if (targetOrderId) {
      const query = [
        { orderId: targetOrderId },
        { 'paymentDetails.razorpayOrderId': finalOrderId }
      ];
      if (mongoose.isValidObjectId(targetOrderId)) {
        query.push({ _id: targetOrderId });
      }

      const orderDoc = await Order.findOne({ $or: query });

      if (orderDoc) {
        orderDoc.paymentStatus = 'completed';
        orderDoc.status = 'CONFIRMED';
        orderDoc.paymentDetails = {
          razorpayOrderId: finalOrderId,
          razorpayPaymentId: finalPaymentId,
          razorpaySignature: finalSignature,
          paidAt: new Date()
        };

        // Add timeline event
        orderDoc.timeline.push({
          status: 'CONFIRMED',
          title: 'Payment Successful',
          note: `Payment verified via Razorpay (Payment ID: ${finalPaymentId}). Order confirmed for dispatch.`,
          timestamp: new Date(),
          updatedBy: 'Razorpay Gateway'
        });

        // Deduct inventory stock upon verified payment
        try {
          await inventoryService.deductOrderStock(orderDoc.items, orderDoc.orderId, orderDoc.user);
        } catch (invErr) {
          console.warn('[Payment] Inventory deduction warning:', invErr.message);
        }

        await orderDoc.save();
        updatedOrder = orderDoc;

        // Broadcast realtime notification to admin dashboard
        try {
          realtimeHub.notifyNewOrder(orderDoc);
        } catch (rtErr) {
          console.warn('[Payment] Realtime notification warning:', rtErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id: finalOrderId,
      payment_id: finalPaymentId,
      order: updatedOrder
    });
  } catch (error) {
    console.error('[Razorpay Verify Payment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while verifying payment.'
    });
  }
};

/**
 * GET /api/payment/key or /api/v1/payment/key
 * Returns public Key ID for client-side Razorpay modal initialization
 */
const getRazorpayKey = (req, res) => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (!keyId) {
    return res.status(500).json({
      success: false,
      message: 'Razorpay Key ID is not configured.'
    });
  }
  return res.status(200).json({
    success: true,
    key_id: keyId
  });
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  getRazorpayKey
};
