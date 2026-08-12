import re

# Update JS star rendering
with open("assets/js/main.js", "r") as f:
    js_content = f.read()

star_code = """  function renderStars(rating) {
    const rounded = Math.round(Number(rating));
    return `${"<span class='star'>★</span>".repeat(rounded)}${"<span class='star-empty' style='color:#ccc !important;'>☆</span>".repeat(5 - rounded)}`;
  }"""
js_content = re.sub(r'function renderStars\(rating\)\s*\{[^\}]+\}', star_code, js_content, flags=re.DOTALL)
with open("assets/js/main.js", "w") as f:
    f.write(js_content)

html_files = ["index.html", "profiles.html", "mentor-booking.html", "marketplace.html"]
for file in html_files:
    with open(file, "r") as f:
        html = f.read()
    
    html = re.sub(
        r'entry\.target\.style\.opacity\s*=\s*[\'"]1[\'"];\s*entry\.target\.style\.transform\s*=\s*[\'"]translateY\(0\)[\'"];',
        'entry.target.classList.add("animated");',
        html
    )
    
    html = re.sub(
        r'card\.style\.opacity\s*=\s*[\'"]0[\'"];\s*card\.style\.transform\s*=\s*[\'"]translateY\(\d+px\)[\'"];*(?:\s*card\.style\.transition\s*=\s*[^;]+;)?',
        'card.classList.add("scroll-reveal");',
        html
    )
    
    # Optional fade-in scroll-to-top fixes
    html = html.replace('if(header) header.classList.toggle(\'scrolled\'', 'const b = document.getElementById("backToTop"); if(b) b.classList.toggle("scrolled", window.scrollY > 400); if(header) header.classList.toggle(\'scrolled\'')
        
    with open(file, "w") as f:
        f.write(html)
print("JS & HTML Tweaks Complete")
