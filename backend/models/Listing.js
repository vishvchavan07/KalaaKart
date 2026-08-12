/**
 * models/Listing.js — Marketplace listing schema
 */
'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ListingSchema = new Schema({
  seller:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerName:   { type: String, trim: true, maxlength: 100 },
  sellerEmail:  { type: String, trim: true, lowercase: true },

  name:         { type: String, trim: true, required: true, maxlength: 200 },
  description:  { type: String, trim: true, maxlength: 2000 },
  category:     { type: String, trim: true, enum: ['clothing', 'books', 'electronics', 'art', 'other'], default: 'other' },

  buyPrice:     { type: Number, min: 0 },
  rentPrice:    { type: Number, min: 0 },
  rentPer:      { type: String, enum: ['day', 'week', 'month', ''] },

  images:       [{ filename: String, mimetype: String, size: Number }],

  isActive:     { type: Boolean, default: true },
  isSold:       { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Listing', ListingSchema);
