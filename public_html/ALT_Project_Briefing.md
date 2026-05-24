# Australian Linen & Towels — Project Briefing
**Last updated: April 2026**
Use this file at the start of every new chat to resume context instantly.

---

## 1. Client Overview

**Business:** Australian Linen & Towels (ALT)
**Owner:** Hassan (GlassTech Group, Karachi — this is a separate external client project)
**Website URL:** auslinenandtowels.com.au
**Hosting:** Hostinger (static HTML — NOT Node.js, NOT React, NOT Firebase)
**Business model:** B2B wholesale — imports commercial linen from supplier, sells trade-only to hospitality businesses
**Location:** Griffith, NSW, Australia — **online business only, no showroom, no warehouse visits**
**Contact:** info@auslinenandtowels.com.au · 0414 533 449 · Mon–Fri 9am–5pm AEDT

---

## 2. Business Rules (CRITICAL — never break these)

| Rule | Detail |
|---|---|
| **No prices on website** | All pages show "Contact for pricing" |
| **No worldwide/international** | Australia-wide delivery only |
| **Free shipping threshold** | Free on orders over AU$100 only |
| **Return policy** | 14 days (NOT 30) |
| **No samples** | We don't offer samples |
| **No embroidery/branding** | Plain commercial linen only |
| **No showroom** | No street address, no "visits by appointment" |
| **Address display** | Only "Griffith, NSW · Australia" — never postcode or street |
| **Admin is read-only** | No edit links, no bulk upload, no price columns |
| **Live Chat** | "Coming Soon" only |
| **Trade pricing** | Quote-based — prices NOT published anywhere |

---

## 3. Who They Supply (Customer Segments)

- Hotels & Motels (3-star to 5-star)
- Day spas & massage centres
- Serviced apartments & executive accommodation
- Short-stay operators & Airbnb property managers
- Resorts, holiday parks, retreat centres
- B&Bs, guest houses, country lodges
- Educational institutions (boarding schools, university residences)
- Aged-care facilities

---

## 4. Product Catalogue (19 SKUs)

### White Towels — 100% combed cotton
| SKU | Product | Size | Weight |
|---|---|---|---|
| CCBT430 | Classical Bath Towel | 68×137cm | 450 GSM |
| CCHT120 | Classical Hand Towel | 40×60cm | 450 GSM |
| DCFT50 | Deluxe Face Towel | 32×32cm | 500 GSM |
| DCBM250 | Deluxe Bath Mat | 50×70cm | 700 GSM |

### Charcoal Towels — 500 GSM, colour-fast
| SKU | Product | Size |
|---|---|---|
| PCBTCC | Bath Towel | 70×140cm |
| PCHTCC | Hand Towel | 40×60cm |
| PCFTCC | Face Towel | 32×32cm |

### Camel Towels — 500 GSM, colour-fast (Enquire)
| SKU | Product |
|---|---|
| PCBTCM | Bath Towel |
| PCHTCM | Hand Towel |
| PCFTCM | Face Towel |

### White Sheets — 165 GSM, 50/50 cotton-poly
| SKU | Product |
|---|---|
| 60CSSBWH | Single Flat Sheet |
| 60CSFSBWH | Single Fitted Sheet |
| 60CSDBWH | Double Flat Sheet |
| 60CSFDBBWH | Double Fitted Sheet |
| 60CSQBWH | Queen Flat Sheet |
| 60CSFQBWH | Queen Fitted Sheet |
| 60CSKBWH | King Flat Sheet |
| 60CSFKBWH | King Fitted Sheet |
| 60CSPQWH | Pillowcase |

**Additional colours available on request** through supplier network. Custom colour matching for larger volumes.

---

## 5. Website File Structure

```
public_html/
├── index.html              Homepage (hero carousel, featured products, Who We Supply, collections)
├── collection.html         Full catalogue with filter drawer (sidebar on desktop, bottom-sheet mobile)
├── product.html            Individual product pages (?sku=CCBT430)
├── contact.html            Contact form (Formspree-ready) + contact info
├── faq.html                FAQ page — 13 questions with JSON-LD schema for AI search
├── terms.html              T&C page (14 clauses, concise)
├── admin.html              Read-only merchant dashboard
├── assets/
│   ├── styles.css          All CSS + mobile responsive
│   ├── partials.js         Shared header + footer + mobile nav drawer (auto-mounts)
│   ├── products-data.js    19 products + 4 categories + formatPrice() always returns "Contact for pricing"
│   └── chat-widget.js      AI chat widget (connects to Cloudflare Worker)
└── images/
    ├── white-bath-towel.webp
    ├── white-hand-towel.webp
    ├── white-face-towel.webp
    ├── white-bath-mat.webp
    ├── white-towel-stack-3.webp
    ├── white-towel-stack-5.webp
    ├── white-pillowcase-pair.webp
    ├── white-pillowcase-single.webp
    ├── white-rolled-towel.webp
    ├── charcoal-bath-towel.webp
    ├── charcoal-hand-towel.webp
    ├── charcoal-face-towel.webp
    ├── camel-bath-towel.webp
    ├── camel-hand-towel.webp
    ├── camel-face-towel.webp
    ├── cat-white-towels.webp
    ├── cat-charcoal-towels.webp
    ├── cat-camel-towels.webp
    ├── cat-white-sheets.webp
    └── logo.webp
    [hero-hotel.webp, hero-spa.webp, hero-airbnb.webp, hero-resort.webp — PENDING from client]
```

---

## 6. Design System

**Fonts:** Cormorant Garamond (serif, headings), Inter (sans, body), JetBrains Mono (labels/mono)
**Colours:**
```css
--navy:     #1a1f4e   /* primary dark */
--navy-2:   #252a5c
--gold:     #b8933a   /* accent */
--gold-soft:#d4b568
--paper:    #faf8f3   /* background */
--ivory:    #f4f0e8
--ivory-2:  #ede8dc
--ink:      #1a1d2e   /* body text */
--muted:    #6b6e7d   /* secondary text */
--line:     #e5e0d2   /* borders */
```
**Style:** Luxury editorial B2B — similar to Frette, Bemboka, Sheridan Hotel Collection

---

## 7. Key Features Built

### Homepage (index.html)
- Full-screen CSS carousel hero (4 slides, 5s each, smooth fade)
  - **TEMPORARY images** using existing product photos — client needs to add lifestyle images:
    - `hero-hotel.webp` (luxury hotel bedroom)
    - `hero-spa.webp` (day spa with towels)
    - `hero-airbnb.webp` (boutique short-stay)
    - `hero-resort.webp` (resort poolside)
- Marquee benefit strip (scrolling ticker)
- Featured products section (tabbed: All / White / Charcoal / Camel / Sheets)
- **"Who We Supply" section** — 6 segment cards (Hotels & Motels, Day Spas, Serviced Apartments, Short-Stay & Airbnb, Resorts & Wellness, Other Hospitality)
- Shop by Collection grid (4 tiles)
- Wholesale quote CTA

### Collection Page (collection.html)
- Category tabs (horizontal scroll on mobile)
- Filters: desktop sidebar / mobile bottom-sheet drawer
- Sort (no price options)
- **Colour notice banner** on towel categories: "More colours available on request"
- 2-column grid mobile / 3-column grid desktop

### Product Detail (product.html)
- "Contact for pricing" large (no price shown)
- Spec table (size, weight, material, colour, SKU)
- **Colour swatches** for towels: White / Charcoal / Camel / + More on request
- 4 feature blocks: Fast Shipping (free over AU$100) / Commercial Grade / 14-day Returns / Bulk Quote
- Request Quote + Bulk Quote CTAs (both link to contact.html)
- Related items (same category, colour+SKU shown, no price)

### Contact Page (contact.html)
- Form fields: Full Name, Business Email, Phone, Company/Property, Enquiry type, Message
- **Enquiry dropdown:** Wholesale quote / Bulk order / Colour enquiry / Other
- **Contact info:** Email / Phone / Based In: Griffith, NSW / Live Chat: Coming Soon
- Formspree integration (needs FORM_ID — see Section 11)
- Fallback error message if submission fails

### FAQ Page (faq.html)
- 13 questions with JSON-LD FAQPage schema (AI search optimized)
- JSON-LD LocalBusiness schema
- Questions cover: GSM guide, wash cycles, MOQ, delivery, returns, cotton vs blends, colour-fast, AU bed sizes, colours available (Q12), who we supply (Q13)
- All product prices removed — "contact for trade pricing" throughout

### Terms Page (terms.html)
- 14 clauses — concise website standard version
- Links to full Word document (ALT_Terms_Conditions.docx) on request
- **14-day** return window throughout

### Admin Dashboard (admin.html)
- READ-ONLY — no Edit links, no Bulk Upload
- Stats: Total Products (19) / Categories (4) / Towels (10) / Bed Linen (9)
- Tabs: Products / Categories / Customer Inquiries
- Table: Image + Product name + SKU + Category + Weight + STATUS badge ("Live") + "View on site ↗"
- Mobile: sidebar collapses to top bar, table becomes stacked cards

---

## 8. Mobile Optimization

- **Hamburger drawer** (☰) — slides in from left, has all nav links + phone + email
- **Sticky call bar** — gold "CALL SALES" + navy "EMAIL" at bottom on mobile (≤768px)
- **Mobile filter drawer** (collection page) — bottom-sheet slides up from below
- **Horizontal scroll tabs** on collection page
- **Horizontal product cards** on homepage (image left, text right)
- **Footer accordion** — 5 sections collapse with +/− on mobile
- **Viewport-fit=cover** — iPhone notch support
- **100dvh** — proper dynamic viewport height for iOS Safari

---

## 9. AI Chat Widget

**File:** `assets/chat-widget.js`
**Backend:** Cloudflare Worker (`chat-worker/worker.js`) — NOT YET DEPLOYED
**Model:** Claude Haiku 4.5 (cost ~$0.001 per conversation)

**Widget features:**
- Navy floating button bottom-right, gold notification badge
- Slide-up chat window (full-screen on mobile)
- 4 suggestion chips: "What GSM towels do hotels use?" / "How do I open a trade account?" / "Delivery times across Australia" / "How do I get a quote?"
- Typing indicator
- Auto-escalation to handoff form
- Handoff form: Name + Email + Phone → emails team

**System prompt key rules:**
- Never quote prices
- No samples, no embroidery, no international shipping
- Location: Griffith, NSW only (no street)
- **14-day returns**
- Colour info: white/charcoal/camel standard; other colours on request
- Escalate on: quote requests, volume orders, complaints, anything complex

**Current status:** Widget is live on site but needs Cloudflare Worker deployed to function.

---

## 10. SEO / GEO (AI Search Optimization)

- **JSON-LD FAQPage schema** on faq.html — 13 Q&As machine-readable
- **JSON-LD LocalBusiness schema** on faq.html — business name, location, phone, email, hours
- **Meta descriptions** updated on all pages
- **FAQ content** structured for AI citation (direct answers in first 50 words)

**Pending:**
- Google Business Profile (not set up yet)
- Blog section (not built yet)
- Industry directory listings (not done yet)

---

## 11. Pending Actions (client to complete)

### HIGH PRIORITY

**1. Hero lifestyle images**
Generate 4 images using Gemini with these prompts (see previous chat):
- `hero-hotel.webp` — luxury hotel bedroom, white linen, 16:9 landscape
- `hero-spa.webp` — day spa with charcoal towels, moody lighting, 16:9
- `hero-airbnb.webp` — boutique short-stay bedroom, warm, 16:9
- `hero-resort.webp` — resort poolside, camel towels, 16:9

Upload to: `public_html/images/` — same filenames.
Convert to WebP: [squoosh.app](https://squoosh.app)

**2. Formspree contact form**
1. Sign up at [formspree.io](https://formspree.io) (free — 50 submissions/month)
2. Create form → destination: `info@auslinenandtowels.com.au`
3. Copy Form ID (e.g., `xpzgkqyl`)
4. Edit `contact.html` line ~192:
```js
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```
5. Re-upload `contact.html`

**3. Deploy AI Chat Widget (Cloudflare Worker)**
1. Sign up at [cloudflare.com](https://cloudflare.com) (free)
2. Sign up at [console.anthropic.com](https://console.anthropic.com) — add $5 credit
3. Install: `npm install -g wrangler`
4. Login: `wrangler login`
5. In `chat-worker/` folder: `wrangler deploy`
6. Run: `wrangler secret put ANTHROPIC_API_KEY` → paste key
7. Copy Worker URL (e.g., `https://alt-chat.xyz.workers.dev`)
8. Edit `assets/chat-widget.js` line ~12: replace `YOUR_FORM_ID` with Worker URL
9. Re-upload `chat-widget.js`

### MEDIUM PRIORITY

**4. Google Business Profile**
- Go to [business.google.com](https://business.google.com)
- Business name: Australian Linen & Towels
- Category: Commercial linen supplier
- Area served: Australia (not exact address)

**5. LinkedIn company page**
- Builds AI search citations (Reddit + LinkedIn most cited by ChatGPT/Gemini)

### LOW PRIORITY

**6. Blog section** — not built yet
**7. Industry directory listings** — Sourceful Australia, IndustrySearch etc.
**8. Google Analytics GA4** — tracking not set up

---

## 12. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML + CSS + Vanilla JS (NO React, NO Vue, NO Node) |
| Hosting | Hostinger (static files) |
| Images | WebP (converted from JPG, ~57% smaller) |
| Fonts | Google Fonts (Cormorant Garamond, Inter, JetBrains Mono) |
| Chat backend | Cloudflare Workers (serverless) |
| Chat AI | Claude Haiku 4.5 via Anthropic API |
| Contact form | Formspree (pending setup) |
| Deployment | Manual upload via Hostinger File Manager |

**No database. No backend server. No build step.**
Upload files → live instantly.

---

## 13. File Delivery History

All files delivered via Claude conversation. Latest zip:
- **`alt_website.zip`** — 922 KB — 32 files — complete site
- **`chat-worker/worker.js`** — Cloudflare Worker (deploy separately)
- **`chat-worker/wrangler.toml`** — Cloudflare config
- **`ALT_Terms_Conditions.docx`** — Full professional T&C (18 clauses, Word format)

---

## 14. Common Tasks for New Chat

### "Add/change a product"
Edit `assets/products-data.js` — find the product object, update fields. Then re-upload that one file.

### "Update prices" (if ever needed)
In `products-data.js`, change `formatPrice()` function. Currently returns "Contact for pricing" always.

### "Change hero images"
Upload new images to `images/` folder with names:
`hero-hotel.webp`, `hero-spa.webp`, `hero-airbnb.webp`, `hero-resort.webp`
OR edit the 4 lines in `index.html` CSS where `background-image: url(...)` is defined.

### "Add a new page"
Copy structure from `contact.html`, update `data-page=""` attribute on `<body>`, add nav links in `partials.js`.

### "Change shipping threshold"
Search all files for `AU$100` — currently appears in: index.html (hero stats + marquee), product.html (features), partials.js (utility bar), faq.html (Q4 + Q9 schema), terms.html.

### "Change return policy days"
Currently **14 days**. Appears in: index.html (marquee), product.html (features), faq.html (Q10 schema + visible), terms.html (clause 7), chat-worker/worker.js (system prompt).

### "Update chatbot knowledge"
Edit `chat-worker/worker.js` → `SYSTEM_PROMPT` variable → redeploy with `wrangler deploy`.

---

## 15. Key Decisions Made (Consultant Notes)

- **No public pricing** — trade B2B model, prices by quote only
- **Australia-only delivery** — client confirmed, no international
- **14-day returns** — confirmed by client (not industry-standard 30)
- **No samples programme** — client confirmed
- **No embroidery** — client confirmed, plain linen only
- **Location privacy** — home-based warehouse, only city+state shown
- **Hero carousel** — CSS-only animation (no JS library), 4 slides × 5s
- **Admin read-only** — no live edit functionality, static dashboard
- **Formspree for forms** — chosen over EmailJS/PHP for simplicity
- **Cloudflare Worker for chatbot** — API key security (never exposed to browser)
- **WebP images** — converted from JPG, ~57% smaller
- **"Who We Supply" section** — added to address gap: motels, massage centres, 3-star hotels not visible enough
