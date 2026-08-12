/**
 * routes/profile.js — Profile management
 * All routes require JWT authentication.
 */
'use strict';
const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { profileUpdateValidator, mongoIdValidator } = require('../middleware/validate');
const { generalLimiter } = require('../middleware/rateLimiter');
const logger   = require('../utils/logger');

// Apply general rate limiter to all profile routes
router.use(generalLimiter);

// ── GET /api/profile/me ────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { ...user, passwordHash: undefined, emergencyContact: undefined } });
  } catch (err) {
    logger.error(`[PROFILE] Error fetching profile: ${err.message}`);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// ── PATCH /api/profile/me ──────────────────────────
router.patch('/me', protect, profileUpdateValidator, async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'college', 'year'];
    const update = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    // Emergency contact update
    if (req.body.emergencyContact) {
      update.emergencyContact = {
        name:  req.body.emergencyContact.name || null,
        phone: req.body.emergencyContact.phone || null
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated', user: user.toPublicProfile() });
  } catch (err) {
    logger.error(`[PROFILE] Update error: ${err.message}`);
    res.status(500).json({ error: 'Could not update profile' });
  }
});

// ── PATCH /api/profile/me/portfolio ───────────────
// Update seller portfolio — triggers re-verification
router.patch('/me/portfolio', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.roles.includes('seller')) return res.status(403).json({ error: 'Only sellers can update portfolios' });

    await user.updatePortfolio(req.body.portfolio || {});
    logger.info(`[PROFILE] Portfolio updated for user ${user.email}, pending re-verification`);
    res.json({ message: 'Portfolio updated. Account re-submitted for verification.', user: user.toPublicProfile() });
  } catch (err) {
    logger.error(`[PROFILE] Portfolio update error: ${err.message}`);
    res.status(500).json({ error: 'Could not update portfolio' });
  }
});

// ── POST /api/profile/me/add-role ──────────────────
// Add a role to an existing account (e.g. Buyer adds Seller)
router.post('/me/add-role', protect, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['buyer', 'seller'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.roles.includes(role)) return res.status(409).json({ error: `Already has role: ${role}` });

    user.roles.push(role);
    if (role === 'seller') {
      user.verifiedBadge = false;
      user.reviewStatus  = 'pending';
    }
    await user.save();

    logger.info(`[PROFILE] Role ${role} added for ${user.email}`);
    res.json({ message: `Role ${role} added successfully`, roles: user.roles });
  } catch (err) {
    res.status(500).json({ error: 'Could not add role' });
  }
});

module.exports = router;
