const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById
} = require('../controllers/orderController');

// All order endpoints strictly require authentication
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

module.exports = router;
