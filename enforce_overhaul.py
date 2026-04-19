import os
import re

css_overhaul = """
/* ==========================================================================
   V3: COMPLETE DESIGN & ALIGNMENT OVERHAUL (AS PER SPEC)
   ========================================================================== */

/* --- 1. LAYOUT & ALIGNMENT FIXES --- */
.section-heading, .gallery-head {
    text-align: center !important;
    padding: 48px 0 32px 0 !important;
    margin: 0 auto !important;
}

.card-grid, .pillars-grid, .impact-grid, .showcase-grid, .listings-grid, .mentor-grid, .profile-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
    gap: 24px !important;
}

.container {
    padding-left: 16px !important;
    padding-right: 16px !important;
    margin-left: auto !important;
    margin-right: auto !important;
}

.button, button, .btn-primary, .btn-secondary, a.button {
    height: 48px !important;
    border-radius: 8px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 24px !important;
    max-height: 48px !important;
}

.hero-copy, .page-hero {
    text-align: center !important;
    max-width: 720px !important;
    margin: 0 auto !important;
}

.hero-stats, .stats-row {
    display: flex !important;
    justify-content: space-evenly !important;
    align-items: center !important;
    width: 100% !important;
}

.hero-stats article, .stats-row article {
    border-right: 1px solid rgba(0,0,0,0.1);
    padding: 0 24px;
    flex: 1;
    text-align: center;
}
.hero-stats article:last-child, .stats-row article:last-child {
    border-right: none;
}

.filters-bar, .market-category-row, .market-type-row {
    width: 100% !important;
    display: flex !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
    gap: 12px;
}
.filters-bar::-webkit-scrollbar, .market-category-row::-webkit-scrollbar {
    display: none;
}

/* --- 2. TYPOGRAPHY SYSTEM --- */
body {
    line-height: 1.6 !important;
    color: var(--color-text-primary, #4a4a4a) !important;
}

.display-title, h1.hero-headline { font-size: 48px !important; font-weight: 700 !important; }
h1 { font-size: 36px !important; font-weight: 700 !important; line-height: 1.2 !important; }
h2 { font-size: 28px !important; font-weight: 600 !important; line-height: 1.3 !important; }
h3 { font-size: 20px !important; font-weight: 600 !important; line-height: 1.4 !important; margin: 0 0 8px 0 !important; }
p, li { font-size: 16px !important; font-weight: 400 !important; }
span.tag, .caption, small { font-size: 13px !important; font-weight: 500 !important; }

.section-overline, .page-overline, .how-overline, .eyebrow, .showcase-overline {
    font-size: 11px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    color: var(--color-primary) !important;
    display: block !important;
    margin-bottom: 8px !important;
}

/* --- 3. CARD COMPONENTS --- */
article, .card, .profile-card, .mentor-card, .market-card, .lcard, .mcard, .pcard {
    background: var(--color-bg-card, #fff) !important;
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important;
    padding: 20px !important;
    border: none !important;
}

article:hover, .card:hover, .profile-card:hover, .mentor-card:hover, .market-card:hover, .lcard:hover, .mcard:hover, .pcard:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}

.profile-card img, .mentor-card .mentor-avatar, .slate-photo, img.avatar {
    width: 64px !important;
    height: 64px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
}

.market-card img, .lcard-image {
    width: 100% !important;
    height: 200px !important;
    object-fit: cover !important;
    border-radius: 8px !important;
}

.subtitle, .lcard-meta, .profile-title {
    font-size: 13px !important;
    color: var(--color-text-muted) !important;
    margin-bottom: 12px !important;
}

.tag, .tag-row span {
    background: var(--color-primary-light) !important;
    color: var(--color-primary) !important;
    padding: 4px 12px !important;
    border-radius: 999px !important;
    font-size: 12px !important;
}

.price-badge, .status-pill, .price-tag, .lcard-price-buy, .lcard-price-rent {
    font-size: 18px !important;
    font-weight: 700 !important;
    color: var(--color-primary) !important;
    margin-top: 8px;
    display: inline-block;
}

article .button {
    width: 100% !important;
    height: 44px !important;
    background: var(--color-primary) !important;
    color: #fff !important;
    margin-top: 16px !important;
}

.stars, .review-chip, .slate-rating {
    font-size: 13px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
}
.stars span.star, .star {
    color: #F5A623 !important;
    font-size: 14px !important;
}

/* --- 4. NAVBAR --- */
.site-header {
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    backdrop-filter: blur(12px) !important;
    border-bottom: 1px solid var(--color-border) !important;
    background: rgba(255, 255, 255, 0.85) !important; /* Base fallback */
}
[data-theme="warm"] .site-header { background: rgba(255, 248, 240, 0.85) !important; }
[data-theme="cool"] .site-header { background: rgba(240, 245, 255, 0.85) !important; }
[data-theme="sage"] .site-header { background: rgba(240, 255, 244, 0.85) !important; }

.nav-shell {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
}

.top-nav {
    display: flex !important;
    gap: 32px !important;
}

.top-nav a {
    transition: color 0.2s ease !important;
    border-bottom: none !important;
}

.top-nav a.nav-active {
    font-weight: bold !important;
    border-bottom: 2px solid var(--color-primary) !important;
}

.mobile-nav-menu {
    transition: max-height 0.3s ease, padding 0.3s ease !important;
    width: 100% !important;
    background: var(--color-bg) !important;
}

/* --- 5. HERO SECTION --- */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
}
.hero-feather {
    animation: float 4s infinite ease-in-out !important;
}

.live-pill {
    display: inline-flex !important;
    align-items: center !important;
    background: var(--color-bg-soft) !important;
    padding: 8px 16px !important;
    border-radius: 999px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
}

@keyframes pulseDot {
    0% { box-shadow: 0 0 0 0 rgba(var(--color-primary-dark), 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(var(--color-primary-dark), 0); }
    100% { box-shadow: 0 0 0 0 rgba(var(--color-primary-dark), 0); }
}
.live-dot {
    width: 8px !important;
    height: 8px !important;
    background: var(--color-primary) !important;
    border-radius: 50% !important;
    margin-right: 8px !important;
    animation: pulseDot 2s infinite !important;
}

.hero-buttons, .hero-actions {
    display: flex !important;
    gap: 16px !important;
    justify-content: center !important;
    width: 100% !important;
}

/* --- 6. THEME SWITCHER (Overriding the roots completely per spec) --- */
[data-theme="warm"] {
  --color-primary:        #D4743A !important;
  --color-primary-dark:   #B85C24 !important;
  --color-primary-light:  #F0C080 !important;
  --color-secondary:      #D4743A !important;
  --color-bg:             #FFF8F0 !important;
  --color-bg-soft:        #FFF0E0 !important;
  --color-bg-card:        #FFFFFF !important;
  --color-surface:        #FFF8F0 !important;
  --color-text-primary:   #4a4a4a !important;
}

[data-theme="cool"] {
  --color-primary:        #3A7BD4 !important;
  --color-primary-dark:   #245CB8 !important;
  --color-primary-light:  #80B4F0 !important;
  --color-secondary:      #3A7BD4 !important;
  --color-bg:             #F0F5FF !important;
  --color-bg-soft:        #E0EDFF !important;
  --color-bg-card:        #FFFFFF !important;
  --color-surface:        #F0F5FF !important;
  --color-text-primary:   #4a4a4a !important;
}

[data-theme="sage"] {
  --color-primary:        #4A8C6A !important;
  --color-primary-dark:   #34684D !important;
  --color-primary-light:  #80C4A0 !important;
  --color-secondary:      #4A8C6A !important;
  --color-bg:             #F0FFF4 !important;
  --color-bg-soft:        #E0FEE0 !important;
  --color-bg-card:        #FFFFFF !important;
  --color-surface:        #F0FFF4 !important;
  --color-text-primary:   #4a4a4a !important;
}

.theme-option.active {
    box-shadow: 0 0 0 2px var(--color-primary), 0 0 12px var(--color-primary-light) !important;
}

/* --- 7. FOOTER --- */
.site-footer-premium, .site-footer {
    padding: 60px 0 !important;
}
.footer-main {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 32px !important;
}
.footer-social {
    display: flex !important;
    gap: 12px !important;
    justify-content: center !important;
}
.footer-social a {
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    background: var(--color-surface) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
    color: var(--color-text-primary) !important;
}
.footer-social a:hover {
    transform: translateY(-4px) !important;
    background: var(--color-primary) !important;
    color: #fff !important;
}
.footer-bottom p {
    text-align: center !important;
    color: var(--color-text-muted) !important;
    font-size: 13px !important;
    margin-top: 24px !important;
}

/* --- 8. MARKETPLACE SPECIFIC --- */
.badge-rent, .lcard-type-badge .badge-rent {
    background: #3A7BD4 !important;
    color: #fff !important;
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    padding: 4px 12px !important;
    border-radius: 4px !important;
    font-weight: bold !important;
    font-size: 12px !important;
    z-index: 5 !important;
}
.badge-buy, .lcard-type-badge .badge-buy {
    background: #4A8C6A !important;
    color: #fff !important;
    position: absolute !important;
    top: 12px !important;
    left: 80px !important; 
    padding: 4px 12px !important;
    border-radius: 4px !important;
    font-weight: bold !important;
    font-size: 12px !important;
    z-index: 5 !important;
}
.lcard-condition {
    display: inline-block !important;
    background: var(--color-bg-soft) !important;
    color: var(--color-text-secondary) !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    margin-top: 8px !important;
}
.lcard-seller-initial, .seller-avatar {
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: var(--color-primary-light) !important;
    color: var(--color-primary) !important;
    font-weight: bold !important;
}
.sell-banner-btn {
    display: block !important;
    width: 100% !important;
    padding: 48px 24px !important;
    background: var(--color-primary-light) !important;
    color: var(--color-text-primary) !important;
    text-align: center !important;
    border-radius: 16px !important;
    margin-top: 48px !important;
}

/* --- 9. MOBILE RESPONSIVENESS --- */
@media (max-width: 768px) {
    .hero-buttons, .hero-actions {
        flex-direction: column !important;
        width: 100% !important;
    }
    .hero-buttons .button, .hero-actions .button {
        width: 100% !important;
    }
    .footer-main {
        grid-template-columns: 1fr !important;
        text-align: center !important;
    }
    .nav-shell {
        flex-wrap: wrap !important;
    }
    .display-title, h1.hero-headline { font-size: 32px !important; }
    h1 { font-size: 26px !important; }
    h2 { font-size: 22px !important; }
    
    .container {
        padding-left: 16px !important;
        padding-right: 16px !important;
    }
}
@media (min-width: 769px) and (max-width: 1279px) {
    .container {
        padding-left: 32px !important;
        padding-right: 32px !important;
    }
}
@media (min-width: 1280px) {
    .container {
        max-width: 1280px !important;
        padding-left: 80px !important;
        padding-right: 80px !important;
        margin: 0 auto !important;
    }
}

/* --- 10. MICRO-INTERACTIONS & POLISH --- */
a, button, .card, .profile-card, .mentor-card, .market-card, .filter-pill, .mkt-pill {
    transition: all 0.2s ease !important;
}

#backToTop {
    transition: opacity 0.3s ease, transform 0.3s ease !important;
    opacity: 0;
    pointer-events: none;
}
#backToTop.scrolled {
    opacity: 1;
    pointer-events: auto;
}

.filter-pill.active, .mkt-pill.active {
    background: var(--color-primary) !important;
    color: #fff !important;
}

.scroll-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;
}
.scroll-reveal.animated {
    opacity: 1 !important;
    transform: translateY(0) !important;
}
"""

with open("assets/css/styles.css", "a") as css_file:
    css_file.write("\n" + css_overhaul)

print("CSS OVERHAUL DEPLOYED")
