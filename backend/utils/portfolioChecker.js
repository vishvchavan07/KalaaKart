/**
 * utils/portfolioChecker.js — Portfolio authenticity pre-checks
 *
 * Runs on the backend before a seller account is verified.
 * NOTE: Real reverse-image-search requires a paid API (Google Vision/TinEye).
 *       These checks are heuristic / metadata-based.
 */
'use strict';
const User = require('../models/User');

/**
 * Run all authenticity checks on uploaded portfolio images.
 * @param {Array<{buffer: Buffer, mimetype: string, originalname: string, size: number}>} files
 * @param {string} userEmail
 * @returns {Promise<{flags: Array, needsReview: boolean}>}
 */
async function checkPortfolio(files, userEmail) {
  const flags = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 1. Suspiciously small file (likely a downloaded thumbnail, not original work)
    if (file.size < 6000) {
      flags.push({
        imageIndex: i,
        flag: 'very_small_file',
        detail: `File size ${file.size}B is unusually small for original artwork`
      });
    }

    // 2. MIME type vs file extension mismatch (basic tampering check)
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic' };
    if (mimeMap[ext] && file.mimetype !== mimeMap[ext]) {
      flags.push({
        imageIndex: i,
        flag: 'mime_ext_mismatch',
        detail: `Extension .${ext} does not match MIME type ${file.mimetype}`
      });
    }

    // 3. Check for duplicate pixel fingerprint against existing sellers
    // (In production: use a perceptual hash library like 'sharp' + 'imghash')
    // Placeholder — in a real system compute pHash and compare against DB
    // const hash = await computePHash(file.buffer);
    // const existingHash = await User.findOne({ 'portfolio.images.hash': hash, email: { $ne: userEmail } });
    // if (existingHash) flags.push({ imageIndex: i, flag: 'potential_duplicate', detail: 'Image matches another seller portfolio' });

    // 4. Reject overly large files (likely stock photo downloads)
    if (file.size > 20 * 1024 * 1024) {
      flags.push({
        imageIndex: i,
        flag: 'oversized_file',
        detail: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds 20MB limit`
      });
    }
  }

  return {
    flags,
    needsReview: flags.length > 0
  };
}

module.exports = { checkPortfolio };
