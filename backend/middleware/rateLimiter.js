/**
 * middleware/rateLimiter.js
 *
 * Rate limiting for auth endpoints using express-rate-limit.
 * Configured via environment variables.
 *
 * Auth routes: 10 attempts per 15-minute window per IP.
 * General API:  100 requests per 15 minutes per IP.
 */
'use strict';
const rateLimit = require('express-rate-limit');
const logger    = require('../utils/logger');

const windowMs  = (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000;
const maxAuth   = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10;

/**
 * Strict limiter for /api/auth/login and /api/auth/signup
 */
const authLimiter = rateLimit({
  windowMs,
  max: maxAuth,
  standardHeaders: true,  // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: `Too many requests. Maximum ${maxAuth} auth attempts per ${windowMs / 60000} minutes.`,
    retryAfter: windowMs
  },
  handler: (req, res, next, options) => {
    logger.warn(`[RATE_LIMIT] Auth rate limit hit: IP=${req.ip} endpoint=${req.originalUrl}`);
    res.status(429).json(options.message);
  }
});

/**
 * General API limiter (looser) for non-auth routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

module.exports = { authLimiter, generalLimiter };
