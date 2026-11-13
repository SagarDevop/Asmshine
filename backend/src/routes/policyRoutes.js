const express = require('express');
const policyController = require('../controllers/policyController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// -------------------------------------------------------------
// 1. Protected Admin Routes (Must be declared before /:policyType)
// -------------------------------------------------------------
router.get(
  '/admin/overview',
  authenticate,
  authenticate.authorize('admin', 'superadmin'),
  policyController.getAdminOverview
);

router.get(
  '/admin/consents',
  authenticate,
  authenticate.authorize('admin', 'superadmin'),
  policyController.getConsentRecords
);

router.get(
  '/admin/:policyType/versions',
  authenticate,
  authenticate.authorize('admin', 'superadmin'),
  policyController.getPolicyVersions
);

router.post(
  '/admin/:policyType/draft',
  authenticate,
  authenticate.authorize('admin', 'superadmin'),
  policyController.createDraft
);

router.put(
  '/admin/:policyType/draft/:version',
  authenticate,
  authenticate.authorize('admin', 'superadmin'),
  policyController.updateDraft
);

router.post(
  '/admin/:policyType/publish/:version',
  authenticate,
  authenticate.authorize('admin', 'superadmin'),
  policyController.publishVersion
);

// -------------------------------------------------------------
// 2. Public Storefront Routes
// -------------------------------------------------------------
router.get('/', policyController.getPublicPolicies);
router.get('/:policyType', policyController.getPublicPolicy);

module.exports = router;

