# 04 — Data Sources (researched, all free)

**Version:** 1.0 · **Researched:** Aug 20, 2026 · **Rule:** Nothing costs money until we hit the first revenue mark.

---

## 1. Reality check (why this doc exists)

There is **no single free official API** covering every Indian government exam. The correct architecture is a **mix**:
1. **Official open APIs** where they exist (NCS, SSC)
2. **Official RSS feeds** where they exist (UPSC)
3. **Polite HTML/PDF scraping** of official portals (IBPS, MPSC, RRB, Employment News)
4. **Aggregator feeds** (freejobalert, sarkariresult, rojgarlive) as a *backup layer* for things official sources miss
5. **Community/open-source reference code** (jobful-api, jobmitra) to bootstrap parsers

Everything below was verified to exist and be free as of research date.

## 2. Tier 1 — Official open APIs (free, registration)

| Source | Endpoint / Docs | Covers | Notes |
|---|---|---|---|
| **NCS — National Career Service** | ncs.gov.in · new portal betacloud.ncs.gov.in · open APIs published via **NAPIX** (napix.gov.in) / **API-Setu** | ~10L live vacancies incl. govt jobs across India, domestic + international | Govt-backed "open APIs, open standards" (Lok Sabha answer 2026). Requires free API credentials via NAPIX/API-Setu registration. Primary structured feed. |
| **SSC — Staff Selection Commission** | ssc.gov.in · JSON API used by their own site (`ssc.gov.in/api/...` attachments, exam calendar PDFs) | SSC CGL/CHSL/MTS/JE etc. | Their frontend already consumes a JSON API — we mirror those calls; plus regional sites ssc-cr/nr/wr/er/sr.gov.in "What's New" pages. |
| **SIDH / JobX (NSDC)** | demo.nsdcjobx.com open API (ApplyJobs, JobSearch endpoints documented publicly) | Skill-sector vacancies | Open API, no key for read endpoints; useful extra feed. |

## 3. Tier 2 — Official RSS feeds (zero registration)

| Source | Feed / Page | Covers |
|---|---|---|
| **UPSC** | upsc.gov.in/rss.php + /whats-new + /recruitment/recruitment-advertisement | Civil Services, IES/ISS, CAPF, engineering services — adverts as PDFs |
| **SSC regional** | ssccr.gov.in/announcements (s-cr/nr/wr/er/sr variants) | All SSC notices incl. exam cancellations, results |
| **RRB / Railway** | rrbcdg.gov.in, rrb sites (each RRB region publishes notices) | Railway exams (NTPC, Group D, Paramedical…) |
| **Ministry/PSU feeds** | Various govt orgs publish RSS (NIC standard) | Ad-hoc |

## 4. Tier 3 — Official portals (polite HTML/PDF scraping)

| Source | URL | Covers |
|---|---|---|
| **IBPS** | ibps.in (WordPress — stable selectors, "Recent updates") | CRP PO/MT, RRB, SO, Clerk |
| **SBI** | sbi.co.in careers + sbi.co.in/careers (current openings) | SBI PO/Clerk/SO |
| **RBI** | rbi.org.in → opportunity | RBI Grade B etc. |
| **MPSC (Maharashtra)** | mpsc.gov.in + mpsconline.gov.in (online apps) | MPSC Group A/B/C, Talathi, SI, etc. (⚠ Mahapariksha portal was scrapped in 2020 — do NOT target it) |
| **MPSC exam date page** | mpsconline.gov.in scheduled-exams | Prelim/Main exam dates — critical for tracker |
| **Employment News** | employmentnews.gov.in (English weekly) + rojgarsamachar.gov.in (Hindi) | Weekly official gazette — best for "missed it" backfill; PDF parse |
| **State dept portals (Maharashtra)** | mahait.org, mahabharti portals per dept (Police, ZP, Education) | State-level bhartis |

## 5. Tier 4 — Aggregators (backup/verification layer)

| Source | URL | Why |
|---|---|---|
| **Sarkari Result** | sarkariresult.com | The market reference; we use it as *verification* + alert list, never as sole source |
| **FreeJobAlert** | freejobalert.com (open-source API mirrors exist: github `jobful-api`, `deep5050/jobful-api`) | Structured JSON endpoints we can self-host as a bootstrap feed |
| **Rojgarlive** | rojgarlive.com | Secondary aggregator feed |
| **MahaBharti / MahaSarkar** | mahabharti.in, mahasarkar.co.in | Maharashtra-specific aggregation — cross-check for MPSC/dept notices |
| **Apify actor (optional tool)** | apify.com/getascraper/sarkariresult-jobs-monitor | Pay-per-result actor, MCP-server accessible; **backup only**, direct scraping preferred |

## 6. Open-source references to copy patterns from (not to fork blindly)

- **jobmitra** (github buhtig47/jobmitra) — FastAPI scraper over **86+ sources** with RSS + HTML parsers, dedup + mojibake filters, live on Google Cloud Run. Goldmine of selector patterns.
- **jobful-api** (github deep5050/jobful-api) — REST wrapper around freejobalert with state codes (MH = Maharashtra) — fastest bootstrap for state-wise lists.

## 7. Update cadence plan

| Category | Frequency | Notes |
|---|---|---|
| NCS API pull | every 6h | official, high volume |
| RSS feeds (UPSC, SSC regions, RRB) | every 2h | cheap, fast |
| HTML portals (IBPS, SBI, MPSC) | every 4–6h | politeness caps |
| Tracked-job detail re-crawl (change detection) | every 2h | only jobs with active trackers |
| Employment News PDF (weekly edition) | weekly (Fri) | backfill + archive |
| Aggregators | every 6h | verification layer |

**Politeness contract:** max 1 request/5s per domain, honor robots.txt, identifiable User-Agent, exponential backoff on 429/503, no auth bypass, no captcha cracking. If a source rate-limits us, we back off and rely on Tier 4.

## 8. Data quality gates

1. **Dedup**: fingerprint (org + advtNo + postNames) → single canonical Job; aggregator claims must reconcile with official source URL.
2. **Deadline audit**: weekly automated check that all OPEN jobs have applyEnd/feeEnd parsed from an official notification link; jobs with conflicting dates go to "REVIEW" and are excluded from alerts until resolved (never notify a possibly-closed job).
3. **Verification**: before alerting a user about a NEW job, require 2 independent sources OR 1 official source.
4. **Change detection**: only alert on changes detected on the official page (or aggregator delta confirmed by re-crawl).

## 9. What we will NOT do (legal/ethical)

- ❌ No scraping behind logins or captchas
- ❌ No rebranding aggregator content as our own editorial
- ❌ No selling user data; DPDP-compliant retention
- ❌ No paid API products in v1 (all free, as client required)

## 10. Tools / extensions / MCP servers that make this easier (to be added during build)

| Tool | Use | Cost |
|---|---|---|
| Apify MCP server | quick one-off harvests / verification runs | free tier |
| Playwright (local + CI) | JS-heavy page rendering (IBPS/MPSC) | free |
| Browser DevTools-based source sniffers | reverse-engineering SSC JSON API shape | free |
| cron-job.org | free cron triggers for sweeps | free |
| UptimeRobot | source health monitors | free |
| Telegram bot | internal alerting + future user channel | free |