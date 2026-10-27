require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { uploadProductImage } = require('../services/cloudinaryService');
const { validateCloudinaryConfig } = require('../config/cloudinary');
const Category = require('../models/Category');

const FRONTEND_PUBLIC_DIR = path.resolve(__dirname, '../../../frontend/public');

const foldersToMigrate = [
  {
    localSubdir: 'images/banners',
    cloudinaryFolder: 'asm-shine/banners',
    tag: 'banners'
  },
  {
    localSubdir: 'images/categories',
    cloudinaryFolder: 'asm-shine/categories',
    tag: 'categories'
  },
  {
    localSubdir: 'images/trust',
    cloudinaryFolder: 'asm-shine/trust',
    tag: 'trust'
  }
];

const runMediaMigration = async () => {
  console.log('='.repeat(70));
  console.log('[ASM Shine] Migrating Banners, Categories & Trust Badges to Cloudinary');
  console.log('='.repeat(70));

  validateCloudinaryConfig();

  const urlMap = {}; // relativePath -> secureUrl

  for (const group of foldersToMigrate) {
    const fullDirPath = path.join(FRONTEND_PUBLIC_DIR, group.localSubdir);
    if (!fs.existsSync(fullDirPath)) {
      console.warn(`[WARN] Directory not found: ${fullDirPath}`);
      continue;
    }

    const files = fs.readdirSync(fullDirPath).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    console.log(`\nProcessing ${group.localSubdir} (${files.length} files)...`);

    for (const file of files) {
      const localFilePath = path.join(fullDirPath, file);
      const publicId = path.parse(file).name;
      const relativeDbPath = `/${group.localSubdir.replace(/\\/g, '/')}/${file}`;

      console.log(`  - Uploading ${file} to ${group.cloudinaryFolder}...`);
      try {
        const uploadResult = await uploadProductImage(localFilePath, {
          publicId,
          folder: group.cloudinaryFolder,
          overwrite: false,
          tags: ['asm-shine', group.tag]
        });

        urlMap[relativeDbPath] = uploadResult.secureUrl;
        urlMap[file] = uploadResult.secureUrl; // also map by filename
        console.log(`    [SUCCESS] -> ${uploadResult.secureUrl}`);
      } catch (err) {
        console.error(`    [ERROR] Failed to upload ${file}: ${err.message}`);
      }
    }
  }

  // Update MongoDB Category collection with Cloudinary URLs
  console.log('\nUpdating MongoDB Category collection...');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  const categoryImagesMap = {
    all: urlMap['/images/categories/all.jpg'] || urlMap['all.jpg'],
    toilet_care: urlMap['/images/categories/toilet_care.jpg'] || urlMap['toilet_care.jpg'],
    bathroom_care: urlMap['/images/categories/bathroom_care.jpg'] || urlMap['bathroom_care.jpg'],
    glass_care: urlMap['/images/categories/glass_care.jpg'] || urlMap['glass_care.jpg'],
    floor_care: urlMap['/images/categories/floor_care.jpg'] || urlMap['floor_care.jpg'],
    dishwash: urlMap['/images/categories/dishwash.jpg'] || urlMap['dishwash.jpg'],
    kitchen_care: urlMap['/images/categories/kitchen_care.jpg'] || urlMap['kitchen_care.jpg'],
    laundry_care: urlMap['/images/categories/laundry_care.jpg'] || urlMap['laundry_care.jpg'],
    hand_hygiene: urlMap['/images/categories/hand_hygiene.jpg'] || urlMap['hand_hygiene.jpg']
  };

  for (const [catId, imgUrl] of Object.entries(categoryImagesMap)) {
    if (imgUrl) {
      await Category.findOneAndUpdate(
        { id: catId },
        { $set: { image: imgUrl } },
        { upsert: true }
      );
      console.log(`  - Updated Category [${catId}] -> ${imgUrl}`);
    }
  }

  await mongoose.disconnect();

  // Save the full mapping file for frontend/backend synchronization
  const mappingFilePath = path.join(__dirname, 'cloudinary_media_map.json');
  fs.writeFileSync(mappingFilePath, JSON.stringify(urlMap, null, 2), 'utf8');
  console.log(`\nSaved media map to: ${mappingFilePath}`);
  console.log('='.repeat(70));
  console.log('All Banners, Categories & Trust Assets Successfully Uploaded!');
  console.log('='.repeat(70));
};

runMediaMigration().catch(err => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
