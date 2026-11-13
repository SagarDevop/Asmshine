const Policy = require('../models/Policy');
const ConsentRecord = require('../models/ConsentRecord');
const AuditLog = require('../models/AuditLog');

// Default initial approved drafts for the three required legal policies
const DEFAULT_POLICIES = {
  terms_and_conditions: {
    title: 'Terms & Conditions',
    version: '1.0',
    summary: 'Official Terms & Conditions governing ASM Shine e-commerce platform and services.',
    content: `# Terms & Conditions

### 1. Introduction
Welcome to ASM Shine. These Terms & Conditions ("Terms") govern your access to and use of the ASM Shine website, mobile experience, and e-commerce services ("Platform"). By accessing, browsing, registering, or purchasing products from ASM Shine, you acknowledge that you have read, understood, and agree to be legally bound by these Terms. If you do not agree to these Terms, please refrain from using the Platform.

### 2. User Eligibility
You must be at least 18 years of age or possess legal parental/guardian consent to enter into binding legal agreements under applicable Indian law. By accessing this Platform, you represent and warrant that you have the full legal right, authority, and capacity to enter into and abide by all terms and conditions stated herein.

### 3. Account Registration
To access specific features including order history, rewards, and expedited checkout, you may create an account using a valid email address and verified password or One-Time Password (OTP). You agree to provide accurate, truthful, current, and complete information during registration and keep your account details updated at all times.

### 4. User Responsibilities
You are solely responsible for safeguarding the confidentiality of your account credentials, login passwords, and verification codes. You agree to accept responsibility for all activities and transactions that occur under your account. You must notify ASM Shine immediately at support@asmshine.com upon discovering or suspecting any unauthorized access or breach of security. You agree not to misuse the Platform, engage in automated scraping, introduce harmful software, or commit fraudulent acts.

### 5. Products & Descriptions
ASM Shine manufactures and distributes advanced household and commercial cleaning, hygiene, and disinfectant formulations. We make every reasonable effort to ensure that product descriptions, active ingredients, usage instructions, bottle volumes, and visual images accurately represent the products. However, actual packaging, bottle contours, and labeling may slightly vary due to continuous formulation and manufacturing improvements.

### 6. Pricing & Payments
All prices displayed on the Platform are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless explicitly noted otherwise. We accept payments via Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, and Net Banking through authorized and compliant payment gateways. Prices and discounts are subject to change without prior notice; the final binding price is the price confirmed at the moment of order placement.

### 7. Orders & Acceptance
Placing an order represents an offer to purchase the selected items. ASM Shine reserves the right to accept, limit, or reject any order for reasons including product unavailability, pricing errors, delivery address outside serviceable zones, or suspected fraudulent activity. An order is deemed formally accepted once dispatched with an electronic confirmation containing an Order ID.

### 8. Shipping & Delivery
Orders are packed and dispatched from verified facilities to serviceable postal pin codes across India through established courier partners. Standard transit timelines range from 2 to 7 business days depending on location. Risk of loss and title for all products pass to the customer upon delivery by the carrier partner.

### 9. Returns & Refunds
All product returns, damaged product claims, replacements, and refunds are strictly governed by our dedicated Refund, Return & Replacement Policy, which is incorporated into these Terms by reference. Due to hygiene standards, opened or used cleaning chemicals are non-returnable.

### 10. Limitation of Liability
To the maximum extent permitted by applicable Indian law, ASM Shine, its directors, officers, and affiliates shall not be liable for any indirect, punitive, incidental, special, or consequential damages arising out of the use, improper application, or inability to use our products or Platform. In any event, our total aggregate liability shall not exceed the amount actually paid by you for the specific product or order giving rise to the claim.

### 11. Intellectual Property
All trademarks, service marks, trade names, brand logos ("ASM Shine"), product names, packaging designs, text, graphics, and underlying source code are the exclusive intellectual property of ASM Shine and are protected under Indian copyright, trademark, and intellectual property statutes. Unauthorized reproduction, modification, or distribution is strictly prohibited.

### 12. Changes to Terms
We reserve the right to revise, modify, or update these Terms at any time to reflect legislative, regulatory, or business changes. The revised version will be published on the Platform with an updated Effective Date and Version number. Continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms.

### 13. Contact Information
If you have any questions, clarifications, or feedback regarding these Terms & Conditions, please contact us at:
- **Email:** support@asmshine.com
- **Customer Support Hours:** Monday to Saturday, 9:00 AM – 6:00 PM IST
- **Registered Address:** ASM Shine Hygiene Labs, New Delhi, India`
  },

  privacy_policy: {
    title: 'Privacy Policy',
    version: '1.0',
    summary: 'Official Privacy Policy detailing data collection, storage, security, and user rights.',
    content: `# Privacy Policy

### 1. Introduction
At ASM Shine, we respect your privacy and are committed to safeguarding the personal data you entrust to us. This Privacy Policy describes the categories of information we collect, how it is processed and secured, who it may be shared with, and the rights you have regarding your personal information when accessing our Platform or purchasing our cleaning products.

### 2. Information We Collect
We collect only the essential personal and technical data required to process your orders, deliver parcels securely, authenticate accounts, and provide responsive customer care. Data is collected directly when you register an account, place an order, or communicate with our support desk.

### 3. Personal Information
When you register or transact on the Platform, we may collect identifiable details such as your full name, email address, and primary telephone/mobile number. We use this information to maintain your profile and communicate essential transactional notices.

### 4. Account Information
For registered users, we maintain account credentials. All passwords are stored exclusively as one-way cryptographic bcrypt hashes and are never visible or accessible in plaintext to anyone, including our administrative personnel.

### 5. Order & Transaction Information
When you purchase items, we record your chosen shipping address (house/flat number, street, city, state, postal PIN code), order line items, quantity, total price, and chosen payment method (COD, UPI, Card). ASM Shine does NOT store credit/debit card numbers, CVVs, expiry dates, or netbanking passwords. All online payments are handled directly by PCI-DSS compliant payment gateways.

### 6. Cookies & Website Usage
We utilize essential HTTP session cookies and local storage tokens solely for core e-commerce capabilities: preserving items in your shopping cart across sessions, maintaining login status, and preventing Cross-Site Request Forgery (CSRF). We do not use intrusive spyware or third-party tracking cookies.

### 7. How We Use Information
We use your information strictly for legitimate transactional and service purposes:
- Packing, verifying, and dispatching your orders.
- Transmitting tracking numbers, delivery updates, and electronic receipts.
- Authenticating your identity during account login and password recovery.
- Detecting, preventing, and mitigating fraudulent transactions and spam.
- Answering customer support inquiries and managing replacement requests.

### 8. Data Sharing
We do not sell, rent, monetize, or trade your personal information to third-party data brokers or marketing lists. We share data only with trusted operational service partners strictly necessary to execute our obligations:
- **Courier & Logistics Partners:** Name, phone number, and delivery address to deliver shipments.
- **Payment Gateways:** Transaction total and reference IDs to verify payment settlements.
- **Legal Mandates:** Law enforcement or governmental bodies when strictly mandated by Indian law or competent court orders.

### 9. Data Security
We apply industry-standard security measures to protect your personal data from unauthorized access, loss, or alteration. All web traffic is encrypted via Transport Layer Security (TLS/HTTPS). Internal database access is restricted via Role-Based Access Control (RBAC), and administrative operations are audited.

### 10. Data Retention
We retain personal data and order transaction history for the duration necessary to satisfy tax, accounting, and regulatory obligations under Indian law. Inactive accounts may be retained until account deletion is requested by the customer.

### 11. User Rights
Under applicable Indian data protection principles, you possess the right to:
- Review the personal details linked to your account profile.
- Correct or update your shipping addresses and contact details via your Account dashboard.
- Request deactivation or deletion of your profile by emailing support@asmshine.com.

### 12. Contact Information
For privacy questions, data requests, or to reach our Grievance Officer, please contact:
- **Grievance Officer / Privacy Support:** support@asmshine.com
- **Response Timeline:** Within 48 business hours
- **Official Address:** ASM Shine Hygiene Labs, New Delhi, India`
  },

  refund_policy: {
    title: 'Refund, Return & Replacement Policy',
    version: '1.0',
    summary: 'Official Refund, Return & Replacement Policy with approved damage reporting criteria.',
    content: `# Refund, Return & Replacement Policy

### 1. Introduction
At ASM Shine, we take utmost care to ensure that every order is packed and delivered in proper condition. Due to the nature of our cleaning and hygiene-related products, we generally do not accept returns or exchanges for products purchased simply due to a change of mind, incorrect selection, or personal preference.

### 2. Non-Returnable Products
The following items and conditions are strictly non-returnable:
- Products that have been opened, unsealed, used, diluted, or tampered with are not eligible for return.
- Products purchased through personal preference, change of mind, or accidental order selection.
- Products with damaged or missing original outer packaging, caps, or safety seals due to customer handling.

### 3. Damaged or Defective Products
If you receive a product that is damaged, defective, leaking, or broken upon arrival, please contact our support team within 48 hours of delivery. Please provide your Order ID, delivery details, and clear supporting photographs or unboxing videos showing the defect or leakage. After verification, ASM Shine will arrange an appropriate replacement or refund.

### 4. Incorrect Orders
If you receive an item different from what was confirmed in your order summary, please notify us within 48 hours of delivery with photographic evidence. Upon swift verification, we will dispatch the correct product at zero additional cost or issue a full refund if the item is out of stock.

### 5. Return Eligibility
Where an exception is approved by ASM Shine customer support, the returned product must be completely unused, unopened, in its original intact packaging, with all seals, labels, and protective caps intact. Items returned without prior authorization cannot be accepted.

### 6. Order Cancellation
Cancellation requests can be considered only before the order has been dispatched from our facility. Once an order has been shipped and handed over to the courier partner, cancellation is no longer possible.

### 7. Refund Processing
Where a refund is approved by our compliance team, it will be processed through the original payment method (or another mutually agreed method such as UPI or bank transfer), generally within 7 to 10 business days, subject to payment gateway, bank settlement, and clearing cycles. For Cash on Delivery orders, refunds are issued via direct bank account transfer (NEFT/IMPS) upon customer verification.

### 8. Replacement Process
Once a damaged or incorrect shipment claim is verified, a replacement shipment will be dispatched within 24 to 48 business hours. Tracking details for the replacement parcel will be transmitted directly to your registered email and mobile number.

### 9. Contact Information
To submit a replacement request, report a transit issue, or inquire about refund status, contact our dedicated support team:
- **Support Email:** support@asmshine.com
- **Customer Care Hours:** Monday to Saturday, 9:00 AM – 6:00 PM IST
- **Physical Address:** ASM Shine Customer Support, New Delhi, India`
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
