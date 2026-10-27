const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';

async function seedDemoUser() {
  try {
    console.log('[Seed] Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB.');

    const demoEmail = 'demo@asmshine.com';
    const rawPassword = 'asmshine123';

    // Remove existing demo user if present to ensure clean state
    await User.deleteOne({ email: demoEmail });

    // Create fresh demo user
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const demoUser = await User.create({
      name: 'Aarav Sharma',
      email: demoEmail,
      password: passwordHash,
      phone: '9876543210',
      provider: 'local',
      addresses: [
        {
          name: 'Aarav Sharma',
          phone: '9876543210',
          pincode: '110001',
          street: 'Flat 402, Sunshine Residency, Barakhamba Road',
          city: 'New Delhi',
          state: 'Delhi',
          type: 'HOME',
          isDefault: true
        },
        {
          name: 'Aarav Sharma (Office)',
          phone: '9876543210',
          pincode: '122002',
          street: 'Tower B, 7th Floor, DLF Cyber City',
          city: 'Gurugram',
          state: 'Haryana',
          type: 'WORK',
          isDefault: false
        }
      ]
    });

    console.log('\n======================================================');
    console.log('       DEMO TEST USER CREATED SUCCESSFULLY!           ');
    console.log('======================================================');
    console.log('  Email:    ', demoEmail);
    console.log('  Password: ', rawPassword);
    console.log('  Name:     ', demoUser.name);
    console.log('  Phone:    ', demoUser.phone);
    console.log('  Addresses:', demoUser.addresses.length, 'sample delivery addresses attached');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed demo user:', error);
    process.exit(1);
  }
}

seedDemoUser();
