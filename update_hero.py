import re

html_hero = """
    <!-- NEW HERO SECTION -->
    <section class="hero-v3-container">
      <div id="hero-v3">
        <canvas id="hero-canvas"></canvas>
        <div class="hero-aurora"></div>
        
        <div class="hero-v3-content">
          <div class="hero-v3-eyebrow">NOW LIVE ON CAMPUS</div>
          <h1 class="hero-v3-headline">Connect. Create. <span class="highlight-purple">Support your campus.</span></h1>
          <p class="hero-v3-subheadline">A student-powered platform where skills, mentoring, and campus essentials meet.</p>
          <div class="hero-v3-actions">
            <a href="profiles.html" class="v3-btn v3-btn-primary">Explore Profiles</a>
            <a href="mentor-booking.html" class="v3-btn v3-btn-ghost">Book a Mentor</a>
          </div>
        </div>

        <div class="hero-v3-stats">
          <div class="v3-stat"><strong class="v3-counter" data-target="42">0</strong>+ <span>skills listed</span></div>
          <div class="v3-stat"><strong class="v3-counter" data-target="18">0</strong> <span>sessions booked</span></div>
          <div class="v3-stat"><strong class="v3-counter" data-target="27">0</strong> <span>mentors active</span></div>
        </div>

        <!-- Floating Tags -->
        <div class="v3-float-tag tag-1">✦ Painting</div>
        <div class="v3-float-tag tag-2">✦ Mentorship</div>
        <div class="v3-float-tag tag-3">✦ Resin Art</div>
        <div class="v3-float-tag tag-4">✦ Old Clothes</div>
        <div class="v3-float-tag tag-5">✦ Photography</div>
        <div class="v3-float-tag tag-6">✦ Calligraphy</div>

        <div id="v3-cursor" class="v3-custom-cursor">
          <div class="v3-cursor-dot"></div>
          <div class="v3-cursor-ring"></div>
        </div>
      </div>
    </section>

    <!-- RETAINED STUDENT WORK (migrated from old hero) -->
    <section class="container section section-dark" style="padding-top: 1rem;">
      <div class="section-heading inline-heading">
        <div>
          <span class="eyebrow">✦ STUDENT WORK</span>
          <h2>Top creative works and items recently added.</h2>
        </div>
      </div>
      <div class="showcase-grid">
        <div class="showcase-card">
          <a href="#" class="highlight-preview showcase-btn wa-cta" data-name="Campus Artist" data-service="Phone cover painting" data-price="₹249" style="display:block; text-decoration:none;">
            <img src="assets/images/works/Phonecoverpainting.jpeg" alt="Phone cover painting work" loading="lazy">
            <span class="showcase-price-pill">From ₹249</span>
            <span class="showcase-overlay">
              <strong>Phone cover painting</strong>
              <span class="overlay-sub">View Work →</span>
            </span>
          </a>
        </div>
        <div class="showcase-card">
          <a href="#" class="highlight-preview showcase-btn wa-cta" data-name="Campus Artist" data-service="Resin art keychains" data-price="₹199" style="display:block; text-decoration:none;">
            <img src="assets/images/works/Resinartkeychains.jpeg" alt="Resin art keychain work" loading="lazy">
            <span class="showcase-price-pill">From ₹199</span>
            <span class="showcase-overlay">
              <strong>Resin art keychains</strong>
              <span class="overlay-sub">View Work →</span>
            </span>
          </a>
        </div>
        <div class="showcase-card">
          <a href="#" class="highlight-preview showcase-btn wa-cta" data-name="Campus Artist" data-service="Handmade knitted gifts" data-price="₹199" style="display:block; text-decoration:none;">
            <img src="assets/images/works/Handmadeknittedgifts.jpeg" alt="Handmade knitted gift work" loading="lazy">
            <span class="showcase-price-pill">From ₹199</span>
            <span class="showcase-overlay">
              <strong>Handmade knitted gifts</strong>
              <span class="overlay-sub">View Work →</span>
            </span>
          </a>
        </div>
      </div>
    </section>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace <section class="hero-section">...</section> 
pattern = re.compile(r'<section class="hero-section">.*?</section>', re.DOTALL)
html = pattern.sub(html_hero, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html HTML")
