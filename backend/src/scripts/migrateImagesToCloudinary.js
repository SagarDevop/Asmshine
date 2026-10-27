require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { uploadProductImage, DEFAULT_FOLDER } = require('../services/cloudinaryService');
const { validateCloudinaryConfig } = require('../config/cloudinary');

const isDryRun = process.argv.includes('--dry-run');

// Absolute path to frontend/public
const FRONTEND_PUBLIC_DIR = path.resolve(__dirname, '../../../frontend/public');

/**
 * Resolves a database image path (e.g. '/images/products/asm_glass.jpeg')
 * to an absolute local file path on disk.
 */
const resolveLocalImagePath = (dbPath) => {
  if (!dbPath || typeof dbPath !== 'string') return null;
  // If already full HTTPS url, cannot resolve locally
  if (dbPath.startsWith('http://') || dbPath.startsWith('https://')) return null;

  const cleanPath = dbPath.replace(/^\/+/, '');
  const candidate = path.join(FRONTEND_PUBLIC_DIR, cleanPath);
  return candidate;
};

/**
 * Generates a clean, deterministic Cloudinary public ID from a filename
 * e.g., 'asm_glass_cleaner_500ml.jpeg' -> 'asm_glass_cleaner_500ml'
 */
const getPublicIdFromPath = (localPath) => {
  const parsed = path.parse(localPath);
  return parsed.name;
};

const runMigration = async () => {
  console.log('='.repeat(70));
  console.log(`[ASM Shine] Product Image Migration to Cloudinary ${isDryRun ? '(DRY-RUN MODE)' : '(LIVE EXECUTION)'}`);
  console.log('='.repeat(70));
  console.log(`Frontend Public Dir: ${FRONTEND_PUBLIC_DIR}`);

  // Validate credentials before running
  try {
    const { cloudName } = validateCloudinaryConfig();
    console.log(`Cloudinary Target Account: ${cloudName}`);
    console.log(`Cloudinary Folder:         ${DEFAULT_FOLDER}`);
  } catch (err) {
    console.error(`\nConfiguration Error: ${err.message}`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log(`Connecting to MongoDB at:   ${mongoUri}`);

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB Connected successfully.\n');

  const products = await Product.find({});
  console.log(`Discovered ${products.length} product records in MongoDB.\n`);

  const stats = {
    totalProductsScanned: products.length,
    imagesDiscovered: 0,
    imagesUploaded: 0,
    imagesSkipped: 0,
    imagesMissing: 0,
    productsUpdated: 0,
    failures: 0
  };

  // Cache to prevent re-uploading the same local file when referenced across multiple products/variants
  const uploadCache = new Map(); // localPath -> uploadResult

  for (const product of products) {
    let productModified = false;
    console.log(`- Product [${product.id}] "${product.name?.substring(0, 45)}"`);

    // 1. Process Main Product Image
    if (product.image) {
      stats.imagesDiscovered++;

      if (product.image.includes('cloudinary.com') && product.imageData?.publicId) {
        console.log(`    [SKIPPED] Main image already migrated: ${product.imageData.publicId}`);
        stats.imagesSkipped++;
      } else {
        const localPath = resolveLocalImagePath(product.image);

        if (!localPath || !fs.existsSync(localPath)) {
          console.warn(`    [MISSING] Local file not found: ${product.image} (expected at ${localPath})`);
          stats.imagesMissing++;
        } else {
          const publicId = getPublicIdFromPath(localPath);

          if (isDryRun) {
            console.log(`    [DRY-RUN] Would upload: ${path.basename(localPath)} -> ${DEFAULT_FOLDER}/${publicId}`);
            stats.imagesUploaded++;
            productModified = true;
          } else {
            try {
              let uploadResult = uploadCache.get(localPath);
              if (!uploadResult) {
                console.log(`    [UPLOADING] ${path.basename(localPath)} to Cloudinary...`);
                uploadResult = await uploadProductImage(localPath, {
                  publicId,
                  folder: DEFAULT_FOLDER,
                  overwrite: false,
                  tags: ['asm-shine', 'product-catalog', product.category || 'general']
                });
                uploadCache.set(localPath, uploadResult);
                stats.imagesUploaded++;
                console.log(`    [SUCCESS] Uploaded -> ${uploadResult.secureUrl}`);
              } else {
                console.log(`    [REUSED] Cached upload for ${path.basename(localPath)}`);
                stats.imagesSkipped++;
              }

              product.image = uploadResult.secureUrl;
              product.imageData = {
                url: uploadResult.secureUrl,
                secureUrl: uploadResult.secureUrl,
                publicId: uploadResult.publicId,
                alt: product.name,
                format: uploadResult.format,
                bytes: uploadResult.bytes,
                width: uploadResult.width,
                height: uploadResult.height
              };
              productModified = true;
            } catch (uploadErr) {
              console.error(`    [UPLOAD FAILED] ${product.image}: ${uploadErr.message}`);
              stats.failures++;
            }
          }
        }
      }
    }

    // 2. Process Variant Images in availableSizes
    if (Array.isArray(product.availableSizes) && product.availableSizes.length > 0) {
      for (const variant of product.availableSizes) {
        if (!variant.image) continue;
        stats.imagesDiscovered++;

        if (variant.image.includes('cloudinary.com') && variant.imageData?.publicId) {
          stats.imagesSkipped++;
          continue;
        }

        const localPath = resolveLocalImagePath(variant.image);
        if (!localPath || !fs.existsSync(localPath)) {
          console.warn(`    [VARIANT MISSING] File not found: ${variant.image}`);
          stats.imagesMissing++;
        } else {
          const publicId = getPublicIdFromPath(localPath);

          if (isDryRun) {
            console.log(`    [DRY-RUN VARIANT] Would upload: ${path.basename(localPath)} -> ${DEFAULT_FOLDER}/${publicId}`);
            stats.imagesUploaded++;
            productModified = true;
          } else {
            try {
              let uploadResult = uploadCache.get(localPath);
              if (!uploadResult) {
                console.log(`    [UPLOADING VARIANT] ${path.basename(localPath)}...`);
                uploadResult = await uploadProductImage(localPath, {
                  publicId,
                  folder: DEFAULT_FOLDER,
                  overwrite: false,
                  tags: ['asm-shine', 'product-variant', product.category || 'general']
                });
                uploadCache.set(localPath, uploadResult);
                stats.imagesUploaded++;
                console.log(`    [SUCCESS] Variant uploaded -> ${uploadResult.secureUrl}`);
              } else {
                stats.imagesSkipped++;
              }

              variant.image = uploadResult.secureUrl;
              variant.imageData = {
                url: uploadResult.secureUrl,
                secureUrl: uploadResult.secureUrl,
                publicId: uploadResult.publicId,
                alt: `${product.name} - ${variant.size}`
              };
              productModified = true;
            } catch (vErr) {
              console.error(`    [VARIANT UPLOAD FAILED] ${variant.image}: ${vErr.message}`);
              stats.failures++;
            }
          }
        }
      }
    }

    // 3. Save Product to MongoDB if modified
    if (productModified && !isDryRun) {
      await product.save();
      stats.productsUpdated++;
      console.log(`    [DB UPDATED] Saved updated image metadata in MongoDB for ${product.id}`);
    } else if (productModified && isDryRun) {
      stats.productsUpdated++;
    }
  }

  await mongoose.disconnect();

  console.log('\n' + '='.repeat(70));
  console.log(`[Migration Summary] ${isDryRun ? '(DRY-RUN - NO CHANGES WRITTEN)' : '(LIVE COMPLETE)'}`);
  console.log('='.repeat(70));
  console.log(`Total Products Scanned: ${stats.totalProductsScanned}`);
  console.log(`Total Image References: ${stats.imagesDiscovered}`);
  console.log(`Images Uploaded:        ${stats.imagesUploaded}`);
  console.log(`Images Skipped:         ${stats.imagesSkipped}`);
  console.log(`Images Missing on Disk: ${stats.imagesMissing}`);
  console.log(`MongoDB Docs Updated:   ${stats.productsUpdated}`);
  console.log(`Failed Uploads:         ${stats.failures}`);
  console.log('='.repeat(70) + '\n');
};

runMigration().catch((err) => {
  console.error('[Fatal Error in Migration]:', err);
  process.exit(1);
});
