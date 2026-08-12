/**
 * assets/js/imageProcessor.js
 * Craftified — Shared image processing + perceptual hash module
 *
 * Used by:
 *   • sell-item.html  (listing photo upload)
 *   • signup.html     (portfolio photo upload)
 *
 * API:
 *   KKImageProcessor.processImage(file)    → Promise<ProcessResult>
 *   KKImageProcessor.computePHash(imgEl)   → string (64-char binary hash)
 *   KKImageProcessor.comparePHash(h1, h2)  → number (Hamming distance, 0=identical)
 *   KKImageProcessor.checkDuplicates(hash) → Array<{source, name}> (matches in localStorage)
 *   KKImageProcessor.checkImageContent(imgEl, category) → Array<Flag>
 *
 * ProcessResult:
 *   { ok, dataUrl, width, height, originalSize, compressedSize, ratio, rejected, reason }
 */
(function(global) {
  'use strict';

  // ── Config ───────────────────────────────────────
  const CFG = {
    MAX_FILE_SIZE:   10 * 1024 * 1024,   // 10MB — reject before reading
    MIN_FILE_SIZE:   20 * 1024,           // 20KB before compression (catches truly tiny files)
    MIN_DIMENSION:   400,                 // px — quality floor (width AND height)
    MAX_DIMENSION:   1200,                // px — resize target
    JPEG_QUALITY:    0.82,                // canvas JPEG quality
    DUPLICATE_THRESHOLD: 12,              // Hamming distance ≤ 12 → "potential duplicate"
    COLOR_SAMPLE_GRID: 4,                 // NxN grid for colour analysis
    UNIFORM_THRESHOLD: 0.88,             // >88% similar-colour pixels → flag stock BG
    WHITE_THRESHOLD:  235,               // RGB ≥ 235 considered "white"
  };

  // ── processImage ─────────────────────────────────
  /**
   * Full pipeline: validate → read → decode → resize → compress → return dataUrl
   * @param {File} file
   * @returns {Promise<ProcessResult>}
   */
  function processImage(file) {
    return new Promise((resolve) => {
      // 1. Fast file-size check before FileReader
      if (file.size > CFG.MAX_FILE_SIZE) {
        return resolve({ ok: false, rejected: true, reason: `File too large (${_mb(file.size)} MB). Maximum is 10 MB.` });
      }
      if (!file.type.startsWith('image/')) {
        return resolve({ ok: false, rejected: true, reason: 'File must be an image (JPEG, PNG, WebP, etc.).' });
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const w = img.naturalWidth;
          const h = img.naturalHeight;

          // 2. Minimum resolution check
          if (w < CFG.MIN_DIMENSION || h < CFG.MIN_DIMENSION) {
            return resolve({
              ok: false, rejected: true,
              reason: `Image too small (${w}×${h}px). Minimum is ${CFG.MIN_DIMENSION}×${CFG.MIN_DIMENSION}px for listing quality.`
            });
          }

          // 3. Resize & compress via canvas
          const scale = Math.min(1, CFG.MAX_DIMENSION / Math.max(w, h));
          const tw = Math.round(w * scale);
          const th = Math.round(h * scale);

          const canvas = document.createElement('canvas');
          canvas.width  = tw;
          canvas.height = th;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, tw, th);

          const dataUrl = canvas.toDataURL('image/jpeg', CFG.JPEG_QUALITY);
          const compressedSize = Math.round(dataUrl.length * 0.75); // rough byte estimate from base64

          resolve({
            ok: true,
            rejected: false,
            dataUrl,
            imgElement: img,
            canvas,
            width: tw,
            height: th,
            originalSize: file.size,
            compressedSize,
            ratio: +(compressedSize / file.size).toFixed(2)
          });
        };
        img.onerror = () => resolve({ ok: false, rejected: true, reason: 'Could not decode image. File may be corrupted.' });
        img.src = e.target.result;
      };
      reader.onerror = () => resolve({ ok: false, rejected: true, reason: 'Could not read file.' });
      reader.readAsDataURL(file);
    });
  }

  // ── computePHash ─────────────────────────────────
  /**
   * Compute an 8×8 DCT-based perceptual hash from an img element (or canvas dataUrl).
   * Returns a 64-character binary string ("0" or "1" per bit).
   * @param {HTMLImageElement|string} imgOrDataUrl
   * @returns {string}
   */
  function computePHash(imgOrDataUrl) {
    const SIZE = 32; // resize to 32×32 for DCT
    const HASH_SIZE = 8;

    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    if (typeof imgOrDataUrl === 'string') {
      // Draw from dataUrl
      const img = new Image();
      img.src = imgOrDataUrl;
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
    } else {
      ctx.drawImage(imgOrDataUrl, 0, 0, SIZE, SIZE);
    }

    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

    // Convert to grayscale 2D
    const gray = [];
    for (let y = 0; y < SIZE; y++) {
      gray[y] = [];
      for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        gray[y][x] = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      }
    }

    // 2D DCT (simplified — take top-left 8×8 of DCT coefficients)
    const dct = [];
    for (let u = 0; u < HASH_SIZE; u++) {
      for (let v = 0; v < HASH_SIZE; v++) {
        let sum = 0;
        for (let y = 0; y < SIZE; y++) {
          for (let x = 0; x < SIZE; x++) {
            sum += gray[y][x]
              * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * SIZE))
              * Math.cos(((2 * y + 1) * v * Math.PI) / (2 * SIZE));
          }
        }
        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
        dct.push((2 / SIZE) * cu * cv * sum);
      }
    }

    // Exclude DC component (index 0), compute median of remaining 63
    const vals = dct.slice(1);
    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return dct.map(v => (v > median ? '1' : '0')).join('');
  }

  // ── comparePHash ──────────────────────────────────
  /**
   * Hamming distance between two pHash strings (lower = more similar).
   * 0 = identical, 64 = completely different.
   */
  function comparePHash(h1, h2) {
    if (!h1 || !h2 || h1.length !== h2.length) return 64;
    let dist = 0;
    for (let i = 0; i < h1.length; i++) { if (h1[i] !== h2[i]) dist++; }
    return dist;
  }

  // ── checkDuplicates ───────────────────────────────
  /**
   * Compare pHash against all stored listing + portfolio images in localStorage.
   * @param {string} hash - pHash of the new image
   * @returns {Array<{source, name, distance}>}
   */
  function checkDuplicates(hash) {
    const matches = [];
    if (!hash) return matches;

    // Check user listings
    let listings = [];
    try { listings = JSON.parse(localStorage.getItem('kk_user_listings') || '[]'); } catch(e) {}
    listings.forEach((l, i) => {
      if (l.imageHash) {
        const d = comparePHash(hash, l.imageHash);
        if (d <= CFG.DUPLICATE_THRESHOLD) matches.push({ source: 'listing', name: l.name || `Listing ${i}`, distance: d });
      }
    });

    // Check review queue portfolio images
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem('kk_review_queue') || '[]'); } catch(e) {}
    queue.forEach(q => {
      (q.portfolio?.images || []).forEach((img, ii) => {
        if (img.hash) {
          const d = comparePHash(hash, img.hash);
          if (d <= CFG.DUPLICATE_THRESHOLD) matches.push({ source: 'portfolio', name: q.name || 'Portfolio image', distance: d });
        }
      });
    });

    return matches;
  }

  // ── checkImageContent ──────────────────────────────
  /**
   * Heuristic image content checks (Tier 1 — no API key).
   * @param {HTMLCanvasElement} canvas - the processed (resized) canvas
   * @param {string} [declaredCategory] - e.g. 'formals', 'lab', 'fest', 'manuals'
   * @returns {Array<{flag, detail, severity}>}
   */
  function checkImageContent(canvas, declaredCategory) {
    const flags = [];
    if (!canvas) return flags;

    const ctx = canvas.getContext('2d');
    const N = CFG.COLOR_SAMPLE_GRID;
    const W = canvas.width, H = canvas.height;
    const cellW = Math.floor(W / N), cellH = Math.floor(H / N);

    const samples = [];
    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        const cx = Math.floor(gx * cellW + cellW / 2);
        const cy = Math.floor(gy * cellH + cellH / 2);
        const px = ctx.getImageData(cx, cy, 1, 1).data;
        samples.push({ r: px[0], g: px[1], b: px[2] });
      }
    }

    // 1. Colour uniformity — if all sampled pixels are very close → solid BG
    const dists = [];
    for (let i = 0; i < samples.length; i++) {
      for (let j = i + 1; j < samples.length; j++) {
        dists.push(_colorDist(samples[i], samples[j]));
      }
    }
    const avgDist = dists.reduce((a, b) => a + b, 0) / (dists.length || 1);
    if (avgDist < 15) {
      flags.push({
        flag: 'uniform_color',
        detail: 'Image appears to be nearly uniform in colour — possible solid-background or placeholder image.',
        severity: 'warn'
      });
    }

    // 2. White/grey heavy — possible stock photo with white background
    const whiteCount = samples.filter(s => s.r >= CFG.WHITE_THRESHOLD && s.g >= CFG.WHITE_THRESHOLD && s.b >= CFG.WHITE_THRESHOLD).length;
    if (whiteCount / samples.length >= CFG.UNIFORM_THRESHOLD) {
      flags.push({
        flag: 'white_heavy_background',
        detail: 'Image is mostly white/light — may be a stock photo or e-commerce product shot rather than original campus photo.',
        severity: 'warn'
      });
    }

    // 3. Extremely dark image — possible screenshot or very underexposed
    const darkCount = samples.filter(s => s.r < 20 && s.g < 20 && s.b < 20).length;
    if (darkCount / samples.length >= 0.7) {
      flags.push({
        flag: 'very_dark_image',
        detail: 'Image is very dark — may be a screenshot or unlit photo. Buyers may have difficulty seeing the item.',
        severity: 'info'
      });
    }

    return flags;
  }

  // ── Helpers ───────────────────────────────────────
  function _mb(bytes) { return (bytes / 1024 / 1024).toFixed(1); }
  function _kb(bytes) { return (bytes / 1024).toFixed(0); }
  function _colorDist(a, b) { return Math.sqrt((a.r-b.r)**2 + (a.g-b.g)**2 + (a.b-b.b)**2); }

  /** Format compressed-size status label for UI */
  function formatCompressionStatus(result) {
    if (!result.ok) return result.reason;
    const saved = result.originalSize - result.compressedSize;
    const pct = Math.round((1 - result.ratio) * 100);
    if (saved > 0) {
      return `✓ ${_mb(result.originalSize)} MB → ${_kb(result.compressedSize)} KB (${pct}% saved) · ${result.width}×${result.height}px`;
    }
    return `✓ ${_kb(result.compressedSize)} KB · ${result.width}×${result.height}px`;
  }

  // ── Public API ────────────────────────────────────
  global.KKImageProcessor = {
    CFG,
    processImage,
    computePHash,
    comparePHash,
    checkDuplicates,
    checkImageContent,
    formatCompressionStatus,
  };

})(window);
