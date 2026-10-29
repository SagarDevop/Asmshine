const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelCustomerOrder
} = require('../controllers/orderController');

// All order endpoints strictly require authentication
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelCustomerOrder);

module.exports = router;
