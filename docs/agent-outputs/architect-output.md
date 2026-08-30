# Solution Architect — designs API architecture, schemas, caching, deployment Output

## RozgarScout – Next‑Step Architecture Review  
**Current baseline** (as you described)  
- Frontend: React 18 + Vite + Tailwind (SPA)  
- Backend: NestJS + Prisma 5 + MySQL 8.4 + Redis 5.0  
- Auth: Google OAuth SSO + email/password, JWT 15 min + 7 d refresh, argon2  
- Core modules: Jobs (14 seeded, 10 sources), Document Wallet, Bug Reports, State/Qual pages  
- Schema: ~18 tables, TypeScript clean, 50/50 test pass rate  

The system works, but to become a **reliable, scalable, and competitive** portal we need to harden the data‑ingestion pipeline, improve discoverability, add real‑time user engagement, and put observability/CI/CD in place.  

Below are the **top 5 priorities** to build next, ordered by impact on user experience, operational stability, and future‑proofing.

---  

## 1️⃣ Real‑Time Job Ingestion & Normalisation Pipeline  
**Why:** Competitors win by being the first to surface a new notification. Right now jobs are seeded; we need continuous, fault‑tolerant scraping from the 10+ government sources (RSS, APIs, HTML pages).  

### Core Components
| Component | Tech / Pattern | Responsibility |
|-----------|----------------|----------------|
| **Scheduler** | `bullmq` (or `node‑cron`) + Redis-backed queues | Trigger scrapers on a configurable cadence (e.g., every 5 min for high‑frequency sources, hourly for low‑frequency). |
| **Worker Pool** | NestJS microservice (or separate Node service) running `bullmq` processors | Execute source‑specific scrapers, handle retries, exponential back‑off, dead‑letter queues. |
| **Normalisation Service** | NestJS + Prisma + Zod validation | Convert raw source data → canonical `Job` shape (title, org, location, qualifications, apply‑link, expiry, sourceId). |
| **Deduplication & Versioning** | MySQL unique index on `(sourceId, externalId)` + `job_versions` audit table | Prevent duplicate rows, keep history for change‑detect UI (“Updated 2 h ago”). |
| **Error & Alerting** | Sentry + custom dead‑letter queue + email/SMS ops alert | Notify engineers when a source fails > N times. |

### Immediate Tasks (2‑week sprint)
1. Scaffold a `jobs-ingest` NestJS microservice with `bullmq` queue (`ingest:high`, `ingest:low`).  
2. Write adapter templates for the 10 sources (RSS → parser, HTML → cheerio, API → axios).  
3. Add Prisma migration for `job_versions` and unique constraint.  
4. Deploy worker to a small EC2/Cloud‑Run instance; configure Redis connection pooling.  
5. Add basic health‑check endpoint (`/health/ingest`) and integrate with existing monitoring (see #5).  

**Estimated Effort:** 8‑10 person‑days (incl. testing).  

---  

## 2️⃣ Full‑Text Search & Faceted Filtering  
**Why:** Users need to find jobs by keyword, location, qualification, exam type, etc. Current UI likely does client‑side filtering on a limited payload → poor UX as data grows.  

### Options (choose one)
| Option | Pros | Cons |
|--------|------|------|
| **MySQL 8.4 Full‑Text + Generated Columns** | No new infra, ACID, easy to add via Prisma. | Limited relevance scoring, no faceting out‑of‑the‑box. |
| **Elasticsearch 8.x (managed or self‑hosted)** | Powerful scoring, analyzers, faceting, autocomplete, synonyms. | Extra ops overhead, need sync pipeline. |
| **Meilisearch** (open‑source, low‑ops) | Fast, typo‑tolerant, built‑in faceting, easy Docker deploy. | Smaller community than ES. |

**Recommendation:** Start with **Meilisearch** (single Docker container) – gives near‑ES quality with minimal ops. If traffic > 10 k req/min, evaluate migration to ES.

### Core Flow
1. **Indexer** – after a job is inserted/updated (via Prisma `afterSave` hook or a Redis stream), push a lightweight document to Meilisearch (`{id, title, org, location, qualifications, applyLink, expiry, source, tags}`).  
2. **Search API** – NestJS controller `/api/jobs/search` proxies query to Meilisearch, returns paginated hits + facet counts.  
3. **Frontend** – Replace client‑side filter with a debounced search bar + facet chips (location, qualification, exam type). Use React‑Query for caching.  

### Immediate Tasks
1. Add `meilisearch` service to `docker-compose.yml` (or cloud‑managed).  
2. Install `@meilisearch/meilisearch-sdk` in NestJS; create `SearchService`.  
3. Create Prisma `afterSave`/`afterUpdate` hooks (via `prisma` middleware) to push to Meilisearch.  
4. Build `/api/jobs/search` endpoint with query sanitisation, pagination, facet aggregation.  
5. Update Jobs page UI: search bar, facet panel, infinite scroll.  
6. Write unit & e2e tests (Jest + Playwright) for search flow.  

**Estimated Effort:** 6‑8 person‑days.  

---  

## 3️⃣ Real‑Time Notification System (Email, In‑App, Push)  
**Why:** Users expect instant alerts when a job matching their profile is posted. This drives engagement and differentiates from static‑list competitors.  

### Architecture
- **Event Bus:** Redis Pub/Sub channel `job:new` (publish from ingestion worker after a job is saved).  
- **Notification Service:** NestJS microservice (`notifications`) subscribes to the channel, evaluates user preferences (saved filters, followed orgs, qualifications) using a **matcher** (could be a simple in‑memory rule engine or a lightweight Redis‑based bloom filter per user).  
- **Delivery Channels:**  
  - **Email:** via SendGrid / SES template (HTML + plain).  
  - **In‑App:** store notification rows in `UserNotification` table; expose via WS (Socket.io) or polling endpoint for badge count.  
  - **Push (Web Push):** VAPID keys + service worker (frontend) – optional for Phase 2.  

### Immediate Tasks
1. Add `UserPreference` table (keywords, locations, qualification levels, org follows).  
2. Extend ingestion worker to `REDIS.PUBLISH('job:new', JSON.stringify({jobId}))` after commit.  
3. Scaffold `notifications` NestJS microservice with `ioredis` subscriber.  
4. Implement matcher: load user preferences into a cached map (Redis hash) – refresh on user‑pref change.  
5. Create `UserNotification` entity (jobId, userId, channel, status, createdAt).  
6. Build email template service (using `handlebars`).  
7. Expose `/api/notifications` (GET unread count, GET list, PATCH mark‑as‑read).  
8. Integrate Socket.io (or `@nestjs/websockets`) to push new notifications to connected clients.  
9. Add basic rate‑limit per user (e.g., max 5 emails/hr) using Redis `INCR`.  
10. Write integration tests (Jest + `@nestjs/testing`) and e2e scenario (Playwright) for a new job triggering an email & in‑app notice.  

**Estimated Effort:** 10‑12 person‑days (includes email provider setup).  

---  

## 4️⃣ Centralised Caching & Rate‑Limiting Layer  
**Why:** The current Redis usage is ad‑hoc (sessions, maybe OTP). A deliberate caching strategy will cut DB load, improve response times, and protect against scraping‑induced traffic spikes.  

### What to Cache
| Data | TTL | Invalidation Strategy |
|------|-----|-----------------------|
| **Job list (homepage, category)** | 2‑5 min | Invalidate on `job:new` Pub/Sub event (delete key). |
| **Job detail** | 10‑15 min | Same as above + on update/delete. |
| **Source metadata (RSS URL, last fetched)** | 1 hr | Updated by ingestion worker. |
| **User profile + preferences** | 30 min | Invalidate on user‑pref update. |
| **Rate‑limit counters** (IP/API key) | sliding window 1 min | Redis `INCR` with `EXPIRE`. |
| **Search results (frequent queries)** | 1 min | Optional – cache Meilisearch query hash. |

### Implementation Steps
1. Create a NestJS `CacheModule` wrapper (using `cache-manager` + `ioredis` store) – expose `@Cacheable()` decorator or service methods (`getJobList`, `setJobList`).  
2. Refactor `JobsController#getAll` and `#getOne` to try cache first, fallback to Prisma, then set.  
3. Add middleware `RateLimiter` (express‑rate‑limit‑redis‑style) that reads `X-Forwarded-For` or API key, increments a Redis key, returns 429 on threshold.  
4. Hook into the ingestion worker’s `job:new` Pub/Sub to `DEL` relevant cache keys (use pattern matching or a known key set).  
5. Add monitoring: export Redis `hit/miss` ratios via Prometheus client (`prom-client`).  
6. Write load‑test script (k6) to verify 95th‑percentile latency < 200 ms for cached endpoints.  

**Estimated Effort:** 5‑7 person‑days.  

---  

## 5️⃣ Observability, CI/CD & Quality Gates  
**Why:** To ship the above features safely and keep the system healthy as traffic grows, we need automated testing, deployment pipelines, logging, tracing, and alerting.  

### Observability Stack (lightweight, cost‑effective)
| Concern | Tool | How to integrate |
|---------|------|------------------|
| **Logging** | Winston + Loki (or CloudWatch) | NestJS logger writes JSON; Loki ingests via Promtail. |
| **Metrics** | Prometheus client (`prom-client`) + Grafana | Expose `/metrics` endpoint; scrape job ingestion latency, queue depth, error rates. |
| **Tracing** | OpenTelemetry (OTLP) → Tempo or Jaeger | NestJS middleware auto‑spans HTTP; Prisma query spans via `@opentelemetry/instrumentation`. |
| **Error Tracking** | Sentry (DSN) | Capture unhandled exceptions & rejected promises. |
| **Health Checks** | Kubernetes liveness/readiness probes (or simple HTTP) | `/health` returns 200 if DB, Redis, Meilisearch, and workers are reachable. |

### CI/CD Pipeline
1. **GitHub Actions** (or GitLab CI) workflow:  
   - `lint` (`eslint --max-warnings=0`)  
   - `type-check` (`tsc --noEmit`)  
   - `unit-test` (`jest --coverage`) – enforce ≥ 80 % coverage.  
   - `build` (`npm run build` for frontend, `nest build` for backend).  
   - `docker-build` (multi‑stage) → push to GitHub Packages / Docker Hub.  
   - `deploy` to a staging environment (e.g., Render, Fly.io, or a small EKS cluster).  
   - Run **post‑deploy smoke tests** (Playwright) against staging.  
   - On `main` merge → promote to production with manual approval.  

2. **Feature Flags** (optional): Use `launchdarkly`‑style boolean in Redis (`FEATURE_SEARCH`) to toggle new search UI without redeploy.  

### Quality Gates & Technical Debt
- **Test Coverage:** Raise from 50/50 to ≥ 80 % unit + ≥ 60 % integration.  
- **Prisma Migration Review:** Enforce `prisma migrate diff --script` in CI to catch drift.  
- **Dependency Scanning:** `npm audit` + `dependabot` alerts.  
- **Documentation:** Auto‑generate OpenAPI spec (`@nestjs/swagger`) and host on `/api-docs`.  

### Immediate Tasks (2‑week sprint)
1. Add Winston logger with JSON format; configure Loki push via Docker sidecar (or cloud log).  
2. Install `prom-client`; expose `/metrics`; add basic counters (http_requests_total, job_ingest_total, notification_sent_total).  
3. Instrument NestJS with `@opentelemetry/instrumentation-nestjs-core` and Prisma; configure OTLP exporter to Tempo (or Jaeger).  
4. Set up Sentry SDK (`@sentry/node`) with DSN from env.  
5. Create GitHub Actions workflow file (`.ci.yml`) with the steps above.  
6. Add a `docker-compose.override.yml` for staging that includes Loki, Prometheus, Grafana, Tempo.  
7. Write a simple Playwright smoke test that logs in, searches a job, and verifies notification bell updates.  
8. Document the deployment process in `DEPLOYMENT.md`.  

**Estimated Effort:** 8‑10 person‑days (mostly infra & pipeline work).  

---  

## Summary of Priorities  

| # | Priority | Primary Benefit | Rough Timeline |
|---|----------|----------------|----------------|
| 1 | Real‑Time Job Ingestion Pipeline | Freshest listings, competitive edge | 2 wks |
| 2 | Full‑Text Search & Faceted Filtering | Faster, relevant job discovery | 1.5 wks |
| 3 | Notification System (Email/In‑App/Push) | Higher user retention & engagement | 2 wks |
| 4 | Centralised Caching & Rate‑Limiting | Lower DB latency, protection from abuse | 1 wk |
| 5 | Observability, CI/CD & Quality Gates | Safe releases, production health, maintainability | 2 wks |

**Total estimated effort:** ~9 weeks (≈ 2 months) with a small, focused team (2‑3 backend engineers, 1‑2 frontend engineers, 1 DevOps/QA).  

Implementing these in the order listed will give RozgarScout a **solid, scalable foundation** while delivering visible UX improvements that directly address the gaps with current market leaders.  

---  

### Next Immediate Action  
Kick off a **planning meeting** (2 h) to:  
1. Confirm the exact list of 10 source URLs/APIs.  
2. Choose the search solution (Meilisearch vs ES vs MySQL FT).  
3. Provision a small staging cluster (e.g., 2 vCPU + 4 GB RAM VM + managed Redis).  
4. Assign owners for each of the five work‑streams above.  

Once the kickoff is done, the team can begin with **Priority 1** (ingestion pipeline) because it unlocks the data needed for search, notifications, and caching.  

---  

*Prepared by the Solution Architect – RozgarScout*  
*Date: 3 Nov 2025*