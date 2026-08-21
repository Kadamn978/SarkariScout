# 05 — Risk Analysis

**Version:** 1.0 · **Owner:** One-man army · **Review cadence:** weekly, update severity as data proves itself

## 1. Risk matrix

| # | Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| R-01 | **Official site blocks/hardens scraping** (cloudflare, rate limits, layout change) | High | High | 🔴 | Tiered sources (2+ independent per exam family); layout-change watchdogs (selector tests alert us); aggregator fallback; re-crawl diffing keeps data fresh while we fix |
| R-02 | **NCS API changes / credential issues / API-Setu friction** | Medium | Medium | 🟠 | NCS is Tier 1 but never the only feed; RSS+HTML carry critical exams; wrap in adapter with fallback |
| R-03 | **Wrong deadline parsed → user applies after close / misses it** | Medium | Critical | 🔴 | "REVIEW" quarantine for unverifiable dates; weekly deadline audit; official-link verification before alert; conservative default (drop from alerts, don't guess) |
| R-04 | **Dedup failure → duplicate/conflicting alerts** | Medium | Medium | 🟠 | Fingerprint engine + source-priority reconciliation; E2E + integration tests; alert frequency caps per user |
| R-05 | **Email deliverability (SPAM folder, bounces)** | High | High | 🔴 | Brevo dedicated sending domain w/ SPF/DKIM/DMARC; double opt-in; warm-up plan; bounce/complaint handling; open-rate monitoring |
| R-06 | **Free-tier outages / cold starts (Render, Neon, Upstash)** | Medium | Medium | 🟠 | Health checks + UptimeRobot; retry queues; graceful degradation; upgrade path documented the moment revenue allows |
| R-07 | **Single-developer bottleneck (bus factor / burnout)** | High | High | 🟠 | Full docs (this repo), CI gates, isolated services so a future hire/LLM-agent can take over any folder; weekly progress tracker |
| R-08 | **Legal/ToS issues with scraping** | Low | High | 🟠 | Only public data; robots.txt + rate caps; no login bypass; facts/notices are not copyrighted editorial; legal review before launch |
| R-09 | **India DPDP Act / data breach** | Low | Critical | 🔴 | See security doc: encryption, minimal data, consent flow, breach plan; no PII in logs |
| R-10 | **Ad blockers + low ad revenue at small scale** | High | Medium | 🟠 | Revenue diversified day one: ads + affiliate + premium; affiliate converts even when ads don't |
| R-11 | **AdSense approval delay/rejection for new site** | High | Medium | 🟠 | Prepare 10k pageview runway via SEO content + referral; use affiliate-only + Media.net fallback in the meantime |
| R-12 | **Scheduling drift (9 AM IST digest misfires, TZ bugs)** | Low | Critical | 🔴 | All dates UTC with Asia/Kolkata TZ library; cron via cron-job.org (IST-correct); integration test asserting TZ math |
| R-13 | **Job data volume spike (e.g., mega SSC notification)** | Medium | Medium | 🟠 | Queues absorb bursts; per-user digest caps; rate limits on email |
| R-14 | **Premium payment failures / Razorpay edge cases** | Medium | Medium | 🟡 | Webhook verification (signature), idempotent order handling, manual reconciliation log |
| R-15 | **Users mark notifications as spam (trust erosion)** | Medium | High | 🟠 | Strict relevance (only eligible jobs), daily-cap, one-click unsubscribe, preferences, digest preview in email footer |

## 2. Top-3 existential risks (our focus order)

1. **R-03 Wrong deadlines** — the entire product promise is "never miss, never too late". A single false-positive notification destroys trust. → Quarantine + audit gates are **non-negotiable** (unit + E2E tested).
2. **R-01 Source fragility** — if sources break silently, the product goes quiet and users churn. → Health dashboard, per-source status, watchdog tests, multi-source redundancy.
3. **R-05 Deliverability** — an email product that lands in spam is worthless. → Sending infrastructure done right from day 1 (domain auth, warm-up, double opt-in).

## 3. Failure-response plan

| Scenario | Response (RTO) |
|---|---|
| Source layout changed | Watchdog alerts → fix selectors < 24h; data continues from mirrors |
| Email bounce rate > 5% | Auto-pause that user segment, investigate, adjust < 24h |
| Deadline parsing conflict | Quarantine job from alerts immediately; manual resolve < 12h |
| Free-tier outage | Queues hold; resume on recovery; status page + email to admin |
| Data breach | Execute incident plan in security doc (section 7) |

## 4. Weekly risk review

Every Friday: update likelihood/impact columns, review alerts from the week (source failures, parse warnings, bounce rates), and record decisions in this file's change log.

### Change log
| Date | Risk | Change | Decision |
|---|---|---|---|
| Aug 20, 2026 | — | Baseline | Initial matrix |