const express = require('express');
const router = express.Router();
const { getSitemap, getRobotsTxt, getMerchantFeed } = require('../controllers/seoController');

// Direct SEO assets endpoints
router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobotsTxt);
router.get('/merchant-feed', getMerchantFeed);

module.exports = router;

