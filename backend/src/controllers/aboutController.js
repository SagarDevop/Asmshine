const AboutContent = require('../models/AboutContent');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');
const { getCloudinary } = require('../config/cloudinary');
const { initialCategories } = require('../data/seedData');

/**
 * GET /api/v1/about
 * Public endpoint to fetch active published About Us content and product categories
 */
exports.getPublicAbout = async (req, res, next) => {
  try {
    const published = await AboutContent.getPublishedContent();

    // Fetch live product categories to dynamically showcase on About Us
    let categories = await Category.find({}, { _id: 0, __v: 0 }).sort({ createdAt: 1 }).lean();
    if (!categories || categories.length === 0) {
      categories = initialCategories;
    }

    res.status(200).json({
      success: true,
      data: {
        ...published.toObject(),
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/about
 * Protected admin endpoint to fetch editable draft and publication status
 */
exports.getAdminAbout = async (req, res, next) => {
  try {
    const [draft, published] = await Promise.all([
      AboutContent.getDraftContent(),
      AboutContent.getPublishedContent()
    ]);

    let categories = await Category.find({}, { _id: 0, __v: 0 }).sort({ createdAt: 1 }).lean();
    if (!categories || categories.length === 0) {
      categories = initialCategories;
    }

    res.status(200).json({
      success: true,
      data: {
        draft: draft.toObject(),
        publishedAt: published?.publishedAt,
        publishedVersion: published?.version || 1,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/about/draft
 * Protected admin endpoint to save draft About Us content
 */
exports.saveDraft = async (req, res, next) => {
  try {
    const draft = await AboutContent.getDraftContent();
    const { hero, story, mission, vision, pillars, pillarsVisible, comparison, productShowcase, contact, seo } = req.body;

    if (hero) draft.hero = { ...draft.hero, ...hero };
    if (story) draft.story = { ...draft.story, ...story };
    if (mission) draft.mission = { ...draft.mission, ...mission };
    if (vision) draft.vision = { ...draft.vision, ...vision };
    if (Array.isArray(pillars)) draft.pillars = pillars;
    if (pillarsVisible !== undefined) draft.pillarsVisible = Boolean(pillarsVisible);
    if (comparison) draft.comparison = { ...draft.comparison, ...comparison };
    if (productShowcase) draft.productShowcase = { ...draft.productShowcase, ...productShowcase };
    if (contact) draft.contact = { ...draft.contact, ...contact };
    if (seo) draft.seo = { ...draft.seo, ...seo };

    draft.updatedBy = req.user?._id;
    await draft.save();

    res.status(200).json({
      success: true,
      message: 'About Us draft saved successfully.',
      data: draft
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/about/publish
 * Protected admin endpoint to publish draft content to live website
 */
exports.publishAbout = async (req, res, next) => {
  try {
    const draft = await AboutContent.getDraftContent();

    // If new data was submitted with publish request, merge it into draft first
    const { hero, story, mission, vision, pillars, pillarsVisible, comparison, productShowcase, contact, seo } = req.body;
    if (hero) draft.hero = { ...draft.hero, ...hero };
    if (story) draft.story = { ...draft.story, ...story };
    if (mission) draft.mission = { ...draft.mission, ...mission };
    if (vision) draft.vision = { ...draft.vision, ...vision };
    if (Array.isArray(pillars)) draft.pillars = pillars;
    if (pillarsVisible !== undefined) draft.pillarsVisible = Boolean(pillarsVisible);
    if (comparison) draft.comparison = { ...draft.comparison, ...comparison };
    if (productShowcase) draft.productShowcase = { ...draft.productShowcase, ...productShowcase };
    if (contact) draft.contact = { ...draft.contact, ...contact };
    if (seo) draft.seo = { ...draft.seo, ...seo };
    await draft.save();

    // Copy draft values to published document
    let published = await AboutContent.findOne({ status: 'PUBLISHED' });
    const draftObj = draft.toObject();
    delete draftObj._id;
    delete draftObj.createdAt;
    delete draftObj.updatedAt;
    delete draftObj.__v;
    delete draftObj.version;

    if (!published) {
      published = new AboutContent({ ...draftObj, status: 'PUBLISHED' });
    } else {
      Object.assign(published, draftObj);
      published.status = 'PUBLISHED';
    }

    published.version = (published.version || 1) + 1;
    published.publishedAt = new Date();
    published.updatedBy = req.user?._id || req.user?.id || req.admin?.id;
    await published.save();

    // Log admin publish action to AuditLog
    try {
      await AuditLog.create({
        actor: req.user?._id || req.user?.id || req.admin?.id,
        actorName: req.user?.name || req.admin?.name || 'Administrator',
        actorEmail: req.user?.email || req.admin?.email || '',
        actorRole: req.user?.role || req.admin?.role || 'admin',
        action: 'ABOUT_CONTENT_PUBLISH',
        resourceType: 'AboutContent',
        resourceId: published._id.toString(),
        details: {
          version: published.version,
          publishedAt: published.publishedAt,
          heroHeading: published.hero?.heading
        },
        ipAddress: req.ip || ''
      });
    } catch (auditErr) {
      console.warn('[AboutController] Audit log warning:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'About Us page content published to live site successfully!',
      data: published
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/about/upload-image
 * Protected admin endpoint to upload images for About Us sections
 */
exports.uploadImage = async (req, res, next) => {
  try {
    const { imageBase64, imageUrl, folder = 'asm-shine/about' } = req.body;
    const imagePayload = imageBase64 || imageUrl;

    if (!imagePayload) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please provide an image file or URL.'
      });
    }

    try {
      const cloudinary = getCloudinary();
      const result = await cloudinary.uploader.upload(imagePayload, {
        folder,
        resource_type: 'image',
        overwrite: true
      });

      return res.status(200).json({
        success: true,
        message: 'Image uploaded to Cloudinary successfully.',
        data: {
          url: result.secure_url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height
        }
      });
    } catch (cloudErr) {
      console.warn('[AboutController] Cloudinary direct upload failed, returning path:', cloudErr.message);
      // If Cloudinary credentials are not configured in local environment, return image URL if provided
      if (imageUrl && imageUrl.startsWith('http')) {
        return res.status(200).json({
          success: true,
          message: 'External image URL accepted.',
          data: { url: imageUrl, secureUrl: imageUrl }
        });
      }
      return res.status(400).json({
        success: false,
        message: `Image upload failed: ${cloudErr.message}`
      });
    }
  } catch (error) {
    next(error);
  }
};
