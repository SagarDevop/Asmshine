/**
 * Comprehensive Razorpay Integration & Endpoint Test
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const crypto = require('crypto');
const http = require('http');
const app = require('../app');
const { getRazorpayInstance } = require('../config/razorpay');

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE RAZORPAY TESTS ---');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Environment check
  assert(Boolean(process.env.RAZORPAY_KEY_ID), 'RAZORPAY_KEY_ID is set');
  assert(Boolean(process.env.RAZORPAY_KEY_SECRET), 'RAZORPAY_KEY_SECRET is set');

  // 2. Direct SDK Test
  const rzp = getRazorpayInstance();
  const directOrder = await rzp.orders.create({
    amount: 19900,
    currency: 'INR',
    receipt: 'sdk_rcpt_' + Date.now().toString().slice(-6)
  });
  assert(Boolean(directOrder?.id), `Direct SDK order created: ${directOrder.id}`);

  // 3. Start local ephemeral HTTP server on test port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const postJson = async (urlPath, body) => {
    const res = await fetch(`${baseUrl}${urlPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  const getJson = async (urlPath) => {
    const res = await fetch(`${baseUrl}${urlPath}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    // 4. Test Key endpoint
    const keyRes = await getJson('/api/payment/key');
    assert(keyRes.status === 200 && keyRes.data.key_id === process.env.RAZORPAY_KEY_ID, 'GET /api/payment/key returns correct public key');

    // 5. Test create-order with invalid amount (< 100 paise)
    const errRes1 = await postJson('/api/create-order', { amount: 50 });
    assert(errRes1.status === 400 && errRes1.data.success === false, 'POST /api/create-order rejects amount < 100 paise with HTTP 400');

    // 6. Test create-order with missing amount
    const errRes2 = await postJson('/api/create-order', {});
    assert(errRes2.status === 400, 'POST /api/create-order rejects missing amount with HTTP 400');

    // 7. Test create-order with valid amount
    const createRes = await postJson('/api/create-order', {
      amount: 49900,
      currency: 'INR',
      receipt: 'test_order_101'
    });
    assert(
      createRes.status === 200 &&
      createRes.data.success === true &&
      Boolean(createRes.data.order_id) &&
      createRes.data.amount === 49900 &&
      createRes.data.currency === 'INR',
      `POST /api/create-order returns order_id (${createRes.data.order_id}), amount, and currency`
    );

    // Also test alias route /api/v1/payment/create-order
    const createV1Res = await postJson('/api/v1/payment/create-order', {
      amount: 15000,
      currency: 'INR'
    });
    assert(createV1Res.status === 200 && Boolean(createV1Res.data.order_id), 'Alias POST /api/v1/payment/create-order also works seamlessly');

    const razorpayOrderId = createRes.data.order_id;
    const dummyPaymentId = 'pay_TestDummy' + Date.now().toString().slice(-6);

    // 8. Test verify-payment with missing fields
    const missingRes = await postJson('/api/verify-payment', {
      razorpay_order_id: razorpayOrderId
    });
    assert(missingRes.status === 400, 'POST /api/verify-payment rejects missing payment_id or signature with HTTP 400');

    // 9. Test verify-payment with signature mismatch
    const badSigRes = await postJson('/api/verify-payment', {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: dummyPaymentId,
      razorpay_signature: 'invalid_tampered_signature_hex_1234567890abcdef'
    });
    assert(badSigRes.status === 400 && badSigRes.data.success === false, 'POST /api/verify-payment rejects fraudulent signature with HTTP 400');

    // 10. Test verify-payment with genuine HMAC-SHA256 signature
    const genuineSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${dummyPaymentId}`)
      .digest('hex');

    const validSigRes = await postJson('/api/verify-payment', {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: dummyPaymentId,
      razorpay_signature: genuineSignature
    });
    assert(
      validSigRes.status === 200 && validSigRes.data.success === true,
      'POST /api/verify-payment accepts valid HMAC-SHA256 signature with HTTP 200'
    );

  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${passed}/${total}`);
  console.log(`========================================\n`);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
