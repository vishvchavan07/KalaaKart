import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update html tag
html = re.sub(r'<html lang="en">', '<html lang="en" data-theme="dark-cold">', html)

# 2. Update styles at the top
css_block = """<style>
:root, [data-theme="dark-cold"] {
  --bg: #0D0F1A; --surface: #13162A; --nav-bg: rgba(13,15,26,0.85);
  --card-bg: #181C35; --card-top-bg: #1E2340;
  --card-top-text: #E8EAFF; --card-top-muted: #8890C4;
  --text-primary: #E8EAFF; --text-secondary: #9AA0CC;
  --accent: #7C6EF5; --border: rgba(124,110,245,0.18);
  --tag-bg: rgba(124,110,245,0.15); --tag-text: #A99BFF;
  --cursor-color: #7C6EF5; --shadow: 0 4px 24px rgba(124,110,245,0.15);
}
[data-theme="dark-warm"] {
  --bg: #120A05; --surface: #1C1108; --nav-bg: rgba(18,10,5,0.88);
  --card-bg: #231508; --card-top-bg: #3B1F0A;
  --card-top-text: #FFE8CC; --card-top-muted: #C49A6A;
  --text-primary: #FFE8CC; --text-secondary: #BF8D5A;
  --accent: #E8832A; --border: rgba(232,131,42,0.20);
  --tag-bg: rgba(232,131,42,0.14); --tag-text: #FFBA78;
  --cursor-color: #E8832A; --shadow: 0 4px 24px rgba(232,131,42,0.18);
}
[data-theme="light-pro"] {
  --bg: #F7F8FC; --surface: #FFFFFF; --nav-bg: rgba(247,248,252,0.92);
  --card-bg: #FFFFFF; --card-top-bg: #1A1A2E;
  --card-top-text: #F0F0FF; --card-top-muted: #9090BB;
  --text-primary: #1A1A2E; --text-secondary: #555577;
  --accent: #5046E5; --border: rgba(80,70,229,0.14);
  --tag-bg: rgba(80,70,229,0.08); --tag-text: #5046E5;
  --cursor-color: #5046E5; --shadow: 0 4px 20px rgba(0,0,0,0.08);
}

body {
  background: var(--bg);
  color: var(--text-primary);
  cursor: none;
  transition: background 0.35s, color 0.35s;
}

#cursor-dot {
  position: fixed; width: 8px; height: 8px;
  background: var(--cursor-color); border-radius: 50%;
  pointer-events: none; z-index: 99999;
  transform: translate(-50%, -50%);
  transition: background 0.3s;
}
#cursor-ring {
  position: fixed; width: 36px; height: 36px;
  border: 2px solid var(--cursor-color); border-radius: 50%;
  pointer-events: none; z-index: 99998;
  transform: translate(-50%, -50%);
  opacity: 0.65; transition: width 0.2s, height 0.2s, border-color 0.3s;
}

#theme-switcher { position:fixed; bottom:24px; left:24px; z-index:9000; }
.theme-toggle-btn { background:var(--accent); color:#fff; border:none; border-radius:50px; padding:10px 18px; font-size:14px; font-weight:600; cursor:none; box-shadow:var(--shadow); }
.theme-panel { display:none; flex-direction:column; gap:8px; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:12px; margin-bottom:10px; box-shadow:var(--shadow); }
.theme-panel.open { display:flex; }
.theme-opt { display:flex; align-items:center; gap:10px; background:none; border:1px solid transparent; border-radius:10px; padding:8px 12px; cursor:none; color:var(--text-primary); font-size:14px; font-weight:500; transition:border-color 0.2s, background 0.2s; }
.theme-opt:hover, .theme-opt.active { border-color:var(--accent); background:var(--tag-bg); }
.theme-opt.active::after { content:'✓'; margin-left:auto; color:var(--accent); font-weight:700; }
.swatch { width:26px; height:26px; border-radius:7px; display:inline-block; flex-shrink:0; }
</style>"""

html = re.sub(r'<style>.*?</style>', css_block, html, flags=re.DOTALL)

# Also replace the inline script that sets theme at top
script_block = """  <script>
    (function() {
      const t = localStorage.getItem('kk-theme') || 'dark-cold';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>"""
html = re.sub(r'<script>\s*\(function\(\) \{.*?\}\)\(\);\s*</script>', script_block, html, flags=re.DOTALL)


# 4. Add cursor divs after <body>
cursor_html = """\n<div id="cursor-dot"></div>\n<div id="cursor-ring"></div>\n"""
html = re.sub(r'<body[^>]*>', r'\g<0>' + cursor_html, html, count=1)

# Remove the old theme switcher totally (we'll do a regex from <div class="theme-widget" ... to the </body>)
# Let's cleanly just locate the last </div> before </body> and other old scripts and replace them
# Or just replace the new theme switcher directly before </body>

old_switcher_pattern = r'<div class="theme-widget".*?</div>\s*</div>'
html = re.sub(old_switcher_pattern, '', html, flags=re.DOTALL)

# Also remove the whole old <script> block at the end (from const cursorGlow = down to </script>)
html = re.sub(r'<script>\s*// Create cursor glow.*?</script>', '', html, flags=re.DOTALL)
# And the other script handling theme states!
html = re.sub(r'<script>\s*const savedTheme = localStorage.*?</script>', '', html, flags=re.DOTALL)

new_switcher = """<div id="theme-switcher">
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

html = re.sub(r'</body>', new_switcher, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
