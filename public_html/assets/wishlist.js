// Australian Linen & Towels — Wishlist (shortlist) module
// - localStorage-backed list of SKUs
// - Heart icon auto-injected onto every product card via MutationObserver
// - Floating count pill bottom-right; click opens drawer
// - "Request quote for all" button compiles selections into a multi-line enquiry
// - Single-file, zero dependencies
(function () {
  'use strict';
  if (window.__altWishlistLoaded) return;
  window.__altWishlistLoaded = true;

  var KEY = 'alt_wishlist_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function write(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
    syncUI();
  }
  function has(sku) { return read().indexOf(sku) !== -1; }
  function toggle(sku) {
    var list = read();
    var i = list.indexOf(sku);
    if (i === -1) list.push(sku); else list.splice(i, 1);
    write(list);
    return list.indexOf(sku) !== -1;
  }
  function clear() { write([]); }

  window.ALT_WISHLIST = { read: read, has: has, toggle: toggle, clear: clear, open: openDrawer, close: closeDrawer };

  // ─── STYLES ───
  var css =
    '.alt-wl-heart{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;' +
    'background:rgba(255,255,255,.94);border:none;cursor:pointer;display:inline-flex;align-items:center;' +
    'justify-content:center;z-index:3;transition:transform .15s,background .15s;color:#6b6e7d;' +
    'box-shadow:0 2px 6px rgba(0,0,0,.08)}' +
    '.alt-wl-heart:hover{transform:scale(1.08);color:#b8933a}' +
    '.alt-wl-heart.is-on{background:#b8933a;color:#fff}' +
    '.alt-wl-heart svg{width:16px;height:16px;fill:currentColor;stroke:currentColor;stroke-width:1.5}' +
    '.alt-wl-pill{position:fixed;bottom:24px;right:24px;background:#1a1f4e;color:#fff;border:none;' +
    'cursor:pointer;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.14em;' +
    'text-transform:uppercase;padding:13px 20px;border-radius:32px;z-index:9996;display:none;align-items:center;' +
    'gap:10px;box-shadow:0 6px 22px rgba(26,31,78,.32);transition:transform .15s,box-shadow .15s}' +
    '.alt-wl-pill:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(26,31,78,.4)}' +
    '.alt-wl-pill.is-visible{display:inline-flex}' +
    '.alt-wl-pill .alt-wl-count{background:#b8933a;color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;font-weight:600}' +
    '.alt-wl-pill svg{width:16px;height:16px;fill:#d4b568;stroke:#d4b568;stroke-width:1.5}' +
    '@media(max-width:768px){.alt-wl-pill{bottom:96px;right:14px;padding:11px 16px;font-size:10.5px}}' +
    '.alt-wl-overlay{position:fixed;inset:0;background:rgba(10,14,40,.55);backdrop-filter:blur(3px);z-index:9998;' +
    'opacity:0;pointer-events:none;transition:opacity .25s}' +
    '.alt-wl-overlay.is-open{opacity:1;pointer-events:auto}' +
    '.alt-wl-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:92vw;background:#faf8f3;' +
    'z-index:9999;transform:translateX(100%);transition:transform .3s ease;display:flex;flex-direction:column;' +
    'box-shadow:-12px 0 40px rgba(0,0,0,.18);font-family:"Inter",sans-serif}' +
    '.alt-wl-drawer.is-open{transform:translateX(0)}' +
    '.alt-wl-head{background:#1a1f4e;color:#fff;padding:22px 24px;display:flex;align-items:center;justify-content:space-between}' +
    '.alt-wl-head h3{font-family:"Inter",sans-serif;font-size:24px;font-weight:400;margin:0}' +
    '.alt-wl-head h3 em{font-style:italic;color:#d4b568}' +
    '.alt-wl-head button{background:transparent;border:0;color:#fff;cursor:pointer;padding:6px;opacity:.7}' +
    '.alt-wl-head button:hover{opacity:1}' +
    '.alt-wl-head button svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6}' +
    '.alt-wl-body{flex:1;overflow-y:auto;padding:12px 18px}' +
    '.alt-wl-empty{text-align:center;padding:60px 20px;color:#6b6e7d;font-size:14px;line-height:1.6}' +
    '.alt-wl-empty .em{font-family:"Inter",sans-serif;font-size:24px;color:#1a1f4e;margin-bottom:10px;display:block}' +
    '.alt-wl-item{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #e5e0d2}' +
    '.alt-wl-item:last-child{border-bottom:none}' +
    '.alt-wl-thumb{width:64px;height:64px;background:#f2ede2;border-radius:3px;overflow:hidden;flex-shrink:0}' +
    '.alt-wl-thumb img{width:100%;height:100%;object-fit:cover}' +
    '.alt-wl-info{flex:1;min-width:0}' +
    '.alt-wl-name{font-family:"Inter",sans-serif;font-size:16px;font-weight:500;color:#1a1f4e;line-height:1.25;margin-bottom:4px}' +
    '.alt-wl-meta{font-family:"JetBrains Mono",monospace;font-size:10px;color:#6b6e7d;letter-spacing:.06em;text-transform:uppercase}' +
    '.alt-wl-rm{background:transparent;border:0;color:#6b6e7d;cursor:pointer;padding:6px;font-size:13px;align-self:flex-start;flex-shrink:0}' +
    '.alt-wl-rm:hover{color:#a3812f}' +
    '.alt-wl-foot{padding:18px 20px;border-top:1px solid #e5e0d2;background:#fff;display:flex;flex-direction:column;gap:10px}' +
    '.alt-wl-cta{background:#1a1f4e;color:#fff;border:0;padding:15px;font-family:"JetBrains Mono",monospace;' +
    'font-size:11px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;border-radius:2px;font-weight:500;min-height:50px}' +
    '.alt-wl-cta:hover{background:#252a5c}' +
    '.alt-wl-clear{background:transparent;color:#6b6e7d;border:1px solid #e5e0d2;padding:11px;font-family:"JetBrains Mono",monospace;' +
    'font-size:10px;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;border-radius:2px}' +
    '.alt-wl-clear:hover{color:#1a1f4e;border-color:#1a1f4e}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var heartSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var heartFilledSvg = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  // ─── Floating pill ───
  var pill = document.createElement('button');
  pill.className = 'alt-wl-pill';
  pill.type = 'button';
  pill.setAttribute('aria-label', 'View shortlisted products');
  pill.innerHTML = heartFilledSvg + '<span>Shortlist</span><span class="alt-wl-count">0</span>';
  pill.addEventListener('click', openDrawer);

  // ─── Drawer ───
  var overlay = document.createElement('div');
  overlay.className = 'alt-wl-overlay';
  overlay.addEventListener('click', closeDrawer);

  var drawer = document.createElement('aside');
  drawer.className = 'alt-wl-drawer';
  drawer.setAttribute('aria-label', 'Shortlisted products');
  drawer.innerHTML =
    '<div class="alt-wl-head">' +
      '<h3>Your <em>Shortlist</em></h3>' +
      '<button type="button" aria-label="Close" class="alt-wl-close">' +
        '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="alt-wl-body" id="altWlBody"></div>' +
    '<div class="alt-wl-foot">' +
      '<button type="button" class="alt-wl-cta" id="altWlEnquire">Request Quote for All →</button>' +
      '<button type="button" class="alt-wl-clear" id="altWlClear">Clear shortlist</button>' +
    '</div>';

  function mountChrome() {
    if (!document.body) { return setTimeout(mountChrome, 50); }
    document.body.appendChild(pill);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    drawer.querySelector('.alt-wl-close').addEventListener('click', closeDrawer);
    drawer.querySelector('#altWlEnquire').addEventListener('click', submitEnquiry);
    drawer.querySelector('#altWlClear').addEventListener('click', function(){
      if (confirm('Clear all shortlisted items?')) clear();
    });
    syncUI();
    injectHearts();
    observe();
  }

  function openDrawer() {
    renderBody();
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderBody() {
    var body = document.getElementById('altWlBody');
    var list = read();
    var products = (window.ALT_PRODUCTS || []);
    var hits = list.map(function(sku){ return products.find(function(p){ return p.sku === sku; }); }).filter(Boolean);
    if (!hits.length) {
      body.innerHTML = '<div class="alt-wl-empty"><span class="em">Nothing shortlisted yet</span>Tap the heart on any product to add it here, then request a single combined quote for all your selections.</div>';
      return;
    }
    body.innerHTML = hits.map(function(p){
      var img = p.image || 'images/placeholder-product.svg';
      return '<div class="alt-wl-item">' +
        '<a class="alt-wl-thumb" href="product.html?sku=' + encodeURIComponent(p.sku) + '">' +
          '<img src="' + img + '" alt="' + escapeHtml(p.name) + '" onerror="this.onerror=null;this.src=\'images/placeholder-product.svg\'"/>' +
        '</a>' +
        '<div class="alt-wl-info">' +
          '<div class="alt-wl-name"><a href="product.html?sku=' + encodeURIComponent(p.sku) + '">' + escapeHtml(p.name) + '</a></div>' +
          '<div class="alt-wl-meta">' + escapeHtml(p.colour || '') + ' · ' + escapeHtml(p.sku) + (p.size ? ' · ' + escapeHtml(p.size) : '') + '</div>' +
        '</div>' +
        '<button type="button" class="alt-wl-rm" aria-label="Remove" data-sku="' + escapeHtml(p.sku) + '">✕</button>' +
      '</div>';
    }).join('');
    body.querySelectorAll('.alt-wl-rm').forEach(function(btn){
      btn.addEventListener('click', function(){
        toggle(btn.getAttribute('data-sku'));
        renderBody();
      });
    });
  }

  function submitEnquiry() {
    var list = read();
    if (!list.length) return;
    var products = (window.ALT_PRODUCTS || []);
    var lines = list.map(function(sku){
      var p = products.find(function(x){ return x.sku === sku; });
      if (!p) return '- SKU ' + sku;
      return '- ' + p.name + (p.colour ? ' (' + p.colour + ')' : '') +
             ' · SKU ' + p.sku +
             (p.size ? ' · ' + p.size : '') +
             (p.weight ? ' · ' + p.weight + ' gsm' : '');
    });
    var msg = "Hi,\n\nI'd like a wholesale quote for the following shortlist:\n\n" + lines.join('\n') +
              "\n\nPlease provide trade pricing, minimum order quantities, and lead times. Happy to discuss volumes and bundle pricing.\n\nThanks.";
    sessionStorage.setItem('alt_enquiry', msg);
    window.location.href = 'contact.html';
  }

  function syncUI() {
    var n = read().length;
    pill.querySelector('.alt-wl-count').textContent = String(n);
    pill.classList.toggle('is-visible', n > 0);
    // sync any existing heart icons
    document.querySelectorAll('.alt-wl-heart').forEach(function(h){
      var sku = h.getAttribute('data-sku');
      var on = has(sku);
      h.classList.toggle('is-on', on);
      h.innerHTML = on ? heartFilledSvg : heartSvg;
      h.setAttribute('aria-label', on ? 'Remove from shortlist' : 'Add to shortlist');
    });
  }

  function injectHearts(root) {
    var scope = root || document;
    var cards = scope.querySelectorAll('.product-card, .r-card');
    cards.forEach(function(card){
      if (card.querySelector('.alt-wl-heart')) return;
      // Extract SKU from inner href / onclick
      var sku = null;
      var anchor = card.tagName === 'A' ? card : card.querySelector('a[href*="?sku="]');
      if (anchor) {
        var m = anchor.getAttribute('href').match(/[?&]sku=([^&]+)/);
        if (m) sku = decodeURIComponent(m[1]);
      }
      if (!sku) {
        var onclick = card.getAttribute('onclick') || '';
        var m2 = onclick.match(/sku=([A-Za-z0-9_-]+)/);
        if (m2) sku = m2[1];
      }
      if (!sku) return;
      var imgWrap = card.querySelector('.img, .product-img, .img-wrap');
      if (!imgWrap) return;
      if (getComputedStyle(imgWrap).position === 'static') imgWrap.style.position = 'relative';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'alt-wl-heart' + (has(sku) ? ' is-on' : '');
      btn.setAttribute('data-sku', sku);
      btn.setAttribute('aria-label', has(sku) ? 'Remove from shortlist' : 'Add to shortlist');
      btn.innerHTML = has(sku) ? heartFilledSvg : heartSvg;
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        toggle(sku);
      });
      imgWrap.appendChild(btn);
    });
  }

  function observe() {
    var mo = new MutationObserver(function(mutations){
      var any = false;
      mutations.forEach(function(m){
        if (m.addedNodes && m.addedNodes.length) any = true;
      });
      if (any) injectHearts();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountChrome);
  } else {
    mountChrome();
  }
})();
