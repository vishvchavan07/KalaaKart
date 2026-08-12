/**
 * routes/safety.js — Safety report submission
 */
'use strict';
const express      = require('express');
const router       = express.Router();
const SafetyReport = require('../models/SafetyReport');
const User         = require('../models/User');
const { protect }  = require('../middleware/authMiddleware');
const { safetyReportValidator } = require('../middleware/validate');
const { generalLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

// ── POST /api/safety/report ────────────────────────
// Auth optional — anyone can file a report (but logged-in users get EC prefilled)
router.post('/report', generalLimiter, safetyReportValidator, async (req, res) => {
  try {
    const {
      reporterName, reporterEmail, reportedName, reportedEmail,
      incidentTypes, description, date, location, emergencyContact
    } = req.body;

    const report = await SafetyReport.create({
      reporterName, reporterEmail,
      reportedName: reportedName || null,
      reportedEmail: reportedEmail || null,
      incidentTypes, description,
      date: date ? new Date(date) : null,
      location: location || null,
      emergencyContact: emergencyContact || null
    });

    // If reporter is a registered user, update their EC on file
    if (emergencyContact && (emergencyContact.name || emergencyContact.phone)) {
      await User.findOneAndUpdate(
        { email: reporterEmail },
        { $set: { emergencyContact } },
        { runValidators: false }
      ).catch(() => {}); // Non-fatal if user not found
    }

    logger.warn(`[SAFETY] New safety report from ${reporterEmail}: ${incidentTypes.join(', ')}`);

    res.status(201).json({
      message: 'Safety report submitted. Our team will review within 24 hours.',
      reportId: report._id
    });

  } catch (err) {
    logger.error(`[SAFETY] Report submission error: ${err.message}`);
    res.status(500).json({ error: 'Could not submit report. Please try again.' });
  }
});

module.exports = router;
