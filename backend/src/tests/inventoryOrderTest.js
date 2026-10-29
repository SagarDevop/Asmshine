require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const StockMovement = require('../models/StockMovement');
const inventoryService = require('../services/inventoryService');

const runTests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log('====================================================');
  console.log('🧪 SM SHINE INVENTORY & CONCURRENCY TEST SUITE');
  console.log('====================================================');
  await mongoose.connect(uri);

  try {
    // SETUP: Clean up test product if exists
    const testSku = 'TEST-SKU-BOTTLE-20';
    const testId = 'test_bottle_20';
    await Product.deleteMany({ id: testId });
    await StockMovement.deleteMany({ productId: testId });
    await Order.deleteMany({ orderId: { $regex: /^TEST-ORD-/ } });

    // 1. Create a product with stock = 20
    console.log('\n[Step 1] Creating test product with stock = 20...');
    const product = await Product.create({
      id: testId,
      name: 'Test Pure Shine Bottle',
      sku: testSku,
      category: 'everyday_essentials',
      section: 'everyday_essentials',
      size: '500ml',
      price: 199,
      originalPrice: 249,
      discountPercent: 20,
      stockQuantity: 20,
      lowStockThreshold: 5,
      inStock: true,
      image: '/images/products/test.png'
    });
    console.log(`✅ Product created: stockQuantity = ${product.stockQuantity}, inStock = ${product.inStock}`);
    if (product.stockQuantity !== 20) throw new Error('Step 1 Failed: Initial stock is not 20');

    // 2. Place a valid order for 2 units
    console.log('\n[Step 2] Placing order for 2 units...');
    await inventoryService.deductOrderStock(
      [{ productId: testId, name: product.name, quantity: 2, size: '500ml' }],
      'TEST-ORD-001'
    );

    // 3. Verify stock becomes 18
    const pAfter1 = await Product.findOne({ id: testId });
    console.log(`✅ Available stock after 2 units: ${pAfter1.stockQuantity}`);
    if (pAfter1.stockQuantity !== 18) throw new Error(`Step 3 Failed: Expected 18, got ${pAfter1.stockQuantity}`);

    // 4. Place a valid order for 5 units
    console.log('\n[Step 4] Placing order for 5 units...');
    await inventoryService.deductOrderStock(
      [{ productId: testId, name: product.name, quantity: 5, size: '500ml' }],
      'TEST-ORD-002'
    );

    // 5. Verify stock reflects 13 available units
    const pAfter2 = await Product.findOne({ id: testId });
    console.log(`✅ Available stock after 5 units: ${pAfter2.stockQuantity}`);
    if (pAfter2.stockQuantity !== 13) throw new Error(`Step 5 Failed: Expected 13, got ${pAfter2.stockQuantity}`);

    // 6. Sell the remaining 13 units
    console.log('\n[Step 6] Selling the remaining 13 units...');
    await inventoryService.deductOrderStock(
      [{ productId: testId, name: product.name, quantity: 13, size: '500ml' }],
      'TEST-ORD-003'
    );

    // 7. Verify the product is out of stock
    const pAfter3 = await Product.findOne({ id: testId });
    console.log(`✅ Available stock after 13 units: ${pAfter3.stockQuantity}, inStock = ${pAfter3.inStock}`);
    if (pAfter3.stockQuantity !== 0 || pAfter3.inStock !== false) {
      throw new Error(`Step 7 Failed: Expected stock 0 and inStock false, got stock: ${pAfter3.stockQuantity}, inStock: ${pAfter3.inStock}`);
    }

    // 8. Attempt another order
    console.log('\n[Step 8 & 9] Attempting order on 0 stock product...');
    let rejected = false;
    try {
      await inventoryService.deductOrderStock(
        [{ productId: testId, name: product.name, quantity: 1, size: '500ml' }],
        'TEST-ORD-004'
      );
    } catch (err) {
      rejected = true;
      console.log(`✅ Order correctly rejected by backend: "${err.message}"`);
    }
    if (!rejected) throw new Error('Step 9 Failed: Order was NOT rejected on out-of-stock product!');

    // 10. Cancel an eligible order (Order #TEST-ORD-002 which ordered 5 units)
    console.log('\n[Step 10] Cancelling eligible order TEST-ORD-002 (5 units)...');
    const mockOrder2 = {
      orderId: 'TEST-ORD-002',
      items: [{ productId: testId, quantity: 5, size: '500ml' }],
      cancellation: { stockRestored: false }
    };
    const restoreRes = await inventoryService.restoreOrderStock(mockOrder2, 'Customer cancellation test');
    console.log(`✅ Restored items count: ${restoreRes.restoredCount}`);

    // 11. Verify inventory is restored exactly once (0 + 5 = 5 units)
    const pAfterRestore = await Product.findOne({ id: testId });
    console.log(`✅ Restored stock quantity: ${pAfterRestore.stockQuantity}, inStock = ${pAfterRestore.inStock}`);
    if (pAfterRestore.stockQuantity !== 5 || pAfterRestore.inStock !== true) {
      throw new Error(`Step 11 Failed: Expected 5 units and inStock true, got ${pAfterRestore.stockQuantity}`);
    }

    // 12. Retry cancellation and verify no duplicate restoration (idempotent)
    console.log('\n[Step 12] Retrying cancellation for idempotency check...');
    mockOrder2.cancellation.stockRestored = true;
    const retryRes = await inventoryService.restoreOrderStock(mockOrder2, 'Duplicate cancel attempt');
    const pAfterRetry = await Product.findOne({ id: testId });
    console.log(`✅ Retry result: "${retryRes.message}", Stock remains: ${pAfterRetry.stockQuantity}`);
    if (pAfterRetry.stockQuantity !== 5) {
      throw new Error(`Step 12 Failed: Duplicate stock restoration occurred! Stock is ${pAfterRetry.stockQuantity}`);
    }

    // 13. Concurrency Protection Test (2 concurrent orders competing for last units)
    console.log('\n[Step 13] Concurrency test: 2 simultaneous orders requesting 4 units when only 5 units exist...');
    const results = await Promise.allSettled([
      inventoryService.deductOrderStock(
        [{ productId: testId, name: product.name, quantity: 4, size: '500ml' }],
        'TEST-CONCURRENT-A'
      ),
      inventoryService.deductOrderStock(
        [{ productId: testId, name: product.name, quantity: 4, size: '500ml' }],
        'TEST-CONCURRENT-B'
      )
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejectedPromises = results.filter((r) => r.status === 'rejected');

    console.log(`✅ Concurrent orders result: ${fulfilled.length} succeeded, ${rejectedPromises.length} rejected safely.`);
    if (fulfilled.length > 1) {
      throw new Error('Concurrency test failed: Both orders succeeded, causing an oversell!');
    }

    const finalProduct = await Product.findOne({ id: testId });
    console.log(`✅ Final product stock: ${finalProduct.stockQuantity} (Non-negative & safe)`);
    if (finalProduct.stockQuantity < 0) {
      throw new Error('Concurrency test failed: Stock became negative!');
    }

    // Verify StockMovements count
    const movementsCount = await StockMovement.countDocuments({ productId: testId });
    console.log(`✅ Total audited stock movements recorded for test item: ${movementsCount}`);

    // CLEANUP test item
    await Product.deleteMany({ id: testId });
    await StockMovement.deleteMany({ productId: testId });

    console.log('\n====================================================');
    console.log('🎉 ALL 13 INVENTORY & CONCURRENCY TESTS PASSED 100%!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
