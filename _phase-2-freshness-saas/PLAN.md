# AusLinen Freshness Program — Phase 2 Plan

> **Status:** Planned (not built). Deferred until the client is comfortable with the
> live website (Phase 1). This document captures the full vision, architecture,
> data model, MVP scope, and open decisions so Phase 2 can start cleanly.
>
> **This folder is internal** (underscore prefix). It is documentation only — no
> application code yet. Nothing here is served as part of the public website.

---

## 1. The Concept

A **free, public QR-based linen-freshness tracking tool**. Anyone can sign up (not just
existing AusLinen buyers). On sign-up they get QR codes to place on their property /
room doors. A guest scans the QR and sees a **live freshness report with a last-updated
timestamp** — proof that the linen was freshened and quality-checked.

This turns AusLinen from a commodity linen supplier into a **platform**, and turns the
tool into a **customer-acquisition flywheel**.

### The flywheel
```
Free tool → operator signs up  (AusLinen captures email + property data = warm lead)
   → operator uses it daily     (marks rooms "freshened")
   → guest scans QR             (trust + AusLinen brand impression on every scan)
   → dashboard prompts reorder  ("linen ageing / running low → reorder from AusLinen")
   → SALE
```
Every sign-up is a lead. Every guest scan is a brand impression.

---

## 2. Critical Technical Reality

- **A QR code is only a pointer.** It encodes a fixed URL (e.g. `auslinen.com.au/r/ABC123`).
  The QR itself holds **no live data**.
- The **live freshness data + timestamp** comes from the **page that the QR URL points to**,
  which must be backed by a **database the operator updates**.
- Therefore this is **not** a static-site feature. It needs **auth + database + a public
  read endpoint** — i.e. a real web app.
- The client's **100,000-QR subscription** is useful for generating **branded QR images**
  at scale for the printed cards. It does **not** provide the live tracking data — that is
  our app's job. (QR codes can also be generated for free in-browser via `qrcode.js` if
  the subscription is ever unavailable.)

---

## 3. Recommended Architecture

| Layer | Choice | Why |
|---|---|---|
| Backend | **Supabase** | Free tier covers Auth + Postgres + Row-Level Security + Edge Functions. Ideal for this use-case and scales. |
| Auth | Email magic-link | No password friction for busy operators. |
| DB | Postgres (Supabase) | Relational model below. RLS so each operator only sees their own data. |
| Public scan page | Static + Supabase read | `/r/:code` reads latest freshness for that room (read-only, no auth). |
| QR images | Existing 100k subscription (branded) or `qrcode.js` (free fallback) | Encodes the public `/r/:code` URL. |
| Hosting | Vercel (same as site) | Public pages + client app; Supabase hosts data/auth. |

---

## 4. Data Model (MVP)

```
users            (Supabase Auth)
  └─ properties  (id, user_id, name, created_at)
       └─ rooms  (id, property_id, label, public_code [unique],
                  in_service_date, last_freshened_at, last_inspected_at)
            └─ freshness_logs (id, room_id, event['freshened'|'inspected'], at)
```

- `public_code` is what the QR encodes → `/r/:public_code`.
- Guest scan reads `rooms.last_freshened_at` (+ optional `last_inspected_at`,
  `in_service_date`) by `public_code`. **No guest personal data stored.**
- `freshness_logs` gives history and powers the auto wash-cycle estimate later.

---

## 5. MVP Scope (prove the concept, don't over-build)

1. **Sign up / login** — email magic-link (Supabase Auth).
2. **Create property → add rooms** — each room auto-assigned a `public_code` + QR.
3. **Mobile dashboard** — tap a room → **"Mark Freshened Now"** → writes timestamp.
4. **Public scan page** `/r/:code` — guest sees:
   > *"This room's linen was freshened on 28 May, 9:14 AM · Quality-assured by
   > [Property] · Powered by AusLinen"*
   plus AusLinen branding + a subtle CTA.

Everything else (auto wash-estimate, per-room PDF cards, reorder prompts, analytics)
layers on **after** the core loop works.

---

## 6. Phasing

- **Phase 1 (separate, static — can ship independently):** Linen Operations Toolkit —
  configurator → downloadable PDF (master register + per-room cards) + printable
  **A6 door "Freshness Cards"**. No backend. (See "Phase 1 notes" below.)
- **Phase 2 (this document):** QR live-tracking SaaS on Supabase. The MVP above.
- **Phase 3 (later):** Auto wash-cycle estimate from occupancy + in-service date,
  reorder automation, multi-user/staff accounts, analytics dashboard.

---

## 7. Honest Cautions (read before starting)

- **Backend = ongoing commitment** — maintenance, auth security, hosting, support.
  A real step up from the current static brochure site.
- **Privacy (Australian Privacy Act)** — storing operator accounts + property data
  requires a **privacy policy update**. On guest scan, store **no personal data** —
  serve read-only freshness only. Keeps the compliance surface minimal.
- **Stale-data risk** — if an operator stops updating, a guest sees "freshened 9 days
  ago," which can backfire. Show **honest relative time** and handle gracefully
  (e.g. soften or hide the badge past a threshold).
- **Adoption ≠ revenue** — the funnel only pays off if the dashboard actively nudges
  reorders from AusLinen. Build the reorder prompt into the core, not as an afterthought.

---

## 8. Open Decisions (to confirm when Phase 2 starts)

1. **First deliverable** — clickable end-to-end MVP, OR a written screen-by-screen
   plan + Supabase setup first, OR a static (fake-data) UI prototype for look-and-feel?
2. **Backend** — confirm Supabase (recommended) vs alternatives / cost concerns.
3. **Sign-up audience** — fully open (max funnel) vs AU-only / email-verified gating.
4. **QR source** — use the 100k branded subscription, or free in-browser generation?
5. **Branding** — exact wording + design of the guest-facing scan page and the
   "Powered by AusLinen" treatment.

---

## 9. Phase 1 Notes (the printable toolkit — context, also deferred)

Confirmed design choices from discussion (for when Phase 1 toolkit is built):
- **Wash-cycle tracking:** auto-estimate from in-service date + occupancy % + change
  policy (no manual per-wash ticking required).
- **Email:** optional (skippable) — "give email and we'll send reorder reminders."
- **Layout:** both a master linen register (all rooms × items) **and** per-room cards.
- **Door card:** double-sided **A6** (front = guest-facing freshness + QR;
  back = staff tally grid). AU cardholder fit; printable 4-up on A4.
- **Auto-estimate formula:**
  ```
  occupied nights/month = 30 × occupancy%
  checkouts/month       = occupied nights ÷ avg stay
  sheets washes/month   = checkouts/month         (change = every checkout)
  towels washes/month   = occupied nights/month    (change = daily)
  total washes          = washes/month × months in service
  ```
  Flag thresholds: 🟢 OK · 🟡 Monitor (70%+) · 🔴 Replace (towels ~150 / sheets ~200).
- **Build:** configurator page + `jsPDF` (+ autoTable) for in-browser PDF generation.
  No backend.

---

*Captured during the Phase 1 website build. Resume here when the client is ready for Phase 2.*
