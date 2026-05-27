// lead-capture.js — Smart industry-specific exit-intent (#10)
// Shows a tailored offer depending on which page the visitor is leaving
(function () {
  var LS_KEY  = 'alt_lead_ts';
  var DAYS30  = 30 * 24 * 60 * 60 * 1000;

  // Skip on conversion/utility pages
  var skipPages = ['thank-you', 'contact', 'trade-account', 'admin', 'privacy', 'terms'];
  var curPage   = document.body ? (document.body.dataset.page || '') : '';
  if (skipPages.indexOf(curPage) !== -1) return;

  // Don't show again for 30 days
  try {
    var seen = localStorage.getItem(LS_KEY);
    if (seen && Date.now() - parseInt(seen, 10) < DAYS30) return;
  } catch (e) { return; }

  // ── Detect industry context from URL ──────────────────────
  var path = window.location.pathname.toLowerCase();
  var ctx = { title: '', sub: '', offer: '', cta: '', href: 'contact.html' };

  if (path.indexOf('hotel') !== -1) {
    ctx = {
      title: 'Hotel Linen <em>Buying Guide</em>',
      sub:   'The complete spec sheet for 3–5 star properties: GSM recommendations, par levels, linen budget calculator.',
      offer: '+ Free sample pricing for 50+ rooms',
      cta:   'Send me the guide',
      href:  'contact.html?subject=Hotel+Linen+Buying+Guide+Request'
    };
  } else if (path.indexOf('spa') !== -1) {
    ctx = {
      title: 'Spa Towel <em>Sample Pack</em>',
      sub:   'Get samples of our 5 most popular spa towels — White, Charcoal, Camel, Black, and Aqua. Shipped free.',
      offer: '+ Wholesale price sheet included',
      cta:   'Request sample pack',
      href:  'contact.html?subject=Spa+Sample+Pack+Request'
    };
  } else if (path.indexOf('gym') !== -1) {
    ctx = {
      title: 'Gym Towel <em>Bulk Pricing</em>',
      sub:   'Volume pricing for gyms, fitness centres, and yoga studios. 50 to 5,000 units — no minimum order.',
      offer: '+ Compare GSM grades side by side',
      cta:   'Get bulk pricing',
      href:  'contact.html?subject=Gym+Towel+Bulk+Pricing+Request'
    };
  } else if (path.indexOf('airbnb') !== -1 || path.indexOf('short') !== -1) {
    ctx = {
      title: 'Airbnb Linen <em>Starter Pack</em>',
      sub:   'Everything a short-stay property needs: bath towels, hand towels, face washers, bed linen — priced per room.',
      offer: '+ No minimum order, free shipping over $100',
      cta:   'Get starter pack pricing',
      href:  'contact.html?subject=Airbnb+Starter+Pack+Request'
    };
  } else if (path.indexOf('motel') !== -1) {
    ctx = {
      title: 'Motel Linen <em>Trade Pricing</em>',
      sub:   'Wholesale rates for motels and serviced apartments. Bulk supply, consistent quality, reliable dispatch.',
      offer: '+ 3-par stock plan calculator included',
      cta:   'Get trade pricing',
      href:  'contact.html?subject=Motel+Trade+Pricing+Request'
    };
  } else {
    // Generic / homepage / collection / product
    ctx = {
      title: 'Wholesale <em>Price List</em>',
      sub:   'Trade pricing on all 153 SKUs — bath towels, bed linen, robes, quilts, mattress protectors.',
      offer: '+ Bulk discount tiers for 50, 100, 500+ units',
      cta:   'Send me the price list',
      href:  'contact.html?subject=Wholesale+Price+List+Request'
    };
  }

  var triggered = false;

  function showModal () {
    if (triggered) return;
    triggered = true;
    try { localStorage.setItem(LS_KEY, String(Date.now())); } catch (e) {}

    var css = [
      '#altLMOv{position:fixed;inset:0;z-index:10010;background:rgba(10,14,40,.75);',
      'backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;',
      'padding:16px;animation:lmFd .25s ease;}',
      '@keyframes lmFd{from{opacity:0}to{opacity:1}}',
      '#altLMBox{background:#fff;max-width:500px;width:100%;position:relative;',
      'box-shadow:0 32px 80px rgba(0,0,0,.3);animation:lmUp .3s cubic-bezier(.4,0,.2,1);}',
      '@keyframes lmUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}',
      '#altLMBox .lm-hd{background:#0f1235;padding:32px 36px 26px;position:relative;}',
      '#altLMBox .lm-eye{font-family:"JetBrains Mono",monospace;font-size:9.5px;letter-spacing:.22em;',
      'text-transform:uppercase;color:#b8933a;margin-bottom:10px;}',
      '#altLMBox .lm-ttl{font-family:"Playfair Display",Georgia,serif;font-size:26px;font-weight:400;',
      'color:#fff;line-height:1.2;margin-bottom:8px;}',
      '#altLMBox .lm-ttl em{font-style:italic;color:#d4b568;}',
      '#altLMBox .lm-sub{font-size:13px;color:#9b9dae;line-height:1.65;}',
      '#altLMBox .lm-cls{position:absolute;top:12px;right:14px;background:none;border:none;',
      'color:#6b6e85;cursor:pointer;font-size:22px;padding:6px 8px;transition:color .15s;line-height:1;}',
      '#altLMBox .lm-cls:hover{color:#fff;}',
      '#altLMBox .lm-bd{padding:24px 36px 32px;}',
      '#altLMBox .lm-offer{background:#faf8f3;border-left:3px solid #b8933a;padding:10px 16px;',
      'font-size:12.5px;color:#5a5e78;margin-bottom:20px;line-height:1.5;}',
      '#altLMBox .lm-offer strong{color:#0f1235;}',
      '#altLMBox .lm-form{display:flex;gap:0;border:1px solid #d6d0c0;}',
      '#altLMBox .lm-inp{flex:1;border:none;padding:13px 16px;font-family:inherit;font-size:14px;',
      'color:#0f1235;background:#faf8f3;outline:none;min-width:0;}',
      '#altLMBox .lm-inp::placeholder{color:#b0b2c0;}',
      '#altLMBox .lm-btn{background:#b8933a;color:#fff;border:none;padding:13px 20px;',
      'font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;',
      'cursor:pointer;white-space:nowrap;font-weight:500;transition:background .2s;}',
      '#altLMBox .lm-btn:hover{background:#d4b568;}',
      '#altLMBox .lm-skip{text-align:center;margin-top:14px;font-size:12px;color:#9b9dae;}',
      '#altLMBox .lm-skip a{color:#6b6e85;border-bottom:1px solid #d6d0c0;cursor:pointer;}',
      '@media(max-width:520px){',
      '#altLMBox .lm-hd{padding:24px 22px 20px;}',
      '#altLMBox .lm-ttl{font-size:21px;}',
      '#altLMBox .lm-bd{padding:18px 22px 26px;}',
      '#altLMBox .lm-form{flex-direction:column;border:none;gap:8px;}',
      '#altLMBox .lm-inp{border:1px solid #d6d0c0;padding:12px 14px;}',
      '#altLMBox .lm-btn{padding:13px;width:100%;}',
      '}'
    ].join('');
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var overlay = document.createElement('div');
    overlay.id = 'altLMOv';
    overlay.innerHTML =
      '<div id="altLMBox" role="dialog" aria-modal="true" aria-label="Special offer">' +
        '<div class="lm-hd">' +
          '<button class="lm-cls" id="altLMClose" aria-label="Close">&times;</button>' +
          '<div class="lm-eye">Before you go &mdash;</div>' +
          '<div class="lm-ttl">' + ctx.title + '</div>' +
          '<div class="lm-sub">' + ctx.sub + '</div>' +
        '</div>' +
        '<div class="lm-bd">' +
          '<div class="lm-offer"><strong>What you\'ll get:</strong> ' + ctx.offer + '</div>' +
          '<form class="lm-form" id="altLMForm" novalidate>' +
            '<input class="lm-inp" id="altLMEmail" type="email" placeholder="Your business email" autocomplete="email" required/>' +
            '<button class="lm-btn" type="submit">' + ctx.cta + '</button>' +
          '</form>' +
          '<div class="lm-skip">Not now — <a id="altLMSkip">I\'ll keep browsing</a></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    function close () {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .2s';
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
    }

    document.getElementById('altLMClose').addEventListener('click', close);
    document.getElementById('altLMSkip').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc (e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });

    document.getElementById('altLMForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('altLMEmail').value.trim();
      if (!email || email.indexOf('@') === -1) {
        document.getElementById('altLMEmail').style.borderColor = '#c0392b';
        return;
      }
      var subject = ctx.cta + ' — ' + email;
      var body    = 'Lead capture request.\n\nEmail: ' + email + '\nPage: ' + window.location.href + '\nRequest: ' + ctx.cta + '\nTime: ' + new Date().toLocaleString('en-AU');
      window.location.href = 'mailto:info@auslinenandtowels.com.au?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var form = document.getElementById('altLMForm');
      form.innerHTML = '<div style="padding:14px 0;text-align:center;font-family:\'JetBrains Mono\',monospace;' +
        'font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#b8933a;">' +
        '&#10003;&nbsp; Request sent — we\'ll be in touch shortly.</div>';
      setTimeout(close, 3000);
    });
  }

  // ── Trigger 1: Exit intent (mouse leaves top of viewport) ──
  document.addEventListener('mouseleave', function exit (e) {
    if (e.clientY < 5 && e.relatedTarget === null) {
      showModal();
      document.removeEventListener('mouseleave', exit);
    }
  });

  // ── Trigger 2: 60-second timer ──────────────────────────
  var t = setTimeout(function () { showModal(); }, 60000);

  // ── Trigger 3: Scroll 72% depth ──────────────────────────
  window.addEventListener('scroll', function sc () {
    var pct = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (pct > 0.72) {
      showModal();
      clearTimeout(t);
      window.removeEventListener('scroll', sc);
    }
  }, { passive: true });
})();
