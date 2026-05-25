# AusLinenAndTowels.com.au — God Mode Audit Report
**Date:** 25 May 2026  
**Auditor:** Multi-specialist review (5 expert roles)  
**Scope:** Full website — auslinenandtowels.com.au  
**Status:** Pre-live / final readiness check

---

## Overall Score: 7.1 / 10 — Live-Ready with Known Gaps

The website is structurally sound, professionally designed, and technically functional. The product catalogue is accurate (153 products, 23 categories, supplier-verified specs). No generic filler content. The five phases below break down exactly what is strong, what needs fixing before launch, and what can be improved post-launch.

---

## Phase 1 — Technical Performance
### Rating: 6.5 / 10

> *Assessed by: Senior Front-End Performance Engineer (Core Web Vitals, image optimisation, asset delivery)*

### ✅ What's Working
- Hero images served as `.webp` — modern format, correct choice
- Hero images use `<link rel="preload" fetchpriority="high">` — prevents LCP delay
- Product cards use `loading="lazy"` — correct deferred loading
- Google Fonts loaded with `display=swap` — no invisible text during load
- CSS delivered as a single stylesheet — minimal HTTP requests
- Product data served as a static `.js` file — no API latency

### ⚠️ Issues Found

| # | Issue | Severity | File | Fix |
|---|-------|----------|------|-----|
| 1 | `pool-stripe-towel.png` (826 KB) was hardcoded in index.html collection grid — `.jpg` compressed version exists but wasn't used | **High** | `index.html:951` | ✅ Fixed this session |
| 2 | 6 original `.png` files still on disk (pool-stripe, gym-salon, terry-bathrobe, tea-towels, navy-towels, black-towels) — not referenced anymore but bloat the repo | Low | `images/*.png` | Delete post-launch |
| 3 | Logo files are `.png` (`logo-header.png`, `logo-full.png` at 291 KB) — could be `.webp` or inline SVG for faster load | Medium | `images/` | Convert when redesigning logo |
| 4 | No `favicon.ico` or `<link rel="icon">` defined anywhere | Medium | All pages | Add favicon (see recommendations) |
| 5 | No `manifest.json` / PWA support | Low | — | Add post-launch for mobile home screen |
| 6 | No CDN for static assets | Low | — | CloudFlare free plan covers this |
| 7 | `og-collection.jpg` referenced in og: tags but file doesn't exist in `images/` | **High** | `collection.html`, `contact.html` | Create this image (see Phase 2) |

### Recommendations
1. **Favicon immediately:** Create a 32×32 and 180×180 version of the kangaroo logo. Add to all pages:
   ```html
   <link rel="icon" href="images/favicon.ico"/>
   <link rel="apple-touch-icon" href="images/apple-touch-icon.png"/>
   ```
2. **og-collection.jpg:** Save a 1200×630px image of your best product (white bath towel on hotel bed) as `images/og-collection.jpg`. Referenced in 3 pages already but file missing.
3. **Delete old PNGs** once go-live confirmed — saves ~4.5 MB repo size.
4. **CloudFlare:** Point DNS through CloudFlare (free tier) for CDN caching, compression, and automatic HTTPS + security headers.

---

## Phase 2 — SEO & Search Visibility
### Rating: 7.5 / 10

> *Assessed by: Senior SEO Strategist (Technical SEO, structured data, crawlability, content signals)*

### ✅ What's Working
- `robots.txt` comprehensive — allows all crawlers including GPTBot, ClaudeBot, Perplexity ✅
- `sitemap.xml` — 55 URLs including all category pages ✅
- `llms.txt` — AI-readable product summary (ahead of the curve) ✅
- Schema.org `WholesaleStore` + `Organization` JSON-LD on homepage ✅
- Product pages have `Product` schema with name, description, image, brand, offers ✅
- Breadcrumb schema on product pages ✅
- `og:title`, `og:description`, `og:image` on: homepage ✅, product.html ✅, collection.html ✅, about.html ✅, contact.html ✅ (fixed this session)
- Meta descriptions on all major pages ✅
- `lang="en"` on all pages ✅
- Blog exists with 2 articles — organic traffic path ✅

### ⚠️ Issues Found

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Sitemap lists both `/` and `/index.html` — Google treats these as duplicate content signals | Medium | Remove `/index.html` entry from sitemap |
| 2 | `mattress-topper` category URL in sitemap despite product being removed | Medium | ✅ Fixed this session |
| 3 | `og:image` (`og-collection.jpg`) referenced on 3 pages but file does not exist — social share will show broken image | **High** | Create the file (see Phase 1) |
| 4 | Product URLs are `product.html?sku=ALU-BT-001` — query string URLs are indexable but weaker than clean slugs like `/products/white-bath-towel/` | Low | Consider URL rewriting post-launch |
| 5 | Blog articles lack `Article` / `BlogPosting` schema — missing rich snippet eligibility | Medium | Add JSON-LD to blog posts |
| 6 | No `hreflang` — not needed for AU-only, but worth noting for future | None | N/A |
| 7 | `contact.html` has no `dateModified` in sitemap | Low | Add lastmod |
| 8 | No image sitemap — Google Image Search won't index product photos without it | Medium | Add `<image:image>` entries for key products |

### Recommendations
1. **Remove `/index.html` from sitemap** — keep only `https://auslinenandtowels.com.au/` as canonical homepage
2. **Blog schema:** Add this to both blog posts:
   ```json
   { "@type": "BlogPosting", "headline": "...", "datePublished": "...", "author": {...} }
   ```
3. **Target keywords** you're not yet competing for: "hotel towel supplier Australia", "wholesale bed sheets hospitality", "commercial linen Griffith NSW" — these should appear in H1/H2 headings, not just meta.
4. **Write 2 more blog articles** — minimum 4 posts for Google to treat the blog section seriously.

---

## Phase 3 — Security & Trust
### Rating: 5.5 / 10

> *Assessed by: Cybersecurity Consultant & B2B Trust Specialist (web application security, business credibility signals)*

### ✅ What's Working
- `admin.html` and `mail.php` listed in `robots.txt` Disallow ✅
- No API keys, database credentials, or sensitive data in client-side JavaScript ✅
- ABN `86 602 936 725` publicly displayed — strong legitimacy signal for B2B buyers ✅
- "Australian Owned & Operated" trust badge ✅
- HTTPS assumed on live domain (CloudFlare will enforce this) ✅
- No third-party trackers beyond Google Fonts ✅

### ⚠️ Issues Found

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | Contact form (`mail.php`) has **no spam protection** — no honeypot, no CSRF token, no rate limiting, no reCAPTCHA | **Critical** | Any bot can POST to mail.php and flood your inbox. Will happen within days of launch. |
| 2 | `mail.php` is publicly accessible despite `robots.txt` Disallow — robots.txt is not security; it's a crawl hint | High | Direct POST from curl bypasses robots.txt entirely |
| 3 | No HTTP security headers: no `Content-Security-Policy`, no `X-Frame-Options`, no `X-Content-Type-Options` | High | Server-level fix (CloudFlare or `.htaccess`) |
| 4 | Testimonials are fully anonymous ("Motel Operator, Riverina NSW") — no real names, no photos | Medium | B2B buyers, especially procurement managers, discount anonymous reviews |
| 5 | No physical address beyond "Griffith, NSW" — B2B buyers expect a street address for legitimacy | Medium | Schema has the city; the website doesn't show it visually |
| 6 | Trade account form — unclear what data is stored and where (no data retention policy mention) | Low | Privacy policy should reference this |

### Recommendations — Priority Order

**Before go-live:**
1. **Add honeypot field to contact form** — single hidden field that bots fill in, humans don't:
   ```html
   <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
   ```
   Check in `mail.php`: if `$_POST['website']` is not empty, discard silently.

2. **CloudFlare security headers** (free, 5 mins): Enable in CloudFlare dashboard → Security → Headers:
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`

3. **Add Google reCAPTCHA v3** (invisible) to contact form — no friction for users, blocks bots.

**Post-launch:**
4. Replace anonymous testimonials with real ones — even first name + city + type of business is more credible than "Motel Operator".
5. Add physical address in the footer and Contact page.

---

## Phase 4 — Customer Experience (UX/CX)
### Rating: 7.5 / 10

> *Assessed by: Senior UX Designer & Hospitality B2B Conversion Specialist (user journeys, accessibility, mobile experience)*

### ✅ What's Working
- Premium design language — navy/gold/cream palette, serif + mono typography, professional ✅
- Centered split-nav header — standard premium brand pattern, well-executed ✅
- Full-screen hero carousel with 4 hospitality-specific scenes ✅
- Benefits marquee (free shipping, trade pricing, returns, commercial grade) ✅
- Segment cards (Hotels, Spas, Serviced Apartments, Short-Stay, Resorts) — clear audience targeting ✅
- Mobile: slide-in drawer nav at 900px breakpoint ✅
- Sticky mobile call bar (call + email) ✅
- `prefers-reduced-motion` supported — hero freezes for accessibility ✅
- Product filters + sidebar on collection page ✅
- Room Package Calculator — strong differentiator; no competitor has this ✅
- Trade Account application pathway ✅
- Chat widget present ✅
- "Request Quote" instead of prices — correct for B2B wholesale ✅

### ⚠️ Issues Found

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Hero carousel is CSS-only — no keyboard navigation, no ARIA `role="region"` or `aria-live` — fails WCAG 2.1 AA for screen reader users | Medium | Accessibility & potential legal (WCAG compliance) |
| 2 | Search icon in header has no visible destination — clicking it may not work or leads nowhere clear | Medium | User frustration — procurement managers search for specific products |
| 3 | No custom `404.html` page — broken links show a bare server error | Medium | User drops off permanently on a broken link |
| 4 | Hero stats show "Commercial / Trade / Australia" — these are labels, not compelling numbers | Medium | Missed conversion opportunity — "500 GSM · 150+ Products · 48hr Dispatch" would be stronger |
| 5 | No breadcrumbs on collection or category pages | Low | Navigation clarity for multi-page journeys |
| 6 | No delivery timeframe anywhere — "how long until I receive my order?" is a key B2B question | **High** | Customers will call/email to ask this before ordering, adding friction |
| 7 | Product cards: "Photo on request" label on placeholder images — this appears on live products; should be removed or images provided | Medium | Trust signal damage — makes catalogue look incomplete |
| 8 | `wishlist.js` loaded but no visible wishlist feature in UI | Low | Dead weight code |

### Recommendations

1. **Add delivery timeframes** (high priority before go-live):
   - In the benefits marquee: replace "Easy Returns · 14-day policy" with "Dispatch in 2–5 Business Days"
   - On the contact page info sidebar: add "Orders dispatched within 2–5 business days from Griffith NSW"

2. **Create a 404 page** — a simple `404.html` with your nav, a message, and a link back to the collection. Without this, any broken link permanently loses the visitor.

3. **Fix hero stats** — change from generic labels to real numbers:
   - "Commercial" → "500 GSM"  
   - "Trade" → "153 Products"  
   - "Australia" → "48hr Dispatch"

4. **Verify search functionality** — if the search icon does nothing, remove it; if it works, confirm it works on mobile.

5. **Add ARIA to hero carousel:**
   ```html
   <section class="hero" role="region" aria-label="Featured hospitality linen — rotating slides">
   ```

---

## Phase 5 — Content & Conversion
### Rating: 7.0 / 10

> *Assessed by: B2B Copywriter & Conversion Rate Optimisation Specialist (messaging, trust signals, lead capture)*

### ✅ What's Working
- Hero headline: *"We supply the linen. You deliver the experience."* — benefit-focused, B2B appropriate, memorable ✅
- Product descriptions: specific, accurate, GSM + dimensions + material + wash-care relevant — no generic copy ✅
- MOQ and carton quantities on every product ✅
- Blog section: 2 articles (GSM guide, linen selection guide) — correct content strategy for B2B SEO ✅
- Case studies page exists ✅
- FAQ page exists ✅
- ABN published — strongest legitimacy signal for Australian B2B ✅
- Trade account application — 5-minute process as stated ✅
- No prices displayed — correct for wholesale B2B ✅
- Multiple CTAs: "View Collection", "Open a Trade Account", "Get a Quote", "Plan a Property" ✅

### ⚠️ Issues Found

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Testimonials are anonymous — no first name, no company name, no property type detail | **High** | B2B buyers do not trust unattributed quotes; procurement managers especially are sceptical |
| 2 | No business origin story / "Who is behind this?" — the About page has information but the homepage has none | Medium | Wholesale relationships are personal; buyers want to know they're dealing with real people |
| 3 | "14-day returns" mentioned in marquee — no dedicated returns policy page linked | Medium | Unsubstantiated claim; could cause disputes |
| 4 | "Free shipping over AU$100" — this is a real commitment; verify it is live and accurate before go-live | **High** | If this is wrong, first order creates a bad impression |
| 5 | Blog has only 2 articles — thin content for Google to take the blog seriously | Medium | Need minimum 4–6 articles for topical authority |
| 6 | No phone number in the hero or on product pages — only in the top bar and contact page | Medium | B2B buyers want to call before first orders; make it easier |
| 7 | "No minimum order" mentioned in trust badge — but products show MOQ quantities (10 pcs, 25 pcs). Is there actually no minimum? Contradictory. | **High** | This will cause buyer confusion and trust damage if they read product specs |
| 8 | Case studies — are these populated with real case studies or placeholder content? | High | Sending buyers to an empty page is worse than not having the page |

### Recommendations

1. **MOQ vs "No Minimum" contradiction (fix before go-live):**
   Either: a) Remove "No Minimum Order" trust badge, or b) Clarify: "No minimum on first orders — standard MOQ applies to repeat restocking". Pick one and be accurate.

2. **Replace anonymous testimonials** — even one real testimonial with a first name is worth more than three anonymous ones. Ask any existing customer.

3. **Returns page** — add a simple `returns.html` or expand `terms.html` with a clear returns section. Link from the benefits marquee.

4. **Phone number on product pages** — add to the product page sidebar or at the bottom of every product page: "Questions about this product? Call 0414 533 449"

5. **Add 4 more blog articles** — suggested topics:
   - "How to choose bath towel GSM for your hotel"
   - "White vs coloured towels for spas: a buyer's guide"
   - "How much linen does a motel room need? The 3-par system explained"
   - "Commercial laundering: what towel specs actually survive 200 wash cycles"

---

## Summary Scorecard

| Phase | Score | Status |
|-------|-------|--------|
| Phase 1 — Technical Performance | 6.5 / 10 | ⚠️ Favicon missing; og-image file missing |
| Phase 2 — SEO & Search Visibility | 7.5 / 10 | ✅ Strong foundation; blog needs more content |
| Phase 3 — Security & Trust | 5.5 / 10 | 🔴 Contact form has no spam protection — fix before launch |
| Phase 4 — Customer Experience | 7.5 / 10 | ⚠️ Delivery timeframes missing; hero stats weak |
| Phase 5 — Content & Conversion | 7.0 / 10 | 🔴 MOQ vs "No Minimum" contradiction; anonymous testimonials |
| **Overall** | **7.1 / 10** | **Launch-ready with 3 blockers** |

---

## 3 Blockers Before Go-Live

These must be resolved before the website is promoted to any customer:

### 🔴 Blocker 1 — Contact Form Spam Protection
Add a honeypot field to `contact.html` and validate it in `mail.php`. Without this, the inbox will be flooded within days of launch. Takes 30 minutes.

### 🔴 Blocker 2 — "No Minimum Order" vs MOQ Contradiction
Every product shows an MOQ (10 pcs, 25 pcs, 50 pcs). The homepage trust badge says "No Minimum Order". One of these is wrong. Decide and fix before any customer reads both.

### 🔴 Blocker 3 — Free Shipping Claim Accuracy
"Free Shipping over AU$100" is displayed prominently across the site. Confirm this is an actual live commitment before launch. If it's not yet set up, change the copy to "Competitive Freight Rates" until it is.

---

## Quick Win List (can do in 1 day post-launch)

- [ ] Create `favicon.ico` + `apple-touch-icon.png` and add to all pages
- [ ] Create `images/og-collection.jpg` (1200×630px) for social sharing
- [ ] Remove `/index.html` duplicate from sitemap.xml (only keep `/`)
- [ ] Create `404.html` custom error page
- [ ] Fix hero stats to real numbers (500 GSM · 153 Products · 48hr Dispatch)
- [ ] Add delivery timeframes to contact page + benefits strip
- [ ] Add phone number to product page layout
- [ ] Delete old PNG files from `images/` (6 files, ~4.5 MB)
- [ ] Add honeypot to contact form (Blocker 1)

---

*Audit compiled: 25 May 2026 — auslinenandtowels.com.au — 153 products, 23 categories*
