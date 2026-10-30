const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelCustomerOrder,
  publicTrackOrder
} = require('../controllers/orderController');

// Public Live Order Tracking (Accessible with Order ID)
router.get('/track/:id', publicTrackOrder);

// Authenticated customer order operations
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelCustomerOrder);

module.exports = router;
