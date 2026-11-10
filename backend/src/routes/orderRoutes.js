const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelCustomerOrder,
  publicTrackOrder
} = require('../controllers/orderController');

// Rate limit for order creation (prevents automated bot checkouts and transaction spam)
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many order requests. Please wait a few minutes before placing another order.'
  }
});

// All order operations strictly require authentication and ownership verification
router.use(authenticate);

router.post('/', orderCreationLimiter, createOrder);
router.get('/', getOrders);
router.get('/track/:id', publicTrackOrder);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelCustomerOrder);

module.exports = router;
