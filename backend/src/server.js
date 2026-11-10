require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Production Security Validation
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[FATAL CONFIG ERROR] JWT_SECRET must be defined in production environment.');
  process.exit(1);
}

// Initialize DB connection & ensure bootstrap admin
const User = require('./models/User');

const ensureInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: { $in: ['superadmin', 'admin'] } });
    if (!adminExists) {
      const email = (process.env.ADMIN_INITIAL_EMAIL || 'admin@asmshine.com').trim().toLowerCase();
      const password = process.env.ADMIN_INITIAL_PASSWORD;
      const name = 'SM Shine Administrator';

      if (!password || password.trim().length < 8) {
        if (process.env.NODE_ENV === 'production') {
          console.error('[FATAL CONFIG ERROR] ADMIN_INITIAL_PASSWORD environment secret must be set (min 8 chars) to bootstrap initial superadmin.');
          process.exit(1);
        } else {
          console.warn('[Auto-Bootstrap] ADMIN_INITIAL_PASSWORD not configured in backend/.env. Superadmin provisioning skipped.');
          return;
        }
      }

      let user = await User.findOne({ email });
      if (user) {
        user.role = 'superadmin';
        user.isActive = true;
        user.password = password;
        await user.save();
      } else {
        user = new User({
          name,
          email,
          password,
          role: 'superadmin',
          isActive: true
        });
        await user.save();
      }
      console.log(`[Auto-Bootstrap] Initial superadmin '${email}' provisioned securely.`);
    }
  } catch (err) {
    console.warn('[Auto-Bootstrap] Admin bootstrap notice:', err.message);
  }
};

connectDB().then(() => {
  ensureInitialAdmin();
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cleanora API] Server listening on port ${PORT} (0.0.0.0)`);
  console.log(`[Cleanora API] Health Check: http://127.0.0.1:${PORT}/api/v1/health`);
  console.log(`[Cleanora API] Products: http://127.0.0.1:${PORT}/api/v1/products`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
