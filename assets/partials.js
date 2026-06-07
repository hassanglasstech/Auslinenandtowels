// Australian Linen & Towels — shared header + footer + mobile call bar
(function () {
  // ═══════════════════════════════════════════════════════
  // CONSENT GATE — read stored choice (default: granted with anonymize)
  // ═══════════════════════════════════════════════════════
  function getConsent() {
    try { return localStorage.getItem('alt_consent') || ''; } catch(e) { return ''; }
  }
  function setConsent(v) {
    try { localStorage.setItem('alt_consent', v); } catch(e) {}
  }

  // ═══════════════════════════════════════════════════════
  // CONSENT MODE v2 — default DENIED before any tag loads
  // GA4 + Microsoft Clarity load ONLY after explicit "Accept".
  // ═══════════════════════════════════════════════════════
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  function loadAnalytics() {
    if (window.__altTagsLoaded) return;
    window.__altTagsLoaded = true;

    // GA4 loads at startup — consent mode (above) controls what is sent.
    // With analytics_storage: 'denied' GA4 sends cookieless pings (no cookies,
    // no personal data) so pages views + click events are modelled even before
    // the user accepts.  Consent update below upgrades to full tracking.
    var gaId = 'G-BXCSDXJWFJ';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', gaId, { anonymize_ip: true });

    // If the visitor already accepted in a previous session, upgrade consent now.
    if (getConsent() === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadClarity();
    }
  }

  function loadClarity() {
    if (window.__clarityLoaded) return;
    window.__clarityLoaded = true;
    (function(c,l,a,r,i){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      var t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      var y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wy816of55t");
  }

  loadAnalytics();   // always — GA4 handles consent internally

  // ═══════════════════════════════════════════════════════
  // COOKIE CONSENT BANNER (Australian Privacy Act compliant)
  // ═══════════════════════════════════════════════════════
  function showCookieBanner() {
    if (getConsent()) return; // already chosen
    var banner = document.createElement('div');
    banner.id = 'altCookieBanner';
    banner.innerHTML =
      '<div class="alt-cc-inner">' +
        '<div class="alt-cc-copy">' +
          '<strong>We use cookies.</strong> Anonymous analytics help us improve the site. ' +
          'Read our <a href="privacy.html">privacy policy</a>.' +
        '</div>' +
        '<div class="alt-cc-actions">' +
          '<button class="alt-cc-decline" type="button">Decline</button>' +
          '<button class="alt-cc-accept" type="button">Accept</button>' +
        '</div>' +
      '</div>';
    var style = document.createElement('style');
    style.textContent =
      '#altCookieBanner{position:fixed;left:0;right:0;bottom:0;z-index:9997;' +
      'background:#0f1235;color:#fff;border-top:2px solid #b8933a;' +
      'font-family:"Inter",-apple-system,sans-serif;font-size:13px;' +
      'box-shadow:0 -8px 32px rgba(0,0,0,.25)}' +
      '#altCookieBanner .alt-cc-inner{max-width:1200px;margin:0 auto;padding:16px 24px;' +
      'display:flex;align-items:center;gap:24px;flex-wrap:wrap}' +
      '#altCookieBanner .alt-cc-copy{flex:1;min-width:240px;line-height:1.55;color:#c9cbd9}' +
      '#altCookieBanner .alt-cc-copy strong{color:#fff;font-weight:600}' +
      '#altCookieBanner a{color:#d4b568;border-bottom:1px solid #d4b568}' +
      '#altCookieBanner .alt-cc-actions{display:flex;gap:8px;flex-shrink:0}' +
      '#altCookieBanner button{font-family:"JetBrains Mono",ui-monospace,monospace;' +
      'font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;' +
      'padding:11px 20px;border-radius:2px;cursor:pointer;border:1px solid transparent;' +
      'min-height:42px;transition:all .15s}' +
      '#altCookieBanner .alt-cc-decline{background:transparent;color:#c9cbd9;' +
      'border-color:rgba(255,255,255,.25)}' +
      '#altCookieBanner .alt-cc-decline:hover{border-color:#fff;color:#fff}' +
      '#altCookieBanner .alt-cc-accept{background:#b8933a;color:#fff;border-color:#b8933a}' +
      '#altCookieBanner .alt-cc-accept:hover{background:#d4b568;border-color:#d4b568}' +
      '@media(max-width:600px){#altCookieBanner .alt-cc-inner{padding:14px 16px;gap:14px}' +
      '#altCookieBanner .alt-cc-actions{width:100%}' +
      '#altCookieBanner button{flex:1}}';
    document.head.appendChild(style);
    document.body.appendChild(banner);
    banner.querySelector('.alt-cc-accept').addEventListener('click', function(){
      setConsent('granted');
      banner.remove();
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadClarity();
    });
    banner.querySelector('.alt-cc-decline').addEventListener('click', function(){
      setConsent('declined'); banner.remove();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(showCookieBanner, 800); });
  } else {
    setTimeout(showCookieBanner, 800);
  }

  // Microsoft Clarity now loads inside loadAnalytics() — gated by consent.

  // HTML-escape any dynamic string before it goes into innerHTML.
  function altEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  window.ALT_ESC = altEsc;

  // ── Accessibility: keep keyboard focus inside any open modal/drawer ──
  // One global Tab handler — no per-modal wiring needed. Cycles focus within
  // the topmost visible overlay so keyboard users can't tab into the page behind.
  (function modalFocusTrap() {
    var SELECTORS = [
      '#altLMOv',                 // lead-capture modal
      '#altSearchOverlay.open',   // product search
      '.alt-wl-drawer.is-open',   // quote bucket drawer
      '#altOb',                   // onboarding modal
      '.mobile-drawer.open'       // mobile nav drawer
    ];
    // NOTE: overlays are position:fixed, so offsetParent is null even when
    // visible — use getClientRects() to detect actual rendering instead.
    function visible(el) { return !!el && el.getClientRects().length > 0; }
    function openModal() {
      for (var i = 0; i < SELECTORS.length; i++) {
        var el = document.querySelector(SELECTORS[i]);
        if (visible(el)) return el;
      }
      return null;
    }
    function focusable(c) {
      var sel = 'a[href],button:not([disabled]),input:not([disabled]),' +
                'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
      return Array.prototype.slice.call(c.querySelectorAll(sel)).filter(visible);
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var modal = openModal();
      if (!modal) return;
      var f = focusable(modal);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }, true);
  })();

  // icon(), window.ALT_ICON, window.ALT_HEADER, window.ALT_FOOTER removed 2026-05-31.
  // Header/footer are now build-time HTML partials (src/partials/header.html + footer.html)
  // injected by the Vite htmlIncludes() plugin — no runtime HTML injection needed.

  // ── SEARCH OVERLAY ── (placeholder to find next section)
  // ── SEARCH OVERLAY ──────────────────────────────
  function injectSearchOverlay() {
    if (document.getElementById('altSearchOverlay')) return;

    // Search overlay CSS is in assets/styles.css (moved from JS string injection)

    const overlay = document.createElement('div');
    overlay.id = 'altSearchOverlay';
    overlay.innerHTML = `
      <div class="alt-search-box">
        <div class="alt-search-input-wrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="altSearchInput" type="text" placeholder="Search products — towels, sheets, camel…" autocomplete="off"/>
          <button class="alt-search-close" data-action="search-close" aria-label="Close search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div id="altSearchResults"><div class="alt-search-hint">Start typing to search…</div></div>
      </div>
    `;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) window.ALT_SEARCH_CLOSE(); });
    document.body.appendChild(overlay);

    document.getElementById('altSearchInput').addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      const results = document.getElementById('altSearchResults');
      if (!q) { results.innerHTML = '<div class="alt-search-hint">Start typing to search…</div>'; return; }

      const products = window.ALT_PRODUCTS || [];
      const matches = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.colour||'').toLowerCase().includes(q) ||
        (p.material||'').toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      ).slice(0, 8);

      if (!matches.length) {
        results.innerHTML = '<div class="alt-search-empty">No products found for "' + altEsc(this.value) + '"</div>';
        return;
      }
      results.innerHTML = matches.map(p => `
        <div class="alt-sr-item" data-action="search-enquire" data-sku="${altEsc(p.sku||'')}">
          <img class="alt-sr-img" src="${altEsc(p.image||'images/placeholder-product.svg')}" alt="${altEsc(p.name)}" onerror="this.onerror=null;this.src='images/placeholder-product.svg'">
          <div>
            <div class="alt-sr-name">${altEsc(p.name)}</div>
            <div class="alt-sr-meta">${altEsc(p.colour||'')} · ${altEsc(p.material||'')}</div>
          </div>
          ${p.tag ? `<span class="alt-sr-tag">${altEsc(p.tag)}</span>` : ''}
        </div>
      `).join('');
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.ALT_SEARCH_CLOSE(); });
  }

  window.ALT_SEARCH_OPEN = function () {
    injectSearchOverlay();
    document.getElementById('altSearchOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('altSearchInput')?.focus(), 50);
  };
  window.ALT_SEARCH_CLOSE = function () {
    document.getElementById('altSearchOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  };
  window.ALT_SEARCH_ENQUIRE = function (sku) {
    const p = (window.ALT_PRODUCTS||[]).find(x => x.sku === sku);
    if (!p) return;
    window.ALT_SEARCH_CLOSE();
    const msg = `Hi, I'd like to enquire about the following product:\n\nProduct: ${p.name}${p.colour ? ' — ' + p.colour : ''}\nSKU: ${p.sku}\nSize: ${p.size||''}${p.weight ? '\nWeight: '+p.weight : ''}\nMaterial: ${p.material||''}\n\nPlease provide pricing and availability.`;
    sessionStorage.setItem('alt_enquiry', msg);
    window.location.href = 'contact.html';
  };
  // ────────────────────────────────────────────────

  window.ALT_OPEN_DRAWER = function () {
    document.querySelector('.mobile-drawer')?.classList.add('open');
    document.querySelector('.drawer-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.ALT_CLOSE_DRAWER = function () {
    document.querySelector('.mobile-drawer')?.classList.remove('open');
    document.querySelector('.drawer-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  };


  // ── Header + Footer runtime injection ────────────────────────────────────
  // Source of truth: src/partials/header.html + footer.html
  // These strings are auto-generated — edit the source files, then run:
  //   node -e "require('./scripts/sync-partials.js')"
  // OR activate GitHub Actions FTP deploy (ci.yml) to build+deploy automatically.
  window.ALT_HEADER = function() {
    return "<a href=\"#main-content\" class=\"alt-skip\">Skip to content</a>\n<div class=\"utility-bar\">\n  <div class=\"wrap\">\n    <div class=\"left\">\n      <span>Free shipping on orders over AU$100</span>\n      <span>Australia-wide delivery</span>\n    </div>\n    <div class=\"right\">\n      <a href=\"mailto:info@auslinenandtowels.com.au\">info@auslinenandtowels.com.au</a>\n      <a href=\"tel:0414533449\">0414 533 449</a>\n    </div>\n  </div>\n</div>\n<header class=\"site-header\">\n  <div class=\"wrap\">\n    <nav class=\"nav-main left\">\n      <a href=\"collection.html\" data-nav=\"collection\">Collection</a>\n      <a href=\"blog.html\" data-nav=\"blog\">Blog</a>\n      <a href=\"about.html\" data-nav=\"about\">About</a>\n    </nav>\n    <button class=\"menu-toggle\" aria-label=\"Open menu\" data-action=\"open-drawer\">\n      <svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><path d=\"M4 7h16M4 12h16M4 17h16\"/></svg>\n    </button>\n    <a class=\"brand\" href=\"index.html\">\n      <img class=\"brand-logo\" src=\"images/logo-header.png\" alt=\"Australian Linen & Towels\" />\n    </a>\n    <nav class=\"nav-main right\">\n      <a href=\"room-package.html\" data-nav=\"room-package\">Bulk Quote</a>\n      <a href=\"trade-account.html\" data-nav=\"trade-account\">Trade Account</a>\n      <a href=\"contact.html\" data-nav=\"contact\">Contact</a>\n      <button class=\"alt-qb-nav\" id=\"altQbNav\" type=\"button\" aria-label=\"Open Quote Bucket\" data-action=\"open-wishlist\">\n        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.7\"><path d=\"M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z\"/><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/><path d=\"M16 10a4 4 0 01-8 0\"/></svg>\n        <span class=\"alt-qb-badge\" id=\"altQbBadge\"></span>\n      </button>\n    </nav>\n  </div>\n</header>\n\n<div class=\"drawer-overlay\" data-action=\"close-drawer\"></div>\n<div class=\"mobile-drawer\" id=\"mobileDrawer\">\n  <button class=\"close\" aria-label=\"Close menu\" data-action=\"close-drawer\">\n    <svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><path d=\"M6 6l12 12M18 6L6 18\"/></svg>\n  </button>\n  <div class=\"brand-sm\"><img src=\"images/logo-header.png\" alt=\"Australian Linen & Towels\" style=\"max-width:180px;width:100%;height:auto;display:block;margin:0 auto;\"/></div>\n  <a href=\"index.html\">Home</a>\n  <a href=\"collection.html\">Collection</a>\n  <a href=\"collection.html?cat=towels-bath\">Bath Towels</a>\n  <a href=\"collection.html?cat=towels-gym\">Gym &amp; Fitness Towels</a>\n  <a href=\"collection.html?cat=tea-towels\">Tea Towels</a>\n  <a href=\"collection.html?cat=sheets-flat\">Bed Linen</a>\n  <div style=\"margin:14px 0 6px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9b9dae;\">For Your Business</div>\n  <a href=\"hotels.html\">Hotels &amp; Resorts</a>\n  <a href=\"motels.html\">Motels &amp; Serviced Apartments</a>\n  <a href=\"spas.html\">Day Spas &amp; Salons</a>\n  <a href=\"gyms.html\">Gyms &amp; Fitness Centres</a>\n  <a href=\"airbnb.html\">Airbnb &amp; Short-Stay</a>\n  <div style=\"margin:14px 0 6px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9b9dae;\">Account</div>\n  <a href=\"room-package.html\">Bulk Quote Calculator</a>\n  <a href=\"trade-account.html\">Open Trade Account</a>\n  <a href=\"blog.html\">Blog</a>\n  <a href=\"case-studies.html\">Case Studies</a>\n  <a href=\"about.html\">About</a>\n  <a href=\"faq.html\">FAQ</a>\n  <a href=\"contact.html\">Contact Us</a>\n  <div class=\"contact-info\">\n    <a href=\"tel:0414533449\">\n      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>\n      0414 533 449\n    </a>\n    <a href=\"mailto:info@auslinenandtowels.com.au\">\n      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"/><polyline points=\"22,6 12,13 2,6\"/></svg>\n      Email us\n    </a>\n    <div style=\"margin-top: 14px; font-size: 12px; line-height: 1.7;\">Griffith, NSW · Australia</div>\n  </div>\n</div>\n\n<div class=\"mobile-call-bar\">\n  <a href=\"tel:0414533449\" class=\"call\">\n    <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>\n    Call sales\n  </a>\n  <a href=\"mailto:info@auslinenandtowels.com.au\" class=\"email\">\n    <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"/><polyline points=\"22,6 12,13 2,6\"/></svg>\n    Email\n  </a>\n</div>\n<span id=\"main-content\" tabindex=\"-1\"></span>";
  };
  window.ALT_FOOTER = function() {
    return "<footer class=\"site-footer\">\n  <div class=\"wrap\">\n    <div class=\"brand-block\">\n      <div class=\"mark\"><img src=\"images/logo-footer-white.png\" alt=\"Australian Linen &amp; Towels\" style=\"max-width:200px;width:100%;height:auto;display:block;margin-bottom:14px;\"/></div>\n      <p>Premium commercial linens for hotels, spas, and hospitality businesses across Australia. Excellence in every thread.</p>\n    </div>\n    <div>\n      <h5>Quick Links</h5>\n      <ul>\n        <li><a href=\"index.html\">Home</a></li>\n        <li><a href=\"collection.html\">Collection</a></li>\n        <li><a href=\"room-package.html\">Bulk Quote Calculator</a></li>\n        <li><a href=\"trade-account.html\">Open Trade Account</a></li>\n        <li><a href=\"blog.html\">Blog</a></li>\n        <li><a href=\"case-studies.html\">Case Studies</a></li>\n        <li><a href=\"about.html\">About</a></li>\n        <li><a href=\"faq.html\">FAQ</a></li>\n        <li><a href=\"contact.html\">Contact Us</a></li>\n      </ul>\n    </div>\n    <div>\n      <h5>Collection</h5>\n      <ul>\n        <li><a href=\"collection.html?cat=towels-bath\">Towels</a></li>\n        <li><a href=\"collection.html?cat=tea-towels\">Tea Towels</a></li>\n        <li><a href=\"collection.html?cat=sheets-flat\">Bed Linen</a></li>\n        <li><a href=\"collection.html?cat=quilts-micro\">Quilts &amp; Blankets</a></li>\n        <li><a href=\"collection.html?cat=pillows\">Pillows</a></li>\n        <li><a href=\"collection.html\">View All</a></li>\n      </ul>\n    </div>\n    <div>\n      <h5>For Your Business</h5>\n      <ul>\n        <li><a href=\"hotels.html\">Hotels &amp; Resorts</a></li>\n        <li><a href=\"motels.html\">Motels &amp; Serviced Apts</a></li>\n        <li><a href=\"spas.html\">Day Spas &amp; Salons</a></li>\n        <li><a href=\"gyms.html\">Gyms &amp; Fitness</a></li>\n        <li><a href=\"airbnb.html\">Airbnb &amp; Short-Stay</a></li>\n      </ul>\n    </div>\n    <div>\n      <h5>Support</h5>\n      <ul>\n        <li><a href=\"faq.html#q9\">Shipping Policy</a></li>\n        <li><a href=\"faq.html#q10\">Returns</a></li>\n        <li><a href=\"faq.html\">Wholesale FAQ</a></li>\n        <li><a href=\"contact.html\">Bulk Quote</a></li>\n      </ul>\n    </div>\n    <div>\n      <h5>Griffith, NSW</h5>\n      <div style=\"font-size:13px;line-height:1.9;color:#9b9dae;margin-top:12px;\">\n        <a href=\"tel:0414533449\" style=\"color:#d4b568;display:block;\">0414 533 449</a>\n        <a href=\"mailto:info@auslinenandtowels.com.au\" style=\"color:#d4b568;display:block;\">info@auslinenandtowels.com.au</a>\n        <span style=\"display:block;margin-top:10px;\">Mon–Fri &nbsp;9am–5pm AEST</span>\n        <span style=\"display:block;\">Sat &nbsp;9am–1pm AEST</span>\n        <span style=\"display:block;margin-top:8px;font-size:12px;color:#6b6e86;\">ABN 86 602 936 725</span>\n      </div>\n    </div>\n  </div>\n  <div class=\"footer-bottom\">\n    <span>© 2026 Australian Linen &amp; Towels · All rights reserved · ABN 86 602 936 725</span>\n    <div class=\"legals\">\n      <a href=\"terms.html\">Terms</a>\n      <a href=\"privacy.html\">Privacy</a>\n    </div>\n  </div>\n</footer>";
  };

  function autoMount() {
    document.querySelectorAll('[data-header]').forEach(function(el) {
      var wrap = document.createElement('div');
      wrap.innerHTML = window.ALT_HEADER();
      el.replaceWith.apply(el, wrap.childNodes);
    });
    document.querySelectorAll('[data-footer]').forEach(function(el) {
      var wrap = document.createElement('div');
      wrap.innerHTML = window.ALT_FOOTER();
      el.replaceWith.apply(el, wrap.childNodes);
    });
  }

  // ── Active nav state ─────────────────────────────────────────────────────────
  // Header is now a build-time partial (same HTML on all pages). Active class is
  // set at runtime by matching [data-nav] href slugs against body.dataset.page.
  function setActiveNav() {
    var page = document.body.dataset.page || '';
    document.querySelectorAll('[data-nav]').forEach(function(a) {
      var slug = (a.getAttribute('href') || '').replace(/\.html.*$/, '');
      a.classList.toggle('active', slug === page);
    });
  }

  // ── Footer accordion (mobile) ─────────────────────────────────────────────
  function initFooterAccordion() {
    document.querySelectorAll('.site-footer > .wrap > div:not(.brand-block)').forEach(function(section) {
      var h5 = section.querySelector('h5');
      if (!h5 || h5.dataset.wired) return;
      h5.dataset.wired = '1';
      h5.addEventListener('click', function() {
        if (window.innerWidth > 900) return;
        section.classList.toggle('acc-open');
      });
    });
  }

  // ── data-action delegation ────────────────────────────────────────────────
  // Replaces all inline onclick= handlers on header elements and search overlay.
  // Single listener on document — works on build-time partials and dynamic HTML.
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'open-drawer':    window.ALT_OPEN_DRAWER(); break;
      case 'close-drawer':   window.ALT_CLOSE_DRAWER(); break;
      case 'open-wishlist':  window.ALT_WISHLIST && window.ALT_WISHLIST.open(); break;
      case 'search-close':   window.ALT_SEARCH_CLOSE && window.ALT_SEARCH_CLOSE(); break;
      case 'search-enquire':
        var sku = el.dataset.sku;
        if (sku) window.ALT_SEARCH_ENQUIRE && window.ALT_SEARCH_ENQUIRE(sku);
        break;
    }
  });

  // GA4 — phone + email click events (delegated; works on dynamically-injected header/footer)
  document.addEventListener('click', function(e) {
    if (typeof gtag !== 'function') return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0)    gtag('event', 'phone_click',  { link_url: href });
    if (href.indexOf('mailto:') === 0) gtag('event', 'email_click',  { link_url: href });
  });

  // Auto-load wishlist.js once on every page
  function loadWishlist() {
    if (document.querySelector('script[data-alt-wishlist]')) return;
    var s = document.createElement('script');
    s.src = 'assets/wishlist.js?v=2';
    s.defer = true;
    s.setAttribute('data-alt-wishlist', '1');
    document.head.appendChild(s);
  }

  // Auto-load upgrades.js (multi-channel widget, recently viewed, share buttons)
  function loadUpgrades() {
    if (document.querySelector('script[data-alt-upgrades]')) return;
    var s = document.createElement('script');
    s.src = 'assets/upgrades.js';
    s.defer = true;
    s.setAttribute('data-alt-upgrades', '1');
    document.head.appendChild(s);
  }

  // Auto-load lead-capture.js (smart exit-intent modal)
  function loadLeadCapture() {
    if (document.querySelector('script[data-alt-lead]')) return;
    var s = document.createElement('script');
    s.src = 'assets/lead-capture.js';
    s.defer = true;
    s.setAttribute('data-alt-lead', '1');
    document.head.appendChild(s);
  }

  // Auto-load onboarding.js (buyer persona popup, shows once)
  function loadOnboarding() {
    if (document.querySelector('script[data-alt-onboarding]')) return;
    var s = document.createElement('script');
    s.src = 'assets/onboarding.js?v=3';
    s.defer = true;
    s.setAttribute('data-alt-onboarding', '1');
    document.head.appendChild(s);
  }

  function bootExtras() {
    autoMount();
    setActiveNav();
    initFooterAccordion();
    loadWishlist();
    loadUpgrades();
    loadLeadCapture();
    loadOnboarding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootExtras);
  } else {
    bootExtras();
  }
})();
