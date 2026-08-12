// Global Theme & Onboarding Functions (Defined early for HTML onclicks)
window.setTheme = function(theme) {
  const previous = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kk-theme', theme);
  
  // Sync all theme buttons across the page
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  // Sakura: drop petals effect
  if (theme === 'sakura' && previous !== 'sakura') {
    for (let i = 0; i < 12; i++) { // Reduced count for performance
      setTimeout(() => {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        petal.style.width = (8 + Math.random() * 8) + 'px';
        petal.style.height = petal.style.width;
        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), 5000);
      }, i * 100);
    }
  }

  // Sakura: drop petals effect
  if (theme === 'emerald-forest' && previous !== 'emerald-forest') {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const leaf = document.createElement('div');
        leaf.className = 'forest-leaf';
        leaf.style.left = Math.random() * 100 + 'vw';
        leaf.style.width = (10 + Math.random() * 20) + 'px';
        leaf.style.height = (15 + Math.random() * 10) + 'px';
        leaf.style.animationDuration = (3 + Math.random() * 3) + 's';
        document.body.appendChild(leaf);
        setTimeout(() => leaf.remove(), 6000);
      }, i * 350);
    }
  }

  // Sunset Mirage: Mouse Flare
  if (theme === 'sunset-mirage') {
    const flare = document.createElement('div');
    flare.className = 'sunset-flare';
    document.body.appendChild(flare);
    const moveFlare = (e) => {
      flare.style.left = e.clientX + 'px';
      flare.style.top = e.clientY + 'px';
    };
    document.addEventListener('mousemove', moveFlare);
    // Cleanup flare if theme changes
    const observer = new MutationObserver(() => {
      if (document.documentElement.getAttribute('data-theme') !== 'sunset-mirage') {
        flare.remove();
        document.removeEventListener('mousemove', moveFlare);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { attributes: true });
  }

  // Parchment & Quill: Add ink splats to cards
  if (theme === 'parchment-quill') {
    document.querySelectorAll('.profile-card, .market-card, .mentor-card').forEach(card => {
      if (!card.querySelector('.ink-splat')) {
        const splat = document.createElement('div');
        splat.className = 'ink-splat';
        splat.style.top = (20 + Math.random() * 60) + '%';
        splat.style.right = (5 + Math.random() * 15) + '%';
        card.appendChild(splat);
      }
    });
  }

  // Midnight Ink: reveal effect
  if (theme === 'midnight-ink' && previous !== 'midnight-ink') {
    document.querySelectorAll('.profile-card, .market-card, .mentor-card, .pillar-card').forEach((card, i) => {
      card.classList.remove('ink-reveal');
      void card.offsetWidth; // Trigger reflow
      setTimeout(() => card.classList.add('ink-reveal'), i * 40);
    });
  }

  // Stone Gold: shimmer effect
  if (theme === 'stone-gold' && previous !== 'stone-gold') {
    document.querySelectorAll('.btn-primary, .btn-warm-fill').forEach(btn => {
      btn.classList.add('gold-shimmer-active');
      setTimeout(() => btn.classList.remove('gold-shimmer-active'), 800);
    });
  }
};

window.closeOnboarding = function() {
  const onboarding = document.getElementById('onboardingOverlay');
  if(!onboarding) return;
  const card = onboarding.querySelector('.onboarding-card');
  
  if(card) card.classList.add('fall-down');
  onboarding.classList.add('fade-out');
  
  localStorage.setItem('kk_onboarded', 'true');
  
  setTimeout(() => {
    onboarding.remove();
    document.body.style.overflow = 'auto';
  }, 1200); // Wait for animation to finish
};

(function () {
  const data = window.campusCircleData;
  const page = document.body.dataset.page;
  
  // SHARED USER DATA STATE
  const userProfilesRaw = (() => { try { return JSON.parse(localStorage.getItem('kk_user_profiles') || '[]'); } catch(e){ return []; } })();
  const userListingsRaw = (() => { try { return JSON.parse(localStorage.getItem('kk_user_listings') || '[]'); } catch(e){ return []; } })();
  
  const userProfilesCount = userProfilesRaw.length;
  const userListingsCount = userListingsRaw.length;
  
  const allProfiles = [...data.featuredProfiles, ...data.extraProfiles, ...userProfilesRaw];

  // 1. INITIALIZE THEME
  const currentTheme = localStorage.getItem('kk-theme') || 'dark-cold';
  document.documentElement.setAttribute('data-theme', currentTheme);

  // 1. DYNAMIC NAVBAR SEARCH INJECTION
  // Inject the global search widget into the navbar on all pages
  const navLinks = document.querySelector('.nav-links');
  const navMobileDropdown = document.querySelector('.nav-mobile-dropdown');
  if (navLinks && !document.getElementById('globalSearchBtn')) {
    const searchHtml = `
      <div class="global-search-widget" style="position:relative; display:inline-flex; align-items:center; margin-left:15px;">
        <button id="globalSearchBtn" style="background:none; border:none; color:var(--text-primary); font-size:1.2rem; cursor:pointer; padding:5px; transition:color 0.2s;" aria-label="Search site">🔍</button>
        <div id="globalSearchDropdown" style="position:absolute; top:45px; right:0; background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:12px; width:280px; display:none; flex-direction:column; gap:10px; box-shadow:var(--shadow); z-index:100;">
          <input type="text" id="globalSearchInput" placeholder="Search profiles, items, etc..." style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary); font-family:inherit; outline:none;">
          <button id="globalSearchSubmit" class="button btn-primary" style="padding:8px;">Search</button>
        </div>
      </div>
    `;
    navLinks.insertAdjacentHTML('beforeend', searchHtml);

    // Mobile nav search injection
    if (navMobileDropdown) {
      navMobileDropdown.insertAdjacentHTML('afterbegin', `
        <div style="padding:10px 20px; display:flex; gap:10px;">
          <input type="text" id="mobileSearchInput" placeholder="Search..." style="flex:1; padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary); font-family:inherit; outline:none;">
          <button id="mobileSearchSubmit" class="button btn-primary" style="padding:8px 12px;">🔍</button>
        </div>
      `);
    }

    // Logic
    const toggleBtn = document.getElementById('globalSearchBtn');
    const dropdown = document.getElementById('globalSearchDropdown');
    const gInput = document.getElementById('globalSearchInput');
    const gSubmit = document.getElementById('globalSearchSubmit');
    const mInput = document.getElementById('mobileSearchInput');
    const mSubmit = document.getElementById('mobileSearchSubmit');

    const handleSearch = (query) => {
      if (!query) return;
      // Heuristic: if they search for a person/skill, go to profiles. Else marketplace.
      const q = query.toLowerCase();
      const isProfile = ['writer', 'painter', 'art', 'mentor', 'video', 'edit'].some(kw => q.includes(kw));
      if (isProfile) window.location.href = `profiles.html?search=${encodeURIComponent(query)}`;
      else window.location.href = `marketplace.html?q=${encodeURIComponent(query)}`;
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVis = dropdown.style.display === 'flex';
        dropdown.style.display = isVis ? 'none' : 'flex';
        if (!isVis) gInput.focus();
      });
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== toggleBtn) dropdown.style.display = 'none';
      });
    }
    gInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(gInput.value.trim()); });
    gSubmit?.addEventListener('click', () => handleSearch(gInput.value.trim()));
    mInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(mInput.value.trim()); });
    mSubmit?.addEventListener('click', () => handleSearch(mInput.value.trim()));
  }

  // 1.5 DYNAMIC NAVBAR AUTH STATE
  function updateNavbarAuth() {
    const isLoggedIn = localStorage.getItem('kk_user_logged_in') === 'true';
    const user = JSON.parse(localStorage.getItem('kk_current_user') || '{}');
    
    document.querySelectorAll('.nav-links, .nav-mobile-dropdown').forEach(nav => {
      const loginLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'login.html');
      const signupLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'signup.html' || a.getAttribute('href') === 'create-profile.html');
      
      if (isLoggedIn) {
        if (loginLink) {
          loginLink.textContent = 'LOG OUT';
          loginLink.removeAttribute('href');
          loginLink.style.cursor = 'pointer';
          loginLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('kk_user_logged_in');
            localStorage.removeItem('kk_user_email');
            localStorage.removeItem('kk_current_user');
            sessionStorage.removeItem('kk_current_user');
            window.location.href = 'index.html';
          };
        }
        if (signupLink) {
          signupLink.textContent = 'MY PROFILE';
          signupLink.setAttribute('href', 'profiles.html');
        }
      }
    });
  }
  document.addEventListener('DOMContentLoaded', updateNavbarAuth);
  // Also run immediately in case DOM is already loaded
  updateNavbarAuth();

  // 2. REUSABLE UI HELPERS
  function renderStars(rating) {
    const r = parseFloat(rating) || 5;
    let html = '';
    for (let i = 1; i <= 5; i++) {
       if (i <= Math.floor(r)) html += '<span class="star" style="color:#F5A623 !important;">★</span>';
       else if (i - 0.5 <= r) html += '<span class="star-half" style="color:#F5A623 !important;">★</span>';
       else html += '<span class="star-empty" style="color:#ccc !important;">☆</span>';
    }
    return `<div class="star-rating-rendered" style="display:inline-flex; gap:2px;">${html}</div>`;
  }

  // Load verified badges from kk_users for user-created profiles
  function getVerifiedEmails() {
    try {
      const users = JSON.parse(localStorage.getItem('kk_users') || '[]');
      return new Set(users.filter(u => u.verifiedBadge).map(u => u.email));
    } catch(e) { return new Set(); }
  }
  const verifiedEmails = getVerifiedEmails();

  function profileCard(profile) {
    // Check verified status: either profile flag or matched by email in kk_users
    const isVerified = profile.verifiedBadge || (profile.email && verifiedEmails.has(profile.email));
    const verifiedBadge = isVerified
      ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:50px;font-size:0.72rem;font-weight:700;background:rgba(34,197,94,0.12);color:#16a34a;border:1px solid rgba(34,197,94,0.25);margin-left:8px;">✅ Verified</span>`
      : '';

    let hobbyTags = (profile.hobbies || []).map(h => `<span class="tag">${h}</span>`).join("");
    let galleryHtml = '';
    if(profile.gallery && profile.gallery.length > 0){
      galleryHtml = `
        <div class="works-preview" style="display:flex; gap:8px; overflow-x:auto; margin: 12px 0; padding-bottom:6px; scrollbar-width: none;">
          ${profile.gallery.map(work => `
            <img src="${work.src}" 
                 onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(work.title)}&backgroundColor=120A05';" 
                 alt="${work.title}" 
                 class="work-preview-item" 
                 style="width:90px; height:90px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid var(--border); cursor:zoom-in;">
          `).join("")}
        </div>
      `;
    }

    let stats = { avg: profile.rating || '5.0', count: 0 };
    if (window.KKFeedback) {
      const email = profile.email || profile.id + '@example.com';
      const actualStats = KKFeedback.getStatsForUser(email);
      if (actualStats.count > 0) stats = actualStats;
    }

    return `
    <div class="profile-card" data-profile-id="${profile.id}" data-verified="${isVerified}">
      <div>
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
            <img src="${profile.image || ''}" style="width:80px;height:80px;border-radius:50%;object-fit:cover; border:3px solid var(--accent); padding:3px; background:var(--surface);" alt="${profile.name}">
            <div>
              <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
                <h3 style="margin:0;font-size:20px;">${profile.name}</h3>
                ${verifiedBadge}
              </div>
              <p style="margin:2px 0 0;font-size:14px;color:var(--text-secondary);">${profile.title}</p>
            </div>
          </div>
          <div style="background:var(--tag-bg); padding:12px; border-radius:14px; margin-bottom:16px;">
            <p style="margin:0; font-size:14px; opacity:0.9;">${profile.bio}</p>
          </div>
          ${galleryHtml}
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
            ${renderStars(stats.avg)}
            <span style="font-size:15px;font-weight:800;">${stats.avg}</span>
            <span style="font-size:12px;opacity:0.6;">(${stats.count} reviews)</span>
          </div>
      </div>
      <div class="card-bottom">
        <div class="card-tags">${hobbyTags}</div>
        <button class="button btn-primary" data-book-profile="${profile.id}" style="width:100%;">Book Now</button>
      </div>
    </div>`;
  }

  function mentorCard(mentor, index) {
    return `
      <article class="mentor-card" data-mentor-id="${index}">
        <div>
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
            <img src="${mentor.image}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:3px solid var(--accent); padding:3px; background:var(--surface);" alt="${mentor.name}">
            <div>
              <h3 style="margin:0; font-size:18px;">${mentor.name}</h3>
              <p style="margin:2px 0 0; font-size:14px; color:var(--accent); font-weight:700;">${mentor.subject}</p>
              <p style="margin:0; font-size:12px; opacity:0.6;">${mentor.mode}</p>
            </div>
          </div>
          <div style="background:var(--tag-bg); padding:12px; border-radius:14px; margin-bottom:16px;">
            <p style="margin:0; font-size:14px; opacity:0.9; line-height:1.5;">${mentor.description}</p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${renderStars(mentor.rating)}
              <span style="font-size:12px; opacity:0.6;">${mentor.rating} Rating</span>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800; font-size:1.1rem; color:var(--text-primary);">${mentor.price}</div>
              <small style="opacity:0.6; font-size:11px;">${mentor.freeOption}</small>
            </div>
          </div>
        </div>
        <button class="button btn-primary" data-book-mentor="${index}" style="width:100%; font-weight:700;">Book Session</button>
      </article>
    `;
  }

  function marketplaceCard(item, index, searchQuery) {
    const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=120A05&fontSize=32&fontFamily=Courier&chars=2`;
    const q = searchQuery || '';
    const hl = (str) => {
      if (!q || !str) return String(str || '');
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return String(str).replace(new RegExp(`(${esc})`, 'gi'), '<mark class="search-hl">$1</mark>');
    };

    // Check Boost status
    const isBoosted = item.isBoosted === true;
    const boostBadge = isBoosted ? `<div style="display:inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); color:#fff; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:4px; margin-bottom:6px; letter-spacing:0.5px; text-transform:uppercase;">🌟 Featured</div>` : '';

    // AI verification flag/approved badges
    const hasFlags = item.imageFlags && item.imageFlags.length > 0;
    const isApproved = item.imageApproved === true;
    let verificationBadge = '';
    if (isApproved) {
      verificationBadge = `<div class="listing-approved-badge">✅ Image Verified</div>`;
    } else if (hasFlags && !item.isUserListing) {
      // Static listings don't get flagged
    } else if (hasFlags) {
      verificationBadge = `<div class="listing-flag-badge">⚠️ Under Review</div>`;
    }

    const sellerEmail = item.sellerContact || item.seller.replace(' ', '').toLowerCase() + '@example.com';
    let statsHtml = '';
    if (window.KKFeedback) {
      const stats = KKFeedback.getStatsForUser(sellerEmail);
      if (stats.count > 0) {
        statsHtml = `<div style="font-size:12px; margin-bottom:10px; display:flex; align-items:center; gap:4px;">${renderStars(stats.avg)} (${stats.count})</div>`;
      }
    }

    return `
      <article class="market-card" data-item-id="${index}" style="display:flex; flex-direction:column; height:100%;">
        <div style="position:relative; width:100%; height:200px; border-radius:12px; overflow:hidden; background:var(--surface); flex-shrink:0;">
          <img src="${item.image}"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
               alt="${item.name}"
               style="width:100%; height:100%; object-fit:cover;">
          <div class="image-fallback" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background:linear-gradient(135deg, var(--surface), var(--bg)); color:var(--accent); font-weight:800; text-align:center; padding:20px; font-size:14px; border:1px solid var(--border);">
            ${item.name}<br><small style="opacity:0.6; font-size:10px;">(Image Preview)</small>
          </div>
        </div>
        <div style="flex-grow:1; display:flex; flex-direction:column; padding-top:12px;">
          ${boostBadge}
          <h3 style="margin:0 0 4px; font-size:1.1rem; line-height:1.2;">${hl(item.name)}</h3>
          ${verificationBadge}
          <p style="font-size:13px; opacity:0.7; margin-bottom:12px; margin-top:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${hl(item.description)}</p>
          <div class="market-meta" style="margin-top:auto;">
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
              <span class="tag">${item.price}</span>
              ${item.alternate ? `<span class="tag">${item.alternate}</span>` : ''}
              <span class="tag">${item.size || 'FY B.Tech'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <p style="font-size:12px; font-weight:600; opacity:0.8; margin:0;">Seller: ${hl(item.seller)}</p>
              ${statsHtml}
            </div>
            <button class="button button-secondary" onclick="startChat('${item.id || item.name}', '${sellerEmail}')" style="width:100%; border-radius:10px; font-weight:700;">Chat with Seller</button>
          </div>
        </div>
      </article>
    `;
  }

  // Global chat launcher
  window.startChat = function(listingId, sellerEmail) {
    const buyerEmail = localStorage.getItem('kk_user_email');
    if (!buyerEmail) {
      window.location.href = 'login.html';
      return;
    }
    if (buyerEmail === sellerEmail) {
      alert("You cannot chat with yourself.");
      return;
    }
    const thread = KKChat.getOrCreateThread(listingId, buyerEmail, sellerEmail);
    window.location.href = 'chat.html?t=' + thread.id;
  };


  // 3. PAGE SPECIFIC LOGIC
  if (page === "home") {
    const feat = document.getElementById("featuredProfiles");
    if (feat) feat.innerHTML = data.featuredProfiles.map(profileCard).join("");

    document.querySelectorAll('.stat-number').forEach(stat => {
      const target = parseInt(stat.dataset.target);
      if (target === 120) stat.dataset.target = 120 + (userProfilesCount * 2);
      if (target === 48) stat.dataset.target = 48 + userListingsCount;
    });

    const homeSearch = document.getElementById("homeSearchInput");
    if (homeSearch) {
      homeSearch.addEventListener("keypress", (e) => {
        if (e.key === "Enter") window.location.href = `profiles.html?search=${encodeURIComponent(homeSearch.value)}`;
      });
    }

    // Spotlight Rotation
    const spotlightName = document.querySelector(".spotlight-name");
    const spotlightTitle = document.querySelector(".spotlight-title");
    const spotlightPrice = document.querySelector(".spotlight-price");
    const spotlightImage = document.querySelector(".spotlight-image");
    const spotlightTextAnim = document.querySelector(".spotlight-text-anim");

    if (spotlightName && data.featuredProfiles.length > 0) {
      let spotlightIdx = 0;
      setInterval(() => {
        spotlightIdx = (spotlightIdx + 1) % data.featuredProfiles.length;
        const p = data.featuredProfiles[spotlightIdx];
        if (spotlightTextAnim) spotlightTextAnim.style.opacity = '0';
        setTimeout(() => {
          spotlightName.textContent = p.name;
          spotlightTitle.textContent = p.title;
          spotlightPrice.textContent = `From ₹${p.priceRange.min}`;
          if (spotlightImage) spotlightImage.src = p.image;
          if (spotlightTextAnim) spotlightTextAnim.style.opacity = '1';
        }, 300);
      }, 3000);
    }
  }

  if (page === "profiles") {
    const grid = document.getElementById("allProfiles");
    const searchInput = document.getElementById("profileSearch");
    const pills = document.querySelectorAll(".filter-pill");

    const filterProfiles = () => {
      const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter || 'all';
      const searchVal = (searchInput?.value || '').toLowerCase().trim();
      
      const filtered = allProfiles.filter(p => {
        // 'verified' filter pill support
        const isVerified = p.verifiedBadge || (p.email && verifiedEmails.has(p.email));
        if (activeFilter === 'verified') return isVerified;
        const catMatch = (activeFilter === 'all' || p.title.toLowerCase().includes(activeFilter.toLowerCase()) || (p.hobbies || []).some(h => h.toLowerCase().includes(activeFilter.toLowerCase())));
        const searchMatch = !searchVal || p.name.toLowerCase().includes(searchVal) || (p.hobbies || []).some(h => h.toLowerCase().includes(searchVal)) || (p.title || '').toLowerCase().includes(searchVal);
        return catMatch && searchMatch;
      });

      grid.innerHTML = filtered.length ? filtered.map(profileCard).join("") : `<p style="grid-column:1/-1; text-align:center; padding:3rem;">No creators found.</p>`;
    };

    pills.forEach(pill => pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterProfiles();
    }));
    if(searchInput) searchInput.addEventListener('input', filterProfiles);
    
    // URL param wiring
    const urlSearch = new URLSearchParams(window.location.search).get('search');
    if(urlSearch && searchInput) {
      searchInput.value = urlSearch;
    }
    if(grid) filterProfiles();
  }

  if (page === "mentors") {
    const grid = document.getElementById("mentorCards");
    const subjectPills = document.querySelectorAll('.filter-pill');
    const freeToggle = document.getElementById('freeToggle');

    const filterMentors = () => {
      const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter || 'all';
      const freeOnly = freeToggle?.checked || false;
      const list = data.mentors.filter(m => (activeFilter === 'all' || m.subject === activeFilter) && (freeOnly ? m.price.toLowerCase().includes('free') : true));
      grid.innerHTML = list.length ? list.map((m, i) => mentorCard(m, data.mentors.indexOf(m))).join("") : `<p style="text-align:center; padding:3rem;">No mentors found.</p>`;
    };

    subjectPills.forEach(p => p.addEventListener('click', () => {
      subjectPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      filterMentors();
    }));
    if(freeToggle) freeToggle.addEventListener('change', filterMentors);
    if(grid) filterMentors();
  }

  if (page === "marketplace") {
    const grid        = document.getElementById("marketplaceCards");
    const catPills    = document.querySelectorAll('.mkt-pill');
    const buyToggle   = document.getElementById('buyToggle');
    const rentToggle  = document.getElementById('rentToggle');
    const sortSelect  = document.getElementById('sortSelect');
    const searchInput = document.getElementById('mktSearchInput');
    const searchClear = document.getElementById('mktSearchClear');
    const collegeFilter = document.getElementById('mktCollegeFilter');
    const priceMin    = document.getElementById('mktPriceMin');
    const priceMax    = document.getElementById('mktPriceMax');
    const resetBtn    = document.getElementById('mktResetBtn');
    const resultsBar  = document.getElementById('mktResultsBar');
    const ALL_LISTINGS = [...data.marketplace, ...userListingsRaw];

    // Read active boosts
    const activeBoosts = JSON.parse(localStorage.getItem('kk_boosts') || '[]')
      .filter(b => new Date(b.expiresAt) > new Date());
    const boostedIds = new Set(activeBoosts.map(b => String(b.listingId)));

    ALL_LISTINGS.forEach(item => {
      item.isBoosted = boostedIds.has(String(item.id)) || boostedIds.has(String(item.name));
    });

    // ── Text highlight helper ──────────────────────
    function hlText(text, query) {
      if (!query || !text) return String(text || '');
      const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return String(text).replace(new RegExp(`(${esc})`, 'gi'), '<mark class="search-hl">$1</mark>');
    }

    // ── Extract numeric price from string ──────────
    function extractPrice(item) {
      const raw = item.buyPrice || item.rentPrice
        || parseInt((item.price || '').match(/\d+/)?.[0] || 0)
        || parseInt((item.alternate || '').match(/\d+/)?.[0] || 0);
      return Number(raw) || 0;
    }

    // ── Main filter/search function ────────────────
    let _debounceTimer = null;
    const filterMarket = (instant) => {
      clearTimeout(_debounceTimer);
      const run = () => {
        const activeCat = document.querySelector('.mkt-pill.active')?.dataset.category || 'all';
        const showBuy   = buyToggle?.checked ?? true;
        const showRent  = rentToggle?.checked ?? true;
        const sortBy    = sortSelect?.value || 'newest';
        const query     = (searchInput?.value || '').toLowerCase().trim();
        const college   = (collegeFilter?.value || '').toLowerCase().trim();
        const minP      = priceMin?.value ? Number(priceMin.value) : null;
        const maxP      = priceMax?.value ? Number(priceMax.value) : null;

        // Toggle clear button
        if (searchClear) searchClear.classList.toggle('show', query.length > 0);

        let list = [...ALL_LISTINGS];

        // Category filter
        if (activeCat !== 'all') list = list.filter(m => m.category === activeCat);

        // Buy/Rent filter
        list = list.filter(m => {
          const alt = (m.alternate || '').toLowerCase();
          const price = (m.price || '').toLowerCase();
          const bMatch = showBuy && (m.buyPrice || price.includes('buy') || price.includes('rs'));
          const rMatch = showRent && (m.rentPrice || price.includes('rent') || alt.includes('rent'));
          return bMatch || rMatch;
        });

        // Text search — name, description, category, seller, size, sellerYear
        if (query) {
          list = list.filter(m => {
            const haystack = [m.name, m.description, m.category, m.seller, m.sellerYear, m.size]
              .join(' ').toLowerCase();
            return haystack.includes(query);
          });
        }

        // College filter
        if (college) {
          list = list.filter(m => {
            const sellerInfo = (m.college || m.sellerYear || m.seller || '').toLowerCase();
            return sellerInfo.includes(college);
          });
        }

        // Price range filter
        if (minP !== null) list = list.filter(m => extractPrice(m) >= minP);
        if (maxP !== null) list = list.filter(m => {
          const p = extractPrice(m);
          return p === 0 || p <= maxP;
        });

        // Sort
        list.sort((a, b) => {
          // 1. Boosted items always float to the top
          if (a.isBoosted && !b.isBoosted) return -1;
          if (!a.isBoosted && b.isBoosted) return 1;
          
          // 2. Then apply the user's selected sort
          if (sortBy === 'low') return extractPrice(a) - extractPrice(b);
          if (sortBy === 'high') return extractPrice(b) - extractPrice(a);
          return 0; // 'newest' (which is default order)
        });

        // Render
        if (grid) {
          grid.innerHTML = list.length
            ? list.map((m) => {
                const idx = ALL_LISTINGS.indexOf(m);
                return marketplaceCard(m, idx, query);
              }).join('')
            : `<p style="grid-column:1/-1; text-align:center; padding:3rem; opacity:0.6;">
                No items match your search${query ? ` for "<strong>${hlText(query, '')}</strong>"` : ''}. Try a different keyword.
               </p>`;
        }

        // Results bar
        if (resultsBar) {
          const total = ALL_LISTINGS.length;
          const found = list.length;
          resultsBar.innerHTML = found === total
            ? `<span class="mkt-results-count">Showing <strong>${total}</strong> items</span>`
            : `<span class="mkt-results-count"><strong>${found}</strong> of ${total} items</span>${query ? `&nbsp;for&nbsp;<span class="mkt-results-query">"${query}"</span>` : ''}`;
        }
      };
      if (instant) run(); else _debounceTimer = setTimeout(run, 250);
    };

    // ── Event listeners ────────────────────────────
    catPills.forEach(p => p.addEventListener('click', () => {
      catPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      filterMarket(true);
    }));
    [buyToggle, rentToggle, sortSelect].forEach(el => el?.addEventListener('change', () => filterMarket(true)));
    searchInput?.addEventListener('input', () => filterMarket(false));
    collegeFilter?.addEventListener('input', () => filterMarket(false));
    priceMin?.addEventListener('input', () => filterMarket(false));
    priceMax?.addEventListener('input', () => filterMarket(false));

    // Clear button
    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.remove('show');
      filterMarket(true);
    });

    // Reset all filters
    resetBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (collegeFilter) collegeFilter.value = '';
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      if (buyToggle) buyToggle.checked = true;
      if (rentToggle) rentToggle.checked = true;
      if (sortSelect) sortSelect.value = 'newest';
      catPills.forEach(p => p.classList.remove('active'));
      catPills[0]?.classList.add('active');
      if (searchClear) searchClear.classList.remove('show');
      filterMarket(true);
    });

    // ── URL param deep-link ────────────────────────
    const params = new URLSearchParams(window.location.search);
    const urlQ = params.get('q');
    const urlCollege = params.get('college');
    const urlMin = params.get('min');
    const urlMax = params.get('max');
    if (urlQ && searchInput) searchInput.value = urlQ;
    if (urlCollege && collegeFilter) collegeFilter.value = urlCollege;
    if (urlMin && priceMin) priceMin.value = urlMin;
    if (urlMax && priceMax) priceMax.value = urlMax;

    if (grid) filterMarket(true);
  }


  // 4. GLOBAL UI COMPONENTS (MODALS & SLATES)
  const lightbox = document.createElement("div");
  lightbox.className = "work-lightbox";
  lightbox.innerHTML = `<button class="lightbox-backdrop"></button><div class="lightbox-panel"><button class="lightbox-close">×</button><img class="lightbox-image" src=""><div class="lightbox-copy"><strong class="lightbox-title"></strong><span class="lightbox-owner"></span></div></div>`;
  document.body.appendChild(lightbox);

  const bookingSlate = document.createElement("div");
  bookingSlate.className = "booking-slate";
  bookingSlate.innerHTML = `
    <button class="slate-backdrop"></button>
    <section class="slate-panel">
      <button class="slate-close">×</button>
      <div class="slate-grid">
        <div class="slate-media"><div class="slate-visual-container"><img class="slate-main-photo" src=""><div class="floating-crafts"></div><div class="slate-rating-overlay"></div></div></div>
        <div class="slate-content">
          <span class="eyebrow">SELLER PROFILE</span>
          <h2 class="slate-name"></h2>
          <p class="slate-title" style="color:var(--accent); font-weight:700; margin:4px 0 16px;"></p>
          <p class="slate-bio" style="line-height:1.6; opacity:0.9; margin-bottom:20px;"></p>
          <div class="slate-tags"></div>
          <div class="slate-contact">
            <div class="contact-item"><strong>GMAIL</strong><a class="slate-email" href="#"></a></div>
            <div class="contact-item"><strong>SPOT</strong><span class="slate-location"></span></div>
          </div>
          <div class="price-slider-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;"><strong>Your budget</strong><span class="slider-value" style="color:var(--accent); font-weight:800;"></span></div>
            <input class="booking-range" type="range" style="width:100%;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; opacity:0.6; margin-top:8px;"><span class="slider-min"></span><span class="slider-max"></span></div>
          </div>
          <div class="slate-actions">
            <button class="button btn-primary slate-request-btn" style="width:100%; padding:16px; font-weight:800;">✦ Send Booking Request</button>
          </div>
        </div>
      </div>
    </section>`;
  document.body.appendChild(bookingSlate);

  let currentProfile = null;

  function openBookingSlate(id) {
    currentProfile = allProfiles.find(p => p.id === id);
    if (!currentProfile) return;
    bookingSlate.querySelector(".slate-main-photo").src = currentProfile.image;
    bookingSlate.querySelector(".slate-name").textContent = currentProfile.name;
    bookingSlate.querySelector(".slate-title").textContent = currentProfile.title;
    bookingSlate.querySelector(".slate-bio").textContent = currentProfile.bio;
    bookingSlate.querySelector(".slate-tags").innerHTML = (currentProfile.hobbies || []).map(h => `<span class="tag">${h}</span>`).join("");
    bookingSlate.querySelector(".slate-email").textContent = currentProfile.email;
    bookingSlate.querySelector(".slate-email").href = `mailto:${currentProfile.email}`;
    bookingSlate.querySelector(".slate-location").textContent = currentProfile.location;
    
    const range = bookingSlate.querySelector(".booking-range");
    const val = bookingSlate.querySelector(".slider-value");
    range.min = currentProfile.priceRange.min;
    range.max = currentProfile.priceRange.max;
    range.value = currentProfile.priceRange.defaultValue;
    const updateP = () => val.textContent = `Rs ${range.value}`;
    range.oninput = updateP; updateP();

    // Similar creators
    const content = bookingSlate.querySelector(".slate-content");
    content.querySelectorAll(".similar-creators-section").forEach(s => s.remove());
    const similar = allProfiles.filter(p => p.id !== currentProfile.id && (p.hobbies || []).some(h => (currentProfile.hobbies || []).includes(h))).slice(0, 3);
    if(similar.length > 0) {
      const div = document.createElement("div");
      div.className = "similar-creators-section";
      div.innerHTML = `<h4 style="margin:24px 0 12px; font-size:0.9rem; opacity:0.6;">SIMILAR CREATORS</h4><div style="display:flex; gap:12px; overflow-x:auto;">${similar.map(s => `<div class="similar-mini" data-book-profile="${s.id}" style="cursor:pointer; text-align:center; min-width:80px;"><img src="${s.image}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;"><p style="font-size:10px; margin-top:4px;">${s.name.split(' ')[0]}</p></div>`).join('')}</div>`;
      content.appendChild(div);
    }

    bookingSlate.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  }

  // 5. GLOBAL EVENTS
  document.addEventListener("click", (e) => {
    const bookP = e.target.closest("[data-book-profile]");
    if(bookP) { openBookingSlate(bookP.dataset.bookProfile); return; }

    const bookM = e.target.closest("[data-book-mentor]");
    if(bookM) {
      const m = data.mentors[bookM.dataset.bookMentor];
      window.location.href = `mailto:mentors@craftified.in?subject=Mentorship&body=Hi ${m.name}, I'm interested in ${m.subject} session.`;
      return;
    }

    const bookI = e.target.closest("[data-book-item]");
    if(bookI) {
      const list = [...data.marketplace, ...userListingsRaw];
      const i = list[bookI.dataset.bookItem];
      window.location.href = `mailto:${i.sellerContact || 'marketplace@craftified.in'}?subject=Marketplace inquiry: ${i.name}&body=Hi ${i.seller}, is this ${i.name} still available?`;
      return;
    }

    const reqBtn = e.target.closest(".slate-request-btn");
    if(reqBtn) {
      const creatorName = currentProfile?.name || "Creator";
      const budget = bookingSlate.querySelector(".slider-value").textContent;

      const sub = `Project Interest: ${creatorName} — Craftified`;
      
      const body = `Hi ${creatorName},

I absolutely love your work and I'm interested in purchasing your services! I found your profile on the Craftified student marketplace.

My budget for this project is around ${budget}. 

I would love to discuss the details and how we can collaborate. Looking forward to your response!

Sent via Craftified Marketplace`;

      window.location.href = `mailto:${currentProfile?.email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
      
      bookingSlate.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      return;
    }

    const preview = e.target.closest(".work-preview-item");
    const showcase = e.target.closest(".showcase-btn");
    
    if(preview || showcase) {
      const src = preview ? preview.src : showcase.dataset.workSrc;
      const title = preview ? preview.alt : showcase.dataset.workTitle;
      const owner = showcase ? showcase.dataset.workOwner : "";
      
      lightbox.querySelector(".lightbox-image").src = src;
      lightbox.querySelector(".lightbox-title").textContent = title;
      lightbox.querySelector(".lightbox-owner").textContent = owner;
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      return;
    }

    if(e.target.closest(".lightbox-close, .lightbox-backdrop")) { lightbox.classList.remove("is-open"); document.body.classList.remove("lightbox-open"); }
    if(e.target.closest(".slate-close, .slate-backdrop")) { bookingSlate.classList.remove("is-open"); document.body.classList.remove("lightbox-open"); }
  });

  // 6. ONBOARDING & CURSOR
  const onboarding = document.getElementById('onboardingOverlay');
  if(onboarding) {
    // Show on every reload as requested
    setTimeout(() => {
      onboarding.classList.add('active');
      document.body.style.overflow = 'hidden';
    }, 1200);
  }

  // Premium Smooth Antigravity Cursor
  let dot = document.getElementById("cursor-dot");
  let ring = document.getElementById("cursor-ring");
  
  if(!dot || !ring) {
    dot = document.createElement("div");
    dot.id = "cursor-dot";
    ring = document.createElement("div");
    ring.id = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
  }

  if(dot && ring) {
    dot.style.cssText = "position:fixed; width:8px; height:8px; background:var(--cursor-color, var(--accent)); border-radius:50%; z-index:100000; pointer-events:none; transition: transform 0.1s ease; transform: translate3d(-50%, -50%, 0);";
    ring.style.cssText = "position:fixed; width:36px; height:36px; border:2px solid var(--cursor-color, var(--accent)); border-radius:50%; z-index:99999; pointer-events:none; transition: width 0.3s ease, height 0.3s ease, background 0.3s ease, transform 0.15s ease-out; transform: translate3d(-50%, -50%, 0); opacity: 0.6;";
    let rx = 0, ry = 0, dx = -100, dy = -100;
    dot.style.transform = 'translate3d(-50%, -50%, 0)';
    ring.style.transform = 'translate3d(-50%, -50%, 0)';
    
    document.addEventListener("mousemove", (e) => {
      dx = e.clientX; 
      dy = e.clientY; 
      dot.style.left = dx + 'px'; 
      dot.style.top = dy + 'px'; 
    });
    
    (function loop(){ 
      rx += (dx - rx) * 0.15; 
      ry += (dy - ry) * 0.15; 
      ring.style.left = rx + 'px'; 
      ring.style.top = ry + 'px'; 
      requestAnimationFrame(loop); 
    })();

    const updateHover = () => {
      document.querySelectorAll("button, a, .profile-card, .market-card, .mentor-card, input, select").forEach(el => {
        el.onmouseenter = () => {
          ring.style.width = '52px';
          ring.style.height = '52px';
          ring.style.background = 'rgba(124,110,245,0.08)';
          ring.style.opacity = '1';
        };
        el.onmouseleave = () => {
          ring.style.width = '36px';
          ring.style.height = '36px';
          ring.style.background = 'transparent';
          ring.style.opacity = '0.6';
        };
      });
    };
    updateHover();
    new MutationObserver(updateHover).observe(document.body, { childList: true, subtree: true });
  }

  // 7. ENTRANCE ANIMATIONS & TILT
  document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll("section, .profile-card, .market-card").forEach(s => { s.classList.add("reveal-on-scroll"); observer.observe(s); });

    function initTilt() {
      document.querySelectorAll(".profile-card, .market-card, .mentor-card").forEach(card => {
        card.onmousemove = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width/2) / 12;
          const y = (e.clientY - r.top - r.height/2) / -12;
          card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.02, 1.02, 1.02)`;
        };
        card.onmouseleave = () => card.style.transform = `perspective(1000px) rotateY(0) rotateX(0) scale3d(1,1,1)`;
      });
    }
    initTilt();
    new MutationObserver(initTilt).observe(document.body, { childList: true, subtree: true });
  });

  // 8. NAVIGATION & UTILS
  const burger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('navMobileDropdown');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      burger.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !mobileNav.contains(e.target) && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        burger.textContent = '☰';
      }
    });
  }

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.style.opacity = window.scrollY > 300 ? '1' : '0';
      backToTop.style.pointerEvents = window.scrollY > 300 ? 'auto' : 'none';
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 9. FOOTER HELPERS
  const footer = document.querySelector(".site-footer-premium");
  if(footer && (userProfilesCount > 0 || userListingsCount > 0)) {
    const reset = document.createElement("button");
    reset.textContent = "Reset Demo Data";
    reset.style = "background:none; border:none; opacity:0.3; color:inherit; cursor:pointer; text-decoration:underline; font-size:12px; width:100%; margin-top:20px;";
    reset.onclick = () => { localStorage.clear(); location.reload(); };
    footer.appendChild(reset);
  }

  // 10. MARKETPLACE CONTACT LOGIC
  document.addEventListener('click', (e) => {
    if (e.target.dataset.bookItem !== undefined) {
      const idx = e.target.dataset.bookItem;
      const item = data.marketplace[idx] || userListingsRaw[idx - data.marketplace.length];
      if(!item) return;
      
      const btn = e.target;
      btn.textContent = "Request Sent ✓";
      btn.style.background = "#4CAF50";
      btn.style.color = "#fff";
      btn.disabled = true;
      
      // Visual feedback popup
      const toast = document.createElement('div');
      toast.className = "mkt-toast";
      toast.style = "position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:var(--accent); color:#fff; padding:12px 24px; border-radius:30px; font-weight:700; z-index:10000; box-shadow:0 10px 30px rgba(0,0,0,0.3); animation: slideUp 0.3s ease-out;";
      toast.textContent = `Notification sent to ${item.seller}!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        toast.style.transition = '0.4s';
        setTimeout(() => toast.remove(), 400);
      }, 2500);
    }
  });

})();
