# Sprint Plan — Next 5 Sprints

**Date:** Aug 24, 2026
**Current State:** Auth, Jobs (14 seeded), Document Wallet, Bug Reports, Google OAuth, crewAI agents
**BRD Gap:** No crawlers, no eligibility matching, no daily digest, no application tracker

---

## Sprint 1 — Fix BRD Alignment (1 week)
**Goal:** Ensure current implementation matches BRD v1 requirements

| # | Task | Priority | Status |
|---|---|---|---|
| 1.1 | Add missing BRD fields to schema (feePaymentEnd, officialNotificationUrl, applyUrlPost, sourceUrl) | P0 | TODO |
| 1.2 | Add email preferences table (digest on/off, instant on/off, unsubscribe token) | P0 | TODO |
| 1.3 | Add NotificationLog table (track sent emails) | P0 | TODO |
| 1.4 | Add Missing Person report schema (user uploads, system checks) | P1 | TODO |
| 1.5 | Verify all 18 tables match BRD entities | P0 | TODO |
| 1.6 | Run Prisma migration for new tables | P0 | TODO |
| 1.7 | Update seed data with more realistic jobs (50+ jobs) | P1 | TODO |

**Exit gate:** All BRD v1 entities present in schema, 50+ seeded jobs

---

## Sprint 2 — Job Crawlers (2 weeks)
**Goal:** Automated ingestion from 20+ government sources

| # | Task | Priority | Status |
|---|---|---|---|
| 2.1 | Source registry: each source has name, baseUrl, type (HTML/RSS/API), schedule, status, selectors | P0 | TODO |
| 2.2 | RSS connector: UPSC, SSC, RRB, Employment News | P0 | TODO |
| 2.3 | HTML scraper: IBPS, SBI, MPSC, DRDO, ISRO | P0 | TODO |
| 2.4 | NCS API connector (free API via NAPIX/API-Setu) | P0 | TODO |
| 2.5 | Normalizer: extract structured fields from raw HTML/RSS | P0 | TODO |
| 2.6 | Dedup engine: fingerprint = hash(source + advtNo + postName) | P0 | TODO |
| 2.7 | Scheduler: cron job every 6h, error handling, retry logic | P0 | TODO |
| 2.8 | Source health dashboard (admin only) | P1 | TODO |
| 2.9 | Test with 5 sources, verify 50+ jobs ingested | P0 | TODO |

**Exit gate:** 5+ sources live, 50+ jobs ingested, dedup working, admin sees health

---

## Sprint 3 — Eligibility Matching Engine (1 week)
**Goal:** Filter jobs by user profile, only show applicable jobs

| # | Task | Priority | Status |
|---|---|---|---|
| 3.1 | Hard rules engine: qualification match, state match, age match, category match | P0 | TODO |
| 3.2 | Deadline guard: applyEnd > today 23:59:59 IST | P0 | TODO |
| 3.3 | Fee window check: feePaymentEnd > today (if fee required) | P0 | TODO |
| 3.4 | Scoring engine: compute eligibility score per (user, job) | P0 | TODO |
| 3.5 | Dashboard: show only applicable jobs, sorted by score | P0 | TODO |
| 3.6 | Profile builder: complete eligibility profile form | P0 | TODO |
| 3.7 | Unit tests for matching rules (10+ tests) | P0 | TODO |

**Exit gate:** User with profile sees ONLY applicable jobs, deadline guard working

---

## Sprint 4 — Daily Digest + Email (1 week)
**Goal:** Send daily email digest with only applicable jobs

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | Digest builder: fetch user's applicable jobs, format email | P0 | TODO |
| 4.2 | Email sender: nodemailer + Brevo (prod) / Mailtrap (dev) | P0 | TODO |
| 4.3 | Cron job: 9:05 AM IST daily | P0 | TODO |
| 4.4 | Unsubscribe link: one-click unsubscribe (RFC 8058) | P0 | TODO |
| 4.5 | Instant alerts: toggleable per user | P1 | TODO |
| 4.6 | Email preferences page | P0 | TODO |
| 4.7 | Welcome email on registration | P1 | TODO |
| 4.8 | Test: verify email arrives in Mailtrap | P0 | TODO |

**Exit gate:** User receives daily digest at 9 AM IST, unsubscribe works

---

## Sprint 5 — Application Tracker + Change Detection (2 weeks)
**Goal:** Track job applications and detect changes

| # | Task | Priority | Status |
|---|---|---|---|
| 5.1 | Tracker CRUD: add/remove/update tracked jobs | P0 | TODO |
| 5.2 | Tracker stages: applied → exam → admit card → result | P0 | TODO |
| 5.3 | Change detection: diff job pages, detect venue/date/deadline changes | P0 | TODO |
| 5.4 | Change alerts: email on detected changes | P0 | TODO |
| 5.5 | Dashboard: stats, upcoming exams, weekly summary | P0 | TODO |
| 5.6 | Search + advanced filters (org, family, state, dates) | P1 | TODO |
| 5.7 | Unit tests for tracker + change detection | P0 | TODO |

**Exit gate:** User can track jobs, receives alerts on changes, dashboard shows stats

---

## Sprint Velocity

| Sprint | Duration | Focus | Agents Used |
|---|---|---|---|
| 1 | 1 week | Schema alignment | architect, dev |
| 2 | 2 weeks | Data engine | data, architect, dev |
| 3 | 1 week | Matching | architect, dev, qa |
| 4 | 1 week | Email | dev, devops |
| 5 | 2 weeks | Tracker | architect, dev, qa |

**Total: 7 weeks of work**

---

## Agent Commands

```bash
# Sprint 1: Schema alignment
python crewai/light_agent.py architect "Review schema.prisma against BRD. List missing tables/fields."
python crewai/light_agent.py dev "Add missing BRD fields to Prisma schema."

# Sprint 2: Crawlers
python crewai/light_agent.py data "Design crawler architecture for SSC, UPSC, IBPS, RRB sources."
python crewai/light_agent.py architect "Design source registry schema and API."

# Sprint 3: Matching
python crewai/light_agent.py architect "Design eligibility matching engine with hard rules + scoring."
python crewai/light_agent.py qa "Write tests for matching rules."

# Sprint 4: Email
python crewai/light_agent.py dev "Implement daily digest email with nodemailer."
python crewai/light_agent.py devops "Configure Brevo for production email."

# Sprint 5: Tracker
python crewai/light_agent.py architect "Design application tracker with change detection."
python crewai/light_agent.py qa "Write tests for tracker and change detection."
```
