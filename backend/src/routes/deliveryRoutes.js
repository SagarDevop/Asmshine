const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const deliveryController = require('../controllers/deliveryController');

// Rate limiting for public delivery estimation and pincode lookups
const deliveryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many delivery lookups. Please wait a moment.'
  }
});

// Public endpoints
router.get('/settings', deliveryController.getDeliverySettings);
router.get('/estimate', deliveryLimiter, deliveryController.estimateDelivery);
router.get('/pincode/:pincode', deliveryLimiter, deliveryController.getPincodeDetails);

module.exports = router;
