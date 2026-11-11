const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const path = require('path');

// Trust reverse proxy (Render / Vercel load balancers) for accurate client IP in rate limiters
app.set('trust proxy', 1);

// HTTP Security Headers Middleware (Zero-dependency production hardening)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://www.asmshine.com https://asmshine.com https://frontend-exjb.vercel.app https://asmshine.onrender.com https://accounts.google.com http://localhost:* http://127.0.0.1:*; frame-src https://accounts.google.com; frame-ancestors 'self';"
  );
  next();
});

// Whitelist of Explicitly Allowed Frontend Origins
const defaultProductionOrigins = [
  'https://www.asmshine.com',
  'https://asmshine.com',
  'https://frontend-exjb.vercel.app'
];

const envOrigins = [
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((s) => s.trim()) : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()) : [])
];

const localDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const allowedOrigins = Array.from(
  new Set([
    ...localDevOrigins,
    ...defaultProductionOrigins,
    ...envOrigins
  ])
).filter(Boolean);

// Middlewares: Strict CORS Validation
app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server or non-browser tools (e.g., automated tests, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Policy Blocked] Unauthorized origin: ${origin}`);
      const corsError = new Error(`CORS policy rejection: Origin '${origin}' is not authorized.`);
      corsError.statusCode = 403;
      callback(corsError);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Idempotency-Key', 'X-Idempotency-Key']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public images if accessed directly via backend
const publicImagesPath = path.join(__dirname, '../../frontend/public/images');
app.use('/images', express.static(publicImagesPath));


// Mount API v1
app.use('/api/v1', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Cleanora E-Commerce API is running',
    version: 'v1',
    docs: '/api/v1/health'
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
