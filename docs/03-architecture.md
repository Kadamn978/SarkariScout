# 03 — System Architecture & Design

**Version:** 1.0 · **Status:** Approved for build

---

## 1. Design principles

1. **Isolated, swappable services** — frontend/, backend/, crawler/ are independent folders with clean HTTP/queue contracts. Swap any one without touching others.
2. **₹0 infra** — everything runs on free tiers until revenue (Vercel, Render free, Neon, Upstash, Mailtrap/Brevo).
3. **Async-first** — all heavy work (crawling, matching, emails) is queue-driven (BullMQ + Redis). API stays fast.
4. **Data first** — a normalizer guarantees one canonical `Job` record regardless of source format.
5. **Fail soft** — if a source is down, we log, alert admin, and continue; users never see errors.

## 2. High-level topology

```
┌────────────┐   HTTPS   ┌──────────────────┐        ┌─────────────────┐
│  Browser   │──────────▶│  frontend (React)│        │  Ads / Affiliate│
│  (PWA-able)│◀──────────│  Vercel:5173/443 │        │  slots in UI    │
└────────────┘           └────────┬─────────┘        └─────────────────┘
                                  │ REST (JWT)
                                  ▼
                        ┌──────────────────┐   BullMQ    ┌──────────────┐
                        │  backend (NestJS)│────────────▶│ Redis (queue)│
                        │  API :3000       │◀────────────│ Upstash free │
                        └───────┬──────────┘             └──────┬───────┘
                                │                               │ workers
                        ┌───────▼──────────┐        ┌───────────▼─────────┐
                        │ PostgreSQL (Neon)│        │ workers (Render)    │
                        │ Prisma schema    │        │  • digest:9am IST   │
                        └──────────────────┘        │  • instant alerts   │
                                                    │  • change detection │
                                                    │  • crawler jobs     │
                                                    └───────────┬─────────┘
                                                                │
                                        ┌───────────────────────▼────────────────────┐
                                        │ crawler service (Node, isolated folder)    │
                                        │  NCS API · RSS · HTML · Playwright · PDF   │
                                        └────────────────────────────────────────────┘
```

## 3. Folder layout (monorepo)

```
sarkariradar/
├── docs/                     # All documentation (this repo's source of truth)
├── frontend/
│   ├── src/
│   │   ├── app/              # routes, providers, guards
│   │   ├── features/         # auth / profile / jobs / tracker / admin / ads
│   │   ├── components/ui/    # design system (shadcn-style)
│   │   ├── components/3d/    # three.js hero, particle backgrounds
│   │   ├── lib/              # api client, hooks, utils
│   │   └── styles/           # Tailwind v4 tokens
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # JWT, refresh, OTP, verify
│   │   │   ├── users/        # profile & eligibility
│   │   │   ├── jobs/         # CRUD + search + detail
│   │   │   ├── matching/     # eligibility engine (pure TS, heavily tested)
│   │   │   ├── notifications/# digest + instant builders, templates
│   │   │   ├── trackers/     # application tracker + stages
│   │   │   ├── changes/      # change events API
│   │   │   ├── sources/      # source registry + admin
│   │   │   ├── billing/      # Razorpay webhooks, plans
│   │   │   └── ads/          # ad slots + affiliate clicks
│   │   ├── prisma/           # schema + migrations
│   │   └── common/           # guards, filters, interceptors, rate-limit
│   ├── test/                 # unit + integration (Jest)
│   └── package.json
├── crawler/
│   ├── src/
│   │   ├── connectors/       # ncs / rss / html / playwright / pdf
│   │   ├── normalizer/       # dedup + field extraction (dates, fees, quals)
│   │   ├── diff/             # change detection logic
│   │   └── scheduler/        # BullMQ producers + cron registrations
│   └── package.json
├── e2e/                      # Playwright: chromium/firefox/webkit
│   ├── tests/                # per-feature specs
│   └── playwright.config.ts
├── infra/
│   ├── docker-compose.yml    # postgres + redis (+ adminer optional)
│   ├── Dockerfile.frontend / backend / crawler
│   ├── render.yaml           # backend + worker deploy blueprint
│   ├── vercel.json
│   └── .env.example          # all vars documented
└── README.md
```

## 4. Data model (core tables, Prisma)

```
User
  id, email, passwordHash, name, role, emailVerifiedAt, premiumTier, createdAt

Profile                (1:1 User)
  userId, educationLevel (10th/12th/Diploma/UG/PG/PhD),
  degrees[] (e.g., ["B.E. Computer Science"]), state, district,
  languages[] (["Hindi","Marathi","English"]), category (GEN/OBC/SC/ST/EWS),
  dob, gender, examFamilies[] (SSC/IBPS/RRB/UPSC/MPSC...),
  keywords[], notifyInstant(bool), notifyDigest(bool), digestTime (default 09:00)

Source
  id, name, type (NCS_API/RSS/HTML/PDF), baseUrl, schedule, lastRunAt,
  lastRunStatus, itemsPerRun, enabled, configJson

Job                       (canonical record, deduped)
  id, fingerprint UNIQUE, sourceId, sourceUrl, org, advtNo,
  title, postNames[], totalVacancies?, state (ALL_IN/MAH/...), examFamily,
  qualificationText, qualificationLevels[],
  ageMin?, ageMax?, categoryFeesJson, applyStart, applyEnd, feeEnd,
  examDate?, admitCardDate?, resultDate?, status (OPEN/CLOSED),
  notificationPdfUrl, applyUrl, officialUrls[], rawHash, firstSeenAt, lastSeenAt

JobChange                    (change detection events)
  id, jobId, type (EXAM_DATE/VENUE/DEADLINE/CORRIGENDUM/RESULT/ADMIT_CARD),
  field, before, after, detectedAt, notified(bool)

UserJob                       (tracker)
  id, userId, jobId UNIQUE, applied(bool), appliedAt, notes,
  stage (APPLIED/EXAM/ADMIT_CARD/RESULT/REJECTED/SELECTED), examCity?

NotificationLog
  id, userId, jobId?, changeId?, type (DIGEST/INSTANT/WELCOME), sentAt, status

Subscription                  (premium)
  id, userId, plan (LITE/PRO), status, razorpayOrderId, startsAt, endsAt

AdSlot / AdImpression / AffiliateClick   (revenue tracking)
  id, slot (LHS/RHS/TOP/BOTTOM), adId, shownAt, clickedAt, jobId?, value?
```

**Key decisions**
- `Job.fingerprint` = SHA-256 of `org + advtNo + postNames(sorted)` → dedup across sources.
- `rawHash` per source lets change-detection diff pages without re-parsing everything.
- All dates stored as `timestamptz` in **IST-equivalent UTC**; every deadline check uses `Asia/Kolkata` TZ logic — a job is OPEN only if `applyEnd > now(IST)` **and** `feeEnd > now(IST)` **and** neither is before today 23:59:59 IST.

## 5. Matching engine (pseudo)

```
score(user, job):
  hard = []
  hard += qualificationMatch(profile.degrees, job.qualificationLevels/text)
  hard += stateMatch(profile.state, job.state)          # ALL_IN always matches
  hard += ageInRange(profile.dob, job.ageMin, job.ageMax, relaxByDate=applyEnd)
  hard += languageMatch(profile.languages, job.requiredLanguages?)  # if stated
  hard += categoryOpenOrJobHasCategory(job, profile.category)
  deadlineOpen = job.applyEnd > nowIST() && job.feeEnd > nowIST()
  return ELIGIBLE if all(hard) && deadlineOpen else NOT_ELIGIBLE
```

- Qualification matching uses a **taxonomy** (10th, 12th, ITI, Diploma, UG, PG, PhD + degree name synonyms: "B.E."/"BE"/"Bachelor of Engineering"; "CS"/"Computer Science"; plus keyword scoring vs `qualificationText`).
- Language requirement: rare, but when a job states Marathi/Hindi requirement we match profile languages.
- Only `ELIGIBLE` jobs enter the notification pipeline (daily digest + instant).

## 6. Notifications pipeline

```
Job created/updated ──▶ ChangeEvent(if diff) ──▶ enqueue
                        │
                        ├──▶ [cron 09:00 IST] digest: SELECT eligible jobs per user
                        │        (new since last digest OR deadline < 7 days, cap 15)
                        │        build HTML (mobile-first), send via Brevo API
                        └──▶ [instant] on exam/venue/deadline/corrigendum events
                                 for users with notifyInstant && tracking the job
```

- Bounce/SPAM feedback loop → auto-mute user after 3 bounces; log everything.
- Unsubscribe link is server-rendered, works without login (token signed).

## 7. Change detection strategy

- Each source URL tracked for **raw hash + normalized fields**.
- On each crawl: if hash changed → re-parse → compute diff of (applyEnd, examDate, venueText, qualificationText, status) → create `JobChange` events.
- Priority watch list: jobs with ≥1 active tracker get **re-crawled every 2h** (targeted refresh), everything else 6–12h.

## 8. Deploy targets (₹0)

| Component | Host | Notes |
|---|---|---|
| frontend | Vercel (Hobby) | static export + serverless API passthrough |
| backend API | Render free web service | cold-start ok for v1 |
| workers + crawler | Render free background worker | BullMQ consumers, cron via cron-job.org pings |
| Postgres | Neon free (0.5GB) | connection pooling via PgBouncer |
| Redis | Upstash free | queues, rate-limit counters |
| Email | Mailtrap (dev) / Brevo (prod, 300/day) | upgrade to SES post-revenue |
| CI | GitHub Actions free | lint, typecheck, unit, integration, E2E (Playwright) |
| Cron | cron-job.org free | 9 AM IST digest trigger, hourly source sweeps |

## 9. Observability (free)

- Structured logs (pino) → Render log viewer; error alerting via a private Telegram bot (free).
- Health endpoint `/health` with per-source status; uptime check via UptimeRobot free.

## 10. Swapping a layer (exit plan)

| Layer | Swap to | Because |
|---|---|---|
| frontend | Next.js / SvelteKit / plain HTML | folder contract: calls same REST API |
| backend | Fastify / Express / Go / Laravel | REST + JWT contract unchanged |
| crawler | Python (Scrapy/BeautifulSoup) | queue contract (BullMQ→Celery) is the only change |
| DB | Postgres-compatible managed (Supabase/RDS) | Prisma abstracts |
| Email | AWS SES / SendGrid | single adapter module |

## 11. Local development topology

```
docker compose up  →  postgres:5432, redis:6379
backend  →  http://localhost:3000  (NestJS, watch mode)
frontend →  http://localhost:5173  (Vite HMR, proxies /api → :3000)
crawler  →  npm run worker (BullMQ consumer)  +  npm run crawl:once (manual sweep)
e2e      →  npx playwright test  (spins its own servers or hits running ones)
```

Full commands, prerequisites, and troubleshooting: **docs/09-runbook.md**