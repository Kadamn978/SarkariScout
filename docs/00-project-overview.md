# 00 — Project Overview & Progress Tracker

> **Codename:** SarkariScout · **Status:** Planning complete, build pending approval · **Last updated:** Aug 20, 2026
> **Operating model:** One-man army (Developer / Architect / Tester / QA / Security Auditor / DevOps / Product Owner) — full end-to-end ownership.

---

## 1. What are we building?

A **revenue-generating web platform** that:

1. Lets users build a **profile** (education/degrees, state, known languages, category, age, preferred posts).
2. Continuously **monitors 20+ free sources** of Indian government job & exam notifications (UPSC, SSC, IBPS, RRB, MPSC, Maharashtra dept portals, NCS, Employment News, verified aggregators).
3. **Filters jobs by eligibility** — a user only receives jobs they can actually apply to (qualification match, state match, deadline still open, fee window open).
4. Sends **email notifications** — a **daily digest at 9 AM IST** and **instant alerts** for critical updates.
5. Gives each user a **tracker** for jobs they applied to: exam date, admit card, result, and **change alerts** (venue change, date shift, rule/corrigendum updates, extension of deadline).
6. **Monetizes** with clean side ads, affiliate links, and a premium tier — **all data sources free** until we hit the first revenue milestone.

## 2. Why it exists (the problem)

Government exam aspirants in India (UPSC, SSC, Banking, Railways, MPSC etc.) lose opportunities daily because:

- Notifications are scattered across dozens of slow, ad-cluttered official websites
- Deadlines are missed (most are short — 15–30 days)
- Eligibility rules are buried in PDFs
- Exam updates (venue change, date shift, corrigendum) arrive too late
- Aggregators like Sarkari Result are noisy — they show *everything*, not what *you* can apply to

**Our wedge:** relevance + timing. "Only jobs you can apply to, before the deadline closes, plus tracking through to the result."

## 3. Target user (primary persona)

| Attribute | Value |
|---|---|
| Name | Rohit (representative user) |
| Education | B.E. Computer Science |
| State | Maharashtra |
| Languages | Hindi, Marathi, English |
| Age | 24 |
| Category | Open (General) |
| Looking for | SSC CGL, IBPS PO, RRB NTPC, MPSC Group B/C, state engineering posts |
| Pain point | Missed 3 deadlines last year because he didn't know notifications existed |

## 4. Success metrics

| Metric | Target (first 12 months) |
|---|---|
| Registered users | 10,000 |
| Active weekly users | 25% |
| Emails delivered / opened | Open rate > 45% |
| Jobs indexed & deduplicated | 15,000+/yr |
| Trackers created | 3,000+ |
| Revenue | ₹10,00,000 (first ₹10L mark, then scale) |
| Ad view-through (no popups) | 100% clean — zero intrusive formats |

## 5. Tech stack at a glance (swappable, isolated)

| Layer | Tech | Why |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind v4 + Framer Motion + Three.js/React Three Fiber | Modern award-style UI, 3D hero wow factor, free hosting (Vercel) |
| Backend | NestJS + TypeScript + Prisma + Zod | Structured, testable, swappable |
| Workers/Queues | BullMQ + Redis (Upstash free) | Daily digest + instant alert pipelines |
| Database | PostgreSQL (Docker local / Neon free) | Zero-cost managed hosting |
| Crawler | Node (Cheerio + undici + RSS + Playwright for JS-heavy sites) | Separate folder, can swap to Python anytime |
| E2E | Playwright (real browsers: Chromium + Firefox + WebKit) | True browser tests, not mocks |
| Email | Mailtrap (dev) → Brevo free 300/day (prod) → SES when volume grows | Free till revenue |
| Deploy | Vercel (FE) + Render free (BE + workers) + Neon (DB) | ₹0 running cost |

## 6. Progress tracker (live)

| Phase | Deliverable | Status |
|---|---|---|
| Phase 0 — Planning | BRD, Feature Plan, Architecture, Data Sources, Risk, Security, Revenue, Roadmap, Runbook, Test Plan | ✅ **Done (this batch of docs)** |
| Phase 1 — Foundation | Monorepo, docker-compose, env templates, CI, auth | ⏳ Pending approval |
| Phase 2 — Data engine | NCS API + RSS + HTML crawlers, dedup, normalization | ⏳ Pending |
| Phase 3 — Matching & alerts | Eligibility engine, daily digest, instant alerts | ⏳ Pending |
| Phase 4 — User features | Profile, dashboard, tracker, change detection | ⏳ Pending |
| Phase 5 — Monetize | Ad slots, affiliate, premium (Razorpay) | ⏳ Pending |
| Phase 6 — Growth | SEO content engine, referral, mobile | ⏳ Pending |

> **How progress is tracked:** this table is updated after every work session. Each phase lists its own sub-checklist in [08-roadmap.md](08-roadmap.md).

## 7. What we are NOT doing (v1 out-of-scope)

- ❌ No mobile apps in v1 (responsive PWA instead)
- ❌ No job application *on behalf of* users (we link to official portals only)
- ❌ No private-sector jobs in v1 (govt-only focus)
- ❌ No paid data sources — everything free
- ❌ No popups / interstitials / auto-playing ads — ever (contract with ourselves)
- ❌ No manual data entry as the primary pipeline (automation first)

## 8. Cost summary until first revenue

| Item | Cost |
|---|---|
| Frontend hosting (Vercel) | ₹0 |
| Backend + workers (Render free) | ₹0 |
| Database (Neon free) | ₹0 |
| Redis (Upstash free) | ₹0 |
| Email (Mailtrap dev → Brevo free) | ₹0 |
| Scraping infra (our own servers, polite crawlers) | ₹0 |
| E2E (Playwright on local + GitHub Actions free minutes) | ₹0 |
| **Total running cost** | **₹0** |

When we cross the first revenue mark, we upgrade email (SES), add a paid worker tier for reliability, and reinvest into the premium features.