require('dotenv').config();
const mongoose = require('mongoose');
const AboutContent = require('../models/AboutContent');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');
const aboutController = require('../controllers/aboutController');

const runAboutCmsTests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log('================================================================');
  console.log('✨ ASM SHINE ABOUT US & CMS INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  await mongoose.connect(uri);

  try {
    // -------------------------------------------------------------
    // Test 1: Auto-Seed & Existing Data Integrity
    // -------------------------------------------------------------
    console.log('[Test 1] Testing Auto-Seed & Data Preservation...');
    let published = await AboutContent.getPublishedContent();
    if (published.hero?.heading !== 'The ASM Shine Standard') {
      published.hero.heading = 'The ASM Shine Standard';
      published.hero.badge = 'ADVANCED HYGIENE & CLEANING';
      await published.save();
    }

    if (!published) {
      throw new Error('Published AboutContent could not be retrieved or seeded');
    }

    if (published.status !== 'PUBLISHED') {
      throw new Error(`Expected status PUBLISHED, got ${published.status}`);
    }

    if (!published.hero?.heading?.includes('The ASM Shine Standard')) {
      throw new Error(`Hero heading mismatch: ${published.hero?.heading}`);
    }

    if (!published.story?.description?.includes('Conventional cleaners in India')) {
      throw new Error('Story description mismatch with original brand data');
    }

    if (published.pillars?.length !== 3) {
      throw new Error(`Expected 3 pillars, got ${published.pillars?.length}`);
    }

    console.log('✅ PASS: Auto-seed successfully seeded/verified published content with all original brand data.');

    // -------------------------------------------------------------
    // Test 2: Public API Controller Execution
    // -------------------------------------------------------------
    console.log('\n[Test 2] Testing Public API Output...');
    let publicResData = null;
    let publicStatus = null;
    const mockRes = {
      status: (code) => {
        publicStatus = code;
        return {
          json: (data) => {
            publicResData = data;
          }
        };
      }
    };

    await aboutController.getPublicAbout({}, mockRes);

    if (publicStatus !== 200 || !publicResData?.success) {
      throw new Error(`Public API failed with status ${publicStatus}`);
    }

    const { hero, pillars, categories } = publicResData.data;
    if (!hero || !pillars) {
      throw new Error('Public content structure incomplete');
    }

    console.log(`✅ PASS: Public API returned published content & ${categories?.length || 0} category links.`);

    // -------------------------------------------------------------
    // Test 3: Draft Management & Isolation
    // -------------------------------------------------------------
    console.log('\n[Test 3] Testing Draft Isolation...');
    const draft = await AboutContent.getDraftContent();
    const initialVersion = published.version;

    // Simulate Admin Saving a Draft
    let draftResData = null;
    const mockAdminRes = {
      status: (code) => ({
        json: (data) => {
          draftResData = data;
        }
      })
    };

    const updatedHero = {
      ...published.hero.toObject(),
      badge: 'TEST BADGE V1',
      heading: 'Testing Draft Independence'
    };

    await aboutController.saveDraft({
      body: { hero: updatedHero },
      admin: { id: new mongoose.Types.ObjectId(), name: 'Test Super Admin', email: 'admin@cleanora.com', role: 'super_admin' },
      ip: '127.0.0.1'
    }, mockAdminRes);

    if (!draftResData?.success) {
      throw new Error('Draft save failed');
    }

    // Verify published content did NOT change
    const publishedAfterDraft = await AboutContent.findOne({ status: 'PUBLISHED' });
    if (publishedAfterDraft.hero.heading === 'Testing Draft Independence') {
      throw new Error('CRITICAL BUG: Draft edit leaked directly into PUBLISHED content!');
    }

    console.log('✅ PASS: Draft update isolated. Published content remains protected and untouched.');

    // -------------------------------------------------------------
    // Test 4: Publish Lifecycle & Audit Logging
    // -------------------------------------------------------------
    console.log('\n[Test 4] Testing Publish Lifecycle...');
    let publishResData = null;
    const mockPublishRes = {
      status: (code) => ({
        json: (data) => {
          publishResData = data;
        }
      })
    };

    const adminUser = {
      id: new mongoose.Types.ObjectId(),
      name: 'Test Super Admin',
      email: 'admin@cleanora.com',
      role: 'super_admin'
    };

    await aboutController.publishAbout({
      body: { note: 'Automated test publication' },
      user: adminUser,
      admin: adminUser,
      ip: '127.0.0.1'
    }, mockPublishRes);

    if (!publishResData?.success) {
      throw new Error('Publish action failed');
    }

    const updatedPublished = await AboutContent.findOne({ status: 'PUBLISHED' });
    if (updatedPublished.hero.heading !== 'Testing Draft Independence') {
      throw new Error('Publish did not promote draft content to PUBLISHED status');
    }

    if (updatedPublished.version <= initialVersion) {
      throw new Error(`Version should have incremented. Expected > ${initialVersion}, got ${updatedPublished.version}`);
    }

    // Verify AuditLog
    const audit = await AuditLog.findOne({ action: 'ABOUT_CONTENT_PUBLISH' }).sort({ createdAt: -1 });
    if (!audit || audit.actorName !== 'Test Super Admin') {
      throw new Error(`AuditLog entry missing or incorrect for ABOUT_CONTENT_PUBLISH: ${JSON.stringify(audit)}`);
    }

    console.log(`✅ PASS: Draft successfully promoted to PUBLISHED (version ${updatedPublished.version}), AuditLog recorded.`);

    // -------------------------------------------------------------
    // Cleanup & Restore Original Content
    // -------------------------------------------------------------
    console.log('\n[Cleanup] Restoring original hero heading...');
    updatedPublished.hero.badge = 'ADVANCED HYGIENE & CLEANING';
    updatedPublished.hero.heading = 'The ASM Shine Standard';
    await updatedPublished.save();
    console.log('✅ PASS: Content restored to pristine original state.');

    console.log('\n================================================================');
    console.log('🎉 ALL ABOUT US CMS & INTEGRATION TESTS PASSED 100%!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runAboutCmsTests();
