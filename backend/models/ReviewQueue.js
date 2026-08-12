/**
 * models/ReviewQueue.js — Seller portfolio review queue
 */
'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const FlagSchema = new Schema({
  imageIndex: { type: Number },
  flag:       { type: String, trim: true },
  detail:     { type: String, trim: true }
}, { _id: false });

const ReviewQueueSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:      { type: String, trim: true, maxlength: 100 },
  email:     { type: String, trim: true, lowercase: true, index: true },
  roles:     [{ type: String, enum: ['buyer', 'seller'] }],

  // Snapshot of portfolio at submission time
  portfolioSnapshot: {
    v:          Number,
    bio:        String,
    link:       String,
    imageCount: Number
  },

  flags:        { type: [FlagSchema], default: [] },
  status:       { type: String, enum: ['pending', 'hold', 'approved', 'rejected'], default: 'pending', index: true },
  reviewedBy:   { type: String },     // Admin identifier
  reviewedAt:   { type: Date },
  reviewNotes:  { type: String, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('ReviewQueue', ReviewQueueSchema);
