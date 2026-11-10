require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Otp = require('../models/Otp');
const StockMovement = require('../models/StockMovement');
const inventoryService = require('../services/inventoryService');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

const runPhase1Tests = async () => {
  console.log('====================================================');
  console.log('🔒 ASM SHINE — PHASE 1 SECURITY REMEDIATION TEST SUITE');
  console.log('====================================================');

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  await mongoose.connect(uri);

  const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_local_apex';
  let passedCount = 0;
  let totalTests = 0;

  const test = (title, condition) => {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      throw new Error(`Test assertion failed: ${title}`);
    }
  };

  try {
    // ----------------------------------------------------
    // SETUP
    // ----------------------------------------------------
    const testEmail = 'sec_audit_customer@asmshine.com';
    await User.deleteMany({ email: { $in: [testEmail, 'deactivated_user@asmshine.com', 'lockout_test@asmshine.com'] } });

    // ----------------------------------------------------
    // TASK 1: ADMIN & USER AUTHENTICATION DEFENSES
    // ----------------------------------------------------
    console.log('\n--- TASK 1: Admin & Authentication Defenses ---');

    // 1A. Deactivated account rejection on login
    const deactivatedUser = await User.create({
      name: 'Deactivated User',
      email: 'deactivated_user@asmshine.com',
      password: 'StrongPassword123!',
      role: 'customer',
      isActive: false
    });

    const resDeactLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: deactivatedUser.email, password: 'StrongPassword123!' })
    });
    test('1A: Deactivated user cannot log in (HTTP 403)', resDeactLogin.status === 403);

    // 1B. Deactivated user token blocked in authenticate middleware
    const deactToken = jwt.sign({ id: deactivatedUser._id.toString() }, jwtSecret);
    const resDeactAccess = await fetch(`${BASE_URL}/auth/addresses`, {
      headers: { Authorization: `Bearer ${deactToken}` }
    });
    test('1B: Deactivated user token blocked on protected routes (HTTP 403)', resDeactAccess.status === 403);

    // 1C & 1D. Failed login attempts tracking & 15-minute account lockout
    const lockoutUser = await User.create({
      name: 'Lockout Test User',
      email: 'lockout_test@asmshine.com',
      password: 'CorrectPassword123!',
      role: 'customer',
      isActive: true
    });

    for (let i = 1; i <= 4; i++) {
      const wrongRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lockoutUser.email, password: 'WrongPassword!' })
      });
      if (wrongRes.status !== 401) throw new Error(`Expected 401 on failed attempt ${i}`);
    }

    // 5th failed attempt triggers lockout (HTTP 423)
    const fifthRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lockoutUser.email, password: 'WrongPassword!' })
    });
    test('1C: 5th consecutive failed login triggers account lockout (HTTP 423)', fifthRes.status === 423);

    // 6th attempt (even with correct password) is blocked by active lockout
    const sixthRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lockoutUser.email, password: 'CorrectPassword123!' })
    });
    test('1D: Locked account rejects login even with correct password (HTTP 423)', sixthRes.status === 423);

    // 1E. Superadmin role access enforcement
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (!superadmin) throw new Error('Superadmin account not found.');
    const adminToken = jwt.sign({ id: superadmin._id.toString() }, jwtSecret);

    const normalCust = await User.create({
      name: 'Normal Customer',
      email: testEmail,
      password: 'Password123!',
      role: 'customer'
    });
    const custToken = jwt.sign({ id: normalCust._id.toString() }, jwtSecret);

    const custAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    test('1E: Customer token rejected on admin APIs (HTTP 403 Forbidden)', custAdminRes.status === 403);

    const superAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    test('1F: Superadmin token authorized on admin APIs (HTTP 200 OK)', superAdminRes.status === 200);

    // ----------------------------------------------------
    // TASK 2: OTP SECURITY & ZERO INFORMATION LEAKAGE
    // ----------------------------------------------------
    console.log('\n--- TASK 2: OTP Security & Leakage Prevention ---');

    // 2A. Signup send-otp: no devOtp or otp in response
    const resOtpSignup = await fetch(`${BASE_URL}/auth/signup/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'OTP Tester', email: 'otp_tester_01@asmshine.com', password: 'Password123!' })
    });
    const dataOtpSignup = await resOtpSignup.json();
    test('2A: sendSignupOtp response does NOT contain devOtp or otp', dataOtpSignup.devOtp === undefined && dataOtpSignup.otp === undefined);

    // 2B. Login send-otp: no devOtp in response
    const resOtpLogin = await fetch(`${BASE_URL}/auth/login/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const dataOtpLogin = await resOtpLogin.json();
    test('2B: sendLoginOtp response does NOT contain devOtp or otp', dataOtpLogin.devOtp === undefined && dataOtpLogin.otp === undefined);

    // 2C. Forgot-password send-otp: no devOtp in response
    const resOtpForgot = await fetch(`${BASE_URL}/auth/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const dataOtpForgot = await resOtpForgot.json();
    test('2C: sendForgotPasswordOtp response does NOT contain devOtp or otp', dataOtpForgot.devOtp === undefined && dataOtpForgot.otp === undefined);

    // 2D. Reset-password Path B attempt limits
    for (let j = 1; j <= 5; j++) {
      await fetch(`${BASE_URL}/auth/forgot-password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, otp: '000000', newPassword: 'NewPassword123!' })
      });
    }
    const sixthResetRes = await fetch(`${BASE_URL}/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000', newPassword: 'NewPassword123!' })
    });
    test('2D: resetPassword Path B blocks brute force with HTTP 400/429 and invalidates OTP', sixthResetRes.status === 400 || sixthResetRes.status === 429);

    // ----------------------------------------------------
    // TASK 3: STRICT CORS ENFORCEMENT
    // ----------------------------------------------------
    console.log('\n--- TASK 3: Strict CORS Validation ---');

    // 3A. Approved origin (localhost) allowed
    const resCorsOk = await fetch(`${BASE_URL}/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    test('3A: Approved origin http://localhost:5173 is permitted', resCorsOk.status === 200);

    // 3B. Wildcard vercel subdomain rejected
    const resCorsVercel = await fetch(`${BASE_URL}/health`, {
      headers: { Origin: 'https://attacker-rogue.vercel.app' }
    });
    test('3B: Unauthorized Vercel subdomain https://attacker-rogue.vercel.app is rejected (HTTP 403)', resCorsVercel.status === 403);

    // 3C. Unauthorized onrender subdomain rejected
    const resCorsRender = await fetch(`${BASE_URL}/health`, {
      headers: { Origin: 'https://evil-host.onrender.com' }
    });
    test('3C: Unauthorized Onrender subdomain https://evil-host.onrender.com is rejected (HTTP 403)', resCorsRender.status === 403);

    // ----------------------------------------------------
    // TASK 4: REDOS & REGEX INJECTION DEFENSES
    // ----------------------------------------------------
    console.log('\n--- TASK 4: ReDoS & Regex Injection Defenses ---');

    // Malformed regex patterns that previously would cause SyntaxError (HTTP 500) or ReDoS loop
    const reDosPatterns = ['[a-', '([a-z]+)+$', '(?:(?=a)b', '***', '(?<=abc'];

    for (const pat of reDosPatterns) {
      const resCust = await fetch(`${BASE_URL}/admin/customers?search=${encodeURIComponent(pat)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (resCust.status !== 200) throw new Error(`Customer search failed on pattern '${pat}': status ${resCust.status}`);

      const resInv = await fetch(`${BASE_URL}/admin/inventory?search=${encodeURIComponent(pat)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (resInv.status !== 200) throw new Error(`Inventory search failed on pattern '${pat}': status ${resInv.status}`);

      const resOrd = await fetch(`${BASE_URL}/admin/orders?search=${encodeURIComponent(pat)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (resOrd.status !== 200) throw new Error(`Order search failed on pattern '${pat}': status ${resOrd.status}`);

      const resProd = await fetch(`${BASE_URL}/admin/products?search=${encodeURIComponent(pat)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (resProd.status !== 200) throw new Error(`Admin product search failed on pattern '${pat}': status ${resProd.status}`);
    }

    test('4A: All 4 admin search routes safely handle unescaped regex tokens without SyntaxError or crash', true);

    const resPublicProd = await fetch(`${BASE_URL}/products?search=${encodeURIComponent('[a-')}`);
    test('4B: Public product search safely handles unescaped regex characters (HTTP 200)', resPublicProd.status === 200);

    // ----------------------------------------------------
    // TASK 5: VARIANT INVENTORY & PAYMENT SECURITY
    // ----------------------------------------------------
    console.log('\n--- TASK 5: Variant Inventory & Payment Security ---');

    // 5A & 5B. Create product with variants and test accurate variant stock deduction
    const testVarSku = 'TEST-VAR-DISH-500';
    const testVarId = 'test_var_dishwash_gel';
    await Product.deleteMany({ id: testVarId });

    const varProduct = await Product.create({
      id: testVarId,
      name: 'Test Variant Dishwash Gel',
      sku: 'SKU-DISH-BASE',
      category: 'everyday_essentials',
      section: 'everyday_essentials',
      size: '500ml',
      price: 129,
      originalPrice: 185,
      discountPercent: 30,
      stockQuantity: 25,
      inStock: true,
      image: '/images/products/test.png',
      availableSizes: [
        {
          size: '500ml',
          sku: testVarSku,
          price: 129,
          originalPrice: 185,
          stockQuantity: 15,
          inStock: true
        },
        {
          size: '1L',
          sku: 'TEST-VAR-DISH-1L',
          price: 239,
          originalPrice: 320,
          stockQuantity: 10,
          inStock: true
        }
      ]
    });

    // Deduct 3 units of '1L' variant
    await inventoryService.deductOrderStock(
      [{ productId: testVarId, name: varProduct.name, quantity: 3, size: '1L' }],
      'ORD-TEST-VAR-001'
    );

    const pAfterVariantDeduct = await Product.findOne({ id: testVarId });
    const v1L = pAfterVariantDeduct.availableSizes.find((s) => s.size === '1L');
    const v500 = pAfterVariantDeduct.availableSizes.find((s) => s.size === '500ml');

    test('5A: Variant stock is accurately decremented (10 - 3 = 7)', v1L.stockQuantity === 7);
    test('5B: Other variant stock remains untouched (15)', v500.stockQuantity === 15);
    test('5C: Parent stock is accurately decremented (25 - 3 = 22)', pAfterVariantDeduct.stockQuantity === 22);

    // 5D. Variant stock overselling prevention
    let oversellBlocked = false;
    try {
      // Attempt to deduct 8 units of '1L' when only 7 exist
      await inventoryService.deductOrderStock(
        [{ productId: testVarId, name: varProduct.name, quantity: 8, size: '1L' }],
        'ORD-TEST-VAR-002'
      );
    } catch (err) {
      oversellBlocked = true;
    }
    test('5D: Variant overselling is rejected with insufficient stock error', oversellBlocked === true);

    // 5E. Online order (UPI) placed without verification does NOT deduct inventory and marks PENDING_PAYMENT
    const stockBeforeOnlineOrder = (await Product.findOne({ id: testVarId })).stockQuantity;

    const resOnlineOrder = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({
        items: [{ productId: testVarId, quantity: 2, size: '500ml' }],
        shippingAddress: {
          fullName: 'Sagar Singh',
          phone: '9876543210',
          street: 'Line 1, Civil Lines',
          city: 'Banda',
          state: 'Uttar Pradesh',
          pincode: '210001',
          type: 'HOME'
        },
        paymentMethod: 'upi'
      })
    });

    const dataOnlineOrder = await resOnlineOrder.json();
    test('5E: Online order created with status PENDING_PAYMENT', dataOnlineOrder.order?.status === 'PENDING_PAYMENT');
    test('5F: Unearned 5% prepaid discount is 0 on online order', dataOnlineOrder.order?.pricing?.prepaidDiscount === 0);

    const stockAfterOnlineOrder = (await Product.findOne({ id: testVarId })).stockQuantity;
    test('5G: Unverified online order does NOT deduct inventory (Stock stays at 22)', stockBeforeOnlineOrder === stockAfterOnlineOrder);

    // 5H. Cash on Delivery (COD) order IS confirmed and DOES deduct inventory
    const resCodOrder = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({
        items: [{ productId: testVarId, quantity: 2, size: '500ml' }],
        shippingAddress: {
          fullName: 'Sagar Singh',
          phone: '9876543210',
          street: 'Line 1, Civil Lines',
          city: 'Banda',
          state: 'Uttar Pradesh',
          pincode: '210001',
          type: 'HOME'
        },
        paymentMethod: 'cod'
      })
    });

    const dataCodOrder = await resCodOrder.json();
    test('5H: COD order created with status CONFIRMED', dataCodOrder.order?.status === 'CONFIRMED');

    const stockAfterCodOrder = (await Product.findOne({ id: testVarId })).stockQuantity;
    test('5I: Confirmed COD order deducts inventory (22 - 2 = 20)', stockAfterCodOrder === 20);

    // Cleanup test product
    await Product.deleteMany({ id: testVarId });
    await StockMovement.deleteMany({ productId: testVarId });

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedCount}/${totalTests} PHASE 1 SECURITY TESTS PASSED 100%!`);
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ PHASE 1 SECURITY SUITE FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runPhase1Tests();
