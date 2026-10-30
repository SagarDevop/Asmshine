const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const dashboardController = require('../controllers/adminDashboardController');
const productController = require('../controllers/adminProductController');
const inventoryController = require('../controllers/adminInventoryController');
const orderController = require('../controllers/adminOrderController');
const customerController = require('../controllers/adminCustomerController');
const couponController = require('../controllers/adminCouponController');
const settingsController = require('../controllers/adminSettingsController');

// All admin endpoints strictly require authentication and staff/admin role
router.use(authenticate);
router.use(authorize('admin', 'superadmin', 'order_manager', 'inventory_manager'));

// -------------------------------------------------------------
// 1. Dashboard Metrics
// -------------------------------------------------------------
router.get('/dashboard', dashboardController.getDashboardMetrics);

// -------------------------------------------------------------
// 2. Product Management (CRUD)
// -------------------------------------------------------------
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post(
  '/products',
  authorize('admin', 'superadmin', 'inventory_manager'),
  productController.createProduct
);
router.put(
  '/products/:id',
  authorize('admin', 'superadmin', 'inventory_manager'),
  productController.updateProduct
);
router.patch(
  '/products/:id/status',
  authorize('admin', 'superadmin', 'inventory_manager'),
  productController.toggleProductStatus
);
router.delete(
  '/products/:id',
  authorize('admin', 'superadmin'),
  productController.deleteProduct
);

// -------------------------------------------------------------
// 3. Inventory & Stock Adjustments
// -------------------------------------------------------------
router.get('/inventory', inventoryController.getInventory);
router.post(
  '/inventory/adjust',
  authorize('admin', 'superadmin', 'inventory_manager'),
  inventoryController.performStockAdjustment
);
router.get('/inventory/movements', inventoryController.getMovements);

// -------------------------------------------------------------
// 4. Order Management & Workflow
// -------------------------------------------------------------
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.patch(
  '/orders/:id/status',
  authorize('admin', 'superadmin', 'order_manager'),
  orderController.updateOrderStatus
);
router.put(
  '/orders/:id/status',
  authorize('admin', 'superadmin', 'order_manager'),
  orderController.updateOrderStatus
);
router.post(
  '/orders/:id/cancel',
  authorize('admin', 'superadmin', 'order_manager'),
  orderController.cancelOrder
);

// -------------------------------------------------------------
// 5. Customer Management
// -------------------------------------------------------------
router.get('/customers', customerController.getCustomers);
router.get('/customers/:id', customerController.getCustomerById);

// -------------------------------------------------------------
// 6. Coupons & Discounts
// -------------------------------------------------------------
router.get('/coupons', couponController.getCoupons);
router.post(
  '/coupons',
  authorize('admin', 'superadmin'),
  couponController.createCoupon
);
router.put(
  '/coupons/:id',
  authorize('admin', 'superadmin'),
  couponController.updateCoupon
);
router.delete(
  '/coupons/:id',
  authorize('admin', 'superadmin'),
  couponController.deleteCoupon
);

// -------------------------------------------------------------
// 7. Store Settings, Audit Logs, and CSV Exports
// -------------------------------------------------------------
router.get('/settings', settingsController.getSettings);
router.put(
  '/settings',
  authorize('admin', 'superadmin'),
  settingsController.updateSettings
);
router.get(
  '/audit-logs',
  authorize('admin', 'superadmin'),
  settingsController.getAuditLogs
);
router.get('/reports/export-orders', settingsController.exportOrdersCsv);

module.exports = router;
