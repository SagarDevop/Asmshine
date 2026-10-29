require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const runAuthTests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log('====================================================');
  console.log('🛡️ SM SHINE AUTH & ACCESS CONTROL TEST SUITE');
  console.log('====================================================');
  await mongoose.connect(uri);

  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_local_apex';

    // 1. Check Customer User
    const customer = await User.findOne({ role: 'customer' }) || await User.create({
      name: 'Test Customer',
      email: 'test_customer_auth@asmshine.com',
      password: 'password123',
      role: 'customer'
    });

    const customerToken = jwt.sign({ id: customer._id.toString() }, jwtSecret);

    // 2. Check Admin User
    const admin = await User.findOne({ role: 'superadmin' });
    if (!admin) throw new Error('Superadmin account not found! Run npm run admin:create first.');

    const adminToken = jwt.sign({ id: admin._id.toString() }, jwtSecret);

    // Test API calls against local running backend (http://127.0.0.1:5000)
    console.log('\n[Test 1] Testing unauthenticated access to /api/v1/admin/dashboard...');
    const res1 = await fetch('http://127.0.0.1:5000/api/v1/admin/dashboard');
    console.log(`Response status: ${res1.status}`);
    if (res1.status !== 401) throw new Error(`Test 1 Failed: Expected 401, got ${res1.status}`);
    console.log('✅ Unauthenticated request correctly rejected with 401 Unauthorized.');

    console.log('\n[Test 2] Testing customer role access to /api/v1/admin/dashboard...');
    const res2 = await fetch('http://127.0.0.1:5000/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log(`Response status: ${res2.status}`);
    if (res2.status !== 403) throw new Error(`Test 2 Failed: Expected 403, got ${res2.status}`);
    console.log('✅ Customer token correctly blocked with 403 Forbidden.');

    console.log('\n[Test 3] Testing superadmin role access to /api/v1/admin/dashboard...');
    const res3 = await fetch('http://127.0.0.1:5000/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Response status: ${res3.status}`);
    if (res3.status !== 200) throw new Error(`Test 3 Failed: Expected 200, got ${res3.status}`);
    const data3 = await res3.json();
    console.log('✅ Superadmin authorized successfully with 200 OK.');
    console.log(`   - Total Orders in DB: ${data3.data?.summary?.totalOrders}`);
    console.log(`   - Total Revenue in DB: ₹${data3.data?.summary?.totalRevenue}`);
    console.log(`   - In Stock Products: ${data3.data?.summary?.inStockProducts}`);

    console.log('\n====================================================');
    console.log('🎉 ALL ROLE-BASED ACCESS CONTROL TESTS PASSED 100%!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ AUTH TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runAuthTests();
