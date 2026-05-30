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

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    document.getElementById('altLMForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('altLMEmail');
      var email = input.value.trim();
      if (!EMAIL_RE.test(email)) {
        input.style.borderColor = '#c0392b';
        return;
      }

      var form   = document.getElementById('altLMForm');
      var btn    = form.querySelector('.lm-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      var message = 'Lead capture request.\n\nPage: ' + window.location.href +
                    '\nRequest: ' + ctx.cta +
                    '\nTime: ' + new Date().toLocaleString('en-AU');

      var data = new FormData();
      data.append('name', 'Website Lead');
      data.append('email', email);
      data.append('message', message);
      data.append('enquiry', 'lead-capture');

      function done (ok) {
        if (ok && typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead', { event_category: 'Lead Capture', event_label: ctx.cta });
        }
        form.innerHTML = '<div style="padding:14px 0;text-align:center;font-family:\'JetBrains Mono\',monospace;' +
          'font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:' + (ok ? '#b8933a' : '#c0392b') + ';">' +
          (ok ? '&#10003;&nbsp; Request sent — we\'ll be in touch shortly.'
              : 'Something went wrong — please email info@auslinenandtowels.com.au') + '</div>';
        setTimeout(close, ok ? 3000 : 4500);
      }

      fetch('mail.php', { method: 'POST', body: data })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) { done(!!(res && res.ok)); })
        .catch(function () { done(false); });
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
