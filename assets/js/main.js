(function () {
  const data = window.campusCircleData;
  const page = document.body.dataset.page;
  
  // SHARED USER DATA STATE
  const userProfilesRaw = (() => { try { return JSON.parse(localStorage.getItem('kk_user_profiles') || '[]'); } catch(e){ return []; } })();
  const userListingsRaw = (() => { try { return JSON.parse(localStorage.getItem('kk_user_listings') || '[]'); } catch(e){ return []; } })();
  
  const userProfilesCount = userProfilesRaw.length;
  const userListingsCount = userListingsRaw.length;
  
  const allProfiles = [...data.featuredProfiles, ...data.extraProfiles, ...userProfilesRaw];

  // 1. REUSABLE UI HELPERS
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

  function profileCard(profile) {
    let hobbyTags = (profile.hobbies || []).map(h => `<span class="tag">${h}</span>`).join("");
    let galleryHtml = '';
    if(profile.gallery && profile.gallery.length > 0){
      galleryHtml = `
        <div class="works-preview" style="display:flex; gap:8px; overflow-x:auto; margin: 12px 0; padding-bottom:6px; scrollbar-width: none;">
          ${profile.gallery.map(work => `
            <img src="${work.src}" alt="${work.title}" class="work-preview-item" style="width:90px; height:90px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid var(--border); cursor:zoom-in;">
          `).join("")}
        </div>
      `;
    }

    return `
    <div class="profile-card" data-profile-id="${profile.id}">
      <div>
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
            <img src="${profile.image || ''}" style="width:80px;height:80px;border-radius:50%;object-fit:cover; border:3px solid var(--accent); padding:3px; background:var(--surface);" alt="${profile.name}">
            <div>
              <h3 style="margin:0;font-size:20px;">${profile.name}</h3>
              <p style="margin:2px 0 0;font-size:14px;color:var(--text-secondary);">${profile.title}</p>
            </div>
          </div>
          <div style="background:var(--tag-bg); padding:12px; border-radius:14px; margin-bottom:16px;">
            <p style="margin:0; font-size:14px; opacity:0.9;">${profile.bio}</p>
          </div>
          ${galleryHtml}
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
            ${renderStars(profile.rating)}
            <span style="font-size:15px;font-weight:800;">${profile.rating || '5.0'}</span>
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
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
          <img src="${mentor.image}" style="width:84px; height:84px; border-radius:18px; object-fit:cover; border:2px solid var(--accent); padding:3px;" alt="${mentor.name}">
          <div style="flex:1; min-width:200px;">
            <div style="display:flex; justify-content:space-between;">
              <div>
                <h3 style="margin:0;">${mentor.name}</h3>
                <p style="color:var(--accent); font-weight:700;">${mentor.subject} • ${mentor.mode}</p>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:800;">${mentor.price}</div>
                <small style="opacity:0.6;">${mentor.freeOption}</small>
              </div>
            </div>
            <p style="margin:16px 0; opacity:0.9;">${mentor.description}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:16px;">
              <div>${renderStars(mentor.rating)}</div>
              <button class="button btn-primary" data-book-mentor="${index}">Book Session</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function marketplaceCard(item, index) {
    return `
      <article class="market-card" data-item-id="${index}">
        <img src="${item.image}" alt="${item.name}" style="width:100%; height:200px; object-fit:cover; border-radius:12px;">
        <h3 style="margin:12px 0 4px;">${item.name}</h3>
        <p style="font-size:14px; opacity:0.7; margin-bottom:12px;">${item.description}</p>
        <div class="market-meta">
          <span class="tag">${item.price}</span>
          ${item.alternate ? `<span class="tag">${item.alternate}</span>` : ''}
          <span class="tag">${item.size || 'N/A'}</span>
        </div>
        <p style="font-size:13px; font-weight:600; margin-top:8px;">Seller: ${item.seller}</p>
        <button class="button button-secondary" data-book-item="${index}" style="width:100%; margin-top:12px;">Contact Seller</button>
      </article>
    `;
  }

  // 2. PAGE SPECIFIC LOGIC
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
    const grid = document.getElementById("marketplaceCards");
    const catPills = document.querySelectorAll('.mkt-pill');
    const buyToggle = document.getElementById('buyToggle');
    const rentToggle = document.getElementById('rentToggle');
    const sortSelect = document.getElementById('sortSelect');

    const filterMarket = () => {
      const activeCat = document.querySelector('.mkt-pill.active')?.dataset.category || 'all';
      const showBuy = buyToggle?.checked ?? true;
      const showRent = rentToggle?.checked ?? true;
      const sortBy = sortSelect?.value || 'newest';

      let list = [...data.marketplace, ...userListingsRaw];
      list = list.filter(m => {
        const cMatch = (activeCat === 'all' || m.category === activeCat);
        const bMatch = showBuy && (m.buyPrice || m.price.toLowerCase().includes('buy'));
        const rMatch = showRent && (m.rentPrice || m.price.toLowerCase().includes('rent') || m.alternate.toLowerCase().includes('rent'));
        return cMatch && (bMatch || rMatch);
      });

      if (sortBy === 'low') list.sort((a,b) => (parseInt(a.price.match(/\d+/)) || 0) - (parseInt(b.price.match(/\d+/)) || 0));
      if (sortBy === 'high') list.sort((a,b) => (parseInt(b.price.match(/\d+/)) || 0) - (parseInt(a.price.match(/\d+/)) || 0));

      grid.innerHTML = list.length ? list.map((m, i) => marketplaceCard(m, [...data.marketplace, ...userListingsRaw].indexOf(m))).join("") : `<p style="text-align:center; padding:3rem;">No items found.</p>`;
    };

    catPills.forEach(p => p.addEventListener('click', () => {
      catPills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      filterMarket();
    }));
    [buyToggle, rentToggle, sortSelect].forEach(el => el?.addEventListener('change', filterMarket));
    if(grid) filterMarket();
  }

  // 3. GLOBAL UI COMPONENTS (MODALS & SLATES)
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

  const requestModal = document.createElement("div");
  requestModal.className = "request-modal";
  requestModal.innerHTML = `
    <button class="request-backdrop"></button>
    <div class="request-panel">
      <button class="request-close">×</button>
      <h2>Request Custom Order</h2>
      <form id="orderForm" style="display:flex; flex-direction:column; gap:16px; margin-top:20px;">
        <textarea id="orderDesc" placeholder="What do you need?" required style="min-height:100px; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary);"></textarea>
        <input type="date" id="orderDeadline" required style="padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary);">
        <input type="text" id="orderName" placeholder="E.g. Rohan Gupta" required style="padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary);">
        <input type="email" id="orderEmail" placeholder="E.g. rohan@gmail.com" required style="padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary);">
        <input type="text" id="orderBudget" readonly style="padding:12px; border-radius:12px; border:1.5px solid var(--accent); background:var(--surface); color:var(--accent); font-weight:800;">
        <button type="submit" class="button btn-primary" style="padding:16px;">Submit Request</button>
      </form>
    </div>`;
  document.body.appendChild(requestModal);

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

  // GLOBAL EVENTS
  document.addEventListener("click", (e) => {
    const bookP = e.target.closest("[data-book-profile]");
    if(bookP) { openBookingSlate(bookP.dataset.bookProfile); return; }

    const bookM = e.target.closest("[data-book-mentor]");
    if(bookM) {
      const m = data.mentors[bookM.dataset.bookMentor];
      window.location.href = `mailto:mentors@kalaakart.in?subject=Mentorship&body=Hi ${m.name}, I'm interested in ${m.subject} session.`;
      return;
    }

    const bookI = e.target.closest("[data-book-item]");
    if(bookI) {
      const list = [...data.marketplace, ...userListingsRaw];
      const i = list[bookI.dataset.bookItem];
      window.location.href = `mailto:${i.sellerContact || 'marketplace@kalaakart.in'}?subject=Marketplace inquiry: ${i.name}&body=Hi ${i.seller}, is this ${i.name} still available?`;
      return;
    }

    const reqBtn = e.target.closest(".slate-request-btn");
    if(reqBtn) {
      document.getElementById("orderBudget").value = bookingSlate.querySelector(".slider-value").textContent;
      requestModal.classList.add("is-open");
      return;
    }

    const preview = e.target.closest(".work-preview-item");
    if(preview) {
      lightbox.querySelector(".lightbox-image").src = preview.src;
      lightbox.querySelector(".lightbox-title").textContent = preview.alt;
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      return;
    }

    if(e.target.closest(".lightbox-close, .lightbox-backdrop")) { lightbox.classList.remove("is-open"); document.body.classList.remove("lightbox-open"); }
    if(e.target.closest(".slate-close, .slate-backdrop")) { bookingSlate.classList.remove("is-open"); document.body.classList.remove("lightbox-open"); }
    if(e.target.closest(".request-close, .request-backdrop")) { requestModal.classList.remove("is-open"); }
  });

  document.getElementById("orderForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const sub = `Custom Order Request for ${currentProfile?.name}`;
    const body = `Description: ${document.getElementById("orderDesc").value}\nDeadline: ${document.getElementById("orderDeadline").value}\nFrom: ${document.getElementById("orderName").value} (${document.getElementById("orderEmail").value})\nBudget: ${document.getElementById("orderBudget").value}`;
    window.location.href = `mailto:${currentProfile?.email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
  });

  // Premium Smooth Antigravity Cursor
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if(dot && ring) {
    let rx = 0, ry = 0, dx = -100, dy = -100;
    
    // Explicitly reset any transforms that may have been fighting the positioning
    dot.style.transform = 'translate(-50%, -50%)';
    ring.style.transform = 'translate(-50%, -50%)';
    
    document.addEventListener("mousemove", (e) => {
      dx = e.clientX; 
      dy = e.clientY; 
      dot.style.left = dx + 'px'; 
      dot.style.top = dy + 'px'; 
    });
    
    (function loop(){ 
      rx += (dx - rx) * 0.14; 
      ry += (dy - ry) * 0.14; 
      ring.style.left = rx + 'px'; 
      ring.style.top = ry + 'px'; 
      requestAnimationFrame(loop); 
    })();

    document.querySelectorAll("button, a, .profile-card, .market-card, .mentor-card, input, select").forEach(el => {
      el.addEventListener("mouseenter", () => {
        ring.style.width = '48px';
        ring.style.height = '48px';
        ring.style.background = 'rgba(124,110,245,0.05)';
        ring.style.opacity = '1';
      });
      el.addEventListener("mouseleave", () => {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.background = 'transparent';
        ring.style.opacity = '0.6';
      });
    });
  }
  // Entrance Animations & Tilt
  document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll("section, .profile-card, .market-card").forEach(s => { s.classList.add("reveal-on-scroll"); observer.observe(s); });

    function initTilt() {
      document.querySelectorAll(".profile-card, .market-card, .mentor-card").forEach(card => {
        card.onmousemove = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width/2) / 10;
          const y = (e.clientY - r.top - r.height/2) / -10;
          card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.02, 1.02, 1.02)`;
        };
        card.onmouseleave = () => card.style.transform = `perspective(1000px) rotateY(0) rotateX(0) scale3d(1,1,1)`;
      });
    }
    initTilt();
    new MutationObserver(initTilt).observe(document.body, { childList: true, subtree: true });
  });

  // Global Hamburger Navigation
  const burger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('navMobileDropdown');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
      burger.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        burger.textContent = '☰';
      });
    });
  }

  // Theme & Reset demo helper
  const footer = document.querySelector(".site-footer-premium");
  if(footer && (userProfilesCount > 0 || userListingsCount > 0)) {
    const reset = document.createElement("button");
    reset.textContent = "Reset Demo Data";
    reset.style = "background:none; border:none; opacity:0.3; color:inherit; cursor:pointer; text-decoration:underline; font-size:12px; width:100%; margin-top:20px;";
    reset.onclick = () => { localStorage.clear(); location.reload(); };
    footer.appendChild(reset);
  }

})();
