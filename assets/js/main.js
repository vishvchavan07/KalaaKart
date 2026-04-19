(function () {
  const data = window.campusCircleData;
  const page = document.body.dataset.page;

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
    let hobbyTags = '';
    if(profile.hobbies && Array.isArray(profile.hobbies)){
       hobbyTags = profile.hobbies.map(hobby => `<span class="tag">${hobby}</span>`).join("");
    }
    
    let galleryHtml = '';
    if(profile.gallery && Array.isArray(profile.gallery)){
      galleryHtml = `
        <div class="works-preview" style="display:flex; gap:8px; overflow-x:auto; margin: 12px 0; padding-bottom:6px; scrollbar-width: none;">
          ${profile.gallery.map(work => `
            <img src="${work.src}" alt="${work.title}" style="width:90px; height:90px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          `).join("")}
        </div>
      `;
    }

    return `
<div class="profile-card" data-profile-id="${profile.id}" style="display:flex; flex-direction:column; justify-content:space-between;">
  <div>
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
        <img src="${profile.image || ''}" style="width:80px;height:80px;border-radius:50%;object-fit:cover; border:3px solid var(--accent); padding:3px; background:var(--surface);" alt="${profile.name || ''}">
        <div>
          <h3 style="margin:0;font-size:20px;letter-spacing:-0.01em;">${profile.name || ''}</h3>
          <p style="margin:2px 0 0;font-size:14px;color:var(--text-secondary);">${profile.title || 'Student Profile'}</p>
        </div>
      </div>
      <div style="background:var(--tag-bg); padding:12px; border-radius:14px; margin-bottom:16px;">
        <p style="margin:0; font-size:14px; line-height:1.6; color:var(--text-primary); opacity:0.9;">${profile.bio || ''}</p>
      </div>
      
      ${galleryHtml.replace(/<img/g, '<img class="work-preview-item" style="cursor:zoom-in;"')}

      <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
        ${renderStars(profile.rating)}
        <span style="font-size:15px;font-weight:800;">${profile.rating || '5.0'}</span>
        <span style="font-size:13px;color:var(--text-secondary);">(${profile.reviews || 0} reviews)</span>
      </div>
  </div>
  <div class="card-bottom">
    <div class="card-tags" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
        ${hobbyTags}
    </div>
    <a href="#" class="button btn-primary wa-cta" data-name="${profile.name}" data-service="${profile.title}" data-price="${profile.price}" style="display:block; text-align:center; text-decoration:none; width:100%; padding:14px 20px; font-weight:700; border-radius:10px;">Book Now</a>
  </div>
</div>`;
  }

  function mentorCard(mentor, index) {
    return `
      <article class="mentor-card" data-mentor-id="${index}" style="background:var(--card-bg); border:1px solid var(--border); border-radius:24px; padding:24px; margin-bottom:20px; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display:flex; flex-direction:column; gap:20px; box-shadow:var(--shadow);">
        <div class="mentor-card-top" style="display:flex; gap:20px; align-items:start; flex-wrap:wrap;">
          <img src="${mentor.image}" style="width:84px; height:84px; border-radius:18px; object-fit:cover; border:2px solid var(--accent); background:var(--surface); padding:3px;" alt="${mentor.name}">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; justify-content:space-between; align-items:start; gap:12px;">
              <div>
                <h3 style="margin:0; font-size:1.4rem; color:var(--text-primary); font-weight:800; letter-spacing:-0.02em;">${mentor.name}</h3>
                <p style="margin:4px 0; font-size:1rem; color:var(--text-secondary); font-weight:600;">
                  <span style="color:var(--accent);">${mentor.subject}</span> • ${mentor.mode}
                </p>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">${mentor.price}</div>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">${mentor.freeOption}</div>
              </div>
            </div>
            
            <p style="margin:16px 0; font-size:1.05rem; line-height:1.6; color:var(--text-primary); opacity:0.9;">${mentor.description || ''}</p>
            
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:24px; flex-wrap:wrap; gap:16px; border-top:1px solid var(--border); padding-top:20px;">
              <div style="display:flex; align-items:center; gap:12px;">
                ${renderStars(mentor.rating)}
                <span style="font-weight:800; font-size:1.1rem; color:var(--text-primary);">${mentor.rating}</span>
                <span style="font-size:0.9rem; color:var(--text-secondary);">Expert Mentor</span>
              </div>
              <a href="#" class="button btn-primary wa-cta" data-name="${mentor.name}" data-service="${mentor.subject} Mentoring" data-price="${mentor.price}" style="display:block; text-align:center; text-decoration:none; padding:12px 32px; font-weight:700; border-radius:12px; font-size:1rem;">Book Session</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function marketplaceCard(item, index) {
    return `
      <article class="market-card" data-item-id="${index}">
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="market-meta">
          <span class="tag">${item.price}</span>
          <span class="tag">${item.alternate}</span>
          <span class="tag">${item.size}</span>
        </div>
        <p>${item.seller}</p>
        <a href="#" class="button button-secondary wa-cta" data-name="${item.seller}" data-service="${item.name}" data-price="${item.buyPrice ? 'Buy Rs '+item.buyPrice : 'Rent Rs '+item.rentPrice}" style="display:block; text-align:center; text-decoration:none; width:100%; margin-top:12px;">Contact Seller</a>
      </article>
    `;
  }

  if (page === "home") {
    const feat = document.getElementById("featuredProfiles");
    if (feat) feat.innerHTML = data.featuredProfiles.map(profileCard).join("");
  }

  // FIX: Profile filtering by hobby pill
  if (page === "profiles") {
    const allProfiles = [...data.featuredProfiles, ...data.extraProfiles];
    const allContainer = document.getElementById("allProfiles");
    function renderProfiles(filter) {
      const filtered = filter === "all"
        ? allProfiles
        : allProfiles.filter(p => p.hobbies && p.hobbies.some(h => h.toLowerCase().includes(filter.toLowerCase())));
      allContainer.innerHTML = filtered.length
        ? filtered.map(profileCard).join("")
        : `<p style="color:var(--text-secondary);grid-column:1/-1;text-align:center;padding:2rem;">No creators found for this filter.</p>`;
    }
    if (allContainer) renderProfiles("all");
    document.querySelectorAll(".filter-pill").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        renderProfiles(this.dataset.filter || "all");
      });
    });
  }

  // FIX: Mentor filtering by subject + free-only toggle
  if (page === "mentors") {
    const mentorContainer = document.getElementById("mentorCards");
    function renderMentors() {
      const activeFilter = (document.querySelector(".filter-pill.active") || {}).dataset && document.querySelector(".filter-pill.active").dataset.filter || "all";
      const freeOnly = document.getElementById("freeToggle") && document.getElementById("freeToggle").checked;
      let list = [...data.mentors];
      if (activeFilter !== "all") list = list.filter(m => m.subject && m.subject.toLowerCase().includes(activeFilter.toLowerCase()));
      if (freeOnly) list = list.filter(m => m.price.toLowerCase().includes("free") || (m.freeOption && m.freeOption.toLowerCase().includes("free")));
      mentorContainer.innerHTML = list.length
        ? list.map((m, i) => mentorCard(m, data.mentors.indexOf(m))).join("")
        : `<p style="color:var(--text-secondary);padding:2rem;text-align:center;">No mentors found for this filter.</p>`;
    }
    if (mentorContainer) renderMentors();
    document.querySelectorAll(".filter-pill").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        renderMentors();
      });
    });
    const freeToggle = document.getElementById("freeToggle");
    if (freeToggle) freeToggle.addEventListener("change", renderMentors);
  }

  // FIX: Marketplace: category filter + buy/rent toggle + sort dropdown
  if (page === "marketplace") {
    const marketContainer = document.getElementById("marketplaceCards");
    function renderMarket() {
      const activeCategory = (document.querySelector(".mkt-pill.active") || {}).dataset && document.querySelector(".mkt-pill.active").dataset.category || "all";
      const showBuy  = !document.getElementById("buyToggle")  || document.getElementById("buyToggle").checked;
      const showRent = !document.getElementById("rentToggle") || document.getElementById("rentToggle").checked;
      const sortVal  = document.getElementById("sortSelect") ? document.getElementById("sortSelect").value : "newest";

      let list = [...data.marketplace];
      // Category filter
      if (activeCategory !== "all") list = list.filter(m => m.category === activeCategory);
      // Buy/Rent filter
      if (!showBuy && showRent) list = list.filter(m => m.rentPrice);
      if (showBuy && !showRent) list = list.filter(m => m.buyPrice);
      if (!showBuy && !showRent) list = [];
      // Sort
      if (sortVal === "low")  list.sort((a, b) => (a.buyPrice || 9999) - (b.buyPrice || 9999));
      if (sortVal === "high") list.sort((a, b) => (b.buyPrice || 0) - (a.buyPrice || 0));
      // Render
      marketContainer.innerHTML = list.length
        ? list.map((m, i) => marketplaceCard(m, data.marketplace.indexOf(m))).join("")
        : `<p style="color:var(--text-secondary);padding:3rem;text-align:center;">No items match your filters.</p>`;
    }
    if (marketContainer) renderMarket();
    document.querySelectorAll(".mkt-pill").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".mkt-pill").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        renderMarket();
      });
    });
    ["buyToggle","rentToggle"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", renderMarket);
    });
    const sortSel = document.getElementById("sortSelect");
    if (sortSel) sortSel.addEventListener("change", renderMarket);
  }

  const lightbox = document.createElement("div");
  lightbox.className = "work-lightbox";
  lightbox.innerHTML = `
    <button class="lightbox-backdrop" type="button" aria-label="Close image preview"></button>
    <div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="Work preview">
      <button class="lightbox-close" type="button" aria-label="Close preview">×</button>
      <img class="lightbox-image" src="" alt="">
      <div class="lightbox-copy">
        <strong class="lightbox-title"></strong>
        <span class="lightbox-owner"></span>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxOwner = lightbox.querySelector(".lightbox-owner");

  const bookingSlate = document.createElement("div");
  bookingSlate.className = "booking-slate";
  bookingSlate.innerHTML = `
    <button class="slate-backdrop" type="button" aria-label="Close profile booking"></button>
    <section class="slate-panel" role="dialog" aria-modal="true" aria-label="Seller booking profile">
      <button class="slate-close" type="button" aria-label="Close profile booking">×</button>
      <div class="slate-grid">
        <div class="slate-media">
          <div class="slate-visual-container">
            <img class="slate-main-photo" src="" alt="">
            <div class="floating-crafts"></div>
            <div class="slate-rating-overlay"></div>
          </div>
        </div>
        <div class="slate-content">
          <span class="eyebrow">SELLER PROFILE</span>
          <h2 class="slate-name"></h2>
          <p class="slate-title" style="color:var(--accent); font-weight:700; font-size:1.1rem; margin: 4px 0 16px;"></p>
          <p class="slate-bio" style="line-height:1.6; opacity:0.9; margin-bottom:20px;"></p>
          <div class="slate-tags"></div>
          <div class="slate-contact">
            <div class="contact-item">
              <strong>GMAIL</strong>
              <a class="slate-email" href="#"></a>
            </div>
            <div class="contact-item">
              <strong>CAMPUS SPOT</strong>
              <span class="slate-location"></span>
            </div>
            <div class="contact-item">
              <strong>RESPONSE</strong>
              <span class="slate-response"></span>
            </div>
          </div>
          <div class="price-slider-card" style="background:var(--tag-bg); padding:20px; border-radius:16px; margin-top:24px; border:1px solid var(--border);">
            <div class="slider-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <strong style="font-size:0.95rem;">Select your budget</strong>
              <span class="slider-value" style="color:var(--accent); font-weight:800; font-size:1.2rem;"></span>
            </div>
            <input class="booking-range" type="range" style="width:100%; accent-color:var(--accent);">
            <div class="slider-scale" style="display:flex; justify-content:space-between; font-size:0.8rem; opacity:0.6; margin-top:8px;">
              <span class="slider-min"></span>
              <span class="slider-max"></span>
            </div>
          </div>
          <div class="slate-actions" style="margin-top:28px;">
            <a class="button btn-primary slate-mail-action" href="#" style="width:100%; padding:16px; font-weight:800; border-radius:12px; font-size:1.1rem;">Send Booking Request</a>
            <button class="button button-secondary slate-close-inline" type="button" style="width:100%; margin-top:12px; background:none; border:none; opacity:0.6; font-weight:600;">Maybe Later</button>
          </div>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(bookingSlate);

  const allProfiles = [...data.featuredProfiles, ...data.extraProfiles];
  const slateMainPhoto = bookingSlate.querySelector(".slate-main-photo");
  const floatingCrafts = bookingSlate.querySelector(".floating-crafts");
  const slateRatingOverlay = bookingSlate.querySelector(".slate-rating-overlay");
  const slateName = bookingSlate.querySelector(".slate-name");
  const slateTitle = bookingSlate.querySelector(".slate-title");
  const slateBio = bookingSlate.querySelector(".slate-bio");
  const slateTags = bookingSlate.querySelector(".slate-tags");
  const slateEmail = bookingSlate.querySelector(".slate-email");
  const slateLocation = bookingSlate.querySelector(".slate-location");
  const slateResponse = bookingSlate.querySelector(".slate-response");
  const bookingRange = bookingSlate.querySelector(".booking-range");
  const sliderValue = bookingSlate.querySelector(".slider-value");
  const sliderMin = bookingSlate.querySelector(".slider-min");
  const sliderMax = bookingSlate.querySelector(".slider-max");
  const slateMailAction = bookingSlate.querySelector(".slate-mail-action");

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  function closeBookingSlate() {
    bookingSlate.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  function updateBookingPrice(profile) {
    const value = Number(bookingRange.value);
    sliderValue.textContent = `Rs ${value}`;
    slateMailAction.href = `mailto:${profile.email}?subject=Kalaa Kart booking request for ${encodeURIComponent(profile.name)}&body=Hi ${encodeURIComponent(profile.name)},%0D%0AI want to book your ${encodeURIComponent(profile.title)} service.%0D%0AMy selected budget is Rs ${value}.%0D%0A%0D%0APlease share your availability.`;
  }

  function openBookingSlate(profileId) {
    const profile = allProfiles.find((item) => item.id === profileId);
    if (!profile) return;

    slateMainPhoto.src = profile.image;
    slateMainPhoto.alt = `${profile.name} portrait`;
    
    // Fill floating crafts
    if (profile.gallery) {
      floatingCrafts.innerHTML = profile.gallery.map((work, idx) => `
        <div class="floating-item item-${idx}" style="--delay:${idx * 0.2}s">
          <img src="${work.src}" alt="${work.title}">
        </div>
      `).join("");
    } else {
      floatingCrafts.innerHTML = '';
    }

    slateRatingOverlay.innerHTML = `${renderStars(profile.rating)} <span style="font-weight:700;">${profile.rating}</span> • ${profile.reviews} reviews`;
    
    slateName.textContent = profile.name;
    slateTitle.textContent = profile.title;
    slateBio.textContent = profile.bio;
    slateTags.innerHTML = profile.hobbies.map((hobby) => `<span class="tag">${hobby}</span>`).join("");
    slateEmail.textContent = profile.email;
    slateEmail.href = `mailto:${profile.email}`;
    slateLocation.textContent = profile.location;
    slateResponse.textContent = profile.responseTime;
    bookingRange.min = profile.priceRange.min;
    bookingRange.max = profile.priceRange.max;
    bookingRange.step = profile.priceRange.step;
    bookingRange.value = profile.priceRange.defaultValue;
    sliderMin.textContent = `Rs ${profile.priceRange.min}`;
    sliderMax.textContent = `Rs ${profile.priceRange.max}`;
    bookingRange.oninput = () => updateBookingPrice(profile);
    updateBookingPrice(profile);
    bookingSlate.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".gallery-item, .work-preview-item");
    if (trigger) {
      if (trigger.classList.contains("work-preview-item")) {
        // Find profile to get work details if possible, or just use img src
        lightboxImage.src = trigger.src;
        lightboxImage.alt = trigger.alt;
        lightboxTitle.textContent = trigger.alt;
        // Find seller name
        const pCard = trigger.closest(".profile-card");
        if (pCard) lightboxOwner.textContent = `by ${pCard.querySelector("h3").textContent}`;
      } else {
        lightboxImage.src = trigger.dataset.workSrc;
        lightboxImage.alt = trigger.dataset.workTitle;
        lightboxTitle.textContent = trigger.dataset.workTitle;
        lightboxOwner.textContent = trigger.dataset.workOwner;
      }
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      return;
    }

    const bookProfileButton = event.target.closest("[data-book-profile]");
    if (bookProfileButton) {
      event.stopPropagation();
      openBookingSlate(bookProfileButton.dataset.bookProfile);
      return;
    }

    const bookMentorButton = event.target.closest("[data-book-mentor]");
    if (bookMentorButton) {
      const mentor = data.mentors[bookMentorButton.dataset.bookMentor];
      const mailto = `mailto:mentors@kalaakart.in?subject=Mentorship Request: ${encodeURIComponent(mentor.subject)}&body=Hi ${encodeURIComponent(mentor.name)},%0D%0AI want to book a mentorship session for ${encodeURIComponent(mentor.subject)}.%0D%0AI saw your profile on Kalaa Kart.%0D%0APlease let me know your availability for an ${encodeURIComponent(mentor.mode)} session.`;
      window.location.href = mailto;
      return;
    }

    const bookItemButton = event.target.closest("[data-book-item]");
    if (bookItemButton) {
      const item = data.marketplace[bookItemButton.dataset.bookItem];
      const mailto = `mailto:marketplace@kalaakart.in?subject=Marketplace Inquiry: ${encodeURIComponent(item.name)}&body=Hi,%0D%0AI am interested in the ${encodeURIComponent(item.name)} listed on Kalaa Kart.%0D%0ADescription: ${encodeURIComponent(item.description)}%0D%0AIs this still available for ${encodeURIComponent(item.price)}?`;
      window.location.href = mailto;
      return;
    }

    const profileCardTrigger = event.target.closest(".profile-card");
    if (profileCardTrigger && !event.target.closest("button, a, input")) {
      openBookingSlate(profileCardTrigger.dataset.profileId);
      return;
    }

    if (event.target.closest(".lightbox-close") || event.target.classList.contains("lightbox-backdrop")) {
      closeLightbox();
    }

    if (event.target.closest(".slate-close") || event.target.closest(".slate-close-inline") || event.target.classList.contains("slate-backdrop")) {
      closeBookingSlate();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      closeBookingSlate();
    }

    const focusedCard = event.target.closest(".profile-card");
    if (focusedCard && event.target === focusedCard && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openBookingSlate(focusedCard.dataset.profileId);
    }
  });

  // --- FILTERING & SORTING LOGIC ---
  if (page === "mentors") {
    const subjectPills = document.querySelectorAll('.filter-pill');
    const freeToggle = document.getElementById('freeToggle');
    const grid = document.getElementById('mentorCards');

    const filterMentors = () => {
      const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter || 'all';
      const freeOnly = freeToggle?.checked || false;

      grid.innerHTML = data.mentors
        .map((m, i) => ({ ...m, index: i }))
        .filter(m => (activeFilter === 'all' || m.subject === activeFilter))
        .filter(m => (freeOnly ? m.price.toLowerCase().includes('free') : true))
        .map(m => mentorCard(m, m.index))
        .join("");
    };

    subjectPills.forEach(pill => {
      pill.addEventListener('click', () => {
        subjectPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterMentors();
      });
    });
    freeToggle?.addEventListener('change', filterMentors);
    filterMentors(); // Initial render
  }

  if (page === "marketplace") {
    const categoryPills = document.querySelectorAll('.mkt-pill');
    const buyToggle = document.getElementById('buyToggle');
    const rentToggle = document.getElementById('rentToggle');
    const sortSelect = document.getElementById('sortSelect');
    const grid = document.getElementById('marketplaceCards');

    const filterMarketplace = () => {
      const activeCat = document.querySelector('.mkt-pill.active')?.dataset.category || 'all';
      const showBuy = buyToggle?.checked || false;
      const showRent = rentToggle?.checked || false;
      const sortBy = sortSelect?.value || 'newest';

      let items = data.marketplace.map((m, i) => ({ ...m, index: i }));
      
      // Filter
      items = items.filter(m => {
        const catMatch = (activeCat === 'all'); // Add complex category logic if data structure allows
        const buyMatch = showBuy && m.price.toLowerCase().includes('buy');
        const rentMatch = showRent && m.alternate.toLowerCase().includes('rent');
        return catMatch && (buyMatch || rentMatch);
      });

      // Sort
      if (sortBy === 'low' || sortBy === 'high') {
        items.sort((a, b) => {
          const getP = (s) => parseInt(s.match(/\d+/)?.[0] || 0);
          const priceA = getP(a.price);
          const priceB = getP(b.price);
          return sortBy === 'low' ? priceA - priceB : priceB - priceA;
        });
      }

      grid.innerHTML = items.map(m => marketplaceCard(m, m.index)).join("");
    };

    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterMarketplace();
      });
    });
    [buyToggle, rentToggle, sortSelect].forEach(el => el?.addEventListener('change', filterMarketplace));
    filterMarketplace(); // Initial render
  }

  if (page === "profiles") {
    const pills = document.querySelectorAll('.filter-pill');
    const grid = document.getElementById('allProfiles');

    const filterProfiles = () => {
      const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter || 'all';
      const allData = [...data.featuredProfiles, ...data.extraProfiles];
      
      grid.innerHTML = allData
        .filter(p => (activeFilter === 'all' || p.title.toLowerCase().includes(activeFilter.toLowerCase()) || p.hobbies.some(h => h.toLowerCase().includes(activeFilter.toLowerCase()))))
        .map(p => profileCard(p))
        .join("");
    };

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterProfiles();
      });
    });
    filterProfiles(); // Initial render
  }
})();


// --- ANTIGRAVITY CUSTOM JS ---

const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
if(cursorDot && cursorRing) {
  let ringX = 0, ringY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
  });

  function animateRing() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .profile-card, .tag, .mkt-pill').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width = '54px';
      cursorRing.style.height = '54px';
      cursorRing.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.opacity = '0.6';
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kk-theme', theme);
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

window.setTheme = setTheme; // export to global for onclick to hit
window.toggleThemePanel = function() {
  const p = document.getElementById('theme-panel');
  if(p) p.classList.toggle('open');
};

const savedLocalTheme = localStorage.getItem('kk-theme') || 'dark-cold';
setTheme(savedLocalTheme);


  // WA.ME GENERATOR
  function buildWALink(name, service, price) {
    const msg = encodeURIComponent(
      `Hi ${name}! I found you on Kalaa Kart.\n` +
      `I'm interested in: ${service}\n` +
      `Quoted price: ${price}\n` +
      `Can we connect?`
    );
    return `https://wa.me/919999999999?text=${msg}`;
  }

  function initWACtas() {
    document.querySelectorAll('.wa-cta').forEach(btn => {
      let card = btn.closest('.profile-card, .mentor-card, .market-card, .showcase-card') || btn;
      let name = card.getAttribute('data-name') || btn.getAttribute('data-name') || 'Creator';
      let service = card.getAttribute('data-service') || btn.getAttribute('data-service') || 'Your Service';
      let price = card.getAttribute('data-price') || btn.getAttribute('data-price') || 'Discussed price';
      
      if (btn.tagName.toLowerCase() === 'a') {
        btn.href = buildWALink(name, service, price);
        btn.target = "_blank";
        btn.rel = "noopener";
      } else {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(buildWALink(name, service, price), '_blank');
        });
      }
    });
  }
  
  // Call initWACtas periodically to catch dynamic renders or just hook into render functions
  // Actually, we'll override the render functions to call initWACtas
  const origRenderMentors = window.renderMentors;
  const origRenderMarket = window.renderMarket;
  const origRenderProfiles = window.renderProfiles;
  
  // Simple listener for dynamic changes
  const observer = new MutationObserver((mutations) => {
      initWACtas();
  });
  observer.observe(document.body, { childList: true, subtree: true });
