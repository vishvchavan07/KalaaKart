/**
 * routes/auth.js — Signup & Login
 *
 * Security:
 *  ✅ Rate limited (10 attempts / 15 min per IP)
 *  ✅ Input validation & sanitization via express-validator
 *  ✅ bcrypt password hashing (saltRounds=12)
 *  ✅ JWT issued on success
 *  ✅ Failed auth attempts logged
 *  ✅ NoSQL injection prevented (mongoSanitize in server.js)
 */
'use strict';
const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const router     = express.Router();
const User       = require('../models/User');
const ReviewQueue      = require('../models/ReviewQueue');
const { authLimiter }  = require('../middleware/rateLimiter');
const { signupValidator, loginValidator } = require('../middleware/validate');
const { checkPortfolio }  = require('../utils/portfolioChecker');
const logger     = require('../utils/logger');

const SALT_ROUNDS = 12;

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

// ── POST /api/auth/signup ──────────────────────────────────────────────────
router.post('/signup', authLimiter, signupValidator, async (req, res) => {
  try {
    const { name, email, password, roles, college, year, portfolio, emergencyContact } = req.body;

    // Check duplicate email — use lean query for performance
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      logger.warn(`[AUTH] Signup attempt with existing email: ${email}`);
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Run portfolio authenticity checks for seller signups
    let portfolioFlags = [];
    let needsReview = false;
    let finalPortfolio = null;

    if (roles.includes('seller') && portfolio) {
      // In production: files come via multipart/form-data (multer) not base64
      // Here we check any metadata available in the portfolio object
      const imageFiles = (portfolio.images || []).map((img, i) => ({
        originalname: img.filename || `image_${i}`,
        mimetype: img.mimetype || 'image/jpeg',
        size: img.size || 0,
        buffer: null  // actual buffer available via multer in production
      }));

      const result = await checkPortfolio(imageFiles, email);
      portfolioFlags = result.flags;
      needsReview = result.needsReview;

      finalPortfolio = {
        v: 1,
        bio: portfolio.bio,
        link: portfolio.link || null,
        images: imageFiles.map((f, i) => ({
          filename: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          flags: portfolioFlags.filter(fl => fl.imageIndex === i).map(fl => fl.flag),
          uploadedAt: new Date()
        })),
        submittedAt: new Date(),
        history: []
      };
    }

    const reviewStatus = roles.includes('seller')
      ? (needsReview ? 'flagged' : 'pending')
      : 'approved';

    // Create user
    const user = await User.create({
      name, email, passwordHash, roles, college, year,
      verifiedBadge: !roles.includes('seller'), // buyers auto-verified
      reviewStatus,
      portfolio: finalPortfolio,
      emergencyContact: emergencyContact || null
    });

    // Queue for review if seller
    if (roles.includes('seller')) {
      await ReviewQueue.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        portfolioSnapshot: {
          v: finalPortfolio?.v || 1,
          bio: finalPortfolio?.bio || '',
          link: finalPortfolio?.link || null,
          imageCount: finalPortfolio?.images?.length || 0
        },
        flags: portfolioFlags,
        status: needsReview ? 'pending' : 'pending'
      });
    }

    logger.info(`[AUTH] New signup: ${email} roles=${roles.join(',')}`);

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toPublicProfile(),
      reviewStatus
    });

  } catch (err) {
    logger.error(`[AUTH] Signup error: ${err.message}`);
    // Handle Mongoose duplicate key error gracefully
    if (err.code === 11000) return res.status(409).json({ error: 'Email already registered.' });
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', authLimiter, loginValidator, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user — select passwordHash explicitly (excluded from toJSON)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      logger.warn(`[AUTH] Login failed: email not found ${email} from IP ${req.ip}`);
      // Return generic error — don't reveal whether email exists
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`[AUTH] Login failed: wrong password for ${email} from IP ${req.ip}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    logger.info(`[AUTH] Login success: ${email} roles=${user.roles.join(',')}`);

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicProfile()
    });

  } catch (err) {
    logger.error(`[AUTH] Login error: ${err.message}`);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
