/**
 * routes/admin.js — Admin panel API
 * Protected by X-Admin-Pin header (set ADMIN_PIN in .env)
 */
'use strict';
const express      = require('express');
const router       = express.Router();
const User         = require('../models/User');
const ReviewQueue  = require('../models/ReviewQueue');
const SafetyReport = require('../models/SafetyReport');
const Config       = require('../models/Config');
const { adminGate }      = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

// All admin routes require PIN verification
router.use(generalLimiter, adminGate);

// ── GET /api/admin/queue ───────────────────────────
// All pending seller review queue entries
router.get('/queue', async (req, res) => {
  try {
    const queue = await ReviewQueue.find({}).sort({ createdAt: -1 }).lean();
    res.json({ queue });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch review queue' });
  }
});

// ── PATCH /api/admin/queue/:id ─────────────────────
// Approve, hold, or reject a seller
router.patch('/queue/:id', async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!['approved', 'hold', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: approved | hold | rejected' });
    }

    const entry = await ReviewQueue.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Queue entry not found' });

    entry.status     = status;
    entry.reviewedAt = new Date();
    entry.reviewNotes = reviewNotes || '';
    await entry.save();

    // If approved, update user's verifiedBadge
    if (status === 'approved') {
      await User.findOneAndUpdate(
        { email: entry.email },
        { $set: { verifiedBadge: true, reviewStatus: 'approved' } },
        { runValidators: false }
      );
      logger.info(`[ADMIN] Seller verified: ${entry.email}`);
    } else if (status === 'rejected') {
      await User.findOneAndUpdate(
        { email: entry.email },
        { $set: { reviewStatus: 'rejected' } }
      );
      logger.info(`[ADMIN] Seller rejected: ${entry.email}`);
    }

    res.json({ message: `Queue entry updated to: ${status}`, entry });
  } catch (err) {
    logger.error(`[ADMIN] Queue update error: ${err.message}`);
    res.status(500).json({ error: 'Could not update queue entry' });
  }
});

// ── GET /api/admin/safety-reports ─────────────────
router.get('/safety-reports', async (req, res) => {
  try {
    const reports = await SafetyReport.find({}).sort({ createdAt: -1 }).lean();
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch safety reports' });
  }
});

// ── PATCH /api/admin/safety-reports/:id/resolve ───
router.patch('/safety-reports/:id/resolve', async (req, res) => {
  try {
    const report = await SafetyReport.findByIdAndUpdate(
      req.params.id,
      { $set: { resolved: true, resolvedAt: new Date() } },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report marked as resolved', report });
  } catch (err) {
    res.status(500).json({ error: 'Could not resolve report' });
  }
});

// ── GET /api/admin/users ───────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// ── GET /api/admin/auth-log ────────────────────────
// In production this comes from Winston log files; this is a stub
router.get('/auth-log', async (req, res) => {
  res.json({
    note: 'Auth log is written to logs/combined.log on the server. For real-time monitoring, integrate a log aggregation service like Datadog, Logtail, or CloudWatch.',
    recentFailures: 'See logs/error.log'
  });
});

// ── GET /api/admin/config/branding ─────────────────
router.get('/config/branding', async (req, res) => {
  try {
    const conf = await Config.findOne({ key: 'branding' }).lean();
    res.json(conf ? conf.value : {});
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch config' });
  }
});

// ── PUT /api/admin/config/branding ─────────────────
router.put('/config/branding', async (req, res) => {
  try {
    const conf = await Config.findOneAndUpdate(
      { key: 'branding' },
      { $set: { value: req.body } },
      { new: true, upsert: true }
    );
    res.json({ message: 'Branding config updated', config: conf.value });
  } catch (err) {
    res.status(500).json({ error: 'Could not update config' });
  }
});

// ── POST /api/admin/verify-image ───────────────────
// Tier 2 AI check (Google Cloud Vision Scaffold)
router.post('/verify-image', async (req, res) => {
  try {
    const { imageBase64, category } = req.body;
    if (!process.env.VISION_API_KEY) {
      return res.json({ tier1Only: true, note: 'VISION_API_KEY not set. Skipping Tier 2 checks.' });
    }

    // Scaffold for actual Vision API call
    // const visionRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`, { ... })
    
    // Example of flags that would be returned:
    const flags = [];
    /*
    if (visionRes.safeSearch.adult === 'LIKELY') flags.push({ flag: 'nsfw', detail: 'Explicit content detected' });
    if (category === 'formals' && visionRes.labels.includes('electronics')) flags.push({ flag: 'category_mismatch', detail: 'Looks like electronics, not formals' });
    */

    res.json({ flags });
  } catch (err) {
    logger.error(`[ADMIN] Vision API error: ${err.message}`);
    res.status(500).json({ error: 'Image verification failed' });
  }
});

module.exports = router;
