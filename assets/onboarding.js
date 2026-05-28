// Australian Linen & Towels — Buyer Onboarding Popup
// 3-step micro-survey: property type → product interests → restock frequency
// Saves to localStorage; personalises collection page on completion.
// Shows once per browser; dismissed on skip or completion.
(function () {
  'use strict';
  if (window.__altOnboardingLoaded) return;
  window.__altOnboardingLoaded = true;

  var DONE_KEY  = 'alt_onboarding_done_v1';
  var PREFS_KEY = 'alt_buyer_prefs_v1';

  // Expose prefs reader for other scripts (e.g. collection.html)
  window.ALT_BUYER_PREFS = function () {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch (e) { return null; }
  };

  function isDone() {
    try { return !!localStorage.getItem(DONE_KEY); } catch (e) { return true; }
  }
  function markDone(prefs) {
    try {
      if (prefs) localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      localStorage.setItem(DONE_KEY, '1');
    } catch (e) {}
  }

  // Don't show on pages where a popup would be disruptive
  var page = (document.body && document.body.dataset.page) || '';
  var skip = ['contact', 'thank-you', 'trade-account', 'room-package'];
  if (skip.indexOf(page) !== -1 || isDone()) return;

  // Delay so page content loads first (don't block LCP)
  setTimeout(mount, 1800);

  // ─── Data ────────────────────────────────────────
  var PROPERTY_TYPES = [
    { id: 'hotel',    label: 'Hotel / Resort',           icon: '🏨' },
    { id: 'motel',    label: 'Motel / Serviced Apt',     icon: '🏩' },
    { id: 'spa',      label: 'Day Spa / Salon',          icon: '💆' },
    { id: 'gym',      label: 'Gym / Fitness Centre',     icon: '🏋️' },
    { id: 'airbnb',   label: 'Airbnb / Short-Stay',      icon: '🏠' },
    { id: 'hospital', label: 'Hospital / Healthcare',    icon: '🏥' },
  ];

  var CATEGORIES = [
    { id: 'towels',   label: 'Towels',              icon: '🛁', subcat: 'towels-bath' },
    { id: 'sheets',   label: 'Bed Linen',           icon: '🛏️', subcat: 'sheets-flat' },
    { id: 'quilts',   label: 'Blankets & Quilts',   icon: '🛌', subcat: 'blankets-fleece' },
    { id: 'mattress', label: 'Mattress Protection', icon: '🛡️', subcat: 'mp-protectors' },
    { id: 'robes',    label: 'Robes',               icon: '👘', subcat: 'towels-robes' },
  ];

  var FREQUENCIES = [
    { id: 'monthly',     label: 'Monthly or more' },
    { id: 'quarterly',   label: 'Every 2–3 months' },
    { id: 'as-needed',   label: 'When items wear out' },
    { id: 'first-time',  label: 'First time buying' },
  ];

  // State
  var step = 1;
  var sel = { propertyType: null, categories: [], frequency: null };

  // ─── CSS ─────────────────────────────────────────
  var css =
    // Backdrop
    '#altOb{position:fixed;inset:0;background:rgba(10,14,40,.6);backdrop-filter:blur(4px);' +
    'z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;' +
    'animation:altObFadeIn .25s ease}' +
    '@keyframes altObFadeIn{from{opacity:0}to{opacity:1}}' +

    // Modal card
    '#altObCard{background:#faf8f3;border-radius:6px;width:100%;max-width:540px;' +
    'box-shadow:0 24px 64px rgba(10,14,40,.28);display:flex;flex-direction:column;' +
    'max-height:90vh;overflow:hidden;animation:altObSlideUp .3s ease}' +
    '@keyframes altObSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}' +

    // Header
    '#altObHead{background:#1a1f4e;color:#fff;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}' +
    '#altObHead h2{font-family:"Inter",sans-serif;font-size:18px;font-weight:400;margin:0}' +
    '#altObHead h2 em{font-style:italic;color:#d4b568}' +
    '#altObClose{background:none;border:none;color:#fff;cursor:pointer;padding:4px;opacity:.6;line-height:1;font-size:20px}' +
    '#altObClose:hover{opacity:1}' +

    // Progress dots
    '#altObProgress{display:flex;gap:6px;justify-content:center;padding:16px 24px 0;flex-shrink:0}' +
    '.alt-ob-dot{width:8px;height:8px;border-radius:50%;background:#e5e0d2;transition:background .2s}' +
    '.alt-ob-dot.active{background:#b8933a}' +
    '.alt-ob-dot.done{background:#1a1f4e}' +

    // Body
    '#altObBody{padding:20px 24px 16px;overflow-y:auto;flex:1}' +
    '#altObQuestion{font-family:"Inter",sans-serif;font-size:17px;font-weight:500;color:#1a1f4e;margin-bottom:4px}' +
    '#altObSub{font-size:12px;color:#6b6e7d;margin-bottom:18px}' +

    // Option pills
    '.alt-ob-options{display:flex;flex-wrap:wrap;gap:8px}' +
    '.alt-ob-opt{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;' +
    'border:1.5px solid #e5e0d2;border-radius:24px;cursor:pointer;' +
    'font-family:"Inter",sans-serif;font-size:13px;color:#1a1f4e;background:#fff;' +
    'transition:border-color .15s,background .15s;user-select:none;white-space:nowrap}' +
    '.alt-ob-opt:hover{border-color:#b8933a;background:#fdf8ef}' +
    '.alt-ob-opt.selected{border-color:#1a1f4e;background:#1a1f4e;color:#fff}' +
    '.alt-ob-opt .ob-icon{font-size:16px;line-height:1}' +

    // Footer
    '#altObFoot{padding:16px 24px 20px;border-top:1px solid #e5e0d2;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:12px}' +
    '#altObSkip{background:none;border:none;color:#9a9280;cursor:pointer;font-size:12px;text-decoration:underline;padding:0;flex-shrink:0}' +
    '#altObSkip:hover{color:#1a1f4e}' +
    '#altObNext{background:#1a1f4e;color:#fff;border:none;padding:12px 28px;' +
    'font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;' +
    'border-radius:2px;cursor:pointer;transition:background .15s;margin-left:auto}' +
    '#altObNext:hover{background:#b8933a}' +
    '#altObNext:disabled{opacity:.4;cursor:default}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── Build ───────────────────────────────────────
  var backdrop, card, body, nextBtn, skipBtn;
  var dots = [];

  function mount() {
    if (!document.body || isDone()) return;

    backdrop = document.createElement('div');
    backdrop.id = 'altOb';
    backdrop.addEventListener('click', function(e){ if (e.target === backdrop) dismiss(); });

    card = document.createElement('div');
    card.id = 'altObCard';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'Tell us about your business');

    card.innerHTML =
      '<div id="altObHead">' +
        '<h2>Tell us about <em>your business</em></h2>' +
        '<button id="altObClose" type="button" aria-label="Skip">✕</button>' +
      '</div>' +
      '<div id="altObProgress">' +
        '<div class="alt-ob-dot active" id="altObDot1"></div>' +
        '<div class="alt-ob-dot" id="altObDot2"></div>' +
        '<div class="alt-ob-dot" id="altObDot3"></div>' +
      '</div>' +
      '<div id="altObBody"></div>' +
      '<div id="altObFoot">' +
        '<button id="altObSkip" type="button">Skip → Browse all</button>' +
        '<button id="altObNext" type="button" disabled>Next →</button>' +
      '</div>';

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    dots = [
      document.getElementById('altObDot1'),
      document.getElementById('altObDot2'),
      document.getElementById('altObDot3'),
    ];
    body    = document.getElementById('altObBody');
    nextBtn = document.getElementById('altObNext');
    skipBtn = document.getElementById('altObSkip');

    card.querySelector('#altObClose').addEventListener('click', dismiss);
    skipBtn.addEventListener('click', dismiss);
    nextBtn.addEventListener('click', advance);

    renderStep();
  }

  function renderStep() {
    // Update dots
    dots.forEach(function(d, i){
      d.classList.remove('active', 'done');
      if (i + 1 < step) d.classList.add('done');
      else if (i + 1 === step) d.classList.add('active');
    });

    if (step === 1) renderPropertyType();
    else if (step === 2) renderCategories();
    else renderFrequency();

    updateNextBtn();
  }

  function renderPropertyType() {
    document.getElementById('altObNext').textContent = 'Next →';
    skipBtn.textContent = 'Skip → Browse all';
    body.innerHTML =
      '<div id="altObQuestion">What type of property do you operate?</div>' +
      '<div id="altObSub">We\'ll highlight the most relevant products for your business.</div>' +
      '<div class="alt-ob-options">' +
        PROPERTY_TYPES.map(function(t){
          var on = sel.propertyType === t.id;
          return '<button class="alt-ob-opt' + (on ? ' selected' : '') + '" data-id="' + t.id + '" type="button">' +
            '<span class="ob-icon">' + t.icon + '</span>' + t.label + '</button>';
        }).join('') +
      '</div>';
    body.querySelectorAll('.alt-ob-opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        sel.propertyType = btn.getAttribute('data-id');
        body.querySelectorAll('.alt-ob-opt').forEach(function(b){ b.classList.remove('selected'); });
        btn.classList.add('selected');
        updateNextBtn();
      });
    });
  }

  function renderCategories() {
    document.getElementById('altObNext').textContent = 'Next →';
    body.innerHTML =
      '<div id="altObQuestion">What are you shopping for today?</div>' +
      '<div id="altObSub">Select all that apply — your bucket will be ready.</div>' +
      '<div class="alt-ob-options">' +
        CATEGORIES.map(function(c){
          var on = sel.categories.indexOf(c.id) !== -1;
          return '<button class="alt-ob-opt' + (on ? ' selected' : '') + '" data-id="' + c.id + '" type="button">' +
            '<span class="ob-icon">' + c.icon + '</span>' + c.label + '</button>';
        }).join('') +
      '</div>';
    body.querySelectorAll('.alt-ob-opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-id');
        var idx = sel.categories.indexOf(id);
        if (idx === -1) sel.categories.push(id);
        else sel.categories.splice(idx, 1);
        btn.classList.toggle('selected', sel.categories.indexOf(id) !== -1);
        updateNextBtn();
      });
    });
  }

  function renderFrequency() {
    document.getElementById('altObNext').textContent = 'See My Products →';
    body.innerHTML =
      '<div id="altObQuestion">How often do you restock linen?</div>' +
      '<div id="altObSub">Helps us highlight the right quantities and trade terms.</div>' +
      '<div class="alt-ob-options">' +
        FREQUENCIES.map(function(f){
          var on = sel.frequency === f.id;
          return '<button class="alt-ob-opt' + (on ? ' selected' : '') + '" data-id="' + f.id + '" type="button">' +
            f.label + '</button>';
        }).join('') +
      '</div>';
    body.querySelectorAll('.alt-ob-opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        sel.frequency = btn.getAttribute('data-id');
        body.querySelectorAll('.alt-ob-opt').forEach(function(b){ b.classList.remove('selected'); });
        btn.classList.add('selected');
        updateNextBtn();
      });
    });
  }

  function updateNextBtn() {
    var valid =
      (step === 1 && sel.propertyType) ||
      (step === 2 && sel.categories.length > 0) ||
      (step === 3 && sel.frequency);
    nextBtn.disabled = !valid;
  }

  function advance() {
    if (step < 3) {
      step++;
      renderStep();
    } else {
      complete();
    }
  }

  function complete() {
    markDone(sel);
    removeSelf();
    applyPreferences(sel);
  }

  function dismiss() {
    markDone(null);
    removeSelf();
  }

  function removeSelf() {
    if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    document.body.style.overflow = '';
  }

  // ─── Apply preferences to collection page ────────
  function applyPreferences(prefs) {
    // Only apply on collection page
    if ((document.body.dataset.page || '') !== 'collection') {
      // Redirect to collection with context param
      window.location.href = 'collection.html?from=onboarding';
      return;
    }
    doApply(prefs);
  }

  // Called on collection page load if ?from=onboarding present
  window.ALT_APPLY_ONBOARDING_PREFS = function() {
    var prefs = window.ALT_BUYER_PREFS ? window.ALT_BUYER_PREFS() : null;
    if (prefs) doApply(prefs);
  };

  function doApply(prefs) {
    if (!prefs) return;

    // Show personalization banner
    var label = prefs.propertyType
      ? (PROPERTY_TYPES.find(function(t){ return t.id === prefs.propertyType; }) || {}).label
      : null;

    var banner = document.createElement('div');
    banner.id = 'altObBanner';
    banner.style.cssText =
      'background:#1a1f4e;color:#fff;padding:10px 16px;border-radius:3px;' +
      'font-size:12.5px;display:flex;align-items:center;justify-content:space-between;' +
      'margin-bottom:14px;gap:12px;font-family:"Inter",sans-serif;';
    banner.innerHTML =
      '<span>' +
        (label ? '✓ Showing products for <strong>' + label + '</strong>' : '✓ Personalised selection') +
        ' — browse all or <a href="collection.html" onclick="localStorage.removeItem(\'alt_onboarding_done_v1\');localStorage.removeItem(\'alt_buyer_prefs_v1\');" style="color:#d4b568;cursor:pointer;text-decoration:underline;">reset</a>' +
      '</span>' +
      '<button type="button" onclick="this.parentNode.remove()" style="background:none;border:none;color:#fff;cursor:pointer;padding:0;font-size:18px;opacity:.6;line-height:1">✕</button>';

    var main = document.querySelector('.main-content');
    if (main) main.insertBefore(banner, main.firstChild);

    // Apply category filter: if one category, select it in sidebar; if multiple, show all matching
    if (prefs.categories && prefs.categories.length === 1) {
      var catId = prefs.categories[0];
      var cat = CATEGORIES.find(function(c){ return c.id === catId; });
      if (cat && window.selectSubcat) {
        // Small delay so collection JS has finished init
        setTimeout(function(){
          window.selectSubcat(cat.subcat, cat.label, false);
        }, 100);
      }
    }
  }
})();
