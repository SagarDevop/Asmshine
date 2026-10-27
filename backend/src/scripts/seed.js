require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { initialProducts, initialCategories } = require('../data/seedData');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log(`[Seed] Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seed] MongoDB Connected successfully.');

    // 1. Idempotent Upsert for Categories
    console.log(`[Seed] Migrating ${initialCategories.length} categories...`);
    let categoriesUpserted = 0;
    for (const cat of initialCategories) {
      await Category.findOneAndUpdate(
        { id: cat.id },
        { $set: cat },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoriesUpserted++;
    }
    console.log(`[Seed] Successfully verified/upserted ${categoriesUpserted} categories.`);

    // 2. Idempotent Upsert for Products
    console.log(`[Seed] Migrating ${initialProducts.length} products...`);
    let productsUpserted = 0;
    for (const prod of initialProducts) {
      await Product.findOneAndUpdate(
        { id: prod.id },
        { $set: prod },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      productsUpserted++;
    }
    console.log(`[Seed] Successfully verified/upserted ${productsUpserted} products.`);

    // 3. Seed Default Clean User
    const User = require('../models/User');
    const existingUser = await User.findOne({ email: 'user@asmshine.com' });
    if (!existingUser) {
      await User.create({
        name: 'ASM Shine Customer',
        email: 'user@asmshine.com',
        password: 'password123',
        phone: '9876543210'
      });
      console.log('[Seed] Default user created: user@asmshine.com / password123');
    } else {
      console.log('[Seed] Default user already exists: user@asmshine.com');
    }

    // 4. Verification Query
    const totalCategories = await Category.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    console.log(`[Seed Verification] MongoDB Collections:`);
    console.log(`  - Total Categories in DB: ${totalCategories}`);
    console.log(`  - Total Products in DB:   ${totalProducts}`);
    console.log(`  - Total Users in DB:      ${totalUsers}`);

    await mongoose.disconnect();
    console.log('[Seed] Database migration completed. Disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
