/**
 * middleware/validate.js — Input validation & sanitization
 *
 * Uses express-validator to validate and sanitize all incoming data.
 * Prevents:
 *   - NoSQL injection (via mongoSanitize in server.js + these validators)
 *   - XSS (via escape/trim)
 *   - Type confusion attacks
 *
 * Usage: import the relevant validator array and spread into your route handler.
 */
'use strict';
const { body, param, validationResult } = require('express-validator');

// ── Allowed college email domains ──────────────────────────────────────────
const COLLEGE_DOMAINS = ['.edu', '.ac.in', '.edu.in', '.ac.uk', '.university'];

function isCollegeEmail(email) {
  const lower = email.toLowerCase();
  return COLLEGE_DOMAINS.some(d => lower.endsWith(d));
}

// ── Middleware: return 400 if any validator failed ─────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Auth validators ────────────────────────────────────────────────────────
const signupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
    .escape(),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .custom(v => {
      if (!isCollegeEmail(v)) throw new Error('Must be a college email (.edu or .ac.in domain)');
      return true;
    }),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('roles')
    .isArray({ min: 1 }).withMessage('At least one role (buyer or seller) is required')
    .custom(arr => {
      const valid = ['buyer', 'seller'];
      if (!arr.every(r => valid.includes(r))) throw new Error('Invalid role. Must be buyer or seller');
      return true;
    }),

  body('college')
    .trim()
    .notEmpty().withMessage('College name is required')
    .isLength({ max: 200 }).withMessage('College name too long')
    .escape(),

  body('year')
    .optional()
    .isIn(['First Year', 'Second Year', 'Third Year', 'Final Year', ''])
    .withMessage('Invalid year value'),

  // Seller-only fields (only required when roles includes 'seller')
  body('portfolio.bio')
    .if(body('roles').custom(r => Array.isArray(r) && r.includes('seller')))
    .trim()
    .notEmpty().withMessage('Portfolio bio is required for Sellers')
    .isLength({ min: 10, max: 200 }).withMessage('Bio must be 10–200 characters')
    .escape(),

  body('portfolio.link')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('Portfolio link must be a valid URL'),

  // Emergency contact (optional)
  body('emergencyContact.name')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Emergency contact name too long')
    .escape(),

  body('emergencyContact.phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number too long')
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage('Invalid phone number format'),

  handleValidationErrors
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Password too long'), // prevent DoS via bcrypt

  handleValidationErrors
];

// ── Profile update validators ──────────────────────────────────────────────
const profileUpdateValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).escape(),
  body('bio').optional().trim().isLength({ max: 500 }).escape(),
  body('portfolio.bio').optional().trim().isLength({ max: 200 }).escape(),
  body('portfolio.link').optional({ nullable: true, checkFalsy: true }).trim().isURL(),
  body('emergencyContact.name').optional().trim().isLength({ max: 100 }).escape(),
  body('emergencyContact.phone').optional().trim().matches(/^[+\d\s\-()]{7,20}$/),
  handleValidationErrors
];

// ── Safety report validators ───────────────────────────────────────────────
const safetyReportValidator = [
  body('reporterName').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('reporterEmail').trim().isEmail().normalizeEmail(),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 30, max: 2000 }).withMessage('Description must be 30–2000 characters')
    .escape(),
  body('incidentTypes')
    .isArray({ min: 1 }).withMessage('At least one incident type is required'),
  body('reportedEmail').optional().trim().isEmail().normalizeEmail(),
  body('emergencyContact.name').optional().trim().isLength({ max: 100 }).escape(),
  body('emergencyContact.phone').optional().trim().matches(/^[+\d\s\-()]{7,20}$/),
  handleValidationErrors
];

// ── ID param validator ─────────────────────────────────────────────────────
const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  signupValidator,
  loginValidator,
  profileUpdateValidator,
  safetyReportValidator,
  mongoIdValidator,
  handleValidationErrors
};
