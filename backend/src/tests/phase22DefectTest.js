require('dotenv').config();
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const IdempotencyKey = require('../models/IdempotencyKey');
const { normalizeCheckoutPayload } = require('../controllers/orderController');
const errorHandler = require('../middleware/errorHandler');

const BASE_URL = 'http://127.0.0.1:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_local_apex';

let customerAToken = '';
let customerBToken = '';
let adminToken = '';
let customerAId = '';
let customerBId = '';
let adminId = '';

const runTests = async () => {
  console.log('================================================================');
  console.log('🛡️ ASM SHINE — PHASE 2.2 FINAL REMEDIATION & VERIFICATION SUITE');
  console.log('================================================================\n');

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/cleanora');

    // 1. Setup Test Users
    await User.deleteMany({ email: { $in: ['p22_alice@test.com', 'p22_bob@test.com', 'p22_admin@test.com'] } });

    const customerA = await User.create({
      name: 'Alice P22',
      email: 'p22_alice@test.com',
      password: 'password123',
      role: 'customer',
      isActive: true,
      addresses: [{
        name: 'Alice',
        phone: '9876543210',
        pincode: '210001',
        street: '123 River Road',
        city: 'Banda',
        state: 'Uttar Pradesh',
        type: 'HOME',
        isDefault: true
      }]
    });
    customerAId = customerA._id.toString();
    customerAToken = jwt.sign({ id: customerA._id, email: customerA.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    const customerB = await User.create({
      name: 'Bob P22',
      email: 'p22_bob@test.com',
      password: 'password123',
      role: 'customer',
      isActive: true,
      addresses: [{
        name: 'Bob',
        phone: '9123456780',
        pincode: '210001',
        street: '456 Market Lane',
        city: 'Banda',
        state: 'Uttar Pradesh',
        type: 'HOME',
        isDefault: true
      }]
    });
    customerBId = customerB._id.toString();
    customerBToken = jwt.sign({ id: customerB._id, email: customerB.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    const admin = await User.create({
      name: 'Admin P22',
      email: 'p22_admin@test.com',
      password: 'password123',
      role: 'superadmin',
      isActive: true
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ id: admin._id, email: admin.email, role: 'superadmin' }, JWT_SECRET, { expiresIn: '1h' });

    // Setup Test Products
    await Product.deleteMany({ id: { $in: ['p22_prod_1', 'p22_prod_variant'] } });

    await Product.create({
      id: 'p22_prod_1',
      name: 'P22 Test Cleanser 500ml',
      category: 'cleaner',
      section: 'everyday_essentials',
      size: '500ml',
      price: 150,
      originalPrice: 200,
      discountPercent: 25,
      stockQuantity: 100,
      status: 'active',
      inStock: true,
      image: '/images/products/all_shine_dishwash_gel_500ml.png'
    });

    await Product.create({
      id: 'p22_prod_variant',
      name: 'P22 Multi-Variant Product',
      category: 'cleaner',
      section: 'everyday_essentials',
      size: '500ml',
      price: 200,
      originalPrice: 250,
      discountPercent: 20,
      stockQuantity: 50,
      status: 'active',
      inStock: true,
      image: '/images/products/all_shine_dishwash_gel_500ml.png',
      availableSizes: [
        {
          size: '500ml',
          price: 200,
          originalPrice: 250,
          stockQuantity: 25,
          inStock: true,
          image: '/images/products/all_shine_dishwash_gel_500ml.png'
        },
        {
          size: '1L',
          price: 350,
          originalPrice: 400,
          stockQuantity: 25,
          inStock: true,
          image: '/images/products/all_shine_dishwash_gel_500ml.png'
        }
      ]
    });

    console.log('--- DEFECT 1: Idempotency Payload Mismatch Detection (HTTP 422) ---');
    const mismatchKey = `p22-mismatch-${Date.now()}`;
    const payload1 = {
      items: [{ productId: 'p22_prod_1', quantity: 1, size: '500ml' }],
      shippingAddress: {
        fullName: 'Alice Original',
        phone: '9876543210',
        pincode: '210001',
        street: '123 River Road',
        city: 'Banda',
        state: 'Uttar Pradesh'
      },
      paymentMethod: 'cod'
    };

    // First request with payload 1 -> Should succeed
    const res1 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`,
        'Idempotency-Key': mismatchKey
      },
      body: JSON.stringify(payload1)
    });
    const data1 = await res1.json();
    assert.strictEqual(res1.status, 201, `First checkout should return 201, got ${res1.status}`);
    assert.ok(data1.order, 'Order must be created');
    const initialCreatedOrderId = data1.order.orderId;

    // Check stock after payload 1
    const prodAfter1 = await Product.findOne({ id: 'p22_prod_1' });
    const stockAfter1 = prodAfter1.stockQuantity;
    assert.strictEqual(stockAfter1, 99, 'Stock must decrement by 1 to 99');

    // Second request with SAME idempotency key but DIFFERENT payload (quantity: 5)
    const payload2 = {
      items: [{ productId: 'p22_prod_1', quantity: 5, size: '500ml' }],
      shippingAddress: {
        fullName: 'Alice Altered Request',
        phone: '9876543210',
        pincode: '210001',
        street: '123 River Road',
        city: 'Banda',
        state: 'Uttar Pradesh'
      },
      paymentMethod: 'cod'
    };

    const res2 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`,
        'Idempotency-Key': mismatchKey
      },
      body: JSON.stringify(payload2)
    });
    const data2 = await res2.json();
    assert.strictEqual(res2.status, 422, `Mismatched payload must return HTTP 422 Unprocessable Entity, got ${res2.status}`);
    assert.strictEqual(
      data2.message,
      'Idempotency key has already been used with a different request payload.',
      'Must return explicit payload mismatch message'
    );

    // Verify stock was NOT decremented for payload 2
    const prodAfter2 = await Product.findOne({ id: 'p22_prod_1' });
    assert.strictEqual(prodAfter2.stockQuantity, 99, 'Stock must remain 99, untouched by rejected payload 2');
    console.log('✅ [PASS] Defect 1: Idempotency payload mismatch rejected with HTTP 422, zero stock deduction');


    console.log('\n--- DEFECT 2: Failed Idempotency Key Atomic Retry ---');
    const failedKey = `p22-failed-retry-${Date.now()}`;
    const retryPayload = {
      items: [{ productId: 'p22_prod_1', quantity: 1, size: '500ml' }],
      shippingAddress: {
        fullName: 'Alice Retry',
        phone: '9876543210',
        pincode: '210001',
        street: '123 River Road',
        city: 'Banda',
        state: 'Uttar Pradesh'
      },
      paymentMethod: 'cod'
    };

    // Calculate requestHash using the exact canonical normalizer
    const normalizedData = normalizeCheckoutPayload(
      customerAId,
      retryPayload.items,
      retryPayload.shippingAddress,
      retryPayload.paymentMethod,
      ''
    );
    const hashCanonical = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalizedData))
      .digest('hex');

    // Seed an existing record in FAILED status
    await IdempotencyKey.create({
      key: failedKey,
      user: customerA._id,
      endpoint: '/api/v1/orders',
      requestHash: hashCanonical,
      status: 'FAILED',
      errorMessage: 'Simulated network timeout during previous checkout attempt'
    });

    // Stock before retry
    const stockBeforeRetry = (await Product.findOne({ id: 'p22_prod_1' })).stockQuantity;

    // Send request with matching payload using this FAILED key
    const retryRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`,
        'Idempotency-Key': failedKey
      },
      body: JSON.stringify(retryPayload)
    });
    const retryData = await retryRes.json();

    assert.strictEqual(retryRes.status, 201, `Retry on FAILED idempotency key must succeed with 201, got ${retryRes.status}`);
    assert.ok(retryData.order, 'Order should be created upon retrying failed idempotency key');

    // Verify idempotency record is now COMPLETED
    const keyRecord = await IdempotencyKey.findOne({ key: failedKey });
    assert.strictEqual(keyRecord.status, 'COMPLETED', 'Idempotency record status must be COMPLETED');
    assert.strictEqual(keyRecord.orderId, retryData.order.orderId, 'Idempotency record must reference new order ID');

    // Verify stock decremented by 1
    const stockAfterRetry = (await Product.findOne({ id: 'p22_prod_1' })).stockQuantity;
    assert.strictEqual(stockAfterRetry, stockBeforeRetry - 1, 'Stock must decrement by exactly 1 on successful retry');
    console.log('✅ [PASS] Defect 2: Failed idempotency key safely claimed, retried and updated to COMPLETED');


    console.log('\n--- DEFECT 3: Per-User Coupon Concurrency Race Condition ---');
    const concurrencyCouponCode = `CONC_${Date.now()}`;
    await Coupon.create({
      code: concurrencyCouponCode,
      description: 'Concurrency Test Coupon',
      discountType: 'fixed',
      discountValue: 20,
      minOrderValue: 50,
      usageLimit: 100,
      userUsageLimit: 1,
      usedCount: 0,
      usedBy: [],
      isActive: true,
      validFrom: new Date(Date.now() - 3600000),
      validUntil: new Date(Date.now() + 86400000)
    });

    const concurrentCheckoutReq = (idempSuffix) =>
      fetch(`${BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerAToken}`,
          'Idempotency-Key': `p22-conc-${idempSuffix}-${Date.now()}`
        },
        body: JSON.stringify({
          items: [{ productId: 'p22_prod_1', quantity: 1, size: '500ml' }],
          shippingAddress: {
            fullName: 'Alice Concurrency',
            phone: '9876543210',
            pincode: '210001',
            street: '123 River Road',
            city: 'Banda',
            state: 'Uttar Pradesh'
          },
          paymentMethod: 'cod',
          couponCode: concurrencyCouponCode
        })
      });

    // Execute 2 simultaneous checkout requests for Alice with userUsageLimit = 1
    const [cRes1, cRes2] = await Promise.all([
      concurrentCheckoutReq('req1'),
      concurrentCheckoutReq('req2')
    ]);

    const cData1 = await cRes1.json();
    const cData2 = await cRes2.json();

    // Check discount application on both
    const disc1 = Number(cData1.order?.pricing?.couponDiscount ?? cData1.order?.coupon?.discountAmount ?? 0);
    const disc2 = Number(cData2.order?.pricing?.couponDiscount ?? cData2.order?.coupon?.discountAmount ?? 0);

    // Verify coupon state in MongoDB
    const cCoupon = await Coupon.findOne({ code: concurrencyCouponCode });
    const aliceUsages = cCoupon.usedBy.filter(u => (u.user?.toString() || u.userId?.toString()) === customerAId);

    // Exactly one order may receive the coupon discount
    const discountedOrdersCount = (disc1 > 0 ? 1 : 0) + (disc2 > 0 ? 1 : 0);
    assert.strictEqual(discountedOrdersCount, 1, `Exactly one order must receive discount, got ${discountedOrdersCount}`);
    assert.strictEqual(cCoupon.usedCount, 1, `Coupon usedCount must be 1, got ${cCoupon.usedCount}`);
    assert.strictEqual(aliceUsages.length, 1, `Alice usedBy count in database must be 1, got ${aliceUsages.length}`);
    console.log('✅ [PASS] Defect 3: Concurrent checkout atomic $expr prevented double coupon reservation');


    console.log('\n--- DEFECT 4: Symmetric Coupon Restoration on Cancellation ---');
    // Part 4A: Customer Cancellation Restores Coupon
    const custCancelCouponCode = `RESTORE_CUST_${Date.now()}`;
    await Coupon.create({
      code: custCancelCouponCode,
      description: 'Customer Restore Coupon',
      discountType: 'fixed',
      discountValue: 30,
      minOrderValue: 50,
      usageLimit: 10,
      userUsageLimit: 2,
      usedCount: 0,
      usedBy: [],
      isActive: true,
      validFrom: new Date(Date.now() - 3600000),
      validUntil: new Date(Date.now() + 86400000)
    });

    const custOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`
      },
      body: JSON.stringify({
        items: [{ productId: 'p22_prod_1', quantity: 1, size: '500ml' }],
        shippingAddress: {
          fullName: 'Alice Cancellation Test',
          phone: '9876543210',
          pincode: '210001',
          street: '123 River Road',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod',
        couponCode: custCancelCouponCode
      })
    });
    const custOrderData = await custOrderRes.json();
    assert.strictEqual(custOrderRes.status, 201, 'Order creation must succeed');
    const custOrderId = custOrderData.order.orderId;

    // Verify coupon usedCount is 1
    let couponRecord = await Coupon.findOne({ code: custCancelCouponCode });
    assert.strictEqual(couponRecord.usedCount, 1, 'usedCount must be 1 before cancel');

    // Customer cancels order
    const cancelRes = await fetch(`${BASE_URL}/api/v1/orders/${custOrderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`
      },
      body: JSON.stringify({ reason: 'Found a better price' })
    });
    assert.strictEqual(cancelRes.status, 200, 'Customer order cancellation should return 200');

    // Verify coupon usedCount restored to 0 and order flag marked
    couponRecord = await Coupon.findOne({ code: custCancelCouponCode });
    assert.strictEqual(couponRecord.usedCount, 0, 'usedCount must be restored to 0 after cancellation');
    assert.strictEqual(couponRecord.usedBy.length, 0, 'usedBy entry must be removed');

    const dbOrderCancelled = await Order.findOne({ orderId: custOrderId });
    assert.strictEqual(dbOrderCancelled.cancellation.couponRestored, true, 'couponRestored flag must be true');

    // Repeated customer cancellation attempt must fail or be idempotent (order already cancelled)
    const repeatCancelRes = await fetch(`${BASE_URL}/api/v1/orders/${custOrderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`
      },
      body: JSON.stringify({ reason: 'Repeated cancel attempt' })
    });
    assert.strictEqual(repeatCancelRes.status, 400, 'Already cancelled order cannot be cancelled again');
    couponRecord = await Coupon.findOne({ code: custCancelCouponCode });
    assert.strictEqual(couponRecord.usedCount, 0, 'usedCount must remain 0 and not become negative');
    console.log('✅ [PASS] Defect 4A: Customer cancellation safely restored coupon and flagged order');

    // Part 4B: Admin Cancellation Restores Coupon
    const adminCancelCouponCode = `RESTORE_ADMIN_${Date.now()}`;
    await Coupon.create({
      code: adminCancelCouponCode,
      description: 'Admin Restore Coupon',
      discountType: 'fixed',
      discountValue: 25,
      minOrderValue: 50,
      usageLimit: 10,
      userUsageLimit: 2,
      usedCount: 0,
      usedBy: [],
      isActive: true,
      validFrom: new Date(Date.now() - 3600000),
      validUntil: new Date(Date.now() + 86400000)
    });

    const adminOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerBToken}`
      },
      body: JSON.stringify({
        items: [{ productId: 'p22_prod_1', quantity: 1, size: '500ml' }],
        shippingAddress: {
          fullName: 'Bob Admin Cancel Test',
          phone: '9123456780',
          pincode: '210001',
          street: '456 Market Lane',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod',
        couponCode: adminCancelCouponCode
      })
    });
    const adminOrderData = await adminOrderRes.json();
    assert.strictEqual(adminOrderRes.status, 201, 'Order creation must succeed');
    const adminOrderId = adminOrderData.order.orderId;

    // Verify coupon usedCount is 1
    let adminCouponRec = await Coupon.findOne({ code: adminCancelCouponCode });
    assert.strictEqual(adminCouponRec.usedCount, 1, 'usedCount must be 1 before admin cancel');

    // Admin cancels order
    const adminCancelRes = await fetch(`${BASE_URL}/api/v1/admin/orders/${adminOrderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: 'Out of area delivery not serviced' })
    });
    assert.strictEqual(adminCancelRes.status, 200, 'Admin cancellation must return 200');

    // Verify coupon restored by admin
    adminCouponRec = await Coupon.findOne({ code: adminCancelCouponCode });
    assert.strictEqual(adminCouponRec.usedCount, 0, 'Admin cancellation must restore coupon usedCount to 0');
    assert.strictEqual(adminCouponRec.usedBy.length, 0, 'Admin cancellation must pull usedBy entry');

    const dbAdminOrder = await Order.findOne({ orderId: adminOrderId });
    assert.strictEqual(dbAdminOrder.cancellation.couponRestored, true, 'couponRestored flag must be true on order');
    console.log('✅ [PASS] Defect 4B: Admin cancellation symmetrically restored coupon and updated audit metadata');


    console.log('\n--- DEFECT 5: Content Security Policy (CSP) Hardening ---');
    const cspRes = await fetch(`${BASE_URL}/api/v1/health`);
    assert.strictEqual(cspRes.status, 200, 'Health endpoint must return 200');

    const cspHeader = cspRes.headers.get('content-security-policy') || '';
    assert.ok(cspHeader.length > 0, 'Content-Security-Policy header must be present');

    // Verify 'unsafe-eval' is REMOVED
    assert.ok(!cspHeader.includes("'unsafe-eval'"), "CSP header must NOT contain 'unsafe-eval'");

    // Verify broad 'https:' in img-src is removed, but approved CDNs are allowed
    const imgSrcMatch = cspHeader.match(/img-src\s+([^;]+)/);
    assert.ok(imgSrcMatch, 'img-src directive must exist in CSP');
    const imgSrcDirective = imgSrcMatch[1];

    // Must NOT contain bare 'https:'
    const imgSrcTokens = imgSrcDirective.split(/\s+/);
    assert.ok(!imgSrcTokens.includes('https:'), "img-src must NOT contain broad 'https:' wildcard");
    assert.ok(imgSrcTokens.includes('https://res.cloudinary.com'), 'img-src must allow Cloudinary');
    assert.ok(imgSrcTokens.includes('https://images.unsplash.com'), 'img-src must allow Unsplash');
    console.log('✅ [PASS] Defect 5: CSP hardened — unsafe-eval eliminated and img-src restricted to approved CDNs');


    console.log('\n--- DEFECT 6: Variant Image URL Validation in updateProduct ---');
    // Test 6A: Malicious javascript: scheme rejected
    const badJsRes = await fetch(`${BASE_URL}/api/v1/admin/products/p22_prod_variant`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        availableSizes: [
          {
            size: '500ml',
            price: 200,
            image: 'javascript:alert(document.cookie)'
          }
        ]
      })
    });
    const badJsData = await badJsRes.json();
    assert.strictEqual(badJsRes.status, 400, `javascript: scheme in variant image must return HTTP 400, got ${badJsRes.status}`);
    assert.ok(badJsData.message.includes('Invalid image URL for size variant'), 'Error message must specify invalid variant image URL');

    // Test 6B: Unapproved external domain rejected
    const unapprovedDomainRes = await fetch(`${BASE_URL}/api/v1/admin/products/p22_prod_variant`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        availableSizes: [
          {
            size: '500ml',
            price: 200,
            image: 'http://malicious-attacker.com/payload.png'
          }
        ]
      })
    });
    assert.strictEqual(unapprovedDomainRes.status, 400, 'Unapproved HTTP domain in variant image must return HTTP 400');

    // Test 6C: Valid Cloudinary HTTPS URL accepted
    const validImgRes = await fetch(`${BASE_URL}/api/v1/admin/products/p22_prod_variant`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        availableSizes: [
          {
            size: '500ml',
            price: 200,
            image: 'https://res.cloudinary.com/cleanora/image/upload/v1/products/variant_500.png'
          }
        ]
      })
    });
    assert.strictEqual(validImgRes.status, 200, `Valid Cloudinary image URL must be accepted with HTTP 200, got ${validImgRes.status}`);
    console.log('✅ [PASS] Defect 6: Variant image URL validation strictly blocks malicious schemes and unapproved origins');


    console.log('\n--- DEFECT 7: CSV Streaming & Global Error Handler Resilience ---');
    // Test 7A: Global Error Handler res.headersSent guard
    let nextCalledWith = null;
    let jsonCalled = false;
    const mockReq = { method: 'GET', originalUrl: '/test' };
    const mockRes = {
      headersSent: true,
      status: () => ({
        json: () => { jsonCalled = true; }
      })
    };
    const testError = new Error('Test streaming interruption error');
    errorHandler(testError, mockReq, mockRes, (err) => {
      nextCalledWith = err;
    });

    assert.strictEqual(nextCalledWith, testError, 'errorHandler must call next(err) if res.headersSent is true');
    assert.strictEqual(jsonCalled, false, 'errorHandler must not call res.json() if headers are already sent');

    // Test 7B: CSV Export Streaming
    const csvExportRes = await fetch(`${BASE_URL}/api/v1/admin/reports/export-orders`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.strictEqual(csvExportRes.status, 200, 'CSV export endpoint must return HTTP 200');
    assert.strictEqual(csvExportRes.headers.get('content-type'), 'text/csv; charset=utf-8', 'Content-Type must be text/csv');
    const csvText = await csvExportRes.text();
    assert.ok(csvText.startsWith('Order ID,Date,Customer Name,Phone,Email,City,State,Items Count,Total Amount,Payment Method,Payment Status,Order Status'), 'CSV header row must match specification');
    console.log('✅ [PASS] Defect 7: res.headersSent guard verified and CSV streaming terminates cleanly');


    // Clean up test records
    await User.deleteMany({ email: { $in: ['p22_alice@test.com', 'p22_bob@test.com', 'p22_admin@test.com'] } });
    await Product.deleteMany({ id: { $in: ['p22_prod_1', 'p22_prod_variant'] } });
    await Coupon.deleteMany({ code: { $in: [concurrencyCouponCode, custCancelCouponCode, adminCancelCouponCode] } });
    await IdempotencyKey.deleteMany({ key: { $in: [mismatchKey, failedKey] } });

    console.log('\n================================================================');
    console.log('🎉 ALL 7 PHASE 2.2 DEFECT TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ [FAIL] Phase 2.2 Defect Test Failed:', err);
    process.exit(1);
  }
};

runTests();
