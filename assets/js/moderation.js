/**
 * assets/js/moderation.js
 * Craftified — Client-side chat moderation engine
 * Filters out phone numbers, emails, and external app handles to keep transactions on-platform.
 */
(function() {
  'use strict';

  const MODERATION_RULES = [
    {
      id: 'phone_number',
      // Matches typical 10 digit numbers, +91, with spaces/dashes
      regex: /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/gi,
      reason: 'Sharing phone numbers is not allowed. Keep communication on Craftified for your safety.'
    },
    {
      id: 'email_address',
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      reason: 'Sharing email addresses is not allowed. Keep communication on Craftified.'
    },
    {
      id: 'external_app',
      // Matches "insta", "ig", "whatsapp", "snap", "telegram", "dm me on"
      regex: /\b(insta|instagram|ig|whatsapp|wa|snap|snapchat|telegram|tg|discord)\b/gi,
      reason: 'Redirecting to external apps is against our policy. Please chat here.'
    },
    {
      id: 'payment_app',
      regex: /\b(gpay|paytm|phonepe|upi|venmo|cashapp)\b/gi,
      reason: 'Direct payment handles should only be shared securely after finalizing the deal in chat.'
    }
  ];

  window.KKModeration = {
    /**
     * Checks a message string against moderation rules.
     * @param {string} text - The message to check.
     * @returns {object} { ok: boolean, reason: string | null, ruleId: string | null }
     */
    checkMessage: function(text) {
      if (!text) return { ok: true, reason: null, ruleId: null };
      
      for (let rule of MODERATION_RULES) {
        if (rule.regex.test(text)) {
          return { ok: false, reason: rule.reason, ruleId: rule.id };
        }
      }
      return { ok: true, reason: null, ruleId: null };
    },

    /**
     * Logs a moderation strike against the user profile in localStorage.
     * Admins can view these strikes.
     * @param {string} email - User email
     * @param {string} text - The blocked message
     * @param {string} ruleId - The rule triggered
     */
    logStrike: function(email, text, ruleId) {
      const users = JSON.parse(localStorage.getItem('kk_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (user) {
        user.moderationStrikes = user.moderationStrikes || 0;
        user.moderationStrikes += 1;
        
        user.strikeLog = user.strikeLog || [];
        user.strikeLog.push({
          ruleId: ruleId,
          text: text,
          date: new Date().toISOString()
        });
        
        localStorage.setItem('kk_users', JSON.stringify(users));
      }
    }
  };

})();
