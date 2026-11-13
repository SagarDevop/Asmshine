require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Policy = require('../models/Policy');
const ConsentRecord = require('../models/ConsentRecord');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const policyService = require('../services/policyService');

const runLegalPolicyTests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log('================================================================');
  console.log('⚖️ ASM SHINE LEGAL & POLICY MANAGEMENT SYSTEM VERIFICATION TEST');
  console.log('================================================================\n');

  await mongoose.connect(uri);

  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_local_apex';

    // -------------------------------------------------------------
    // Test 1: Auto-Seeding & Initial Policy States (v1.0)
    // -------------------------------------------------------------
    console.log('[Test 1] Testing Auto-Seed & Default Policies...');
    await Policy.deleteMany({ policyType: 'refund_policy', version: { $ne: '1.0' } });
    await Policy.updateOne({ policyType: 'refund_policy', version: '1.0' }, { $set: { status: 'PUBLISHED', isCurrentPublished: true } });
    await policyService.ensureDefaultPolicies();

    const terms = await Policy.findOne({ policyType: 'terms_and_conditions', isCurrentPublished: true });
    const privacy = await Policy.findOne({ policyType: 'privacy_policy', isCurrentPublished: true });
    const refund = await Policy.findOne({ policyType: 'refund_policy', isCurrentPublished: true });

    if (!terms || terms.version !== '1.0' || terms.status !== 'PUBLISHED') {
      throw new Error('Terms & Conditions v1.0 not properly seeded or published');
    }
    if (!privacy || privacy.version !== '1.0' || privacy.status !== 'PUBLISHED') {
      throw new Error('Privacy Policy v1.0 not properly seeded or published');
    }
    if (!refund || refund.version !== '1.0' || refund.status !== 'PUBLISHED') {
      throw new Error('Refund Policy v1.0 not properly seeded or published');
    }

    // Verify refund wording matches exact approved requirements
    if (!refund.content.includes('hygiene-related products') || !refund.content.includes('48 hours of delivery')) {
      throw new Error('Refund Policy content does not match mandatory approved wording');
    }
    console.log('✅ PASS: All 3 policies (Terms, Privacy, Refund) seeded at v1.0, PUBLISHED, with approved wording.');

    // -------------------------------------------------------------
    // Test 2: Public Policies Querying
    // -------------------------------------------------------------
    console.log('\n[Test 2] Testing Public Retrieval Services...');
    const publicPolicies = await policyService.getPublicPolicies();
    if (publicPolicies.length < 3) {
      throw new Error(`Expected at least 3 active public policies, found ${publicPolicies.length}`);
    }

    const publicTerms = await policyService.getPublicPolicyContent('terms_and_conditions');
    if (!publicTerms || !publicTerms.content || publicTerms.version !== '1.0') {
      throw new Error('Public terms content retrieval failed');
    }
    console.log('✅ PASS: Public policy endpoints return correct versioned content.');

    // -------------------------------------------------------------
    // Test 3: Immutability of Published Policy Versions
    // -------------------------------------------------------------
    console.log('\n[Test 3] Testing Immutability of Published Policies...');
    let immutabilityBlocked = false;
    try {
      await policyService.updatePolicyDraft('terms_and_conditions', '1.0', {
        title: 'Tampered Title',
        content: 'Tampered Content'
      }, { name: 'Attacker', role: 'admin' });
    } catch (err) {
      if (err.message.includes('immutable') || err.message.includes('cannot be modified')) {
        immutabilityBlocked = true;
      } else {
        throw err;
      }
    }

    if (!immutabilityBlocked) {
      throw new Error('CRITICAL SECURITY VIOLATION: Published policy was allowed to be directly modified!');
    }
    console.log('✅ PASS: Published policy version 1.0 is strictly immutable.');

    // -------------------------------------------------------------
    // Test 4: Draft Creation, Revision & Version Publishing Lifecycle
    // -------------------------------------------------------------
    console.log('\n[Test 4] Testing Policy Lifecycle (Draft -> Revision -> Publishing)...');
    // Create draft v1.1
    // Clean up any existing draft 1.1 first
    await Policy.deleteMany({ policyType: 'refund_policy', version: '1.1' });

    const draft = await policyService.createPolicyDraft('refund_policy', {
      version: '1.1',
      title: 'Refund, Return & Replacement Policy',
      content: refund.content + '\n\n#### Razorpay Compliance Clause\nInstant refunds processed within 5-7 working days.',
      summary: 'Added Razorpay compliance timeline'
    }, { name: 'Admin Compliance Officer', role: 'admin' });

    if (!draft || draft.status !== 'DRAFT' || draft.isCurrentPublished !== false) {
      throw new Error('Draft creation failed or improperly marked as published');
    }

    // Update draft v1.1
    const updatedDraft = await policyService.updatePolicyDraft('refund_policy', '1.1', {
      title: 'Refund, Return & Replacement Policy',
      content: draft.content + '\nUpdated note on packaging.',
      summary: 'Added packaging guidelines'
    }, { name: 'Admin Compliance Officer', role: 'admin' });

    if (!updatedDraft.content.includes('packaging guidelines') && !updatedDraft.summary.includes('packaging guidelines')) {
      throw new Error('Draft update failed');
    }

    // Publish v1.1
    const publishedNew = await policyService.publishPolicyVersion('refund_policy', '1.1', {
      name: 'SuperAdmin Lead',
      role: 'superadmin'
    });

    if (!publishedNew || publishedNew.status !== 'PUBLISHED' || publishedNew.isCurrentPublished !== true) {
      throw new Error('Publishing v1.1 failed');
    }

    // Verify older v1.0 was archived
    const olderRefund = await Policy.findOne({ policyType: 'refund_policy', version: '1.0' });
    if (!olderRefund || olderRefund.status !== 'ARCHIVED' || olderRefund.isCurrentPublished !== false) {
      throw new Error('Older v1.0 was not properly archived upon superseding');
    }

    // Verify audit log entry
    const audit = await AuditLog.findOne({
      action: 'POLICY_PUBLISH',
      resourceType: 'POLICY',
      'details.version': '1.1'
    });
    if (!audit) {
      throw new Error('AuditLog entry not found for POLICY_PUBLISH');
    }
    console.log('✅ PASS: Policy lifecycle complete (Draft v1.1 created -> updated -> published -> v1.0 archived -> AuditLog recorded).');

    // Restore refund_policy to v1.0 as current for clean test state
    await Policy.updateOne({ policyType: 'refund_policy', version: '1.0' }, { $set: { status: 'PUBLISHED', isCurrentPublished: true } });
    await Policy.deleteOne({ policyType: 'refund_policy', version: '1.1' });

    // -------------------------------------------------------------
    // Test 5: Customer Signup Consent Recording
    // -------------------------------------------------------------
    console.log('\n[Test 5] Testing Customer Signup Consent Recording...');
    const testEmail = `test_legal_signup_${Date.now()}@asmshine.com`;
    const signupConsent = await policyService.recordConsent({
      userId: new mongoose.Types.ObjectId(),
      userEmail: testEmail,
      consentType: 'SIGNUP',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      policyTypes: ['terms_and_conditions', 'privacy_policy', 'refund_policy']
    });

    if (!signupConsent || signupConsent.consentType !== 'SIGNUP' || signupConsent.userEmail !== testEmail) {
      throw new Error('Consent record creation failed');
    }
    if (signupConsent.acceptedPolicies.length !== 3) {
      throw new Error(`Expected 3 accepted policies, got ${signupConsent.acceptedPolicies.length}`);
    }
    console.log(`✅ PASS: ConsentRecord created successfully for SIGNUP with ${signupConsent.acceptedPolicies.length} active policy versions.`);

    // -------------------------------------------------------------
    // Test 6: Checkout Order Policy Acknowledgement Consent
    // -------------------------------------------------------------
    console.log('\n[Test 6] Testing Checkout Policy Acknowledgement Recording...');
    const orderConsent = await policyService.recordConsent({
      userId: signupConsent.user,
      userEmail: testEmail,
      consentType: 'CHECKOUT',
      orderId: 'ORD_TEST_998877',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      policyTypes: ['terms_and_conditions', 'refund_policy']
    });

    if (!orderConsent || orderConsent.consentType !== 'CHECKOUT' || orderConsent.orderId !== 'ORD_TEST_998877') {
      throw new Error('Checkout consent record creation failed');
    }
    console.log('✅ PASS: ConsentRecord created for CHECKOUT tied to Order ID ORD_TEST_998877.');

    // -------------------------------------------------------------
    // Test 7: Admin Consent Records Query & Filtering
    // -------------------------------------------------------------
    console.log('\n[Test 7] Testing Admin Consent Query & Filtering...');
    const consentQuery = await policyService.getConsentRecords({
      search: testEmail,
      consentType: 'SIGNUP'
    });

    if (!consentQuery || !consentQuery.records || consentQuery.records.length === 0) {
      throw new Error('Failed to find recorded consent via admin query');
    }
    console.log(`✅ PASS: Admin query successfully retrieved ${consentQuery.records.length} records matching search & filter.`);

    // Clean up test records
    await ConsentRecord.deleteMany({ userEmail: testEmail });

    console.log('\n================================================================');
    console.log('🏆 ALL 7 LEGAL & POLICY TEST SUITES PASSED WITH 100% SUCCESS!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runLegalPolicyTests();
