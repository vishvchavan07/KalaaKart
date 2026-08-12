/**
 * models/SafetyReport.js — Safety incident reports
 *
 * Emergency contact is stored here for admin access only.
 * Never returned in public API responses.
 */
'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SafetyReportSchema = new Schema({
  reporterName:   { type: String, trim: true, maxlength: 100, required: true },
  reporterEmail:  { type: String, trim: true, lowercase: true, required: true, index: true },
  reportedName:   { type: String, trim: true, maxlength: 100 },
  reportedEmail:  { type: String, trim: true, lowercase: true },

  incidentTypes:  { type: [String], required: true, validate: { validator: arr => arr.length > 0 } },
  description:    { type: String, trim: true, minlength: 30, maxlength: 2000, required: true },
  date:           { type: Date },
  location:       { type: String, trim: true, maxlength: 200 },

  // Private — admin only
  emergencyContact: {
    name:  { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 20 }
  },

  resolved:    { type: Boolean, default: false },
  resolvedAt:  { type: Date },
  resolvedBy:  { type: String }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('SafetyReport', SafetyReportSchema);
