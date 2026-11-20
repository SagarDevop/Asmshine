const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config(); // Fallback for root or environment-provided configs
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

// Self-ping mechanism to keep Render Free Tier awake 24/7 (Never sleep after 15 mins)
const setupKeepAlive = () => {
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://asmshine.onrender.com' : null);
  if (!externalUrl) {
    return;
  }
  const pingUrl = `${externalUrl.replace(/\/$/, '')}/ping`;
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (Render spins down after 15 mins of zero inbound traffic)

  console.log(`[Keep-Alive] Initialized auto-ping for ${pingUrl} every 10 minutes.`);

  // First ping after 1 minute of startup, then every 10 minutes
  setTimeout(() => {
    const doPing = () => {
      try {
        const client = pingUrl.startsWith('https') ? require('https') : require('http');
        client.get(pingUrl, (res) => {
          res.on('data', () => {}); // Drain stream
          console.log(`[Keep-Alive] Self-ping active (${res.statusCode}) at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        }).on('error', (err) => {
          console.warn(`[Keep-Alive] Ping notice:`, err.message);
        });
      } catch (e) {
        console.warn(`[Keep-Alive] Error:`, e.message);
      }
    };
    doPing();
    setInterval(doPing, PING_INTERVAL_MS);
  }, 60 * 1000);
};

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cleanora API] Server listening on port ${PORT} (0.0.0.0)`);
  console.log(`[Cleanora API] Health Check: http://127.0.0.1:${PORT}/api/v1/health`);
  console.log(`[Cleanora API] Ping/Keep-Alive: http://127.0.0.1:${PORT}/ping`);
  console.log(`[Cleanora API] Products: http://127.0.0.1:${PORT}/api/v1/products`);
  setupKeepAlive();
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
