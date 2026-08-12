/**
 * assets/js/branding.js
 * KalaaKart — Live branding (logo / favicon / site name) from localStorage
 *
 * Runs immediately in <head> before page render to avoid FOUC.
 * Reads: localStorage.kk_branding = { logoUrl, faviconUrl, siteName }
 *
 * Targets:
 *   • img[data-kk-logo]   — all nav + footer logos
 *   • link[rel="icon"]    — favicon
 *   • document.title      — replaces "Kalaa Kart" with siteName if set
 *
 * When backend is live:
 *   Fetch GET /api/admin/config/branding and call KKBranding.apply(data).
 */
(function() {
  'use strict';

  var DEFAULT_LOGO = 'assets/images/main_logo_final.jpeg';
  var DEFAULT_NAME = 'Kalaa Kart';

  function apply(b) {
    if (!b) return;
    // Logo swap — runs after DOM is ready
    function swapLogos() {
      var els = document.querySelectorAll('[data-kk-logo]');
      for (var i = 0; i < els.length; i++) {
        els[i].src = b.logoUrl || DEFAULT_LOGO;
      }
    }

    // Favicon swap
    if (b.faviconUrl) {
      var link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (link) link.href = b.faviconUrl;
    }

    // Title swap
    if (b.siteName && b.siteName !== DEFAULT_NAME) {
      document.title = document.title.replace(DEFAULT_NAME, b.siteName);
    }

    // Logos need DOM — swap now or wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', swapLogos);
    } else {
      swapLogos();
    }
  }

  // Load from localStorage
  var raw = null;
  try { raw = JSON.parse(localStorage.getItem('kk_branding') || 'null'); } catch(e) {}
  if (raw) apply(raw);

  // Expose for programmatic use (admin-branding.html calls KKBranding.apply + KKBranding.save)
  window.KKBranding = {
    apply: apply,
    get: function() {
      try { return JSON.parse(localStorage.getItem('kk_branding') || '{}'); } catch(e) { return {}; }
    },
    save: function(data) {
      var current = window.KKBranding.get();
      var merged = Object.assign({}, current, data);
      localStorage.setItem('kk_branding', JSON.stringify(merged));
      apply(merged);
      return merged;
    },
    reset: function() {
      localStorage.removeItem('kk_branding');
      apply({ logoUrl: DEFAULT_LOGO, faviconUrl: null, siteName: DEFAULT_NAME });
    },
    DEFAULT_LOGO: DEFAULT_LOGO,
    DEFAULT_NAME: DEFAULT_NAME
  };
})();
