/**
 * models/User.js — Mongoose User Schema
 *
 * Security-hardened with:
 *  ✅ Roles stored as array (not enum) — supports buyer+seller dual-role
 *  ✅ Portfolio as versioned subdocument
 *  ✅ emergencyContact stored as private subdoc (never returned to other users)
 *  ✅ passwordHash field (bcrypt) — password field intentionally excluded from toJSON
 *  ✅ Schema-level validation on every field
 *  ✅ Indexes on email (unique) for fast lookup
 */
'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Portfolio image subdocument ──────────────────
const PortfolioImageSchema = new Schema({
  filename:    { type: String, trim: true },
  mimetype:    { type: String, trim: true },
  size:        { type: Number, min: 0 },
  hash:        { type: String, trim: true },   // pHash for duplicate detection
  flags:       [{ type: String }],              // authenticity check flags
  uploadedAt:  { type: Date, default: Date.now }
}, { _id: false });

// ── Portfolio subdocument (versioned) ─────────────
const PortfolioSchema = new Schema({
  v:           { type: Number, default: 1, min: 1 },
  bio:         { type: String, trim: true, maxlength: 200 },
  link:        { type: String, trim: true, maxlength: 500 },
  images:      { type: [PortfolioImageSchema], validate: {
    validator: arr => arr.length >= 3 && arr.length <= 6,
    message: 'Portfolio must have 3–6 images'
  }},
  submittedAt: { type: Date, default: Date.now },
  // History array retains previous versions for verification audit trail
  history:     [{
    v:          Number,
    bio:        String,
    link:       String,
    images:     [PortfolioImageSchema],
    archivedAt: { type: Date, default: Date.now }
  }]
}, { _id: false });

// ── Emergency Contact subdocument ────────────────
const EmergencyContactSchema = new Schema({
  name:  { type: String, trim: true, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 20 }
}, { _id: false });

// ── ID Verification subdocument ───────────────────
const IdVerificationSchema = new Schema({
  filename:   { type: String, trim: true },
  mimetype:   { type: String, trim: true },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

// ── Main User Schema ───────────────────────────────
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    index: true
  },

  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },

  // roles is an ARRAY — a user can be ['buyer'], ['seller'], or ['buyer','seller']
  roles: {
    type: [{ type: String, enum: ['buyer', 'seller'] }],
    required: true,
    validate: {
      validator: arr => arr.length >= 1,
      message: 'At least one role is required'
    }
  },

  college:  { type: String, trim: true, maxlength: 200 },
  year:     { type: String, enum: ['First Year', 'Second Year', 'Third Year', 'Final Year', ''] },

  verifiedBadge: { type: Boolean, default: false },
  reviewStatus:  { type: String, enum: ['pending', 'approved', 'flagged', 'rejected'], default: 'pending' },

  portfolio:        { type: PortfolioSchema, default: null },
  idVerification:   { type: IdVerificationSchema, default: null },
  emergencyContact: { type: EmergencyContactSchema, default: null }
}, {
  timestamps: true,   // adds createdAt / updatedAt automatically
  toJSON: {
    transform(doc, ret) {
      // NEVER return sensitive fields to the client
      delete ret.passwordHash;
      delete ret.emergencyContact;  // Only admins should see this
      delete ret.__v;
      return ret;
    }
  }
});

// ── Instance method: return safe public profile ───
UserSchema.methods.toPublicProfile = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emergencyContact;
  delete obj.idVerification;
  delete obj.__v;
  return obj;
};

// ── Method to update portfolio with versioning ────
UserSchema.methods.updatePortfolio = async function(newPortfolioData) {
  if (this.portfolio && this.portfolio.v) {
    // Archive current version to history
    this.portfolio.history = this.portfolio.history || [];
    this.portfolio.history.push({
      v: this.portfolio.v,
      bio: this.portfolio.bio,
      link: this.portfolio.link,
      images: this.portfolio.images,
      archivedAt: new Date()
    });
    this.portfolio.v = (this.portfolio.v || 1) + 1;
  }
  Object.assign(this.portfolio || (this.portfolio = {}), newPortfolioData);
  this.verifiedBadge = false;           // Re-verification required after portfolio update
  this.reviewStatus = 'pending';
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
