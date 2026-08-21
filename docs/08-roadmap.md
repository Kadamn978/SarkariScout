# 08 — Roadmap & Progress Tracker

**Version:** 1.0 · **Started:** Aug 20, 2026 · **Model:** one-man army, full ownership of every phase

---

## Phase 0 — Planning ✅ COMPLETE (Aug 20, 2026)

| Deliverable | Status |
|---|---|
| Market & data-source research (NCS, UPSC, SSC, IBPS, MPSC, Employment News, aggregators) | ✅ |
| BRD (docs/01) | ✅ |
| Feature plan w/ priority+severity (docs/02) | ✅ |
| Architecture & ERD (docs/03) | ✅ |
| Data sources doc (docs/04) | ✅ |
| Risk analysis (docs/05) | ✅ |
| Security analysis (docs/06) | ✅ |
| Revenue plan (docs/07) | ✅ |
| Runbook (docs/09) | ✅ |
| Test plan (docs/10) | ✅ |
| **Client sign-off on scope** | ⏳ **NEXT** |

## Phase 0.5 — Implementation Improvements (Aug 21, 2026) ✅ COMPLETE

| Deliverable | Status |
|---|---|
| Reference project analysis (TrailSync, Hawkeye, AI Venture Engine) | ✅ |
| 47 implementable improvements documented (docs/11) | ✅ |
| Security checklist created (SECURITY-CHECKLIST.md) | ✅ |
| Agent system role charters (agents/) | ✅ |
| PROGRESS.md tracker created | ✅ |

## Phase 1 — Foundation + Security Hardening (weeks 1–2)

| Task | Status |
|---|---|
| Monorepo scaffold: frontend/ backend/ crawler/ e2e/ infra/ | ⬜ |
| docker-compose (postgres+redis), .env.example, README wiring | ⬜ |
| CI pipeline (lint, typecheck, unit, integration, E2E) | ⬜ |
| Auth module (register, verify, login, refresh, forgot, rate limits) | ⬜ |
| Profile + eligibility schema & builder UI | ⬜ |
| Landing page w/ 3D hero (three.js) + dark/light theme | ⬜ |
| **Security hardening** (IDOR, rate limiting, headers, encryption) | ⬜ |
| **Agent system** (orchestrator, role charters, PROGRESS.md) | ⬜ |
| **QA infrastructure** (95% coverage, JUnit reports, browser matrix) | ⬜ |
| **Exit gate:** register → build profile → polished landing ✅ | ⬜ |
| **Exit gate:** security checklist 100% pass | ⬜ |

## Phase 2 — Data Engine (weeks 3–5)

| Task | Status |
|---|---|
| Source registry + scheduler + health dashboard | ⬜ |
| NCS API connector (NAPIX/API-Setu creds) | ⬜ |
| RSS connectors (UPSC, SSC regions, RRB) | ⬜ |
| HTML scrapers (IBPS, SBI, MPSC, Employment News) | ⬜ |
| Normalizer: field extraction (dates, fees, quals, age, vacancies) + multilingual dates | ⬜ |
| Dedup engine + fingerprint + verification (2-source rule) | ⬜ |
| 2-week historical backfill + weekly deadline audit job | ⬜ |
| **Exit gate:** 20+ sources live, dedup ≥99%, admin sees health | ⬜ |

## Phase 2.5 — Daily Digest Enhancement (weeks 5–6)

| Task | Status |
|---|---|
| Three-section digest format (closing today/week/3 days) | ⬜ |
| Enhanced job card content (fees, docs needed, syllabus) | ⬜ |
| Profile-based filtering improvements | ⬜ |
| Stage tracking prompts | ⬜ |
| Change alert format | ⬜ |
| **Exit gate:** digest matches improvement.md requirements | ⬜ |

## Phase 3 — Matching & Alerts (weeks 6–7)

| Task | Status |
|---|---|
| Eligibility engine (hard rules + scoring) + taxonomy | ⬜ |
| Deadline guard (applyEnd & feeEnd > today 23:59:59 IST) | ⬜ |
| Daily digest 9 AM IST (build, send, bounce handling, unsubscribe) | ⬜ |
| Instant alerts (toggle) | ⬜ |
| Job listing/detail pages + official links | ⬜ |
| **Exit gate:** Rohit-profile receives ONLY applicable jobs; emails verified E2E | ⬜ |

## Phase 4 — Tracker & Change Detection (weeks 8–9)

| Task | Status |
|---|---|
| Application tracker (applied → exam → admit card → result) | ⬜ |
| Change detection worker (venue/date/corrigendum/deadline diffing) | ⬜ |
| Dashboard (stats, upcoming exams, weekly alert summary) | ⬜ |
| Search + advanced filters | ⬜ |
| **Exit gate:** tracker + change alerts proven on real monitored pages | ⬜ |

## Phase 5 — Monetize (weeks 10–12)

| Task | Status |
|---|---|
| Ad engine (LHS/RHS/TOP/BOTTOM slots, rotation, no-overlay contract) | ⬜ |
| Affiliate manager + click tracking | ⬜ |
| Premium: Razorpay checkout, webhooks, plans, entitlement gates | ⬜ |
| Admin panel (source health, ingest logs, job override, feature flags) | ⬜ |
| **Ad-blocker detection + support prompt** | ⬜ |
| **Visitor counter (social proof)** | ⬜ |
| **Copyright verification** | ⬜ |
| **Exit gate:** ads live (clean), affiliate tracking live, premium checkout OK | ⬜ |

## Phase 5.5 — DevOps + Deployment (weeks 12–13)

| Task | Status |
|---|---|
| Docker deployment script (one-line install) | ⬜ |
| Environment isolation (dev/staging/prod) | ⬜ |
| Branch strategy (main/develop/feature/bugfix/hotfix) | ⬜ |
| Production guardrails | ⬜ |
| **Exit gate:** deployment script works, environments isolated | ⬜ |

## Phase 6 — Growth (quarter 2+)

| Task | Status |
|---|---|
| SEO public pages + sitemap + schema.org | ⬜ |
| PWA + referral program | ⬜ |
| Telegram/WhatsApp channel (users requested often) | ⬜ |
| Mobile app (React Native wrapper) | ⬜ |
| **Offline page caching (PWA)** | ⬜ |
| **Bounce/SPAM email feedback loop** | ⬜ |
| **Encrypted communication (TLS 1.2+)** | ⬜ |
| **Exit gate:** organic traffic growing, referral loop live | ⬜ |

## Phase 6.5 — UX Polish (quarter 2+)

| Task | Status |
|---|---|
| Clean ad placement rules | ⬜ |
| Skeleton loaders (TrailSync pattern) | ⬜ |
| Glass morphism design system | ⬜ |
| Account deletion flow (DPDP compliant) | ⬜ |
| One-click unsubscribe (RFC 8058) | ⬜ |
| **Exit gate:** clean UX, no intrusive ads, fast load times | ⬜ |

## Post-₹10L (scale)

- Reliability upgrades (paid workers, SES, SLA), content team, paid acquisition experiments.

---

## Weekly cadence (how we run)

| Day | Activity |
|---|---|
| Mon | Plan week, sync progress tracker, review risk log |
| Tue–Thu | Build + test (feature-branch → CI → E2E → merge) |
| Fri | Source health review, deadline audit, security checks, update docs |
| Sat | Marketing ops (social posts from data, SEO tweaks), revenue dashboard |
| Sun | Off / backlog grooming |

## How progress is reported to you

- This file's ✅/⬜ is updated after **every working session**
- Weekly summary message: work done, % progress per phase, blockers, risks changed, next week's plan