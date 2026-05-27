// upgrades.js — Multi-channel contact widget (#8) + Recently Viewed banner (#9)
(function () {
  'use strict';

  var PHONE    = '0414 533 449';
  var WA_NUM   = '61414533449';
  var EMAIL    = 'info@auslinenandtowels.com.au';
  var RV_KEY   = 'alt_rv';

  // ══════════════════════════════════════════
  // RECENTLY VIEWED — save helper (called from product.html)
  // ══════════════════════════════════════════
  window.ALT_SAVE_RECENT = function (prod) {
    try {
      var list = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
      list = list.filter(function (i) { return i.sku !== prod.sku; });
      list.unshift({
        sku:        prod.sku,
        name:       prod.name,
        colour:     prod.colour,
        image:      prod.image  || '',
        categoryId: prod.categoryId,
        weight:     prod.weight || '',
        ts:         Date.now()
      });
      localStorage.setItem(RV_KEY, JSON.stringify(list.slice(0, 8)));
    } catch (e) {}
  };

  // ══════════════════════════════════════════
  // RECENTLY VIEWED — banner on home / collection
  // ══════════════════════════════════════════
  function showRecentlyViewed () {
    var pg = document.body ? document.body.dataset.page : '';
    if (pg !== 'home' && pg !== 'collection') return;
    if (document.getElementById('altRVStrip')) return;

    try {
      var items = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
      if (!items || items.length < 2) return;
      var recent = items.slice(0, 6);

      var css = [
        '#altRVStrip{background:#faf8f3;border-bottom:1px solid #e5e0d2;padding:16px 0;}',
        '#altRVStrip .rvi{max-width:1400px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:18px;}',
        '#altRVStrip .rvl{font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.18em;',
        'text-transform:uppercase;color:#9b9dae;white-space:nowrap;flex-shrink:0;}',
        '#altRVStrip .rvs{display:flex;gap:10px;overflow-x:auto;flex:1;scroll-snap-type:x mandatory;',
        '-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px;}',
        '#altRVStrip .rvs::-webkit-scrollbar{display:none;}',
        '.rv-card{display:flex;gap:10px;align-items:center;background:#fff;border:1px solid #e5e0d2;',
        'padding:9px 14px 9px 9px;text-decoration:none;color:inherit;flex-shrink:0;',
        'scroll-snap-align:start;transition:border-color .2s;min-width:170px;}',
        '.rv-card:hover{border-color:#b8933a;}',
        '.rv-img{width:42px;height:42px;object-fit:cover;flex-shrink:0;background:#ede9e0;display:block;}',
        '.rv-nm{font-size:12px;color:#0f1235;font-weight:500;line-height:1.3;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;}',
        '.rv-cl{font-size:10px;color:#9b9dae;font-family:"JetBrains Mono",monospace;letter-spacing:.05em;}',
        '.rv-x{flex-shrink:0;background:none;border:none;color:#c9cad8;cursor:pointer;',
        'font-size:18px;padding:0 2px;line-height:1;transition:color .15s;}',
        '.rv-x:hover{color:#6b6e85;}',
        '@media(max-width:768px){',
        '#altRVStrip .rvi{padding:0 14px;gap:10px;}',
        '#altRVStrip .rvl{display:none;}',
        '.rv-card{min-width:150px;padding:8px 10px 8px 8px;}',
        '.rv-nm{max-width:90px;font-size:11.5px;}',
        '}'
      ].join('');
      var styleEl = document.createElement('style');
      styleEl.textContent = css;
      document.head.appendChild(styleEl);

      var strip = document.createElement('div');
      strip.id = 'altRVStrip';

      var cards = recent.map(function (item) {
        var imgPart = (item.image && item.image.indexOf('placeholder') === -1)
          ? '<img class="rv-img" src="' + item.image + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\'">'
          : '<div class="rv-img" style="display:flex;align-items:center;justify-content:center;color:#d4b568;font-size:18px;">&#9744;</div>';
        return '<a class="rv-card" href="product.html?sku=' + item.sku + '">' +
          imgPart +
          '<div><div class="rv-nm">' + item.name + '</div>' +
          '<div class="rv-cl">' + item.colour + (item.weight ? ' &middot; ' + item.weight : '') + '</div></div>' +
          '</a>';
      }).join('');

      strip.innerHTML =
        '<div class="rvi">' +
        '<span class="rvl">Recently Viewed</span>' +
        '<div class="rvs">' + cards + '</div>' +
        '<button class="rv-x" onclick="document.getElementById(\'altRVStrip\').remove()" aria-label="Dismiss">&times;</button>' +
        '</div>';

      // Insert just before the first <section> or <main> on the page
      var anchor = document.querySelector('section, main, .hero, .featured, .page-hero');
      if (anchor) {
        anchor.parentNode.insertBefore(strip, anchor);
      } else {
        document.body.insertBefore(strip, document.body.firstChild);
      }
    } catch (e) {}
  }

  // ══════════════════════════════════════════
  // MULTI-CHANNEL FLOATING WIDGET (#8)
  // ══════════════════════════════════════════
  function loadMultiChannel () {
    if (document.getElementById('altMC')) return;

    // Smart WhatsApp message — knows which product is open
    var waMsg = 'Hi! I\'d like to enquire about wholesale linen pricing for my business. Could you please send me trade pricing?';
    try {
      if (document.body.dataset.page === 'product' && window.ALT_PRODUCTS) {
        var sku = new URLSearchParams(window.location.search).get('sku');
        var prod = sku ? window.ALT_PRODUCTS.find(function (p) { return p.sku === sku; }) : null;
        if (prod) {
          waMsg = 'Hi! Wholesale quote request:\n\n' +
            'Product: ' + prod.name + '\n' +
            'Colour: '  + prod.colour + '\n' +
            'Size: '    + prod.size + '\n' +
            'SKU: '     + prod.sku + '\n\n' +
            'Please send trade pricing and availability. Thank you.';
        }
      }
    } catch (e) {}

    var waUrl = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(waMsg);

    var css = [
      /* container */
      '#altMC{position:fixed;bottom:22px;right:20px;z-index:9990;',
      'display:flex;flex-direction:column;align-items:flex-end;gap:10px;}',
      '@media(max-width:768px){#altMC{bottom:62px;right:14px;}}',
      /* speed-dial items */
      '.mca{display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(10px);',
      'transition:opacity .22s,transform .22s;pointer-events:none;}',
      '#altMC.open .mca{opacity:1;transform:translateY(0);pointer-events:auto;}',
      '#altMC.open .mca:nth-child(1){transition-delay:.12s}',
      '#altMC.open .mca:nth-child(2){transition-delay:.07s}',
      '#altMC.open .mca:nth-child(3){transition-delay:.02s}',
      /* labels */
      '.mca-lbl{background:#0f1235;color:#fff;font-family:"JetBrains Mono",monospace;',
      'font-size:10px;letter-spacing:.1em;padding:7px 13px;border-radius:3px;white-space:nowrap;',
      'box-shadow:0 2px 10px rgba(0,0,0,.25);}',
      '@media(max-width:768px){.mca-lbl{display:none;}}',
      /* icon buttons */
      '.mca-ic{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;',
      'justify-content:center;text-decoration:none;box-shadow:0 3px 14px rgba(0,0,0,.22);',
      'transition:transform .2s,box-shadow .2s;flex-shrink:0;border:none;cursor:pointer;}',
      '.mca-ic:hover{transform:scale(1.1);box-shadow:0 5px 20px rgba(0,0,0,.3);}',
      '.mca-ic.wa{background:#25d366;}',
      '.mca-ic.ph{background:#1a3a6b;}',
      '.mca-ic.em{background:#b8933a;}',
      '.mca-ic svg{width:21px;height:21px;}',
      /* main toggle */
      '#altMCBtn{width:54px;height:54px;border-radius:50%;background:#0f1235;border:none;',
      'display:flex;align-items:center;justify-content:center;cursor:pointer;',
      'box-shadow:0 4px 20px rgba(0,0,0,.28);transition:background .25s;',
      'animation:mc-glow 3s ease-in-out infinite;}',
      '@keyframes mc-glow{0%,100%{box-shadow:0 4px 20px rgba(15,18,53,.3)}',
      '50%{box-shadow:0 4px 28px rgba(184,147,58,.5)}}',
      '#altMC.open #altMCBtn{background:#b8933a;animation:none;}',
      '#altMCBtn .ico-chat{transition:opacity .2s,transform .2s;}',
      '#altMCBtn .ico-close{position:absolute;transition:opacity .2s,transform .2s;opacity:0;transform:rotate(-45deg);}',
      '#altMC.open #altMCBtn .ico-chat{opacity:0;transform:rotate(45deg);}',
      '#altMC.open #altMCBtn .ico-close{opacity:1;transform:rotate(0deg);}',
      '#altMCBtn{position:relative;}'
    ].join('');

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var svgWA = '<svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';
    var svgPH  = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var svgEM  = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    var svgCHAT = '<svg class="ico-chat" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var svgX    = '<svg class="ico-close" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

    var wrap = document.createElement('div');
    wrap.id = 'altMC';
    wrap.setAttribute('aria-label', 'Contact options');
    wrap.innerHTML =
      /* WhatsApp (bottom, nearest to toggle) */
      '<div class="mca">' +
        '<span class="mca-lbl">Chat on WhatsApp</span>' +
        '<a href="' + waUrl + '" target="_blank" rel="noopener" class="mca-ic wa" aria-label="WhatsApp">' + svgWA + '</a>' +
      '</div>' +
      /* Email */
      '<div class="mca">' +
        '<span class="mca-lbl">Send email enquiry</span>' +
        '<a href="mailto:' + EMAIL + '?subject=Wholesale%20Enquiry" class="mca-ic em" aria-label="Email">' + svgEM + '</a>' +
      '</div>' +
      /* Call */
      '<div class="mca">' +
        '<span class="mca-lbl">Call ' + PHONE + '</span>' +
        '<a href="tel:0414533449" class="mca-ic ph" aria-label="Call">' + svgPH + '</a>' +
      '</div>' +
      /* Main toggle */
      '<button id="altMCBtn" aria-expanded="false" aria-label="Contact us">' +
        svgCHAT + svgX +
      '</button>';

    document.body.appendChild(wrap);

    var btn = document.getElementById('altMCBtn');
    btn.addEventListener('click', function () {
      var open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (wrap.classList.contains('open') && !wrap.contains(e.target)) {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ══════════════════════════════════════════
  // WHATSAPP SHARE BUTTON on product page
  // ══════════════════════════════════════════
  function addProductShare () {
    if (document.body.dataset.page !== 'product') return;
    // Injected after renderProductPage runs — wait for pd-actions to exist
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      var actions = document.querySelector('.pd-actions');
      if (!actions || document.getElementById('altPDShare')) {
        if (attempts > 20) clearInterval(timer);
        return;
      }
      clearInterval(timer);

      try {
        var sku = new URLSearchParams(window.location.search).get('sku');
        var prod = sku ? (window.ALT_PRODUCTS || []).find(function (p) { return p.sku === sku; }) : null;
        var shareText = prod
          ? 'Check out this product from Australian Linen & Towels: ' + prod.name + ' (' + prod.colour + ') — ' + window.location.href
          : window.location.href;
        var waShare = 'https://wa.me/?text=' + encodeURIComponent(shareText);

        var css2 = '.pd-share-row{display:flex;gap:10px;margin-top:12px;align-items:center;}' +
          '.pd-share-lbl{font-family:"JetBrains Mono",monospace;font-size:9.5px;letter-spacing:.14em;' +
          'text-transform:uppercase;color:#9b9dae;}' +
          '.pd-share-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border:1px solid #e5e0d2;' +
          'background:#faf8f3;font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.1em;' +
          'text-decoration:none;color:#3a3d54;transition:border-color .2s,background .2s;border-radius:2px;}' +
          '.pd-share-btn:hover{border-color:#b8933a;background:#fff;}' +
          '.pd-share-btn svg{width:14px;height:14px;flex-shrink:0;}';
        var s2 = document.createElement('style');
        s2.textContent = css2;
        document.head.appendChild(s2);

        var row = document.createElement('div');
        row.id = 'altPDShare';
        row.className = 'pd-share-row';
        row.innerHTML =
          '<span class="pd-share-lbl">Share:</span>' +
          '<a href="' + waShare + '" target="_blank" rel="noopener" class="pd-share-btn">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>' +
          'WhatsApp' +
          '</a>' +
          '<a href="mailto:?subject=' + encodeURIComponent('Product from Australian Linen & Towels') + '&body=' + encodeURIComponent(shareText) + '" class="pd-share-btn">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
          'Email' +
          '</a>';

        actions.insertAdjacentElement('afterend', row);
      } catch (e) {}
    }, 200);
  }

  // ══════════════════════════════════════════
  // STICKY PHONE in header (bonus win)
  // Shows phone number inside .site-header once utility-bar scrolls away
  // ══════════════════════════════════════════
  function stickyHeaderPhone () {
    var utilBar = document.querySelector('.utility-bar');
    var header  = document.querySelector('.site-header');
    if (!utilBar || !header) return;
    if (document.getElementById('altHdrPhone')) return;

    var span = document.createElement('a');
    span.id = 'altHdrPhone';
    span.href = 'tel:0414533449';
    span.textContent = PHONE;
    span.setAttribute('aria-label', 'Call us');
    var css3 = '#altHdrPhone{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;' +
      'color:#b8933a;text-decoration:none;opacity:0;transition:opacity .3s;pointer-events:none;' +
      'white-space:nowrap;font-weight:500;}' +
      '#altHdrPhone.visible{opacity:1;pointer-events:auto;}' +
      '@media(max-width:768px){#altHdrPhone{display:none;}}';
    var s3 = document.createElement('style');
    s3.textContent = css3;
    document.head.appendChild(s3);

    // Insert into right nav or header wrap
    var navRight = header.querySelector('.nav-main.right') || header.querySelector('.wrap');
    if (navRight) navRight.insertAdjacentElement('afterbegin', span);

    var utilBottom = utilBar.getBoundingClientRect().bottom;
    window.addEventListener('scroll', function () {
      if (window.scrollY > utilBottom + 10) {
        span.classList.add('visible');
      } else {
        span.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════
  function init () {
    loadMultiChannel();
    showRecentlyViewed();
    addProductShare();
    stickyHeaderPhone();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0); // yield so partials can finish mounting header/footer
  }
})();
