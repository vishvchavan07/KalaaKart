(function () {
  const data = window.campusCircleData;
  const page = document.body.dataset.page;

      function renderStars(rating) {
    const rounded = Math.round(Number(rating));
    return `<span class="star" style="color:#F5A623 !important;">★</span>`.repeat(rounded) + `<span class="star-empty" style="color:#ccc !important;">☆</span>`.repeat(5 - rounded);
  }  function profileCard(profile) {
    let hobbyTags = '';
    if(profile.hobbies && Array.isArray(profile.hobbies)){
       hobbyTags = profile.hobbies.map(hobby => `<span class="tag">${hobby}</span>`).join("");
    }
    return `
<div class="profile-card" data-profile-id="${profile.id}" style="display:flex; flex-direction:column; justify-content:space-between;">
  <div>
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <img src="${profile.image || ''}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;" alt="${profile.name || ''}">
        <div>
          <h3 style="margin:0;font-size:18px;">${profile.name || ''}</h3>
          <p style="margin:0;font-size:13px;color:var(--text-secondary);">${profile.title || 'Student Profile'}</p>
        </div>
      </div>
      <div style="background:var(--tag-bg); padding:10px; border-radius:8px; margin-bottom:12px;">
        <span style="font-size:14px;color:var(--text-primary);display:block;">${profile.bio || 'Creative student offering services on campus.'}</span>
      </div>
      <div style="display:flex; align-items:center; gap:6px; white-space:nowrap; margin-bottom:16px;">
        ${renderStars(profile.rating || 5)}
        <span style="font-size:14px;font-weight:600;margin-left:4px;">${profile.rating || '5.0'}</span>
        <span style="font-size:13px;color:var(--text-secondary);">(${profile.reviews || 0})</span>
      </div>
  </div>
  <div class="card-bottom">
    <div class="card-tags" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        ${hobbyTags}
    </div>
    <button class="button btn-primary" data-book-profile="${profile.id}" style="width:100%;">Book Now</button>
  </div>
</div>`;
  }

  function mentorCard(mentor, index) {
    return `
      <article class="mentor-card" data-mentor-id="${index}">
        <img class="mentor-avatar" src="${mentor.image}" alt="${mentor.name} mentor photo">
        <div>
          <h3>${mentor.name}</h3>
          <p><strong>${mentor.subject}</strong> • ${mentor.mode}</p>
          <p>${mentor.description}</p>
          <div class="tag-row">
            <span class="tag">${mentor.price}</span>
            <span class="tag">${mentor.freeOption}</span>
            <span class="tag">${renderStars(mentor.rating)} ${mentor.rating}</span>
          </div>
        </div>
        <div class="mentor-actions">
          <span class="status-pill">${mentor.price}</span>
          <button class="button button-primary" data-book-mentor="${index}">Book session</button>
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
        <button class="button button-secondary" data-book-item="${index}" style="width:100%; margin-top:12px;">View details</button>
      </article>
    `;
  }

  if (page === "home") {
    const feat = document.getElementById("featuredProfiles");
    if (feat) {
      feat.innerHTML = data.featuredProfiles.map(profileCard).join("");
    }
  }

  if (page === "profiles") {
    const allProfiles = [...data.featuredProfiles, ...data.extraProfiles];
    const allContainer = document.getElementById("allProfiles");
    if (allContainer) {
      allContainer.innerHTML = allProfiles.map(profileCard).join("");
    }
  }

  if (page === "mentors") {
    const mentorContainer = document.getElementById("mentorCards");
    if (mentorContainer) {
      mentorContainer.innerHTML = data.mentors.map((m, i) => mentorCard(m, i)).join("");
    }
  }

  if (page === "marketplace") {
    const marketContainer = document.getElementById("marketplaceCards");
    if (marketContainer) {
      marketContainer.innerHTML = data.marketplace.map((m, i) => marketplaceCard(m, i)).join("");
    }
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
          <img class="slate-photo" src="" alt="">
          <div class="slate-rating"></div>
        </div>
        <div class="slate-content">
          <span class="eyebrow">Seller Profile</span>
          <h2 class="slate-name"></h2>
          <p class="slate-title"></p>
          <p class="slate-bio"></p>
          <div class="slate-tags"></div>
          <div class="slate-contact">
            <div>
              <strong>Gmail</strong>
              <a class="slate-email" href="#"></a>
            </div>
            <div>
              <strong>Campus spot</strong>
              <span class="slate-location"></span>
            </div>
            <div>
              <strong>Response</strong>
              <span class="slate-response"></span>
            </div>
          </div>
          <div class="price-slider-card">
            <div class="slider-top">
              <strong>Select your budget</strong>
              <span class="slider-value"></span>
            </div>
            <input class="booking-range" type="range">
            <div class="slider-scale">
              <span class="slider-min"></span>
              <span class="slider-max"></span>
            </div>
          </div>
          <div class="slate-actions">
            <a class="button button-primary slate-mail-action" href="#">Send Booking Request</a>
            <button class="button button-secondary slate-close-inline" type="button">Maybe Later</button>
          </div>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(bookingSlate);

  const allProfiles = [...data.featuredProfiles, ...data.extraProfiles];
  const slatePhoto = bookingSlate.querySelector(".slate-photo");
  const slateRating = bookingSlate.querySelector(".slate-rating");
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

    slatePhoto.src = profile.image;
    slatePhoto.alt = `${profile.name} profile photo`;
    slateRating.textContent = `${renderStars(profile.rating)} ${profile.rating} • ${profile.reviews} reviews`;
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
    const trigger = event.target.closest(".gallery-item");
    if (trigger) {
      lightboxImage.src = trigger.dataset.workSrc;
      lightboxImage.alt = trigger.dataset.workTitle;
      lightboxTitle.textContent = trigger.dataset.workTitle;
      lightboxOwner.textContent = trigger.dataset.workOwner;
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
