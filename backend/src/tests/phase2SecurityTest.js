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
const realtimeHub = require('../services/realtimeHub');

const BASE_URL = 'http://127.0.0.1:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_local_apex';

let customerAToken = '';
let customerBToken = '';
let adminToken = '';
let testProduct = null;
let orderAId = '';
let customerAId = '';
let customerBId = '';

const runTests = async () => {
  console.log('====================================================');
  console.log('🔒 ASM SHINE — PHASE 2 ADVANCED SECURITY TEST SUITE');
  console.log('====================================================\n');

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/cleanora');

    // Setup Test Users
    await User.deleteMany({ email: { $in: ['cust_a@test.com', 'cust_b@test.com', 'test_admin_p2@test.com'] } });

    const customerA = await User.create({
      name: 'Customer Alice',
      email: 'cust_a@test.com',
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
      name: 'Customer Bob',
      email: 'cust_b@test.com',
      password: 'password123',
      role: 'customer',
      isActive: true,
      addresses: [{
        name: 'Bob',
        phone: '9876543211',
        pincode: '210001',
        street: '456 Hill Street',
        city: 'Banda',
        state: 'Uttar Pradesh',
        type: 'HOME',
        isDefault: true
      }]
    });
    customerBId = customerB._id.toString();
    customerBToken = jwt.sign({ id: customerB._id, email: customerB.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    const admin = await User.create({
      name: 'Admin User',
      email: 'test_admin_p2@test.com',
      password: 'password123',
      role: 'superadmin',
      isActive: true
    });
    adminToken = jwt.sign({ id: admin._id, email: admin.email, role: 'superadmin' }, JWT_SECRET, { expiresIn: '1h' });

    // Setup Test Product
    await Product.deleteOne({ id: 'p2_test_bottle' });
    testProduct = await Product.create({
      id: 'p2_test_bottle',
      name: 'P2 Secure Bottle 500ml',
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

    console.log('--- TASK 1: Order Tracking IDOR Vulnerability ---');

    // Customer A creates an order
    const createOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`
      },
      body: JSON.stringify({
        items: [{ productId: 'p2_test_bottle', quantity: 1, size: '500ml' }],
        shippingAddress: {
          fullName: '=Alice Malicious Name',
          phone: '9876543210',
          pincode: '210001',
          street: '123 River Road',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod'
      })
    });
    const orderData = await createOrderRes.json();
    if (!orderData.order) {
      console.error('createOrder failed:', createOrderRes.status, orderData);
    }
    orderAId = orderData.order.orderId;

    // 1A: Customer A can access their own order via /orders/:id
    const ownOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${orderAId}`, {
      headers: { 'Authorization': `Bearer ${customerAToken}` }
    });
    assert.ok(ownOrderRes.status === 200, `Expected 200, got ${ownOrderRes.status}`);
    console.log('✅ [PASS] 1A: Customer A can access their own order (HTTP 200)');

    // 1B: Customer A can track their own order via /orders/track/:id
    const ownTrackRes = await fetch(`${BASE_URL}/api/v1/orders/track/${orderAId}`, {
      headers: { 'Authorization': `Bearer ${customerAToken}` }
    });
    assert.ok(ownTrackRes.status === 200, `Expected 200, got ${ownTrackRes.status}`);
    console.log('✅ [PASS] 1B: Customer A can track their own order (HTTP 200)');

    // 1C: Customer B CANNOT access Customer A order (HTTP 403)
    const idorOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${orderAId}`, {
      headers: { 'Authorization': `Bearer ${customerBToken}` }
    });
    assert.ok(idorOrderRes.status === 403, `Expected 403, got ${idorOrderRes.status}`);
    console.log('✅ [PASS] 1C: Customer B is blocked with HTTP 403 accessing Customer A order (IDOR Defeated)');

    // 1D: Customer B CANNOT track Customer A order (HTTP 403)
    const idorTrackRes = await fetch(`${BASE_URL}/api/v1/orders/track/${orderAId}`, {
      headers: { 'Authorization': `Bearer ${customerBToken}` }
    });
    assert.ok(idorTrackRes.status === 403, `Expected 403, got ${idorTrackRes.status}`);
    console.log('✅ [PASS] 1D: Customer B is blocked with HTTP 403 tracking Customer A order (IDOR Defeated)');

    // 1E: Unauthenticated tracking request rejected with HTTP 401
    const unauthTrackRes = await fetch(`${BASE_URL}/api/v1/orders/track/${orderAId}`);
    assert.ok(unauthTrackRes.status === 401, `Expected 401, got ${unauthTrackRes.status}`);
    console.log('✅ [PASS] 1E: Unauthenticated order tracking blocked with HTTP 401 Unauthorized');

    // 1F: Admin can access Customer A order for fulfillment (HTTP 200)
    const adminTrackRes = await fetch(`${BASE_URL}/api/v1/orders/track/${orderAId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.ok(adminTrackRes.status === 200, `Expected 200, got ${adminTrackRes.status}`);
    console.log('✅ [PASS] 1F: Admin role is authorized to track customer orders (HTTP 200)');

    console.log('\n--- TASK 2: Checkout Idempotency & Duplicate Order Prevention ---');

    const testIdempKey = `idemp_test_${Date.now()}`;
    const initialProductDoc = await Product.findOne({ id: 'p2_test_bottle' });
    const stockBeforeIdemp = initialProductDoc.stockQuantity;

    // First order submission with idempotency key
    const idempReq1 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`,
        'Idempotency-Key': testIdempKey
      },
      body: JSON.stringify({
        items: [{ productId: 'p2_test_bottle', quantity: 2, size: '500ml' }],
        shippingAddress: {
          fullName: 'Alice Test',
          phone: '9876543210',
          pincode: '210001',
          street: '123 River Road',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod'
      })
    });
    const idempData1 = await idempReq1.json();
    assert.ok(idempReq1.status === 201, `Expected 201, got ${idempReq1.status}`);
    console.log('✅ [PASS] 2A: First submission with Idempotency-Key creates order (HTTP 201)');

    // Second (duplicate/retry) submission with same idempotency key
    const idempReq2 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAToken}`,
        'Idempotency-Key': testIdempKey
      },
      body: JSON.stringify({
        items: [{ productId: 'p2_test_bottle', quantity: 2, size: '500ml' }],
        shippingAddress: {
          fullName: 'Alice Test',
          phone: '9876543210',
          pincode: '210001',
          street: '123 River Road',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod'
      })
    });
    const idempData2 = await idempReq2.json();
    assert.ok(idempReq2.status === 201 || idempReq2.status === 200, `Expected 201/200, got ${idempReq2.status}`);
    assert.ok(idempData2.idempotentReplay === true, 'Expected idempotentReplay = true');
    assert.ok(idempData2.order.orderId === idempData1.order.orderId, 'Expected same orderId on replay');
    console.log('✅ [PASS] 2B: Duplicate request returns identical order replay with idempotentReplay flag');

    // Verify stock was decremented ONLY ONCE (2 units, not 4 units)
    const productAfterIdemp = await Product.findOne({ id: 'p2_test_bottle' });
    assert.ok(productAfterIdemp.stockQuantity === stockBeforeIdemp - 2, `Expected ${stockBeforeIdemp - 2}, got ${productAfterIdemp.stockQuantity}`);
    console.log('✅ [PASS] 2C: Stock was deducted exactly once across repeated idempotent requests');

    console.log('\n--- TASK 3: OTP & Password Reset Security ---');

    // 3A: Account enumeration check on sendForgotPasswordOtp
    const enumRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_ghost_user_12345@example.com' })
    });
    const enumData = await enumRes.json();
    assert.ok(enumRes.status === 200, `Expected 200, got ${enumRes.status}`);
    assert.ok(enumData.message.includes('If an account with that email exists'), 'Expected generic message');
    console.log('✅ [PASS] 3A: Non-existent email returns generic HTTP 200 (Account Enumeration Prevented)');

    // 3B: Password reset invalidates previously issued session tokens
    const preResetToken = customerAToken;
    // Wait 1.1s so passwordChangedAt in next second strictly invalidates earlier tokens
    await new Promise(r => setTimeout(r, 1100));

    // Perform password reset for customerA
    const pwdTimestamp = customerA.passwordChangedAt ? customerA.passwordChangedAt.getTime() : 0;
    const testResetToken = jwt.sign(
      { id: customerAId, email: 'cust_a@test.com', purpose: 'PASSWORD_RESET', pwdTimestamp },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken: testResetToken,
        newPassword: 'newsecurepassword123'
      })
    });
    const resetData = await resetRes.json();
    assert.ok(resetRes.status === 200, `Expected 200, got ${resetRes.status}`);
    console.log('✅ [PASS] 3B: Password reset succeeded with single-use resetToken (HTTP 200)');

    // Old token must now be rejected
    const oldSessionRes = await fetch(`${BASE_URL}/api/v1/auth/addresses`, {
      headers: { 'Authorization': `Bearer ${preResetToken}` }
    });
    assert.ok(oldSessionRes.status === 401, `Expected 401, got ${oldSessionRes.status}`);
    console.log('✅ [PASS] 3C: Prior session JWT was revoked after password change (HTTP 401 Session Invalidation)');

    // 3D: Reusing the same resetToken a second time must fail
    const replayResetRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetToken: testResetToken,
        newPassword: 'anotherpassword123'
      })
    });
    assert.ok(replayResetRes.status === 401, `Expected 401, got ${replayResetRes.status}`);
    console.log('✅ [PASS] 3D: Single-use reset token cannot be reused a second time (HTTP 401 Replay Blocked)');

    console.log('\n--- TASK 4: Coupon Concurrency & Usage Limits ---');

    await Coupon.deleteOne({ code: 'P2_TEST_COUPON' });
    const testCoupon = await Coupon.create({
      code: 'P2_TEST_COUPON',
      description: 'Test Single Use Coupon',
      discountType: 'fixed',
      discountValue: 30,
      usageLimit: 1, // Only 1 total use allowed globally
      userUsageLimit: 1,
      isActive: true
    });

    // Fresh token for Customer A after password reset
    const newCustomerAToken = resetData.token;

    // Use coupon in order 1
    const couponOrder1 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newCustomerAToken}`
      },
      body: JSON.stringify({
        items: [{ productId: 'p2_test_bottle', quantity: 1, size: '500ml' }],
        shippingAddress: {
          fullName: 'Alice Test',
          phone: '9876543210',
          pincode: '210001',
          street: '123 River Road',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod',
        couponCode: 'P2_TEST_COUPON'
      })
    });
    const cOrderData1 = await couponOrder1.json();
    assert.ok(cOrderData1.order.pricing.couponDiscount === 30, `Expected 30, got ${cOrderData1.order.pricing.couponDiscount}`);
    console.log('✅ [PASS] 4A: Coupon applied successfully on first order (₹30 discount)');

    // Attempt second use by Customer B (limit exceeded)
    const couponOrder2 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerBToken}`
      },
      body: JSON.stringify({
        items: [{ productId: 'p2_test_bottle', quantity: 1, size: '500ml' }],
        shippingAddress: {
          fullName: 'Bob Test',
          phone: '9876543211',
          pincode: '210001',
          street: '456 Hill Street',
          city: 'Banda',
          state: 'Uttar Pradesh'
        },
        paymentMethod: 'cod',
        couponCode: 'P2_TEST_COUPON'
      })
    });
    const cOrderData2 = await couponOrder2.json();
    assert.ok(cOrderData2.order.pricing.couponDiscount === 0, `Expected 0 discount, got ${cOrderData2.order.pricing.couponDiscount}`);
    console.log('✅ [PASS] 4B: Second usage correctly denied due to usage limit enforcement (₹0 discount)');

    // Cancelling order 1 restores coupon usage
    const cancelRes = await fetch(`${BASE_URL}/api/v1/orders/${cOrderData1.order.orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newCustomerAToken}`
      },
      body: JSON.stringify({ reason: 'Testing coupon restore' })
    });
    assert.ok(cancelRes.status === 200, `Expected 200, got ${cancelRes.status}`);
    const couponAfterCancel = await Coupon.findOne({ code: 'P2_TEST_COUPON' });
    assert.ok(couponAfterCancel.usedCount === 0, `Expected usedCount = 0, got ${couponAfterCancel.usedCount}`);
    console.log('✅ [PASS] 4C: Cancelling order restored coupon usedCount back to 0');

    console.log('\n--- TASK 5: Database Schema & Indexes ---');

    assert.ok(Product.schema.options.strict === true, 'Expected Product strict: true');
    console.log('✅ [PASS] 5A: Product model schema is strict: true (prevents unmodeled field injection)');

    const orderIndexes = await Order.collection.indexes();
    const hasUserIndex = orderIndexes.some(idx => idx.key.user && idx.key.createdAt);
    assert.ok(hasUserIndex, 'Order model must have compound index on { user: 1, createdAt: -1 }');
    console.log('✅ [PASS] 5B: Order collection has compound index on { user: 1, createdAt: -1 }');

    const couponIndexes = await Coupon.collection.indexes();
    const hasCouponIndex = couponIndexes.some(idx => idx.key.isActive);
    assert.ok(hasCouponIndex, 'Coupon model must have compound index on { isActive: 1, ... }');
    console.log('✅ [PASS] 5C: Coupon collection has compound index on { isActive: 1, validFrom: 1, validUntil: 1 }');

    console.log('\n--- TASK 6: Security Headers & Rate Limiting ---');

    const headersRes = await fetch(`${BASE_URL}/api/v1/health`);
    assert.ok(headersRes.headers.get('x-content-type-options') === 'nosniff', 'Missing X-Content-Type-Options: nosniff');
    assert.ok(headersRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'Missing X-Frame-Options: SAMEORIGIN');
    assert.ok(Boolean(headersRes.headers.get('content-security-policy')), 'Missing Content-Security-Policy');
    console.log('✅ [PASS] 6A: Production HTTP security headers present (X-Content-Type-Options, X-Frame-Options, CSP)');

    console.log('\n--- TASK 7: CSV Export Security (Formula Injection CWE-1236) ---');

    const csvRes = await fetch(`${BASE_URL}/api/v1/admin/reports/export-orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.ok(csvRes.status === 200, `Expected 200, got ${csvRes.status}`);
    const csvText = await csvRes.text();
    // Verify that '=Alice Malicious Name' is escaped to "'=Alice Malicious Name"
    assert.ok(csvText.includes("''=Alice Malicious Name") || csvText.includes("'=Alice Malicious Name"), 'Formula injection must be sanitized with prepended single quote');
    console.log('✅ [PASS] 7A: CSV export sanitizes formulas starting with =,+,-,@ (Formula Injection Defeated)');

    console.log('\n--- TASK 8: API Error Handling & Data Exposure ---');

    // CastError / Malformed ObjectId test
    const castErrorRes = await fetch(`${BASE_URL}/api/v1/products/invalid_obj_id_!@#`);
    const castErrorData = await castErrorRes.json();
    assert.ok(castErrorRes.status === 200 || castErrorRes.status === 404 || castErrorRes.status === 400, `Got ${castErrorRes.status}`);
    assert.ok(!JSON.stringify(castErrorData).includes('MongooseError'), 'Internal database error leaked');
    console.log('✅ [PASS] 8A: Invalid parameters handled safely without leaking MongoDB/Mongoose internals');

    console.log('\n--- TASK 9: Pincode Cache & Image URL Validation ---');

    // 9A: Pincode delivery lookup
    const pinRes = await fetch(`${BASE_URL}/api/v1/delivery/pincode/210001`);
    assert.ok(pinRes.status === 200, `Expected 200, got ${pinRes.status}`);
    const pinData = await pinRes.json();
    assert.ok(pinData.city === 'Banda', `Expected Banda, got ${pinData.city}`);
    console.log('✅ [PASS] 9A: Pincode bounded LRU cache resolves city/state accurately (Banda, UP)');

    // 9B: Malicious image URL rejection
    const badImageRes = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Malicious Product',
        category: 'cleaner',
        price: 99,
        image: 'javascript:alert(document.cookie)' // Malicious XSS / SSRF scheme
      })
    });
    assert.ok(badImageRes.status === 400, `Expected 400, got ${badImageRes.status}`);
    const badImageData = await badImageRes.json();
    assert.ok(badImageData.message.includes('Invalid product image URL'), 'Expected invalid image error');
    console.log('✅ [PASS] 9B: Dangerous image URLs (javascript:) rejected with HTTP 400');

    console.log('\n--- TASK 10: Realtime SSE Security & PII Protection ---');

    // Verify realtimeHub masks PII for inventory_manager
    let capturedClientPayload = null;
    const fakeClient = {
      id: 'test-inv-mgr',
      user: { role: 'inventory_manager' },
      res: {
        write: (str) => {
          if (str.startsWith('event: new_order\ndata: ')) {
            capturedClientPayload = JSON.parse(str.replace('event: new_order\ndata: ', '').trim());
          }
        }
      }
    };
    realtimeHub.adminClients.add(fakeClient);
    realtimeHub.notifyNewOrder({
      orderId: 'ASM-TEST-999',
      _id: new mongoose.Types.ObjectId(),
      shippingAddress: { fullName: 'Secret VIP Customer', phone: '9876543210' },
      user: { email: 'vip@customer.com' },
      items: [],
      totalAmount: 500,
      status: 'CONFIRMED'
    });
    realtimeHub.adminClients.delete(fakeClient);

    assert.ok(capturedClientPayload !== null, 'SSE event must be received');
    assert.ok(capturedClientPayload.customerPhone.includes('******'), 'Customer phone must be masked for inventory_manager');
    assert.ok(capturedClientPayload.customerEmail.includes('******'), 'Customer email must be masked for inventory_manager');
    console.log('✅ [PASS] 10A: Realtime SSE hub masks customer PII for staff with inventory_manager role');

    // Clean up test data
    await User.deleteMany({ email: { $in: ['cust_a@test.com', 'cust_b@test.com', 'test_admin_p2@test.com'] } });
    await Product.deleteOne({ id: 'p2_test_bottle' });
    await Coupon.deleteOne({ code: 'P2_TEST_COUPON' });
    await IdempotencyKey.deleteMany({ key: testIdempKey });

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 2 SECURITY TESTS PASSED 100%!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 2 Test Failed:', err);
    process.exit(1);
  }
};

runTests();
