# 01 — Business Requirements Document (BRD)

**Version:** 1.0 · **Date:** Aug 20, 2026 · **Author:** One-man-army (Product + Tech) · **Status:** Approved pending client sign-off

---

## 1. Executive Summary

SarkariRadar is a web application that aggregates **all Indian government job and exam notifications** (all-India + Maharashtra focus), filters them against a user's **eligibility profile**, and delivers **email notifications** only for jobs the user can genuinely apply to — before application deadlines and fee-payment windows close. Users additionally get an **application tracker** with automatic alerts on exam-date changes, admit cards, results, venue changes, and corrigenda.

The product is **free for users** and monetized through non-intrusive display ads (fixed side/top/bottom banners only — no popups, no interstitials), affiliate links, and a premium tier. Total infrastructure cost until first revenue: **₹0** (free tiers only).

## 2. Problem Statement

Government job aspirants miss opportunities because notifications are fragmented across dozens of official portals, deadlines are short, eligibility is buried in PDFs, and aggregator sites are noisy and ad-saturated. There is no free service that does **profile-based filtering + deadline-aware alerts + post-application tracking** in one place.

## 3. Goals (business + product)

| #  | Goal                                | Measured by                                        |
| -- | ----------------------------------- | -------------------------------------------------- |
| G1 | User never misses an applicable job | % of expired jobs notified vs. applied             |
| G2 | Relevance over volume               | Notification-to-apply conversion > 10%             |
| G3 | Zero data cost until revenue        | ₹0 infra spend pre-revenue                        |
| G4 | Clean UX, no intrusive ads          | 0 popups/interstitials by contract                 |
| G5 | Revenue within 12 months            | ₹10L first-year target                            |
| G6 | Swappable stack                     | Each service in isolated folder with own interface |

## 4. Personas

### 4.1 Rohit — The Aspirant (primary)

- B.E. (CSE), 24, Pune, Maharashtra; languages Hindi/Marathi/English; Open category
- Goal: SSC CGL, IBPS PO, RRB NTPC, MPSC Group B/C, state engineering posts
- Behavior: checks 6–8 websites daily; has missed deadlines before
- Need: "Tell me ONLY what I can apply to, BEFORE it closes."

### 4.2 Sunita — The Parent (secondary)

- Fills profile for her daughter (B.Sc., 22, Nashik, OBC)
- Need: simple interface, single email digest, no tech jargon

### 4.3 Aarav — The Repeat Applicant (power user)

- Already in service, appears for promotion/departmental exams
- Need: deep tracker, instant alerts on exam schedule changes, venue change notifications

## 5. Scope

### 5.1 In scope (v1)

- User registration/login (email + OTP/password, Google OAuth later)
- Eligibility profile: education level + degrees, state/district, languages, category, age, preferred exam families, preferred posts/keywords
- Job ingestion from 20+ free sources (see docs/04-data-sources.md)
- Normalization + deduplication (same job from multiple sources = 1 record)
- Eligibility matching engine (qualification/state/language/age/category)
- Deadline window check: **apply-by date AND fee-payment window must both be open past today 23:59:59 IST**
- Daily digest email 9:00 AM IST + instant alerts (optional per user)
- Job detail pages (eligibility, dates, fees, links to official notification/apply)
- Application tracker: applied → exam date → admit card → result
- Change detection: monitor job pages for venue/date/rule changes; alert subscribed users
- Admin panel: source health, ingest logs, manual override
- Ad slots (LHS/RHS/top/bottom banners) + affiliate link management
- Premium subscriptions (Razorpay) — Phase B

### 5.2 Out of scope (v1)

- Applying on behalf of users · private-sector jobs · mobile apps · paid data feeds · chat/telegram bots (later) · user-uploaded documents storage

## 6. Functional Requirements

| ID    | Requirement                                                                                                                                          | Priority |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-01 | User can register with email + password (verified email)                                                                                             | P0       |
| FR-02 | User can build/edit eligibility profile (education, degrees, state, languages, category, age, exam families, keywords)                               | P0       |
| FR-03 | System ingests jobs from configured sources on schedule                                                                                              | P0       |
| FR-04 | System deduplicates jobs across sources (source+advtNo+postName hash)                                                                                | P0       |
| FR-05 | System extracts structured fields: title, org, posts, vacancies, qualification, age, fees, apply-start, apply-end, fee-end, exam-date, state, links  | P0       |
| FR-06 | System computes eligibility score per (user, job); only score ≥ threshold with ALL hard rules satisfied → notify                                   | P0       |
| FR-07 | Hard rules: qualification match · state match (or all-India) · apply window open (end > today 23:59:59 IST) · fee window open · age within range | P0       |
| FR-08 | Daily digest email at 9 AM IST containing only new/updated applicable jobs                                                                           | P0       |
| FR-09 | Instant alert email when a watched job changes (exam date, venue, corrigendum, deadline extension)                                                   | P1       |
| FR-10 | User can "Track" a job; tracker shows stages: Apply → Exam → Admit Card → Result, each with date + link + status                                  | P1       |
| FR-11 | Change detection worker diffs job pages on schedule, creates change events                                                                           | P1       |
| FR-12 | Search/filter jobs by org, exam family, state, date range                                                                                            | P1       |
| FR-13 | User dashboard: stats (tracked, applied, upcoming exams, alerts this week)                                                                           | P1       |
| FR-14 | Admin: source status (last run, items, errors), manual job edit/delete, feature flags                                                                | P2       |
| FR-15 | Ad placement: fixed LHS/RHS/top/bottom slots only; ads never overlap content                                                                         | P1       |
| FR-16 | Affiliate links on job pages (prep courses, books) with click tracking                                                                               | P1       |
| FR-17 | Premium subscription via Razorpay (instant alerts, unlimited trackers, no ads)                                                                       | P2       |
| FR-18 | Unsubscribe / email preference management (one-click)                                                                                                | P0       |
| FR-19 | Rate-limit + abuse protection on all public endpoints                                                                                                | P0       |
| FR-20 | SEO-friendly public pages (job listing pages for indexed crawlers)                                                                                   | P2       |

## 7. Non-Functional Requirements

| NFR             | Requirement                                                                       |
| --------------- | --------------------------------------------------------------------------------- |
| Performance     | Dashboard < 2s p95; API p95 < 300ms; crawls complete within budget                |
| Availability    | 99.5% uptime; graceful degradation when a source is down                          |
| Security        | OWASP Top-10 aligned; DPDP Act (India) compliant; bcrypt+argon2; JWT; rate limits |
| Scalability     | Stateless API → horizontal scaling; queues for all async work                    |
| Maintainability | Monorepo with isolated services; 80%+ test coverage on core logic; CI gates       |
| Data quality    | Dedup precision ≥ 99%; deadline accuracy audited weekly                          |
| Cost            | ₹0 recurring until first revenue (free tiers)                                    |
| UX              | WCAG AA, mobile-first, no intrusive ads, dark/light mode                          |

## 8. Assumptions & Constraints

- **Assumptions:** NCS open APIs remain free (they're govt-funded); official sites allow polite low-frequency crawling (we comply with robots.txt, cap 1 req/5s); Brevo free tier (300/day) suffices < 10k users; aggregator data is legally usable (facts/notices, not copyrighted editorial).
- **Constraints:** No budget; single developer; Windows dev machine (Laragon) with Docker; must run on any local system (runbook requirement).

## 9. Success Criteria (acceptance gates)

1. 20+ sources ingested, 99% dedup, zero manual entry needed for top exam families
2. A profile like Rohit's receives ONLY applicable jobs (validated against a 2-week manual audit)
3. Deadline filter proven: no job with closed window is ever notified (unit + E2E tests)
4. Daily digest + instant alerts deliverable > 98%, open rate > 45%
5. All real-browser E2E suites pass (Chromium/Firefox/WebKit) in CI
6. ₹0 infra cost maintained through first revenue
7. No popup/interstitial ads — audited by E2E (no overlay detection)

## 10. Stakeholders & Sign-off

| Role                      | Party                         |
| ------------------------- | ----------------------------- |
| Product Owner / Client    | You (client)                  |
| Dev / QA / Ops / Security | One-man army (me)             |
| Beta testers              | 5 aspirants (to be recruited) |

**Sign-off:** docs frozen at v1.0; subsequent changes via change-request log at the bottom of this file.

---

### Change log

| Ver | Date         | Change      | By           |
| --- | ------------ | ----------- | ------------ |
| 1.0 | Aug 20, 2026 | Initial BRD | One-man army |
