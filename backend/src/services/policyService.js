const Policy = require('../models/Policy');
const ConsentRecord = require('../models/ConsentRecord');
const AuditLog = require('../models/AuditLog');

// Default initial approved drafts for the three required legal policies
const DEFAULT_POLICIES = {
  terms_and_conditions: {
    title: 'Terms & Conditions',
    version: '1.0',
    summary: 'Initial approved publication of ASM Shine Terms & Conditions.',
    content: `# Terms & Conditions

**Effective Date:** January 1, 2026 | **Version:** 1.0

Welcome to ASM Shine. These Terms and Conditions ("Terms") govern your access to and use of the ASM Shine website, mobile application, and e-commerce services ("Platform"). By accessing, browsing, registering, or purchasing products on ASM Shine, you agree to be bound by these Terms.

---

### 1. Introduction
ASM Shine ("we", "our", "us") provides premium household and commercial hygiene and cleaning solutions across India. These Terms constitute a legally binding agreement between you ("User", "Customer", "You") and ASM Shine.

### 2. User Eligibility
- You must be at least 18 years of age or possess legal parental/guardian consent to enter into binding agreements.
- By using this Platform, you represent and warrant that you have the right, authority, and capacity to enter into these Terms.

### 3. Account Registration & Security
- To access certain features such as checkout, order tracking, and coupons, you may need to register an account using a valid email address and password or verified One-Time Password (OTP).
- You agree to provide accurate, truthful, and up-to-date information during registration.
- You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
- You must notify ASM Shine immediately at support@asmshine.com upon suspecting any unauthorized access or security breach.

### 4. Account Responsibilities
- You agree not to misuse the Platform, introduce malicious code, engage in fraudulent transactions, or disrupt Platform infrastructure.
- Any abusive, automated, or unauthorized use may result in immediate suspension or termination of your account.

### 5. Product Information & Usage
- We strive to ensure accurate descriptions, images, net volumes, and specifications for all cleaning and hygiene products.
- Actual packaging, colors, and bottle containers may slightly vary due to manufacturer packaging updates.
- Always read product labels, directions for use, dilution ratios, and safety precautions before application. Keep cleaning chemicals out of reach of children and pets.

### 6. Pricing and Payments
- All product prices on the Platform are listed in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless explicitly stated otherwise.
- We support secure payments via Cash on Delivery (COD), UPI, Debit/Credit Cards, and Net Banking through authorized Reserve Bank of India (RBI) compliant payment partners.
- Prices and promotional discounts are subject to change without prior notice. The authoritative price is the price confirmed at the time of order placement.

### 7. Orders and Order Acceptance
- Placing an order constitutes an offer to purchase. ASM Shine reserves the right to accept, reject, or cancel orders in cases of stock unavailability, pricing errors, or suspected fraudulent activity.
- Upon successful order placement, an electronic confirmation notification with an Order ID will be generated.

### 8. Shipping and Delivery
- Orders are delivered to serviceable postal pin codes across India through verified courier partners.
- Estimated delivery timelines generally range from 3 to 7 business days, depending on your geographic location.
- Risk of loss and title for items pass to you upon delivery by the carrier partner.

### 9. Returns, Refunds and Replacements
- Product returns, replacements, and refunds are strictly governed by our [Refund & Return Policy](/refund-policy).

### 10. Limitation of Liability
- To the maximum extent permitted by applicable Indian law, ASM Shine shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or Platform.
- In all events, our total cumulative liability to you shall not exceed the total amount paid by you for the specific order giving rise to the claim.

### 11. Intellectual Property
- All trademarks, logos, brand names ("ASM Shine"), graphics, product labels, text, and software code are the intellectual property of ASM Shine and protected by Indian copyright and trademark laws.

### 12. Changes to Terms
- We reserve the right to amend or update these Terms to reflect operational, regulatory, or legal changes.
- Significant changes will be posted on the Platform with an updated Version and Effective Date.

### 13. Contact Information
For questions or concerns regarding these Terms, please reach out to:
- **Email:** support@asmshine.com
- **Customer Support Hours:** Monday to Saturday, 9:00 AM – 6:00 PM IST
- **Official Address:** ASM Shine Customer Support, New Delhi, India`
  },

  privacy_policy: {
    title: 'Privacy Policy',
    version: '1.0',
    summary: 'Initial approved publication of ASM Shine Privacy Policy.',
    content: `# Privacy Policy

**Effective Date:** January 1, 2026 | **Version:** 1.0

At ASM Shine, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, store, share, and protect your information when you visit our website or purchase our products.

---

### 1. Information We Collect
We collect only the minimum information necessary to provide e-commerce services, process orders, and improve your shopping experience:

#### A. Personal & Account Information
- Full Name
- Email Address
- Mobile Phone Number
- Account credentials (passwords stored strictly as cryptographic bcrypt hashes; never stored in plaintext)

#### B. Delivery & Shipping Information
- Shipping and billing addresses (Street, City, State, Postal PIN Code)
- Delivery contact recipient names and telephone numbers

#### C. Order & Transaction Information
- Order ID, items purchased, quantities, pack sizes, totals, coupon codes applied
- Payment method chosen (Cash on Delivery, UPI, Cards). *Note: ASM Shine does NOT store your credit card numbers, debit card PINs, CVVs, or netbanking credentials. Payment processing is handled by PCI-DSS compliant payment gateways.*

#### D. Technical & Website Usage Information
- IP address, browser type, device information, operating system
- Session cookies necessary for shopping cart persistence, authentication, and security

### 2. How We Use Information
We use your collected personal information strictly for legitimate business and transactional purposes:
- Processing, fulfilling, packing, and delivering your orders.
- Communicating order status updates, courier tracking numbers, and delivery confirmation.
- Authenticating your account via secure email OTPs or password logins.
- Preventing fraud, spam, automated abuse, and duplicate checkout submissions.
- Providing responsive customer support and addressing product inquiries.

### 3. Data Sharing and Third Parties
We do not sell, rent, or trade your personal data to third-party data brokers or marketing agencies. We share information only with trusted service providers necessary to operate our business:
- **Logistics & Courier Partners:** To physically ship and deliver packages to your doorstep.
- **Payment Processing Partners:** To securely process digital payments via PCI-DSS compliant infrastructure.
- **Transactional Communication Services:** To deliver order confirmation emails and authentication OTPs.
- **Law Enforcement & Legal Compliance:** When strictly mandated under applicable Indian law, court order, or governmental regulation.

### 4. Data Security & Storage
- All communication between your browser and our servers is encrypted using industry-standard Transport Layer Security (TLS/HTTPS).
- Administrative access to customer records is strictly restricted using Role-Based Access Control (RBAC) and monitored via audit logs.
- Sensitive authentication data is protected with salted cryptographic hashes and short-lived expiration windows.

### 5. Cookies and Web Storage
- We use essential HTTP cookies and local storage tokens solely to maintain your active shopping cart, remember your authenticated session, and protect against Cross-Site Request Forgery (CSRF).
- You can configure your browser to reject cookies; however, key e-commerce features (such as maintaining a shopping cart or checkout) require session cookies to function.

### 6. Data Retention
- We retain customer order records and transaction receipts for the period required by Indian accounting, taxation, and statutory record-keeping laws.
- Inactive user accounts may be retained until account deletion is requested by the customer.

### 7. User Rights
Subject to applicable Indian laws, you have the right to:
- Access and review the personal data associated with your profile.
- Correct, update, or rectify inaccurate address or contact details via the Account page.
- Request deletion or deactivation of your account by contacting our support team.

### 8. Contact Information
If you have any questions, feedback, or grievance regarding this Privacy Policy or your personal data, please contact:
- **Grievance Officer / Privacy Support:** support@asmshine.com
- **Response Timeline:** We acknowledge all privacy inquiries within 48 business hours.`
  },

  refund_policy: {
    title: 'Refund, Return & Replacement Policy',
    version: '1.0',
    summary: 'Initial approved publication of ASM Shine Refund, Return & Replacement Policy.',
    content: `# Refund, Return & Replacement Policy

**Effective Date:** January 1, 2026 | **Version:** 1.0

#### Introduction
At ASM Shine, we take utmost care to ensure that every order is packed and delivered in proper condition.

Due to the nature of our cleaning and hygiene-related products, we generally do not accept returns or exchanges for products purchased simply due to a change of mind, incorrect selection, or personal preference.

---

#### Non-Returnable Products
- Products that have been opened, used, or tampered with are generally not eligible for return.
- Products purchased through personal preference or a change of mind are generally not eligible for return.
- Products with damaged or missing original packaging due to customer handling may not qualify for return.

---

#### Damaged, Defective or Incorrect Products
If you receive a product that is damaged, defective, leaking, or different from what you ordered, please contact our support team within 48 hours of delivery with your order details and supporting photographs or videos.

After verification, ASM Shine may arrange an appropriate replacement or refund, as applicable.

---

#### Order Cancellation
Cancellation requests may be considered before an order has been dispatched. Once an order has been shipped, cancellation may no longer be possible.

---

#### Refund Processing
Where a refund is approved, it will be processed through the original payment method or another mutually agreed payment method, generally within 7–10 business days, subject to payment provider and banking timelines.

---

#### Important Note
This policy does not limit any consumer rights available under applicable Indian laws.

---

#### Support Contact
- **Email:** support@asmshine.com
- **Customer Care:** Available Monday – Saturday, 9:00 AM – 6:00 PM IST`
  }
};

/**
 * Initializes default approved versions of policies if not present in the database.
 */
const ensureDefaultPolicies = async () => {
  for (const [policyType, def] of Object.entries(DEFAULT_POLICIES)) {
    const existing = await Policy.findOne({ policyType, version: def.version });
    if (!existing) {
      const hasActive = await Policy.findOne({ policyType, isCurrentPublished: true });
      await Policy.create({
        policyType,
        title: def.title,
        version: def.version,
        summary: def.summary,
        content: def.content,
        status: 'PUBLISHED',
        isCurrentPublished: !hasActive,
        publishedAt: new Date(),
        effectiveDate: new Date()
      });
      console.log(`[PolicyService] Seeded published policy: ${policyType} v${def.version}`);
    } else {
      const hasActive = await Policy.findOne({ policyType, isCurrentPublished: true });
      if (!hasActive) {
        existing.isCurrentPublished = true;
        existing.status = 'PUBLISHED';
        await existing.save();
      }
    }
  }
};

/**
 * Get all current published policies (metadata only or with content)
 */
const getPublicPolicies = async () => {
  await ensureDefaultPolicies();
  return Policy.find({ isCurrentPublished: true, status: 'PUBLISHED' })
    .select('policyType title version summary publishedAt effectiveDate')
    .sort({ policyType: 1 });
};

/**
 * Get active published policy by type
 */
const getPublicPolicyContent = async (policyType, version = null) => {
  await ensureDefaultPolicies();
  const query = { policyType, status: 'PUBLISHED' };
  if (version) {
    query.version = version;
  } else {
    query.isCurrentPublished = true;
  }

  const policy = await Policy.findOne(query);
  if (!policy) {
    // If not found in DB, fallback to default policy object
    if (DEFAULT_POLICIES[policyType] && (!version || version === '1.0')) {
      return {
        policyType,
        ...DEFAULT_POLICIES[policyType],
        status: 'PUBLISHED',
        isCurrentPublished: true,
        publishedAt: new Date(),
        effectiveDate: new Date()
      };
    }
    return null;
  }
  return policy;
};

/**
 * Admin: Get policy summary for all 3 policies with current published version and latest draft
 */
const getAdminPolicyOverview = async () => {
  await ensureDefaultPolicies();
  const types = ['terms_and_conditions', 'privacy_policy', 'refund_policy'];
  const overview = [];

  for (const policyType of types) {
    const currentPublished = await Policy.findOne({ policyType, isCurrentPublished: true }).populate('publishedBy', 'name email role');
    const latestDraft = await Policy.findOne({ policyType, status: 'DRAFT' }).sort({ updatedAt: -1 });
    const versionCount = await Policy.countDocuments({ policyType });

    overview.push({
      policyType,
      title: currentPublished?.title || DEFAULT_POLICIES[policyType]?.title,
      currentVersion: currentPublished?.version || '1.0',
      currentPublishedAt: currentPublished?.publishedAt || null,
      publishedBy: currentPublished?.publishedBy ? { name: currentPublished.publishedBy.name, email: currentPublished.publishedBy.email } : null,
      hasDraft: !!latestDraft,
      draftVersion: latestDraft?.version || null,
      totalVersions: versionCount
    });
  }

  return overview;
};

/**
 * Admin: Get all versions of a specific policy
 */
const getPolicyVersions = async (policyType) => {
  await ensureDefaultPolicies();
  return Policy.find({ policyType })
    .sort({ createdAt: -1 })
    .populate('publishedBy', 'name email role');
};

/**
 * Admin: Create a new draft for a policy
 */
const createPolicyDraft = async (policyType, { version, title, content, summary }, adminUser) => {
  if (!['terms_and_conditions', 'privacy_policy', 'refund_policy'].includes(policyType)) {
    throw new Error('Invalid policy type');
  }

  const cleanVersion = (version || '').trim();
  if (!cleanVersion || !/^\d+(\.\d+)+$/.test(cleanVersion)) {
    throw new Error('Version must follow numeric format (e.g. 1.1 or 2.0)');
  }

  // Check if this version already exists
  const existing = await Policy.findOne({ policyType, version: cleanVersion });
  if (existing) {
    throw new Error(`Version ${cleanVersion} already exists for this policy. Please choose a new version number.`);
  }

  const draft = await Policy.create({
    policyType,
    title: (title || '').trim() || DEFAULT_POLICIES[policyType]?.title,
    version: cleanVersion,
    content: (content || '').trim(),
    summary: (summary || '').trim(),
    status: 'DRAFT',
    isCurrentPublished: false
  });

  return draft;
};

/**
 * Admin: Update an existing draft (Strictly blocks modifying published versions)
 */
const updatePolicyDraft = async (policyType, version, { title, content, summary }, adminUser) => {
  const policy = await Policy.findOne({ policyType, version });
  if (!policy) {
    throw new Error('Policy version not found');
  }

  if (policy.status === 'PUBLISHED') {
    throw new Error('Published policy versions are immutable. Create a new draft version to make changes.');
  }

  if (title) policy.title = title.trim();
  if (content !== undefined) policy.content = content.trim();
  if (summary !== undefined) policy.summary = summary.trim();

  await policy.save();
  return policy;
};

/**
 * Admin: Publish a draft version
 */
const publishPolicyVersion = async (policyType, version, adminUser) => {
  const policy = await Policy.findOne({ policyType, version });
  if (!policy) {
    throw new Error(`Policy ${policyType} version ${version} not found.`);
  }

  if (policy.isCurrentPublished && policy.status === 'PUBLISHED') {
    return policy; // Already active
  }

  // 1. Unset current published status on existing active version and archive it
  await Policy.updateMany(
    { policyType, isCurrentPublished: true },
    { $set: { isCurrentPublished: false, status: 'ARCHIVED' } }
  );

  // 2. Mark target version as PUBLISHED and currently active
  policy.status = 'PUBLISHED';
  policy.isCurrentPublished = true;
  policy.publishedAt = new Date();
  policy.effectiveDate = new Date();
  policy.publishedBy = adminUser?._id || null;
  await policy.save();

  // 3. Record in Administrative Audit Log
  try {
    await AuditLog.create({
      actor: adminUser?._id,
      actorName: adminUser?.name || 'Administrator',
      actorEmail: adminUser?.email || '',
      actorRole: adminUser?.role || 'admin',
      action: 'POLICY_PUBLISH',
      resourceType: 'POLICY',
      resourceId: `${policyType}:${version}`,
      details: {
        policyType,
        version,
        publishedAt: policy.publishedAt,
        summary: policy.summary
      }
    });
  } catch (auditErr) {
    console.warn('[PolicyService] Audit log warning:', auditErr.message);
  }

  return policy;
};

/**
 * Records customer consent (Signup, Checkout, or Reconsent)
 */
const recordConsent = async ({
  userId,
  userEmail,
  consentType,
  policyTypes = ['terms_and_conditions', 'privacy_policy', 'refund_policy'],
  orderId = null,
  ipAddress = '',
  userAgent = ''
}) => {
  await ensureDefaultPolicies();

  // Find active published versions of requested policies
  const activePolicies = await Policy.find({
    policyType: { $in: policyTypes },
    isCurrentPublished: true,
    status: 'PUBLISHED'
  });

  const acceptedPolicies = activePolicies.map((p) => ({
    policyType: p.policyType,
    version: p.version,
    policyId: p._id
  }));

  // Fallback if DB was unseeded
  if (acceptedPolicies.length === 0) {
    for (const t of policyTypes) {
      if (DEFAULT_POLICIES[t]) {
        acceptedPolicies.push({
          policyType: t,
          version: DEFAULT_POLICIES[t].version
        });
      }
    }
  }

  const record = await ConsentRecord.create({
    user: userId,
    userEmail: (userEmail || '').toLowerCase().trim(),
    consentType,
    acceptedPolicies,
    orderId: orderId || null,
    ipAddress: (ipAddress || '').trim(),
    userAgent: (userAgent || '').trim(),
    timestamp: new Date()
  });

  return record;
};

/**
 * Admin: Get paginated customer consent records with filter options
 */
const getConsentRecords = async ({
  page = 1,
  limit = 20,
  consentType,
  search,
  orderId,
  startDate,
  endDate
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (consentType && ['SIGNUP', 'CHECKOUT', 'POLICY_RECONSENT'].includes(consentType)) {
    query.consentType = consentType;
  }

  if (orderId && orderId.trim()) {
    query.orderId = new RegExp(orderId.trim(), 'i');
  }

  if (search && search.trim()) {
    query.userEmail = new RegExp(search.trim(), 'i');
  }

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.timestamp.$lte = end;
    }
  }

  const [records, total] = await Promise.all([
    ConsentRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email role')
      .lean(),
    ConsentRecord.countDocuments(query)
  ]);

  return {
    records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

module.exports = {
  DEFAULT_POLICIES,
  ensureDefaultPolicies,
  getPublicPolicies,
  getPublicPolicyContent,
  getAdminPolicyOverview,
  getPolicyVersions,
  createPolicyDraft,
  updatePolicyDraft,
  publishPolicyVersion,
  recordConsent,
  getConsentRecords
};
