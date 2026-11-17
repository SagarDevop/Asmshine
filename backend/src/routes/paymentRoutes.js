const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleRazorpayWebhook,
  logPaymentFailure,
  getRazorpayKey
} = require('../controllers/paymentController');

// Rate limiter to prevent card-testing attacks and gateway spam
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 payment requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many payment requests from this network. Please wait a few minutes before trying again.'
  }
});

// Razorpay standard checkout endpoints
router.post('/create-order', paymentLimiter, createRazorpayOrder);
router.post('/verify-payment', paymentLimiter, verifyPaymentSignature);
router.post('/webhook', handleRazorpayWebhook);
router.post('/payment/webhook', handleRazorpayWebhook);
router.post('/log-failure', logPaymentFailure);
router.post('/payment/log-failure', logPaymentFailure);
router.get('/key', getRazorpayKey);
router.get('/payment/key', getRazorpayKey);

module.exports = router;
