require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Production Security Validation
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[FATAL CONFIG ERROR] JWT_SECRET must be defined in production environment.');
  process.exit(1);
}

// Initialize DB connection
connectDB();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cleanora API] Server listening on port ${PORT} (0.0.0.0)`);
  console.log(`[Cleanora API] Health Check: http://127.0.0.1:${PORT}/api/v1/health`);
  console.log(`[Cleanora API] Products: http://127.0.0.1:${PORT}/api/v1/products`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
