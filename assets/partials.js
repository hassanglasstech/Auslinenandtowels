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
  // GOOGLE ANALYTICS 4 — only after consent (or implicit anonymous mode)
  // ═══════════════════════════════════════════════════════
  function loadGA() {
    if (window.__altGALoaded) return;
    if (getConsent() === 'declined') return;
    window.__altGALoaded = true;
    var gaId = 'G-BXCSDXJWFJ';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId, { anonymize_ip: true });
  }
  loadGA();

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
      setConsent('granted'); banner.remove(); loadGA();
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

  // ═══════════════════════════════════════════════════════
  // MICROSOFT CLARITY — set clarityId once provisioned
  // ═══════════════════════════════════════════════════════
  (function loadClarity() {
    var clarityId = 'XXXXXXXXXX';
    if (clarityId === 'XXXXXXXXXX') return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      var y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", clarityId);
  })();

  function icon(name) {
    const p = {
      search: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="7" class="ln"/><path d="M20 20l-3.5-3.5" class="ln"/></svg>',
      user: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="8" r="4" class="ln"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" class="ln"/></svg>',
      menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
      close: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      phone: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      mail: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    };
    return p[name] || '';
  }
  window.ALT_ICON = icon;

  window.ALT_HEADER = function (active) {
    return `
    <div class="utility-bar">
      <div class="wrap">
        <div class="left">
          <span>Free shipping on orders over AU$100</span>
          <span>Australia-wide delivery</span>
        </div>
        <div class="right">
          <a href="mailto:info@auslinenandtowels.com.au">info@auslinenandtowels.com.au</a>
          <a href="tel:0414533449">0414 533 449</a>
        </div>
      </div>
    </div>
    <header class="site-header">
      <div class="wrap">
        <nav class="nav-main left">
          <a href="collection.html" class="${active==='collection'?'active':''}">Collection</a>
          <a href="blog.html" class="${active==='blog'?'active':''}">Blog</a>
          <a href="about.html" class="${active==='about'?'active':''}">About</a>
        </nav>
        <button class="menu-toggle" aria-label="Open menu" onclick="window.ALT_OPEN_DRAWER()">${icon('menu')}</button>
        <a class="brand" href="index.html">
          <img class="brand-logo" src="images/logo-header.png" alt="Australian Linen & Towels" />
        </a>
        <nav class="nav-main right">
          <a href="room-package.html" class="${active==='room-package'?'active':''}">Bulk Quote</a>
          <a href="trade-account.html" class="${active==='trade-account'?'active':''}">Trade Account</a>
          <a href="contact.html" class="${active==='contact'?'active':''}">Contact</a>
          <div class="header-icons">
            <button class="icon-btn alt-search-btn" onclick="window.ALT_SEARCH_OPEN()" aria-label="Search products">${icon('search')}</button>
          </div>
        </nav>
        <div class="header-icons mobile-only-search">
          <button class="icon-btn alt-search-btn" onclick="window.ALT_SEARCH_OPEN()" aria-label="Search products">${icon('search')}</button>
        </div>
      </div>
    </header>

    <div class="drawer-overlay" onclick="window.ALT_CLOSE_DRAWER()"></div>
    <div class="mobile-drawer" id="mobileDrawer">
      <button class="close" aria-label="Close menu" onclick="window.ALT_CLOSE_DRAWER()">${icon('close')}</button>
      <div class="brand-sm"><img src="images/logo-header.png" alt="Australian Linen & Towels" style="max-width:180px;width:100%;height:auto;display:block;margin:0 auto;"/></div>
      <a href="index.html">Home</a>
      <a href="collection.html">Collection</a>
      <a href="collection.html?cat=towels-bath">Bath Towels</a>
      <a href="collection.html?cat=towels-gym">Gym &amp; Fitness Towels</a>
      <a href="collection.html?cat=tea-towels">Tea Towels</a>
      <a href="collection.html?cat=sheets-flat">Bed Linen</a>
      <a href="room-package.html">Bulk Quote Calculator</a>
      <a href="trade-account.html">Open Trade Account</a>
      <a href="blog.html">Blog</a>
      <a href="case-studies.html">Case Studies</a>
      <a href="about.html">About</a>
      <a href="faq.html">FAQ</a>
      <a href="contact.html">Contact Us</a>
      <div class="contact-info">
        <a href="tel:0414533449">${icon('phone')} 0414 533 449</a>
        <a href="mailto:info@auslinenandtowels.com.au">${icon('mail')} Email us</a>
        <div style="margin-top: 14px; font-size: 12px; line-height: 1.7;">Griffith, NSW · Australia</div>
      </div>
    </div>

    <div class="mobile-call-bar">
      <a href="tel:0414533449" class="call">${icon('phone')} Call sales</a>
      <a href="mailto:info@auslinenandtowels.com.au" class="email">${icon('mail')} Email</a>
    </div>`;
  };

  window.ALT_FOOTER = function () {
    return `
    <footer class="site-footer">
      <div class="wrap">
        <div class="brand-block">
          <div class="mark"><img src="images/logo-footer-white.png" alt="Australian Linen &amp; Towels" style="max-width:200px;width:100%;height:auto;display:block;margin-bottom:14px;"/></div>
          <p>Premium commercial linens for hotels, spas, and hospitality businesses across Australia. Excellence in every thread.</p>
        </div>
        <div>
          <h5>Quick Links</h5>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="collection.html">Collection</a></li>
            <li><a href="room-package.html">Bulk Quote Calculator</a></li>
            <li><a href="trade-account.html">Open Trade Account</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="case-studies.html">Case Studies</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="contact.html">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h5>Collection</h5>
          <ul>
            <li><a href="collection.html?cat=towels-bath">Towels</a></li>
            <li><a href="collection.html?cat=tea-towels">Tea Towels</a></li>
            <li><a href="collection.html?cat=sheets-flat">Bed Linen</a></li>
            <li><a href="collection.html?cat=quilts-micro">Quilts &amp; Blankets</a></li>
            <li><a href="collection.html?cat=pillows">Pillows</a></li>
            <li><a href="collection.html">View All</a></li>
          </ul>
        </div>
        <div>
          <h5>Support</h5>
          <ul>
            <li><a href="faq.html#q9">Shipping Policy</a></li>
            <li><a href="faq.html#q10">Returns</a></li>
            <li><a href="faq.html">Wholesale FAQ</a></li>
            <li><a href="contact.html">Bulk Quote</a></li>
          </ul>
        </div>
        <div>
          <h5>Griffith, NSW</h5>
          <div style="font-size:13px;line-height:1.9;color:#9b9dae;margin-top:12px;">
            <a href="tel:0414533449" style="color:#d4b568;display:block;">0414 533 449</a>
            <a href="mailto:info@auslinenandtowels.com.au" style="color:#d4b568;display:block;">info@auslinenandtowels.com.au</a>
            <span style="display:block;margin-top:10px;">Mon–Fri &nbsp;9am–5pm AEDT</span>
            <span style="display:block;">Sat &nbsp;9am–1pm AEDT</span>
            <span style="display:block;margin-top:8px;font-size:12px;color:#6b6e86;">ABN 86 602 936 725</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Australian Linen &amp; Towels · All rights reserved · ABN 86 602 936 725</span>
        <div class="legals">
          <a href="terms.html">Terms</a>
          <a href="privacy.html">Privacy</a>
        </div>
      </div>
    </footer>`;
  };

  // ── SEARCH OVERLAY ──────────────────────────────
  function injectSearchOverlay() {
    if (document.getElementById('altSearchOverlay')) return;

    const style = document.createElement('style');
    style.textContent = `
      #altSearchOverlay {
        display:none;position:fixed;inset:0;z-index:10000;
        background:rgba(10,14,40,.72);backdrop-filter:blur(4px);
      }
      #altSearchOverlay.open { display:flex;flex-direction:column;align-items:center;padding-top:80px; }
      .alt-search-box {
        width:100%;max-width:640px;background:#fff;border-radius:4px;
        box-shadow:0 24px 64px rgba(0,0,0,.28);overflow:hidden;
      }
      .alt-search-input-wrap {
        display:flex;align-items:center;padding:0 18px;border-bottom:1px solid #e8e5de;
      }
      .alt-search-input-wrap svg { flex-shrink:0;opacity:.45; }
      #altSearchInput {
        flex:1;border:none;outline:none;padding:18px 14px;
        font-family:var(--f-sans,'Inter',sans-serif);font-size:16px;
        color:#1a1f4e;background:transparent;
      }
      #altSearchInput::placeholder { color:#aaa; }
      .alt-search-close {
        background:none;border:none;cursor:pointer;padding:6px;opacity:.5;
        transition:opacity .2s;flex-shrink:0;
      }
      .alt-search-close:hover { opacity:1; }
      #altSearchResults { max-height:420px;overflow-y:auto; }
      .alt-sr-item {
        display:flex;align-items:center;gap:14px;padding:12px 18px;
        cursor:pointer;border-bottom:1px solid #f0ede8;transition:background .15s;
      }
      .alt-sr-item:last-child { border-bottom:none; }
      .alt-sr-item:hover { background:#faf8f5; }
      .alt-sr-img {
        width:52px;height:52px;object-fit:cover;border-radius:3px;
        background:#f0ede8;flex-shrink:0;
      }
      .alt-sr-name { font-family:var(--f-serif,'Inter',sans-serif);font-size:16px;font-weight:600;color:#1a1f4e; }
      .alt-sr-meta { font-size:11px;color:#8b8fa8;margin-top:2px;letter-spacing:.04em; }
      .alt-sr-tag {
        margin-left:auto;font-family:var(--f-mono,'JetBrains Mono',monospace);
        font-size:9px;letter-spacing:.12em;text-transform:uppercase;
        background:#1a1f4e;color:#fff;padding:3px 8px;border-radius:2px;flex-shrink:0;
      }
      .alt-search-empty { padding:40px 18px;text-align:center;color:#aaa;font-size:14px; }
      .alt-search-hint { padding:10px 18px;font-size:11px;color:#bbb;letter-spacing:.06em;text-transform:uppercase; }
      .alt-search-btn { background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;color:inherit; }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'altSearchOverlay';
    overlay.innerHTML = `
      <div class="alt-search-box">
        <div class="alt-search-input-wrap">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="altSearchInput" type="text" placeholder="Search products — towels, sheets, camel…" autocomplete="off"/>
          <button class="alt-search-close" onclick="window.ALT_SEARCH_CLOSE()" aria-label="Close search">
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
        results.innerHTML = '<div class="alt-search-empty">No products found for "' + this.value + '"</div>';
        return;
      }
      results.innerHTML = matches.map(p => `
        <div class="alt-sr-item" onclick="window.ALT_SEARCH_ENQUIRE(${p.sku ? "'"+p.sku+"'" : 'null'})">
          <img class="alt-sr-img" src="${p.image||'images/placeholder-product.svg'}" alt="${p.name}" onerror="this.onerror=null;this.src='images/placeholder-product.svg'">
          <div>
            <div class="alt-sr-name">${p.name}</div>
            <div class="alt-sr-meta">${p.colour||''} · ${p.material||''}</div>
          </div>
          ${p.tag ? `<span class="alt-sr-tag">${p.tag}</span>` : ''}
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

  function autoMount() {
    const active = document.body.dataset.page || '';
    document.querySelectorAll('[data-header]').forEach(el => {
      const wrap = document.createElement('div');
      wrap.innerHTML = window.ALT_HEADER(active);
      el.replaceWith(...wrap.childNodes);
    });
    document.querySelectorAll('[data-footer]').forEach(el => {
      const wrap = document.createElement('div');
      wrap.innerHTML = window.ALT_FOOTER();
      el.replaceWith(...wrap.childNodes);
    });

    // Footer accordion (mobile)
    const initFooterAccordion = () => {
      const isMobile = window.innerWidth <= 900;
      document.querySelectorAll('.site-footer > .wrap > div:not(.brand-block)').forEach(section => {
        const h5 = section.querySelector('h5');
        if (!h5 || h5.dataset.wired) return;
        h5.dataset.wired = '1';
        h5.addEventListener('click', () => {
          if (window.innerWidth > 900) return;
          section.classList.toggle('acc-open');
        });
      });
    };
    initFooterAccordion();
  }

  window.ALT_MOUNT = autoMount;

  // Skip-to-content link (accessibility)
  function addSkipLink() {
    if (document.getElementById('altSkipLink')) return;
    var a = document.createElement('a');
    a.id = 'altSkipLink';
    a.href = '#main';
    a.textContent = 'Skip to content';
    a.style.cssText = 'position:absolute;left:-9999px;top:0;background:#1a1f4e;color:#fff;padding:10px 18px;' +
      'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.14em;' +
      'text-transform:uppercase;text-decoration:none;z-index:10001;border-radius:0 0 4px 0';
    a.addEventListener('focus', function(){ a.style.left = '0'; });
    a.addEventListener('blur',  function(){ a.style.left = '-9999px'; });
    document.body.insertBefore(a, document.body.firstChild);
  }

  // Auto-load wishlist.js once on every page
  function loadWishlist() {
    if (document.querySelector('script[data-alt-wishlist]')) return;
    var s = document.createElement('script');
    s.src = 'assets/wishlist.js';
    s.defer = true;
    s.setAttribute('data-alt-wishlist', '1');
    document.head.appendChild(s);
  }

  function bootExtras() { addSkipLink(); loadWishlist(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ autoMount(); bootExtras(); });
  } else {
    autoMount();
    bootExtras();
  }
})();
