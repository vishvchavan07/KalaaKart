/**
 * assets/js/feedback.js
 * Craftified — Feedback & Ratings store
 */
(function() {
  'use strict';

  // Structure in localStorage:
  // kk_feedback: [ { targetEmail: 'c@d.com', raterEmail: 'a@b.com', listingId: 'lst_456', rating: 5, review: 'Great!', isDispute: false, date: 'iso' } ]

  window.KKFeedback = {
    submitFeedback: function(targetEmail, raterEmail, listingId, rating, review, isDispute) {
      const fbArray = JSON.parse(localStorage.getItem('kk_feedback') || '[]');
      
      const entry = {
        id: 'fb_' + Date.now(),
        targetEmail,
        raterEmail,
        listingId,
        rating: Number(rating),
        review: (review || '').trim(),
        isDispute: !!isDispute,
        date: new Date().toISOString()
      };
      
      fbArray.push(entry);
      localStorage.setItem('kk_feedback', JSON.stringify(fbArray));

      // Hook to points engine
      if (window.KKPoints && !isDispute && entry.rating >= 4) {
        window.KKPoints.awardPoints(targetEmail, 'POSITIVE_FEEDBACK');
      }

      return entry;
    },

    getFeedbackForUser: function(email) {
      const fb = JSON.parse(localStorage.getItem('kk_feedback') || '[]');
      return fb.filter(f => f.targetEmail === email);
    },

    getStatsForUser: function(email) {
      const fb = this.getFeedbackForUser(email);
      if (fb.length === 0) return { avg: 0, count: 0 };
      
      const sum = fb.reduce((acc, cur) => acc + cur.rating, 0);
      return {
        avg: (sum / fb.length).toFixed(1),
        count: fb.length
      };
    }
  };

})();
