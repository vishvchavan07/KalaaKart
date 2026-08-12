/**
 * assets/js/chat.js
 * KalaaKart — LocalStorage-based real-time chat mock.
 * Uses window 'storage' events for instant tab-to-tab sync, and a short interval polling fallback.
 */
(function() {
  'use strict';

  // Structure in localStorage:
  // kk_chats: [ { id: 'thread_123', listingId: 'lst_456', buyerEmail: 'a@b.com', sellerEmail: 'c@d.com', lastUpdated: 'iso', messages: [ { sender: 'a@b.com', text: 'hi', ts: 'iso' } ] } ]

  window.KKChat = {
    getThreadsForUser: function(email) {
      const chats = JSON.parse(localStorage.getItem('kk_chats') || '[]');
      return chats.filter(c => c.buyerEmail === email || c.sellerEmail === email)
                  .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    },

    getThread: function(threadId) {
      const chats = JSON.parse(localStorage.getItem('kk_chats') || '[]');
      return chats.find(c => c.id === threadId) || null;
    },

    getOrCreateThread: function(listingId, buyerEmail, sellerEmail) {
      const chats = JSON.parse(localStorage.getItem('kk_chats') || '[]');
      let thread = chats.find(c => c.listingId === listingId && c.buyerEmail === buyerEmail);
      
      if (!thread) {
        thread = {
          id: 'th_' + Date.now() + '_' + Math.floor(Math.random()*1000),
          listingId: listingId,
          buyerEmail: buyerEmail,
          sellerEmail: sellerEmail,
          lastUpdated: new Date().toISOString(),
          messages: []
        };
        chats.push(thread);
        localStorage.setItem('kk_chats', JSON.stringify(chats));
      }
      return thread;
    },

    sendMessage: function(threadId, senderEmail, text) {
      const chats = JSON.parse(localStorage.getItem('kk_chats') || '[]');
      const tIdx = chats.findIndex(c => c.id === threadId);
      if (tIdx === -1) return false;

      // Moderation gate
      if (window.KKModeration) {
        const check = window.KKModeration.checkMessage(text);
        if (!check.ok) {
          window.KKModeration.logStrike(senderEmail, text, check.ruleId);
          return { error: true, reason: check.reason };
        }
      }

      const msg = { sender: senderEmail, text: text, ts: new Date().toISOString() };
      chats[tIdx].messages.push(msg);
      chats[tIdx].lastUpdated = msg.ts;
      
      localStorage.setItem('kk_chats', JSON.stringify(chats));
      
      // Dispatch a custom event to update the UI immediately in the same tab
      window.dispatchEvent(new CustomEvent('kk_chat_updated', { detail: { threadId } }));
      
      return { error: false, message: msg };
    },

    subscribe: function(threadId, callback) {
      // Listen for changes from other tabs
      const storageListener = (e) => {
        if (e.key === 'kk_chats') {
          callback(this.getThread(threadId));
        }
      };
      window.addEventListener('storage', storageListener);

      // Listen for changes from this tab
      const customListener = (e) => {
        if (e.detail.threadId === threadId) {
          callback(this.getThread(threadId));
        }
      };
      window.addEventListener('kk_chat_updated', customListener);

      // Polling fallback (in case events drop or for robustness)
      const pollTimer = setInterval(() => {
        callback(this.getThread(threadId));
      }, 2000);

      return function unsubscribe() {
        window.removeEventListener('storage', storageListener);
        window.removeEventListener('kk_chat_updated', customListener);
        clearInterval(pollTimer);
      };
    }
  };

})();
