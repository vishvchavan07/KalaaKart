/**
 * assets/js/points.js
 * KalaaKart — Gamified Points & Rewards Engine
 */
(function() {
  'use strict';

  // Configurable weights for point actions
  const POINTS_CONFIG = {
    SALE_COMPLETED: 50,
    POSITIVE_FEEDBACK: 20, // (4+ stars)
    LISTING_CREATED: 10,
    VERIFIED_PORTFOLIO: 100
  };

  // Redemption tiers
  const REDEMPTION_TIERS = {
    BOOST_24H: 500
  };

  window.KKPoints = {
    getConfig: () => POINTS_CONFIG,
    getTiers: () => REDEMPTION_TIERS,
    
    /**
     * Award points to a user.
     * @param {string} email - Target user email
     * @param {string} action - e.g. "SALE_COMPLETED"
     */
    awardPoints: function(email, action) {
      if (!POINTS_CONFIG[action]) return false;
      
      const users = JSON.parse(localStorage.getItem('kk_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (user) {
        user.pointsBalance = (user.pointsBalance || 0) + POINTS_CONFIG[action];
        user.pointsHistory = user.pointsHistory || [];
        user.pointsHistory.push({
          action,
          amount: POINTS_CONFIG[action],
          date: new Date().toISOString()
        });
        localStorage.setItem('kk_users', JSON.stringify(users));
        return true;
      }
      return false;
    },

    /**
     * Deduct points for a reward redemption.
     */
    redeemPoints: function(email, tierKey) {
      const cost = REDEMPTION_TIERS[tierKey];
      if (!cost) return { ok: false, reason: "Invalid tier" };

      const users = JSON.parse(localStorage.getItem('kk_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (user && (user.pointsBalance || 0) >= cost) {
        user.pointsBalance -= cost;
        user.pointsHistory = user.pointsHistory || [];
        user.pointsHistory.push({
          action: 'REDEEMED_' + tierKey,
          amount: -cost,
          date: new Date().toISOString()
        });
        localStorage.setItem('kk_users', JSON.stringify(users));
        return { ok: true, remaining: user.pointsBalance };
      }
      return { ok: false, reason: "Insufficient points" };
    },

    /**
     * Get user's current point balance.
     */
    getBalance: function(email) {
      const users = JSON.parse(localStorage.getItem('kk_users') || '[]');
      const user = users.find(u => u.email === email);
      return user ? (user.pointsBalance || 0) : 0;
    }
  };

})();
