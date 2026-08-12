import re
import glob

# 1. Fix main.js
with open('assets/js/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix renderStars
js = re.sub(
    r'function renderStars\(rating\) \{.*?\}\$\{"☆"\.repeat\(5 - rounded\)\}`;.*?\n\s*\}',
    '''  function renderStars(rating) {
    const rounded = Math.round(Number(rating));
    return `<span class="star" style="color:#F5A623 !important;">★</span>`.repeat(rounded) + `<span class="star-empty" style="color:#ccc !important;">☆</span>`.repeat(5 - rounded);
  }''',
    js,
    flags=re.DOTALL
)

# Fix profileCard
new_profile_card = '''  function profileCard(profile) {
    let hobbyTags = '';
    if(profile.hobbies && Array.isArray(profile.hobbies)){
       hobbyTags = profile.hobbies.map(hobby => `<span class="tag">${hobby}</span>`).join("");
    }
    return `
<div class="profile-card" style="display:flex; flex-direction:column; justify-content:space-between;">
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
    <a href="mentor-booking.html" class="button btn-primary" style="width:100%;">Book Now</a>
  </div>
</div>`;
  }'''

js = re.sub(r'function profileCard\(profile\) \{.*?(?=  function mentorCard)', new_profile_card + '\n\n', js, flags=re.DOTALL)

with open('assets/js/main.js', 'w', encoding='utf-8') as f:
    f.write(js)

# 2. Append CSS fixes
css_fixes = """
/* NAVBAR OVERRIDES */
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
  background: var(--nav-bg) !important;
  border-bottom: 1px solid var(--border) !important;
}
.nav-brand {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  text-decoration: none !important;
}
.nav-brand img {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
}
.nav-links {
  display: flex !important;
  gap: 36px !important;
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
  align-items: center !important;
}
.nav-hamburger {
  display: none !important;
}
@media (max-width: 768px) {
  .nav-hamburger { display: block !important; }
  .nav-links { display: none !important; }
  nav, .navbar, header { padding: 0 20px !important; }
}
"""
with open('assets/css/styles.css', 'a', encoding='utf-8') as f:
    f.write(css_fixes)


theme_switcher = """<div id="theme-switcher">
  <button class="theme-toggle-btn" onclick="document.getElementById('theme-panel').classList.toggle('open')">🎨 Theme</button>
  <div class="theme-panel" id="theme-panel">
    <button class="theme-opt" data-theme="dark-cold" onclick="setTheme('dark-cold')"><span class="swatch" style="background:linear-gradient(135deg,#0D0F1A,#7C6EF5)"></span>Dark Cold</button>
    <button class="theme-opt" data-theme="dark-warm" onclick="setTheme('dark-warm')"><span class="swatch" style="background:linear-gradient(135deg,#120A05,#E8832A)"></span>Dark Warm</button>
    <button class="theme-opt" data-theme="light-pro" onclick="setTheme('light-pro')"><span class="swatch" style="background:linear-gradient(135deg,#F7F8FC,#5046E5)"></span>Light Pro</button>
  </div>
</div>

<script>
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('kk-theme', t);
  document.querySelectorAll('.theme-opt').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
}
(function(){ setTheme(localStorage.getItem('kk-theme') || 'dark-cold'); })();

const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let rx=0,ry=0,dx=0,dy=0;
document.addEventListener('mousemove', e => { dx=e.clientX; dy=e.clientY; dot.style.left=dx+'px'; dot.style.top=dy+'px'; });
(function loop(){ rx+=(dx-rx)*0.12; ry+=(dy-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
document.querySelectorAll('a,button,.profile-card,.card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ ring.style.width='52px'; ring.style.height='52px'; ring.style.opacity='1'; });
  el.addEventListener('mouseleave',()=>{ ring.style.width='36px'; ring.style.height='36px'; ring.style.opacity='0.65'; });
});
</script>
</body>"""

# 3. Apply to profiles.html, mentor-booking.html, marketplace.html
for file in ['profiles.html', 'mentor-booking.html', 'marketplace.html']:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()

    # Apply data-theme
    html = re.sub(r'<html lang="en">', '<html lang="en" data-theme="dark-cold">', html)

    # Insert cursor divs
    if '<div id="cursor-dot">' not in html:
        html = re.sub(r'<body[^>]*>', r'\g<0>\n<div id="cursor-dot"></div>\n<div id="cursor-ring"></div>\n', html, count=1)

    # Replace specific themes / scripts (Clear out old widgets and scripts before </body>)
    html = re.sub(r'<div class="theme-widget".*?</div>\s*</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<div id="themeSwitcher".*?</div>\s*</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<script>\s*// Create cursor glow.*?</script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<div id="cursorGlow"></div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<div id="theme-switcher">.*?</script>', '', html, flags=re.DOTALL)
    # Remove any stray new_switcher additions to prevent duplication if we reran
    
    html = re.sub(r'</body>\s*</html>', theme_switcher + '\n</html>', html, flags=re.IGNORECASE)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(html)

print("done")
