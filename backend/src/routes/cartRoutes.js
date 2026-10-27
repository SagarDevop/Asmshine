const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  syncGuestCart
} = require('../controllers/cartController');

// All authenticated cart routes are strictly protected by session/token
router.use(authenticate);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartQuantity);
router.post('/update', updateCartQuantity);
router.delete('/remove/:productId', removeFromCart);
router.post('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/clear', clearCart);
router.post('/sync', syncGuestCart);

module.exports = router;
