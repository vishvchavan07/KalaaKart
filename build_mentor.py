import re

def build_mentor_page():
    # Read the head base from index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        idx_html = f.read()
    
    # Extract everything from DOCTYPE down to the closing </head>
    head_match = re.search(r'<!DOCTYPE html>.*?</head>', idx_html, re.DOTALL)
    head_content = head_match.group(0)
    
    # Custom adjustments for mentor title/description
    head_content = head_content.replace('Kalaa Kart — From Passion to Profession', 'Mentor Booking — Kalaa Kart')
    head_content = head_content.replace('content="Kalaa Kart is a student-powered platform', 'content="Book peer mentors to learn the exact college syllabus on Kalaa Kart.')
    
    # Extract the navbar from index.html
    nav_match = re.search(r'<header class="navbar">.*?</header>', idx_html, re.DOTALL)
    navbar_content = nav_match.group(0)
    
    # Extract the footer and end of scripts (theme switcher, cursor JS)
    footer_match = re.search(r'<footer.*?</html>', idx_html, re.DOTALL)
    footer_content = footer_match.group(0)

    # Now define the actual mentor content instructed
    main_content = """
  <main>
    <!-- HERO SECTION -->
    <section class="hero-section page-hero">
      <div class="container hero-frame">
        <div class="hero-copy hero-copy-centered">
          <p class="section-overline">✦ PEER MENTORSHIP</p>
          <h1 class="hero-headline">Learn from seniors who know the exact college syllabus.</h1>
          <p class="hero-subtext">Find a senior who knows your exact syllabus — book a session in minutes.</p>
        </div>
      </div>
    </section>

    <!-- FILTER BAR -->
    <section class="container filter-section">
      <div class="filter-controls" id="mentorFilterBar">
        <button class="filter-pill active" data-filter="all">All Subjects</button>
        <button class="filter-pill" data-filter="Physics">Physics</button>
        <button class="filter-pill" data-filter="Mathematics">Mathematics</button>
        <button class="filter-pill" data-filter="Programming">Programming</button>
        <button class="filter-pill" data-filter="Graphics">Engineering Graphics</button>
      </div>
      <div class="filter-toggle">
        <label>
          <input type="checkbox" id="freeToggle"> 
          <span>Free Only</span>
        </label>
      </div>
    </section>

    <!-- MENTOR CARDS -->
    <section class="container">
      <div class="mentors-grid" id="mentorsGrid">
        
        <!-- Card 1 -->
        <article class="mcard" data-subject="Physics" data-free="false">
          <div class="mcard-top">
            <img class="mcard-avatar" src="https://api.dicebear.com/7.x/thumbs/svg?seed=Aditya" alt="Aditya Verma">
            <div class="mcard-info">
              <h3>Aditya Verma</h3>
              <p class="mcard-role">Mechanical Eng · Final Year</p>
            </div>
            <div class="mcard-subject">
              <span>⚛ Physics</span>
            </div>
          </div>
          <div class="mcard-body">
            <p class="mcard-offer">"Cleared SPPU Physics with 9.2 CGPA — I'll help you do the same"</p>
            <div class="mcard-stats">
              <span class="mcard-stars" style="color:#F5A623;">★★★★★</span>
              <strong>4.9</strong>
              <span>· 31 reviews</span>
            </div>
            <ul class="mcard-features">
              <li>✓ Matches your syllabus</li>
            </ul>
            <div class="mcard-tags">
              <span class="tag">💬 Doubt Solving</span>
              <span class="tag">📖 Exam Revision</span>
            </div>
          </div>
          <div class="mcard-bottom">
            <span class="mcard-price">₹149/session</span>
            <button class="button button-primary mcard-book">Book Now</button>
          </div>
        </article>

        <!-- Card 2 -->
        <article class="mcard" data-subject="Programming" data-free="true">
          <div class="mcard-top">
            <img class="mcard-avatar" src="https://api.dicebear.com/7.x/thumbs/svg?seed=Riya" alt="Riya Nair">
            <div class="mcard-info">
              <h3>Riya Nair</h3>
              <p class="mcard-role">Computer Eng · 3rd Year</p>
            </div>
            <div class="mcard-subject">
              <span>💻 Programming</span>
            </div>
          </div>
          <div class="mcard-body">
            <p class="mcard-offer">"C, C++, Java, Python — explained the way your professor won't"</p>
            <div class="mcard-stats">
              <span class="mcard-stars" style="color:#F5A623;">★★★★★</span>
              <strong>4.8</strong>
              <span>· 44 reviews</span>
            </div>
            <ul class="mcard-features">
              <li>✓ Matches your syllabus</li>
            </ul>
            <div class="mcard-tags">
              <span class="tag">🧠 Concept Session</span>
              <span class="tag">🐛 Code Debugging</span>
            </div>
          </div>
          <div class="mcard-bottom">
             <span class="mcard-price" style="color:var(--color-free-text);background:var(--color-free-bg);padding:4px 8px;border-radius:4px;font-weight:700;">Free</span>
            <button class="button button-primary mcard-book">Book Now</button>
          </div>
        </article>

        <!-- Card 3 -->
        <article class="mcard" data-subject="Graphics" data-free="false">
          <div class="mcard-top">
            <img class="mcard-avatar" src="https://api.dicebear.com/7.x/thumbs/svg?seed=Saurabh" alt="Saurabh Rane">
            <div class="mcard-info">
              <h3>Saurabh Rane</h3>
              <p class="mcard-role">Civil Eng · Final Year</p>
            </div>
            <div class="mcard-subject">
              <span>📐 Engineering Graphics</span>
            </div>
          </div>
          <div class="mcard-body">
            <p class="mcard-offer">"AutoCAD + manual drawing — from zero to full marks"</p>
            <div class="mcard-stats">
              <span class="mcard-stars" style="color:#F5A623;">★★★★★</span>
              <strong>4.7</strong>
              <span>· 19 reviews</span>
            </div>
            <ul class="mcard-features">
              <li>✓ Matches your syllabus</li>
            </ul>
            <div class="mcard-tags">
              <span class="tag">🛠 Practical Help</span>
              <span class="tag">📝 Exam Prep</span>
            </div>
          </div>
          <div class="mcard-bottom">
            <span class="mcard-price">₹199/session</span>
            <button class="button button-primary mcard-book">Book Now</button>
          </div>
        </article>

        <!-- Card 4 -->
        <article class="mcard" data-subject="Mathematics" data-free="false">
          <div class="mcard-top">
            <img class="mcard-avatar" src="https://api.dicebear.com/7.x/thumbs/svg?seed=Tanvi" alt="Tanvi Shah">
            <div class="mcard-info">
              <h3>Tanvi Shah</h3>
              <p class="mcard-role">IT Eng · 3rd Year</p>
            </div>
            <div class="mcard-subject">
              <span>📊 Mathematics</span>
            </div>
          </div>
          <div class="mcard-body">
            <p class="mcard-offer">"Engineering Maths 1, 2, and 3 — step-by-step, no shortcuts skipped"</p>
            <div class="mcard-stats">
              <span class="mcard-stars" style="color:#F5A623;">★★★★★</span>
              <strong>5.0</strong>
              <span>· 27 reviews</span>
            </div>
            <ul class="mcard-features">
              <li>✓ Matches your syllabus</li>
            </ul>
            <div class="mcard-tags">
              <span class="tag">🧠 Concept Session</span>
              <span class="tag">📖 Exam Revision</span>
            </div>
          </div>
          <div class="mcard-bottom">
            <span class="mcard-price">₹249/session</span>
            <button class="button button-primary mcard-book">Book Now</button>
          </div>
        </article>

        <!-- Card 5 -->
        <article class="mcard" data-subject="Physics" data-free="true">
          <div class="mcard-top">
            <img class="mcard-avatar" src="https://api.dicebear.com/7.x/thumbs/svg?seed=Dev" alt="Dev Kulkarni">
            <div class="mcard-info">
              <h3>Dev Kulkarni</h3>
              <p class="mcard-role">Electronics · Final Year</p>
            </div>
            <div class="mcard-subject">
              <span>⚛ Physics</span>
            </div>
          </div>
          <div class="mcard-body">
            <p class="mcard-offer">"Applied Physics simplified for engineering students"</p>
            <div class="mcard-stats">
              <span class="mcard-stars" style="color:#F5A623;">★★★★★</span>
              <strong>4.6</strong>
              <span>· 15 reviews</span>
            </div>
            <ul class="mcard-features">
              <li>✓ Matches your syllabus</li>
            </ul>
            <div class="mcard-tags">
              <span class="tag">💬 Doubt Solving</span>
              <span class="tag">⚡ Quick Revision</span>
            </div>
          </div>
          <div class="mcard-bottom">
            <span class="mcard-price" style="color:var(--color-free-text);background:var(--color-free-bg);padding:4px 8px;border-radius:4px;font-weight:700;">Free</span>
            <button class="button button-primary mcard-book">Book Now</button>
          </div>
        </article>

        <!-- Card 6 -->
        <article class="mcard" data-subject="Programming" data-free="false">
          <div class="mcard-top">
            <img class="mcard-avatar" src="https://api.dicebear.com/7.x/thumbs/svg?seed=Pooja" alt="Pooja Deshmukh">
            <div class="mcard-info">
              <h3>Pooja Deshmukh</h3>
              <p class="mcard-role">Computer Eng · 4th Year</p>
            </div>
            <div class="mcard-subject">
              <span>💻 Programming</span>
            </div>
          </div>
          <div class="mcard-body">
            <p class="mcard-offer">"DSA, OOP, and project help — practical and exam-focused"</p>
            <div class="mcard-stats">
              <span class="mcard-stars" style="color:#F5A623;">★★★★★</span>
              <strong>4.8</strong>
              <span>· 38 reviews</span>
            </div>
            <ul class="mcard-features">
              <li>✓ Matches your syllabus</li>
            </ul>
            <div class="mcard-tags">
              <span class="tag">🗂 Project Help</span>
              <span class="tag">👁 Code Review</span>
            </div>
          </div>
          <div class="mcard-bottom">
            <span class="mcard-price">₹299/session</span>
            <button class="button button-primary mcard-book">Book Now</button>
          </div>
        </article>
      </div>
    </section>

    <!-- HOW IT WORKS SECTION -->
    <section class="container section">
      <div class="section-heading section-heading-centered">
        <p class="section-overline">✦ BOOKING FLOW</p>
        <h2 class="section-h2-bold">How It Works</h2>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-icon">🔍</div>
          <h3 class="step-title">Find your mentor</h3>
          <p class="step-desc">Filter by subject, price, or free sessions</p>
        </div>
        <div class="step-card">
          <div class="step-icon">📅</div>
          <h3 class="step-title">Pick a time slot</h3>
          <p class="step-desc">Choose a date and preferred session format</p>
        </div>
        <div class="step-card">
          <div class="step-icon">💬</div>
          <h3 class="step-title">Confirm the topic</h3>
          <p class="step-desc">Tell your mentor what you need help with</p>
        </div>
        <div class="step-card">
          <div class="step-icon">✅</div>
          <h3 class="step-title">Attend and learn</h3>
          <p class="step-desc">Meet on campus or hybrid — your choice</p>
        </div>
      </div>
    </section>

  </main>
"""

    full_html = f'''{head_content}
<body data-page="mentors">
  <div id="cursor-dot"></div>
  <div id="cursor-ring"></div>
  
{navbar_content}

{main_content}

{footer_content}
'''
    
    with open('mentor-booking.html', 'w', encoding='utf-8') as f:
        f.write(full_html)

if __name__ == '__main__':
    build_mentor_page()
