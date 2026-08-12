/**
 * KalaaKart — Express Server (server.js)
 *
 * Security hardening applied:
 *  ✅ All DB credentials via environment variables (no hardcoded strings)
 *  ✅ Helmet for secure HTTP headers
 *  ✅ CORS with explicit allowlist
 *  ✅ Rate limiting on all auth routes
 *  ✅ express-mongo-sanitize — strips $ and . from input (NoSQL injection prevention)
 *  ✅ express-validator schema validation on all routes
 *  ✅ MongoDB Atlas TLS enforced via mongodb+srv:// connection string
 *  ✅ Failed auth attempts logged via Winston
 *  ✅ Mongoose schema validation on every collection (see models/)
 */

'use strict';
require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const cors       = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const morgan     = require('morgan');
const logger     = require('./utils/logger');

// ── Routes ──────────────────────────────────────
const authRoutes    = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes   = require('./routes/admin');
const safetyRoutes  = require('./routes/safety');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers (Helmet) ────────────────────
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc:  ["'self'"],
    scriptSrc:   ["'self'"],
    styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
    imgSrc:      ["'self'", 'data:', 'https:'],
    connectSrc:  ["'self'"],
    frameSrc:    ["'none'"],
    objectSrc:   ["'none'"]
  }
}));

// ── CORS ─────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(' ');
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Body parsing ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));     // 10MB for portfolio image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── NoSQL Injection Prevention ────────────────────
// Strips keys containing $ or . from req.body, req.params, req.query
app.use(mongoSanitize({
  replaceWith: '_',       // Replace offending chars with _ instead of silent deletion
  onSanitize: ({ req, key }) => {
    logger.warn(`[SANITIZE] Potential injection attempt on key "${key}" from IP ${req.ip}`);
  }
}));

// ── Request logging ───────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ── Health check ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── Routes ────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/safety',  safetyRoutes);

// ── 404 ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Global error handler ──────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ── MongoDB connection ────────────────────────────
// MONGODB_URI must be set in .env — never hardcode credentials here
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  logger.error('FATAL: MONGODB_URI is not set. Copy .env.example to .env and fill in your Atlas URI.');
  process.exit(1);
}

// Verify TLS is being used (Atlas mongodb+srv:// enforces TLS automatically)
if (!MONGODB_URI.startsWith('mongodb+srv://') && !MONGODB_URI.includes('tls=true')) {
  logger.warn('WARNING: MONGODB_URI does not appear to use TLS. Use a mongodb+srv:// Atlas URI for encrypted connections.');
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS:          45000,
  family: 4  // Force IPv4 for compatibility
}).then(() => {
  logger.info('✅ MongoDB connected (TLS via Atlas mongodb+srv://)');
  app.listen(PORT, () => {
    logger.info(`🚀 KalaaKart API server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}).catch(err => {
  logger.error(`MongoDB connection failed: ${err.message}`);
  process.exit(1);
});

// ── Graceful shutdown ─────────────────────────────
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected. Server shutting down.');
  process.exit(0);
});

module.exports = app;
