const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// Public route to get published About Us data + active product categories
router.get('/', aboutController.getPublicAbout);

// Protected Admin CMS routes
router.get(
  '/admin/content',
  authenticate,
  authorize('admin', 'superadmin'),
  aboutController.getAdminAbout
);

router.put(
  '/admin/draft',
  authenticate,
  authorize('admin', 'superadmin'),
  aboutController.saveDraft
);

router.post(
  '/admin/publish',
  authenticate,
  authorize('admin', 'superadmin'),
  aboutController.publishAbout
);

router.post(
  '/admin/upload-image',
  authenticate,
  authorize('admin', 'superadmin'),
  aboutController.uploadImage
);

module.exports = router;

