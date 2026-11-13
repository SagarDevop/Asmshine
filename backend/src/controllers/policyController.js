const policyService = require('../services/policyService');

/**
 * GET /api/v1/policies
 * Returns list of currently published active policies
 */
exports.getPublicPolicies = async (req, res, next) => {
  try {
    const policies = await policyService.getPublicPolicies();
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/policies/:policyType
 * Returns full content of active published policy (or requested version)
 */
exports.getPublicPolicy = async (req, res, next) => {
  try {
    const { policyType } = req.params;
    const { version } = req.query;

    const normalizedType = policyType.replace(/-/g, '_');
    const policy = await policyService.getPublicPolicyContent(normalizedType, version);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: `Policy '${policyType}' not found or not published.`
      });
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/policies/admin/overview
 * Protected admin overview of policy publication states
 */
exports.getAdminOverview = async (req, res, next) => {
  try {
    const overview = await policyService.getAdminPolicyOverview();
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/policies/admin/:policyType/versions
 * Protected admin view of all historical versions for a policy
 */
exports.getPolicyVersions = async (req, res, next) => {
  try {
    const { policyType } = req.params;
    const normalizedType = policyType.replace(/-/g, '_');
    const versions = await policyService.getPolicyVersions(normalizedType);
    res.status(200).json({
      success: true,
      data: versions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/policies/admin/:policyType/draft
 * Protected admin creation of a new draft policy version
 */
exports.createDraft = async (req, res, next) => {
  try {
    const { policyType } = req.params;
    const { version, title, content, summary } = req.body;
    const normalizedType = policyType.replace(/-/g, '_');

    if (!version || !content) {
      return res.status(400).json({
        success: false,
        message: 'Version number and policy content are mandatory.'
      });
    }

    const draft = await policyService.createPolicyDraft(
      normalizedType,
      { version, title, content, summary },
      req.user
    );

    res.status(201).json({
      success: true,
      message: `Draft created successfully for ${draft.title} v${draft.version}.`,
      data: draft
    });
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('numeric format')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/v1/policies/admin/:policyType/draft/:version
 * Protected admin update of an un-published draft
 */
exports.updateDraft = async (req, res, next) => {
  try {
    const { policyType, version } = req.params;
    const { title, content, summary } = req.body;
    const normalizedType = policyType.replace(/-/g, '_');

    const updated = await policyService.updatePolicyDraft(
      normalizedType,
      version,
      { title, content, summary },
      req.user
    );

    res.status(200).json({
      success: true,
      message: `Draft v${updated.version} updated successfully.`,
      data: updated
    });
  } catch (error) {
    if (error.message.includes('immutable') || error.message.includes('not found')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/v1/policies/admin/:policyType/publish/:version
 * Protected admin publication of an immutable policy version
 */
exports.publishVersion = async (req, res, next) => {
  try {
    const { policyType, version } = req.params;
    const normalizedType = policyType.replace(/-/g, '_');

    const published = await policyService.publishPolicyVersion(
      normalizedType,
      version,
      req.user
    );

    res.status(200).json({
      success: true,
      message: `${published.title} v${published.version} has been published successfully as the active version.`,
      data: published
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/v1/policies/admin/consents
 * Protected admin retrieval of customer policy consent audit records
 */
exports.getConsentRecords = async (req, res, next) => {
  try {
    const { page, limit, consentType, search, orderId, startDate, endDate } = req.query;

    const result = await policyService.getConsentRecords({
      page,
      limit,
      consentType,
      search,
      orderId,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

