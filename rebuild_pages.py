import re

def rebuild():
    # Load index.html for base template extraction
    with open('index.html', 'r', encoding='utf-8') as f:
        idx_html = f.read()

    head_match = re.search(r'<!DOCTYPE html>.*?</head>', idx_html, re.DOTALL)
    head_content = head_match.group(0)

    nav_match = re.search(r'<header class="navbar">.*?</header>', idx_html, re.DOTALL)
    navbar_content = nav_match.group(0)

    footer_match = re.search(r'<footer.*?</html>', idx_html, re.DOTALL)
    footer_content = footer_match.group(0)

    # 1. Rebuild profiles.html 
    profiles_head = head_content.replace('<title>Kalaa Kart — From Passion to Profession</title>', '<title>Profiles — Kalaa Kart</title>')
    
    profiles_main = """
  <main>
    <section class="page-hero">
      <div class="container hero-frame">
        <h1 class="hero-headline">Campus Talent Profiles</h1>
        <p class="hero-subtext">Discover skilled students offering creative services across campus.</p>
      </div>
    </section>
    
    <section class="container filter-section">
      <div class="filter-controls" id="filterBar">
        <button class="filter-pill active" data-filter="all">All Roles</button>
      </div>
    </section>

    <section class="container">
      <div class="profiles-grid" id="allProfiles">
        <!-- JS will dynamically inject the profile cards from data.js -->
      </div>
    </section>
  </main>
"""
    
    profiles_full = f'{profiles_head}\n<body data-page="profiles">\n  <div id="cursor-dot"></div>\n  <div id="cursor-ring"></div>\n{navbar_content}\n{profiles_main}\n{footer_content}'
    
    # Need to remove the specific empty State and Intersection Observer blocks from the bottom of generic footer content just to be totally clean:
    profiles_full = profiles_full.replace('data-page="home"', 'data-page="profiles"')

    with open('profiles.html', 'w', encoding='utf-8') as f:
        f.write(profiles_full)


    # 2. Rebuild marketplace.html 
    mkt_head = head_content.replace('<title>Kalaa Kart — From Passion to Profession</title>', '<title>Campus Marketplace — Kalaa Kart</title>')
    
    mkt_main = """
  <main>
    <section class="page-hero">
      <div class="container hero-frame">
        <p class="section-overline">✦ THRIFT & RENT</p>
        <h1 class="hero-headline">Affordable college essentials.</h1>
        <p class="hero-subtext">Buy formal wear, lab coats, and fest apparel directly from seniors.</p>
      </div>
    </section>

    <section class="container filter-section">
      <div class="filter-controls" id="categoryRow">
        <button class="mkt-pill active" data-category="all">All Items</button>
        <button class="mkt-pill" data-category="formals">Formals</button>
        <button class="mkt-pill" data-category="lab">Lab Gear</button>
        <button class="mkt-pill" data-category="fest">Fest Wear</button>
      </div>
      <div class="filter-toggle">
        <label><input type="checkbox" id="buyToggle" class="active" checked> <span>Buy</span></label>
        <label><input type="checkbox" id="rentToggle" class="active" checked> <span>Rent</span></label>
      </div>
      <div class="filter-toggle" style="margin-left: auto;">
        <select id="sortSelect" style="background:var(--surface);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;padding:4px 8px;">
          <option value="newest">Newest Listed</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>
    </section>

    <section class="container">
      <div class="listings-grid" id="listingsGrid">
        <!-- JS will dynamically inject the marketplace cards -->
      </div>
      <!-- To fallback to the JS injection logic smoothly across all views -->
      <div id="marketplaceCards" style="display:contents;"></div> 
    </section>
  </main>
"""
    
    mkt_full = f'{mkt_head}\n<body data-page="marketplace">\n  <div id="cursor-dot"></div>\n  <div id="cursor-ring"></div>\n{navbar_content}\n{mkt_main}\n{footer_content}'
    
    with open('marketplace.html', 'w', encoding='utf-8') as f:
        f.write(mkt_full)

if __name__ == '__main__':
    rebuild()
