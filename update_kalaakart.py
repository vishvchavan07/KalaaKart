import re
import os

html_files = ["index.html", "profiles.html", "mentor-booking.html", "marketplace.html"]

########################################
# 1. UPDATE CSS (styles.css)
########################################
with open("assets/css/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

# Instead of relying on complex regex matching for old themes, I will 
# simply append the overrides and forcefully overwrite previous rules.
# This ensures pixel-perfect compliance with the provided prompt.

css_append = """
/* ==========================================================================
   ANTIGRAVITY PROMPT OVERRIDES
   ========================================================================== */

/* PROBLEM 1: NAVBAR ALIGNMENT */
nav, .navbar, header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 48px !important;
  height: 68px !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 1000 !important;
  backdrop-filter: blur(14px) !important;
  border-bottom: 1px solid var(--border) !important;
  background: var(--nav-bg) !important;
}

.nav-brand {
  display: flex !important;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.nav-brand img {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  object-fit: cover;
}

.nav-brand span {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  white-space: nowrap;
}

.nav-links {
  display: flex !important;
  align-items: center !important;
  gap: 36px !important;
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.nav-links a {
  font-size: 15px !important;
  font-weight: 500 !important;
  color: var(--text-secondary) !important;
  text-decoration: none !important;
  transition: color 0.2s !important;
  position: relative !important;
  padding-bottom: 4px !important;
  border-bottom: none !important;
}

.nav-links a.active::after,
.nav-links a:hover::after {
  content: '' !important;
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 2px !important;
  background: var(--accent) !important;
  border-radius: 2px !important;
  transform: none !important;
}

/* Hide hamburger on desktop */
.nav-hamburger {
  display: none !important;
}

@media (max-width: 768px) {
  .nav-links { display: none !important; }
  .nav-hamburger { display: block !important; }
  nav, .navbar, header { padding: 0 20px !important; }
}

/* PROBLEM 2: PROFILE CARDS ALIGNMENT */
.profiles-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
  gap: 28px !important;
  padding: 0 48px 64px !important;
  max-width: 1200px !important;
  margin: 0 auto !important;
}

.profile-card {
  border-radius: 18px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.10) !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease !important;
  background: var(--card-bg) !important;
  border: none !important;
  padding: 0 !important;
}

.profile-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important;
}

.card-top {
  background: var(--card-top-bg) !important;
  padding: 24px 20px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 12px !important;
  position: relative !important;
}

.card-avatar {
  width: 64px !important;
  height: 64px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 3px solid var(--accent) !important;
}

.card-name {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--card-top-text) !important;
  margin: 0 !important;
  line-height: 1.3 !important;
}

.card-role {
  font-size: 13px !important;
  color: var(--card-top-muted) !important;
  margin: 0 !important;
}

.card-offer {
  background: rgba(255,255,255,0.08) !important;
  border-radius: 12px !important;
  padding: 10px 14px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.offer-text {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--accent) !important;
  line-height: 1.4 !important;
}

.card-rating {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex-wrap: nowrap !important;
}

.stars { color: #F5A623 !important; font-size: 14px !important; letter-spacing: 1px !important; }
.score { font-size: 14px !important; font-weight: 700 !important; color: var(--card-top-text) !important; }
.reviews { font-size: 13px !important; color: var(--card-top-muted) !important; }

.card-bottom {
  padding: 20px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
}

.card-bio {
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: var(--text-secondary) !important;
  margin: 0 !important;
}

.card-tags {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}

.card-tags .tag {
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 4px 12px !important;
  border-radius: 20px !important;
  background: var(--tag-bg) !important;
  color: var(--tag-text) !important;
}

.btn-primary {
  display: block !important;
  width: 100% !important;
  padding: 12px !important;
  border-radius: 10px !important;
  text-align: center !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  background: var(--accent) !important;
  color: #fff !important;
  text-decoration: none !important;
  transition: opacity 0.2s !important;
  height: auto !important;
}

.btn-primary:hover { opacity: 0.88 !important; }

/* PROBLEM 3: THEME SYSTEM — COMPLETE OVERHAUL */
:root, [data-theme="dark-cold"] {
  --bg:             #0D0F1A !important;
  --surface:        #13162A !important;
  --nav-bg:         rgba(13,15,26,0.85) !important;
  --card-bg:        #181C35 !important;
  --card-top-bg:    #1E2340 !important;
  --card-top-text:  #E8EAFF !important;
  --card-top-muted: #8890C4 !important;
  --text-primary:   #E8EAFF !important;
  --text-secondary: #9AA0CC !important;
  --accent:         #7C6EF5 !important;
  --accent-hover:   #9B8FF9 !important;
  --border:         rgba(124,110,245,0.18) !important;
  --tag-bg:         rgba(124,110,245,0.15) !important;
  --tag-text:       #A99BFF !important;
  --btn-text:       #ffffff !important;
  --cursor-color:   #7C6EF5 !important;
  --shadow:         0 4px 24px rgba(124,110,245,0.15) !important;
}

[data-theme="dark-warm"] {
  --bg:             #120A05 !important;
  --surface:        #1C1108 !important;
  --nav-bg:         rgba(18,10,5,0.88) !important;
  --card-bg:        #231508 !important;
  --card-top-bg:    #3B1F0A !important;
  --card-top-text:  #FFE8CC !important;
  --card-top-muted: #C49A6A !important;
  --text-primary:   #FFE8CC !important;
  --text-secondary: #BF8D5A !important;
  --accent:         #E8832A !important;
  --accent-hover:   #F5A050 !important;
  --border:         rgba(232,131,42,0.20) !important;
  --tag-bg:         rgba(232,131,42,0.14) !important;
  --tag-text:       #FFBA78 !important;
  --btn-text:       #ffffff !important;
  --cursor-color:   #E8832A !important;
  --shadow:         0 4px 24px rgba(232,131,42,0.18) !important;
}

[data-theme="light-pro"] {
  --bg:             #F7F8FC !important;
  --surface:        #FFFFFF !important;
  --nav-bg:         rgba(247,248,252,0.92) !important;
  --card-bg:        #FFFFFF !important;
  --card-top-bg:    #1A1A2E !important;
  --card-top-text:  #F0F0FF !important;
  --card-top-muted: #9090BB !important;
  --text-primary:   #1A1A2E !important;
  --text-secondary: #555577 !important;
  --accent:         #5046E5 !important;
  --accent-hover:   #6B5FF7 !important;
  --border:         rgba(80,70,229,0.14) !important;
  --tag-bg:         rgba(80,70,229,0.08) !important;
  --tag-text:       #5046E5 !important;
  --btn-text:       #ffffff !important;
  --cursor-color:   #5046E5 !important;
  --shadow:         0 4px 20px rgba(0,0,0,0.08) !important;
}

body {
  background: var(--bg) !important;
  color: var(--text-primary) !important;
  transition: background 0.35s ease, color 0.35s ease !important;
  cursor: none !important;
}

/* CUSTOM CURSOR */
#cursor-dot {
  position: fixed;
  width: 8px;
  height: 8px;
  background: var(--cursor-color);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: background 0.3s;
}

#cursor-ring {
  position: fixed;
  width: 36px;
  height: 36px;
  border: 2px solid var(--cursor-color);
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transform: translate(-50%, -50%);
  transition: width 0.2s, height 0.2s, border-color 0.3s;
  opacity: 0.6;
}

body:hover #cursor-ring { opacity: 1; }
a:hover ~ #cursor-ring, button:hover ~ #cursor-ring { width: 52px; height: 52px; }

/* THEME SWITCHER */
#theme-switcher {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9000;
}
.theme-toggle-btn {
  background: var(--accent) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 50px !important;
  padding: 10px 18px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  cursor: none !important;
  box-shadow: var(--shadow) !important;
  transition: transform 0.2s !important;
  height: auto !important;
}
.theme-toggle-btn:hover { transform: scale(1.05) !important; }

.theme-panel {
  display: none;
  flex-direction: column;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: var(--shadow);
}
.theme-panel.open { display: flex; }

.theme-opt {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  background: none !important;
  border: 1px solid transparent !important;
  border-radius: 10px !important;
  padding: 8px 12px !important;
  cursor: none !important;
  color: var(--text-primary) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: border-color 0.2s, background 0.2s !important;
  text-align: left !important;
  height: auto !important;
}
.theme-opt:hover, .theme-opt.active {
  border-color: var(--accent) !important;
  background: var(--tag-bg) !important;
}
.theme-opt.active::after {
  content: '✓' !important;
  margin-left: auto !important;
  color: var(--accent) !important;
  font-weight: 700 !important;
}

.theme-swatch {
  width: 28px !important;
  height: 28px !important;
  border-radius: 8px !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
}

/* Ensure padding per request */
section.container {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 0 48px !important;
}
@media (max-width: 768px) {
  section.container { padding: 0 16px !important; }
}
"""

with open("assets/css/styles.css", "a", encoding="utf-8") as f:
    f.write(css_append)


########################################
# 2. UPDATE JS (main.js)
########################################
with open("assets/js/main.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# Update profileCard function logic using simple string replacement:
# We just replace the entire profileCard return block.
js_new_profile_func = """function profileCard(profile) {
    let hobbyTags = '';
    if(profile.hobbies && Array.isArray(profile.hobbies)){
       hobbyTags = profile.hobbies.map(hobby => `<span class="tag">${hobby}</span>`).join("");
    }
    return `
<div class="profile-card">
  <div class="card-top">
    <img class="card-avatar" src="${profile.image || ''}" alt="${profile.name || ''}">
    <div class="card-meta">
      <h3 class="card-name">${profile.name || ''}</h3>
      <p class="card-role">${profile.title || 'Student Profile'}</p>
    </div>
    <div class="card-offer">
      <span class="offer-text">${profile.bio || 'General Consultation'}</span>
    </div>
    <div class="card-rating">
      <span class="stars">${"★".repeat(Math.round(Number(profile.rating || 5)))}${"☆".repeat(5-Math.round(Number(profile.rating || 5)))}</span>
      <span class="score">${profile.rating || '5.0'}</span>
      <span class="reviews">${profile.reviews || 0} reviews</span>
    </div>
  </div>
  <div class="card-bottom">
    <p class="card-bio">${profile.note || 'Creative student offering services on campus.'}</p>
    <div class="card-tags">
      ${hobbyTags}
    </div>
    <a href="mentor-booking.html" class="btn-primary">Book Now</a>
  </div>
</div>`;
  }"""
js_content = re.sub(r'function profileCard\(profile\)\s*\{[\s\S]*?(?=\bfunction mentorCard|\bfunction marketplaceCard)', js_new_profile_func + "\n\n  ", js_content)

# Append theme & cursor logic at the end
js_cursor_theme = """
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
"""
with open("assets/js/main.js", "w", encoding="utf-8") as f:
    f.write(js_content + "\n" + js_cursor_theme)


########################################
# 3. UPDATE HTML FILES
########################################
navbar_html = """  <header class="navbar">
    <a class="nav-brand" href="index.html">
        <img src="assets/images/main_logo_final.jpeg" alt="Logo">
        <span>Kalaa Kart</span>
    </a>
    <button class="nav-hamburger" id="navHamburger">☰</button>
    <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="profiles.html">Profiles</a>
        <a href="mentor-booking.html">Mentor Booking</a>
        <a href="marketplace.html">Old Clothes</a>
    </div>
  </header>"""

cursor_theme_html = """  <div id="cursor-dot"></div>
  <div id="cursor-ring"></div>
  <div id="theme-switcher">
    <button class="theme-toggle-btn" onclick="toggleThemePanel()">🎨 Theme</button>
    <div class="theme-panel" id="theme-panel">
      <button class="theme-opt" data-theme="dark-cold" onclick="setTheme('dark-cold')">
        <span class="theme-swatch" style="background:linear-gradient(135deg,#0D0F1A,#7C6EF5)"></span>
        Dark Cold
      </button>
      <button class="theme-opt" data-theme="dark-warm" onclick="setTheme('dark-warm')">
        <span class="theme-swatch" style="background:linear-gradient(135deg,#120A05,#E8832A)"></span>
        Dark Warm
      </button>
      <button class="theme-opt" data-theme="light-pro" onclick="setTheme('light-pro')">
        <span class="theme-swatch" style="background:linear-gradient(135deg,#F7F8FC,#5046E5)"></span>
        Light Pro
      </button>
    </div>
  </div>
"""

for fname in html_files:
    with open(fname, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace <header> to </header> matching site-header
    # Need to be robust across different files
    html = re.sub(r'<header[^>]*>.*?<\/header>', navbar_html, html, flags=re.DOTALL)

    # Inject cursor/theme UI right after <body ...>
    if '<div id="cursor-dot">' not in html:
        html = re.sub(r'(<body[^>]*>)', r'\1\n' + cursor_theme_html, html)

    # Ensure init script defaults to dark-cold instead of warm
    html = re.sub(r"localStorage\.getItem\('kk-theme'\) \|\| 'warm'", "localStorage.getItem('kk-theme') || 'dark-cold'", html)

    with open(fname, "w", encoding="utf-8") as f:
        f.write(html)

print("PYTHON DOM/CSS MANIPULATION SUCCESSFUL.")
