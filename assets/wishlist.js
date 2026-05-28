// Australian Linen & Towels — Quote Bucket module
// - localStorage-backed list of SKUs
// - Heart icon auto-injected onto every product card via MutationObserver
// - Floating pill bottom-right + header badge; click opens drawer
// - "Request quote for all" compiles selections into a combined enquiry
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
    // Heart button on cards
    '.alt-wl-heart{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;' +
    'background:rgba(255,255,255,.94);border:none;cursor:pointer;display:inline-flex;align-items:center;' +
    'justify-content:center;z-index:3;transition:transform .15s,background .15s;color:#6b6e7d;' +
    'box-shadow:0 2px 6px rgba(0,0,0,.08)}' +
    '.alt-wl-heart:hover{transform:scale(1.08);color:#b8933a}' +
    '.alt-wl-heart.is-on{background:#b8933a;color:#fff}' +
    '.alt-wl-heart svg{width:16px;height:16px;fill:currentColor;stroke:currentColor;stroke-width:1.5}' +

    // Floating pill (bottom-right, shows when bucket has items)
    '.alt-wl-pill{position:fixed;bottom:24px;right:24px;background:#1a1f4e;color:#fff;border:none;' +
    'cursor:pointer;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.14em;' +
    'text-transform:uppercase;padding:13px 20px;border-radius:32px;z-index:9996;display:none;align-items:center;' +
    'gap:10px;box-shadow:0 6px 22px rgba(26,31,78,.32);transition:transform .15s,box-shadow .15s}' +
    '.alt-wl-pill:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(26,31,78,.4)}' +
    '.alt-wl-pill.is-visible{display:inline-flex}' +
    '.alt-wl-pill .alt-wl-count{background:#b8933a;color:#fff;border-radius:12px;padding:2px 8px;font-size:11px;font-weight:600}' +
    '.alt-wl-pill svg{width:16px;height:16px;fill:none;stroke:#d4b568;stroke-width:1.8}' +
    '@media(max-width:768px){.alt-wl-pill{bottom:96px;right:14px;padding:11px 16px;font-size:10.5px}}' +

    // Header bucket icon
    '.alt-qb-nav{position:relative;background:none;border:none;cursor:pointer;padding:4px 8px;' +
    'color:#1a1f4e;display:inline-flex;align-items:center;gap:0;vertical-align:middle;border-radius:3px;' +
    'transition:color .15s}' +
    '.alt-qb-nav:hover{color:#b8933a}' +
    '.alt-qb-nav svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7}' +
    '.alt-qb-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:10px;' +
    'background:#b8933a;color:#fff;font-family:"JetBrains Mono",monospace;font-size:9px;font-weight:700;' +
    'display:none;align-items:center;justify-content:center;padding:0 4px;line-height:1}' +
    '.alt-qb-badge.visible{display:flex}' +

    // Overlay
    '.alt-wl-overlay{position:fixed;inset:0;background:rgba(10,14,40,.55);backdrop-filter:blur(3px);z-index:9998;' +
    'opacity:0;pointer-events:none;transition:opacity .25s}' +
    '.alt-wl-overlay.is-open{opacity:1;pointer-events:auto}' +

    // Drawer
    '.alt-wl-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:92vw;background:#faf8f3;' +
    'z-index:9999;transform:translateX(100%);transition:transform .3s ease;display:flex;flex-direction:column;' +
    'box-shadow:-12px 0 40px rgba(0,0,0,.18);font-family:"Inter",sans-serif}' +
    '.alt-wl-drawer.is-open{transform:translateX(0)}' +
    '.alt-wl-head{background:#1a1f4e;color:#fff;padding:22px 24px;display:flex;align-items:center;justify-content:space-between}' +
    '.alt-wl-head h3{font-family:"Inter",sans-serif;font-size:22px;font-weight:400;margin:0;display:flex;align-items:center;gap:10px}' +
    '.alt-wl-head h3 em{font-style:italic;color:#d4b568}' +
    '.alt-wl-head h3 svg{width:20px;height:20px;fill:none;stroke:#d4b568;stroke-width:1.7;flex-shrink:0}' +
    '.alt-wl-head button{background:transparent;border:0;color:#fff;cursor:pointer;padding:6px;opacity:.7}' +
    '.alt-wl-head button:hover{opacity:1}' +
    '.alt-wl-head button svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6}' +
    '.alt-wl-body{flex:1;overflow-y:auto;padding:12px 18px}' +

    // Empty state — cart-style
    '.alt-wl-empty{text-align:center;padding:48px 24px}' +
    '.alt-wl-empty-icon{width:72px;height:72px;margin:0 auto 20px;background:#f0ede6;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center}' +
    '.alt-wl-empty-icon svg{width:32px;height:32px;fill:none;stroke:#b8933a;stroke-width:1.5}' +
    '.alt-wl-empty-title{font-family:"Inter",sans-serif;font-size:18px;font-weight:500;color:#1a1f4e;margin-bottom:8px}' +
    '.alt-wl-empty-sub{font-size:13px;color:#6b6e7d;line-height:1.6;margin-bottom:24px}' +
    '.alt-wl-empty-cta{display:inline-block;background:#1a1f4e;color:#fff;padding:11px 24px;' +
    'font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;' +
    'border-radius:2px;text-decoration:none;transition:background .15s}' +
    '.alt-wl-empty-cta:hover{background:#b8933a}' +

    // Items
    '.alt-wl-item{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #e5e0d2}' +
    '.alt-wl-item:last-child{border-bottom:none}' +
    '.alt-wl-thumb{width:64px;height:64px;background:#f2ede2;border-radius:3px;overflow:hidden;flex-shrink:0}' +
    '.alt-wl-thumb img{width:100%;height:100%;object-fit:cover}' +
    '.alt-wl-info{flex:1;min-width:0}' +
    '.alt-wl-name{font-family:"Inter",sans-serif;font-size:14px;font-weight:500;color:#1a1f4e;line-height:1.3;margin-bottom:4px}' +
    '.alt-wl-name a{color:inherit;text-decoration:none}' +
    '.alt-wl-name a:hover{color:#b8933a}' +
    '.alt-wl-meta{font-family:"JetBrains Mono",monospace;font-size:10px;color:#6b6e7d;letter-spacing:.06em;text-transform:uppercase}' +
    '.alt-wl-rm{background:transparent;border:0;color:#9a9280;cursor:pointer;padding:6px;font-size:16px;align-self:flex-start;flex-shrink:0;line-height:1}' +
    '.alt-wl-rm:hover{color:#a3812f}' +

    // Footer
    '.alt-wl-foot{padding:18px 20px;border-top:1px solid #e5e0d2;background:#fff;display:flex;flex-direction:column;gap:10px}' +
    '.alt-wl-foot-count{font-family:"JetBrains Mono",monospace;font-size:10px;color:#6b6e7d;letter-spacing:.1em;text-transform:uppercase;text-align:center}' +
    '.alt-wl-cta{background:#1a1f4e;color:#fff;border:0;padding:15px;font-family:"JetBrains Mono",monospace;' +
    'font-size:11px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;border-radius:2px;font-weight:500;min-height:50px}' +
    '.alt-wl-cta:hover{background:#b8933a}' +
    '.alt-wl-clear{background:transparent;color:#6b6e7d;border:1px solid #e5e0d2;padding:11px;font-family:"JetBrains Mono",monospace;' +
    'font-size:10px;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;border-radius:2px}' +
    '.alt-wl-clear:hover{color:#1a1f4e;border-color:#1a1f4e}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // SVG icons
  var bagSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
  var heartSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var heartFilledSvg = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ─── Floating pill ───
  var pill = document.createElement('button');
  pill.className = 'alt-wl-pill';
  pill.type = 'button';
  pill.setAttribute('aria-label', 'Open Quote Bucket');
  pill.innerHTML = bagSvg + '<span>Quote Bucket</span><span class="alt-wl-count">0</span>';
  pill.addEventListener('click', openDrawer);

  // ─── Drawer ───
  var overlay = document.createElement('div');
  overlay.className = 'alt-wl-overlay';
  overlay.addEventListener('click', closeDrawer);

  var drawer = document.createElement('aside');
  drawer.className = 'alt-wl-drawer';
  drawer.setAttribute('aria-label', 'Quote Bucket');
  drawer.innerHTML =
    '<div class="alt-wl-head">' +
      '<h3>' + bagSvg + 'Your <em>Quote Bucket</em></h3>' +
      '<button type="button" aria-label="Close" class="alt-wl-close">' + closeSvg + '</button>' +
    '</div>' +
    '<div class="alt-wl-body" id="altWlBody"></div>' +
    '<div class="alt-wl-foot" id="altWlFoot">' +
      '<div class="alt-wl-foot-count" id="altWlFootCount"></div>' +
      '<button type="button" class="alt-wl-cta" id="altWlEnquire">Get Quote for All Items →</button>' +
      '<button type="button" class="alt-wl-clear" id="altWlClear">Clear bucket</button>' +
    '</div>';

  function mountChrome() {
    if (!document.body) { return setTimeout(mountChrome, 50); }
    document.body.appendChild(pill);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    drawer.querySelector('.alt-wl-close').addEventListener('click', closeDrawer);
    drawer.querySelector('#altWlEnquire').addEventListener('click', submitEnquiry);
    drawer.querySelector('#altWlClear').addEventListener('click', function(){
      if (confirm('Clear your Quote Bucket?')) clear();
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
    var foot = document.getElementById('altWlFoot');
    var footCount = document.getElementById('altWlFootCount');
    var list = read();
    var products = (window.ALT_PRODUCTS || []);
    var hits = list.map(function(sku){ return products.find(function(p){ return p.sku === sku; }); }).filter(Boolean);

    if (!hits.length) {
      // Cart-style empty state
      body.innerHTML =
        '<div class="alt-wl-empty">' +
          '<div class="alt-wl-empty-icon">' + bagSvg + '</div>' +
          '<div class="alt-wl-empty-title">Your bucket is empty</div>' +
          '<div class="alt-wl-empty-sub">Tap the heart ♡ on any product to add it here.<br>Build your list, then send one combined quote request.</div>' +
          '<a href="collection.html" class="alt-wl-empty-cta" onclick="window.ALT_WISHLIST.close()">Browse Products →</a>' +
        '</div>';
      if (foot) foot.style.display = 'none';
      return;
    }

    if (foot) foot.style.display = '';
    if (footCount) footCount.textContent = hits.length + ' item' + (hits.length !== 1 ? 's' : '') + ' in your bucket';

    body.innerHTML = hits.map(function(p){
      var img = p.image || 'images/placeholder-product.svg';
      var meta = [p.colour, p.sku, p.size].filter(Boolean).join(' · ');
      return '<div class="alt-wl-item">' +
        '<a class="alt-wl-thumb" href="product.html?sku=' + encodeURIComponent(p.sku) + '">' +
          '<img src="' + img + '" alt="' + escapeHtml(p.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'images/placeholder-product.svg\'"/>' +
        '</a>' +
        '<div class="alt-wl-info">' +
          '<div class="alt-wl-name"><a href="product.html?sku=' + encodeURIComponent(p.sku) + '">' + escapeHtml(p.name) + '</a></div>' +
          '<div class="alt-wl-meta">' + escapeHtml(meta) + '</div>' +
        '</div>' +
        '<button type="button" class="alt-wl-rm" aria-label="Remove from bucket" data-sku="' + escapeHtml(p.sku) + '">✕</button>' +
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
    if (!list.length) { openDrawer(); return; }
    var products = (window.ALT_PRODUCTS || []);
    var lines = list.map(function(sku){
      var p = products.find(function(x){ return x.sku === sku; });
      if (!p) return '- SKU ' + sku;
      return '- ' + p.name + (p.colour ? ' (' + p.colour + ')' : '') +
             ' · SKU ' + p.sku +
             (p.size ? ' · ' + p.size : '') +
             (p.weight ? ' · ' + p.weight + ' GSM' : '');
    });
    var msg = "Hi,\n\nI'd like a wholesale quote for the following items in my Quote Bucket:\n\n" +
              lines.join('\n') +
              "\n\nPlease provide trade pricing, minimum order quantities, and lead times. Happy to discuss volumes.\n\nThanks.";
    sessionStorage.setItem('alt_enquiry_bucket', msg);
    window.location.href = 'contact.html';
  }

  function syncUI() {
    var n = read().length;

    // Floating pill
    pill.querySelector('.alt-wl-count').textContent = String(n);
    pill.classList.toggle('is-visible', n > 0);

    // Header badge
    var badge = document.getElementById('altQbBadge');
    if (badge) {
      badge.textContent = String(n);
      badge.classList.toggle('visible', n > 0);
    }

    // Heart icons on cards
    document.querySelectorAll('.alt-wl-heart').forEach(function(h){
      var sku = h.getAttribute('data-sku');
      var on = has(sku);
      h.classList.toggle('is-on', on);
      h.innerHTML = on ? heartFilledSvg : heartSvg;
      h.setAttribute('aria-label', on ? 'Remove from Quote Bucket' : 'Add to Quote Bucket');
    });
  }

  function injectHearts(root) {
    var scope = root || document;
    var cards = scope.querySelectorAll('.product-card, .r-card');
    cards.forEach(function(card){
      if (card.querySelector('.alt-wl-heart')) return;
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
      btn.setAttribute('aria-label', has(sku) ? 'Remove from Quote Bucket' : 'Add to Quote Bucket');
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
      mutations.forEach(function(m){ if (m.addedNodes && m.addedNodes.length) any = true; });
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
