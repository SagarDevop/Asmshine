require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value || true;
    }
  });
  return args;
};

const run = async () => {
  const args = parseArgs();
  const email = (args.email || process.env.ADMIN_INITIAL_EMAIL || 'admin@asmshine.com').trim().toLowerCase();
  const password = args.password || process.env.ADMIN_INITIAL_PASSWORD || 'Admin@AsmShine2026';
  const name = (args.name || 'SM Shine Administrator').trim();
  const role = args.role || 'superadmin';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Error: A valid email address is required. (e.g. --email=admin@asmshine.com)');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const validRoles = ['superadmin', 'admin', 'order_manager', 'inventory_manager'];
  if (!validRoles.includes(role)) {
    console.error(`Error: Invalid role '${role}'. Valid roles: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleanora';
  console.log(`[Admin Bootstrap] Connecting to MongoDB: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
  await mongoose.connect(mongoUri);

  try {
    let user = await User.findOne({ email });

    if (user) {
      console.log(`[Admin Bootstrap] User '${email}' found. Updating role to '${role}'...`);
      user.role = role;
      user.name = name || user.name;
      user.isActive = true;
      if (args.password) {
        user.password = password; // Will be hashed by User pre-save hook
      }
      await user.save();
      console.log(`[SUCCESS] Existing user '${email}' has been promoted to ${role}!`);
    } else {
      console.log(`[Admin Bootstrap] Creating new administrator '${email}' (${role})...`);
      user = new User({
        name,
        email,
        password,
        role,
        provider: 'local',
        isActive: true
      });
      await user.save();
      console.log(`[SUCCESS] Administrator account '${email}' created successfully with role '${role}'!`);
    }

    console.log(`--------------------------------------------------`);
    console.log(`Admin Email : ${email}`);
    console.log(`Assigned Role: ${role}`);
    console.log(`Admin Access : Available at /admin/login`);
    console.log(`--------------------------------------------------`);
  } catch (error) {
    console.error('[Admin Bootstrap Error]:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Admin Bootstrap] MongoDB disconnected.');
    process.exit(0);
  }
};

run();
