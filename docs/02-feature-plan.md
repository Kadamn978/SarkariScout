# 02 — Feature Plan (What, When, Severity, Effort)

**Version:** 1.0 · **Status:** Frozen for v1 planning

## 1. How to read this plan

- **Priority:** P0 = must ship for MVP (launch), P1 = launch +1, P2 = revenue phase, P3 = growth
- **Severity (business impact if broken):** 🔴 Critical (blocks core promise) · 🟠 High (major UX/business harm) · 🟡 Medium · 🟢 Low
- **Effort:** S (<1d) · M (2–3d) · L (1wk) · XL (2wk+)
- Each feature maps to its BRD FR id and test plan section (docs/10-test-plan.md)

## 2. Feature inventory

| ID | Feature | FR | Phase | Priority | Severity | Effort | Depends on |
|---|---|---|---|---|---|---|---|
| F-01 | Monorepo scaffold + docker-compose + env templates + CI | — | 1 | P0 | 🔴 | M | — |
| F-02 | Auth: register/login/logout/verify-email/forgot-password, JWT + refresh | FR-01 | 1 | P0 | 🔴 | L | F-01 |
| F-03 | Eligibility profile builder (education, degrees, state, languages, category, age, exam families, keywords) | FR-02 | 1 | P0 | 🔴 | M | F-02 |
| F-04 | Source registry + scheduler (per-source config, frequency, status) | FR-03 | 2 | P0 | 🔴 | M | F-01 |
| F-05 | NCS API connector (official free API via NAPIX/API-Setu creds) | FR-03 | 2 | P0 | 🔴 | L | F-04 |
| F-06 | RSS connector (UPSC rss.php, SSC, RRB, org feeds) | FR-03 | 2 | P0 | 🟠 | S | F-04 |
| F-07 | HTML scraper connector (IBPS, MPSC, Employment News, aggregators) with polite rate-limit + robots.txt | FR-03 | 2 | P0 | 🔴 | L | F-04 |
| F-08 | Normalization + dedup engine (advtNo+org+postName fingerprint) | FR-04 | 2 | P0 | 🔴 | M | F-05..07 |
| F-09 | Field extractor (dates, fees, qualifications, age, vacancies, exam date) incl. Hindi/Marathi date parsing | FR-05 | 2 | P0 | 🔴 | XL | F-08 |
| F-10 | Eligibility matching engine (hard rules + score) | FR-06, FR-07 | 3 | P0 | 🔴 | L | F-03, F-09 |
| F-11 | Deadline guard: apply-end & fee-end must be > today 23:59:59 IST | FR-07 | 3 | P0 | 🔴 | S | F-10 |
| F-12 | Daily digest email job (9 AM IST, dedup per user, unsubscribe link) | FR-08 | 3 | P0 | 🔴 | M | F-10, F-02 |
| F-13 | Instant alert email on job/change events (toggleable) | FR-09 | 3 | P1 | 🟠 | M | F-16 |
| F-14 | Job listing + detail pages (eligibility, dates, fees, official links, affiliate slots) | FR-12 | 3 | P1 | 🟠 | L | F-09 |
| F-15 | Dashboard (tracked count, upcoming exams, alerts this week, stats) | FR-13 | 4 | P1 | 🟡 | M | F-10, F-17 |
| F-16 | Change detection worker (page diffing → change events: venue, date, corrigendum, deadline) | FR-11 | 4 | P1 | 🔴 | XL | F-09 |
| F-17 | Application tracker (stages: applied → exam date → admit card → result) | FR-10 | 4 | P1 | 🔴 | M | F-14 |
| F-18 | Search + advanced filters (org, family, state, dates) | FR-12 | 4 | P1 | 🟡 | M | F-14 |
| F-19 | Email preferences (digest on/off, instant on/off, one-click unsubscribe) | FR-18 | 3 | P0 | 🔴 | S | F-02 |
| F-20 | Ad engine: LHS/RHS/top/bottom slots only; per-slot rotation; no overlay ever | FR-15 | 5 | P1 | 🟠 | M | F-14 |
| F-21 | Affiliate link manager + click tracking (prep courses, books) | FR-16 | 5 | P1 | 🟡 | M | F-14 |
| F-22 | Premium subscriptions (Razorpay: ₹49/mo lite, ₹99/mo pro; instant alerts + no ads + unlimited trackers) | FR-17 | 5 | P2 | 🟠 | L | F-13, F-20 |
| F-23 | Admin panel (source health, ingest logs, job edit/override, feature flags) | FR-14 | 5 | P2 | 🟡 | L | F-04 |
| F-24 | SEO: public job pages, sitemap, schema.org JobPosting | FR-20 | 6 | P2 | 🟢 | M | F-14 |
| F-25 | 3D hero + motion polish (three.js) on landing | — | 1 | P1 | 🟢 | M | F-01 |
| F-26 | PWA (installable, offline shell) | — | 6 | P3 | 🟢 | M | F-14 |
| F-27 | Telegram/WhatsApp alerts channel | — | 6 | P3 | 🟢 | L | F-13 |
| F-28 | Mobile app (React Native wrapper) | — | 7 | P3 | 🟢 | XL | F-14 |

## 3. Phased delivery (what builds when)

### Phase 1 — Foundation (week 1–2)
F-01, F-02, F-03, F-25 → *Exit gate: user can register, build profile, see a polished landing page.*

### Phase 2 — Data engine (week 3–5)
F-04, F-05, F-06, F-07, F-08, F-09 → *Exit gate: 20+ sources live, 2-week historical backfill, dedup ≥99%, admin sees source health.*

### Phase 3 — Matching & alerts (week 6–7)
F-10, F-11, F-12, F-19, F-13, F-14 → *Exit gate: Rohit-style profile receives only applicable jobs; digest + instant emails verified end-to-end.*

### Phase 4 — User features (week 8–9)
F-15, F-16, F-17, F-18 → *Exit gate: tracker + change detection live; venue/date change alerts proven with a real monitored page.*

### Phase 5 — Monetize (week 10–12)
F-20, F-21, F-22, F-23 → *Exit gate: ads live (side banners only), affiliate tracking live, premium checkout works.*

### Phase 6 — Growth (quarter 2+)
F-24, F-26, F-27, F-28 → *Exit gate: SEO traffic growing, referral loop live.*

## 4. MVP definition (what MUST be in launch)

F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12, F-13, F-14, F-15, F-17, F-19, F-20, F-21

Everything else is post-launch. **F-16 (change detection) is the top P1** because it's the differentiator for the tracker.

## 5. Severity-driven test priority

| Severity | Features | Test gate |
|---|---|---|
| 🔴 Critical | F-01,02,03,04,05,07,08,09,10,11,12,16,17,19 | Must have unit + integration + E2E before merge |
| 🟠 High | F-06,13,14,15,18,20,21 | Unit + E2E smoke |
| 🟡 Medium | F-22,23 | Unit + manual checklist |
| 🟢 Low | F-24,25,26,27,28 | Manual + best-effort automation |