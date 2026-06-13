# GO-LIVE AUDIT — Australian Linen & Towels
**God-mode multi-agent audit** · 13 June 2026 · Branch `claude/glasstech-go-live-audit-oka2yt`
Repo: `hassanglasstech/Auslinenandtowels` · Deploy: Hostinger shared (PHP/MySQL)

> Method: 5 specialised audit agents run in parallel — Security/Backend, Frontend/Code-Quality,
> SEO/Content/Business-Rules, Infra/Data/ERP-gap, Docs-drift/Dead-files. All findings are
> read-only with exact `file:line` references. No files were modified during the audit.

---

## 0. Important reframe — this is NOT an ERP

The owner asked for an "ERP go-live readiness" check. **This application is a B2B wholesale
marketing + lead-capture website with a catalogue editor** — not an ERP. Of the 10 standard ERP
modules, **0 are fully present, 3 are partial (CRM-lite, PIM-lite, catalogue), 7 are absent**
(see §6). The go-live verdict below judges it as what it actually is: a brochure/lead-gen site.

---

## 1. OVERALL VERDICT

| | |
|---|---|
| **As a marketing/lead-capture website** | 🟠 **GO-WITH-FIXES** — strong foundations, but blocked by client-rule + lead-pipeline issues |
| **As an ERP** | 🔴 **NOT AN ERP** — ~0/10 modules; do not attempt to grow this into one (integrate Xero/MYOB/Odoo instead) |
| **Launch decision** | ❌ **DO NOT LAUNCH** until the 6 blockers in §2 are cleared |

The codebase is materially better-built than its own docs suggest (PDO prepared statements
everywhere, CSRF + honeypot, CSP + security headers, a real Vite MPA build, GA4 consent-mode-v2,
and a DB→catalogue publish pipeline whose datasets are **100% consistent**). The blockers are
concentrated and fixable — they are not architectural rot.

---

## 2. 🔴 GO-LIVE BLOCKERS (must fix before launch)

| # | Blocker | Evidence | Why it blocks launch |
|---|---------|----------|----------------------|
| **B1** | **`mail.php` returns 403 on the live server** | `mail.php`; `assets/lead-capture.js:151`; `AUDIT.md:115,201` | Every lead funnel (contact form, exit-intent, newsletter) POSTs here. 403 = **every lead silently lost**. Highest business risk. Fix: hPanel perms 644 + ModSecurity whitelist; verify 200. |
| **B2** | **5 hard business-rule violations** | see §3 | Client's non-negotiable rules. Real prices in `products-data.js` (153×) + JSON-LD; samples advertised; embroidery offered (contradicts own FAQ); postcode "2680" exposed; admin is full CRUD not read-only. |
| **B3** | **Admin exposed: token in URL + only `.htpasswd`/noindex** | `admin.html:402-424`; `api/products.php:8-13` | `?token=...` leaks to access/proxy/Referer logs; one shared static token = no identity; admin page renders for anyone if `.htaccess` auth isn't enforced. Move token → header; verify 401 on live; deploy `db-config.php` outside webroot. |
| **B4** | **Weak committed admin hash** | `.htpasswd:1` (`$apr1$`/MD5) | Salted-MD5 in a repo = crackable offline by anyone with read access, then full admin login. Regenerate bcrypt (`htpasswd -B`), rotate, purge from git history. |
| **B5** | **Partials source-of-truth drift breaks live footer on next push** | `src/partials/footer.html` vs `assets/partials.js:276` | CI runs `npm run sync && vite build` on every push to `main`. Source `footer.html` is missing the Riverina link that the deployed footer has → **next routine push silently deletes a live link** (verified: sync dry-run reports "Footer WOULD CHANGE"). |
| **B6** | **Raw DB exception leaked to clients** | `api/products.php:251` (`'Server error: '.$e->getMessage()`) | Leaks SQL/schema/paths to any caller on error — recon aid. Every other endpoint already returns generic errors; match them. |

---

## 3. Business-rule compliance — ❌ FAIL (5 violations)

Source of truth: `ALT_Project_Briefing.md §2`. Each violation is HIGH.

| Rule | Status | Evidence |
|------|--------|----------|
| No prices anywhere ("Contact for pricing") | ❌ | Numeric `price` in `assets/products-data.js` (153 products); price strings in JSON-LD `collection.html:836,896,926,941`; `product.html:329-330` offer price `0.00`. (Rendered UI correctly hides them — but data + schema leak them.) |
| No samples | ❌ | `assets/lead-capture.js:26,32-36`; `hotels.html:104,158,233`; `about.html:315`; `blog-gsm-guide.html:236-241`; `blog-choosing-linen-supplier.html:103,156`. |
| No embroidery/branding | ❌ | `gyms.html:46,128`, `spas.html:130` offer embroidery — **directly contradicts** `faq.html:117,517` ("No"). |
| Address = "Griffith, NSW" only, never postcode | ❌ | "2680" in visible text `contact.html:217`, `linen-supplier-griffith-riverina.html:70`, `llms.txt:11` (plus JSON-LD `postalCode` on ~8 pages). |
| Admin read-only (no edit, no price column) | ❌ | `admin.html:310,344,356,462-463,557-600` — full Add/Edit/Delete/Publish + numeric price input. |
| 14-day returns (not 30) | ✅ | `terms.html:109`. Clean. |
| Free shipping over AU$100 | ✅ | Consistent across pages. |
| No international shipping | ✅ | `terms.html:99`. |
| No street address / showroom | ✅ | None found. |

---

## 4. Findings by domain (severity-ranked, deduplicated)

### 4A · Security & Backend — verdict: GO-WITH-FIXES
| Sev | File:line | Finding |
|-----|-----------|---------|
| 🔴 High | `.htpasswd:1` | Weak `apr1`/MD5 admin hash committed → offline-crackable (**B4**) |
| 🔴 High | `api/products.php:251` | Raw PDO exception text returned to client (**B6**) |
| 🔴 High | `admin.html:402-424` | Admin token in URL query string; admin page auth = `.htaccess` only (**B3**) |
| 🟠 Med | `db-config.php` / `.htaccess:98` | Secrets file in webroot; one misconfig from plaintext. Deploy outside `public_html` (the `../` fallback is already coded in every consumer) |
| 🟠 Med | `mail.php:46-70` | IP rate-limit uses world-readable temp files; bypassable behind proxy/CDN |
| 🟠 Med | `health.php:16-34` | Public health endpoint discloses DB up/down (recon) |
| 🟢 Verified-safe | — | **No SQLi** (PDO prepared statements + `$FIELD_MAP` allowlist throughout); **no email-header injection** (`mail.php` validates + strips CRLF); CSRF origin check + honeypot present; CSP + security headers present; CORS allowlisted; **no real secrets in git history** (committed `db-config.php` held placeholders only) |

### 4B · Frontend / Code Quality — maturity ~5/10
| Sev | File:line | Finding |
|-----|-----------|---------|
| 🔴 Crit | `src/partials/footer.html` vs `partials.js:276` | Source/output drift; CI overwrites live footer on next push (**B5**) |
| 🟠 High | `index.html:1397,1409` | Invalid `<button>` nested inside `<a>` in featured cards |
| 🟠 High | `contact.html:158-190`, `trade-account.html:96-212` | Form labels not associated (`for`/`id`) — a11y failure on primary conversion forms |
| 🟠 High | `product.html:392,417,437,507` | Colour/type swatches are `<span onclick>` (not keyboard-accessible); real `<h1>`/content only exists after JS — no `<noscript>` fallback |
| 🟠 High | catalogue counts | SKU count inconsistent: README says 19; `collection.html:417` JSON-LD `numberOfItems:50`; meta "150+"; `hotels.html:124` "153". **Real = 153 / 22 categories** |
| 🟡 Med | `partials.js:15,175` | Stale comments contradict code (consent-mode + "functions removed" claims are false) |
| 🟡 Med | `eslint.config.js:4` | Lint covers only standalone JS; ~45 KB of inline JS in `collection.html`/`index.html`/`product.html` is never linted |
| 🟡 Med | repo-wide | **No test suite** — data integrity, partials sync, and PHP API are entirely unverified by automation |
| 🟢 Verified-good | — | **`products-data.js` ≡ `products-seed.json`: 0 diffs across 153 SKUs** (healthiest part of the codebase); no broken internal links; no missing `alt`; no duplicate IDs; Vite MPA build is sophisticated and deploy-complete |

### 4C · SEO / Performance / Content
| Sev | File:line | Finding |
|-----|-----------|---------|
| 🟠 High | `collection.html:836…`, `products-data.js` | Prices in JSON-LD + data (also a business-rule violation, B2) |
| 🟡 Med | `product.html:329-331` | JSON-LD offer `price:0.00` + `InStock` = invalid structured data |
| 🟡 Med | dispatch time | **Three conflicting values**: `faq.html:101,492` "1–2 days", most pages "2–5 days", `llms.txt:107` "3–8 days". Standardise. |
| 🟡 Med | `collection.html` | Product grid JS-rendered; add `<noscript>` fallback for Googlebot |
| 🟡 Med | `product.html:17` | Default `og:image` is the logo PNG (JS overrides at runtime, but scrapers read static) |
| 🟡 Med | `linen-supplier-griffith-riverina.html:13` / `blog-gsm-guide.html:5` | Meta description ~310 chars / title 92 chars (regressions vs AUDIT.md claims) |
| 🟢 Good | — | Canonicals, OG tags, consent-mode-v2 GA4, FAQ/LocalBusiness/Article schema, clean sitemap, no broken `?cat=`/`?sku=`, **no fake reviews**, **no "20 years" claim**, `og-collection.jpg` now exists |

### 4D · Infra / Deploy / Data
| Sev | File:line | Finding |
|-----|-----------|---------|
| 🟠 High | `.github/workflows/ci.yml:34-52` | "Auto-deploy from GitHub" is **not actually wired** (FTP block commented out); deploys are manual, no rollback |
| 🟠 High | `setup-db.sql` | One-shot DDL, **no migrations**, no `schema_version` table → guaranteed env drift |
| 🟠 High | — | **No staging environment** — schema/data changes tested in prod |
| 🟠 High | `backup.php:24-69` | Backup is partial (only `subscribers`+`enquiries`), same-disk, externally-cron-dependent, **never restore-tested** |
| 🟡 Med | `mail.php:180` | Email via PHP `mail()` — poor deliverability (no SPF/DKIM enforced); use authenticated SMTP |
| 🟡 Med | `.htaccess:23-24` | HSTS `max-age=1yr; includeSubDomains` hardcoded on — verify SSL on apex + all subdomains first |
| 🟢 Good | — | InnoDB + `utf8mb4`; sensible indexes; HTTPS + www→apex canonicalisation; gzip + browser caching; 404 page; lead-capture-with-DB-fallback design |
| **DB schema gap** | `setup-db.sql:68,72,74` | No foreign keys (logical FKs enforced only in app code); `weight VARCHAR` not numeric; `gallery TEXT`-JSON not queryable; **no currency/tax/cost columns** (GST-naive); no audit/soft-delete |

---

## 5. Documentation vs reality — README & Briefing are substantially false

`README.md` and `ALT_Project_Briefing.md` still describe the **v1 static brochure** ("no database,
no backend, no build step, 19 SKUs, Formspree forms, admin read-only demo, Cloudflare chat worker").
Reality: **MySQL + PHP CRUD API + Vite/ESLint build + CI + 153-SKU DB-driven catalogue + admin→publish
pipeline + PHP mail backend**, and the chat worker no longer exists. `products-data.js` is now
auto-generated and marked "do NOT hand-edit" — yet the README still tells you to hand-edit it.
**Action: rewrite both docs (or run `/init`) to match the real stack before sign-off.** `AUDIT.md` is
the only roughly-current doc, but it has stale items (lists `og-collection.jpg` as missing — it exists;
claims "6 unreferenced PNGs" — only 1 remains).

**Dead files to remove:** `generate_products.py.deprecated` (75 KB), the `generate_products.py` stub,
`images/logo-full.png`, ~15 orphaned old `.webp` product images, and the stale `_contrast-preview.html`
entry in `vite.config.js:25` (file already gone).

---

## 6. ERP gap analysis — 0 present / 3 partial / 7 absent

| ERP module | Status | Gap |
|------------|--------|-----|
| Inventory / stock (multi-warehouse, reorder) | ❌ Absent | No `stock_qty`/`warehouse`/`reorder_point`; catalogue is display-only |
| Order management / sales orders / quote-to-cash | ❌ Absent | No orders/quotes tables; `enquiries` captures leads only; no cart/fulfilment |
| Procurement / purchasing / suppliers | ❌ Absent | No suppliers/POs/receiving |
| Customer master / CRM | 🟡 Partial | `subscribers`+`enquiries` capture contacts; no unified customer, pipeline, or dedup |
| Accounting / GL / AR / AP / invoicing / GST | ❌ Absent | No ledger/invoices/payments/tax; `price` GST-naive |
| Product/catalog master data (PIM) | 🟡 Partial | **Strongest area** — DB-backed CRUD + publish; but no stock/cost/tax/variant matrix |
| Reporting / BI / dashboards | ❌ Absent | `admin.html` is a product editor; only CSV exports |
| Roles / RBAC / audit trail / multi-user | ❌ Absent | Single shared Basic-Auth + one shared API token; no users/roles/audit |
| Multi-currency / multi-tenant | ❌ Absent | Single AUD price, single tenant |
| Integrations (payment / shipping / Xero/MYOB) | ❌ Absent | Only outbound `mail()` + GA4/Clarity |

**ERP verdict:** Very far from an ERP — the entire operational + financial core is missing by design.
**Recommended path: integrate, don't build.** Adopt Xero/MYOB (GL/AR/AP/GST) + an inventory/order
tool, or an SMB ERP like Odoo; map the real asset here (the 153-SKU PIM catalogue) into it; keep this
website as the lead-gen front-end. (Note: `_phase-2-freshness-saas/PLAN.md` is a separate QR/freshness
SaaS on Supabase — not an ERP, and not yet built.)

---

## 7. Prioritised action plan

**Before launch (blockers):** B1 mail.php 403 → B2 5 business-rule fixes → B3 admin token-in-header +
verify 401 → B4 bcrypt `.htpasswd` + rotate + purge history → B5 fix `src/partials/footer.html` →
B6 generic error in `products.php:251` → move `db-config.php` outside webroot.

**Week 1 (high):** form labels (contact/trade-account); `<button>`-in-`<a>` fix; `product.html`
keyboard swatches + `<noscript>`; centralise SKU count + dispatch time + contact/ABN/threshold;
fix dispatch-time contradiction; backup = full `mysqldump` + off-site + restore test; decide deploy
+ rollback strategy.

**Post-launch (med/low):** rewrite README/Briefing (or `/init`); add tests (data ≡ seed, build smoke);
extend lint to inline JS; migrations + staging; SMTP + SPF/DKIM; webp conversion; remove dead files;
canonical on room-package/thank-you; ALT-Trade-Desk bylines.

---

## 8. Recommended Claude Code skills for this work

| Skill | Use | Priority |
|-------|-----|----------|
| `/security-review` | B3/B4/B6 + `db-config` hardening as we change code | ⭐ Top |
| `/code-review` (`--fix` / `--comment`) | Correctness + cleanup on JS/PHP diffs | ⭐ Top |
| `/review` | Full PR review on the go-live-fixes PR | High |
| `/verify` + `/run` | Launch app, confirm forms/admin/catalogue work pre-sign-off | High |
| `/simplify` | Centralise duplicated business data; partials drift | Med |
| `/init` | Regenerate accurate `CLAUDE.md` (docs are false) | Med |
| `/deep-research` | Benchmark ERP/GST/Privacy-Act standards for the gap analysis | Optional |
| `/session-start-hook` + `/fewer-permission-prompts` | Auto-run lint+build+php-lint each web session | Optional |

Force-multiplier beyond skills: **parallel sub-agents per domain** (used here) + **GitHub MCP** for PR/CI.
