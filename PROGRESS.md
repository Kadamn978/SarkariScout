# SarkariScout — Progress Tracker

Single source of truth. Read this file first at the start of every session.

**Repo:** project root directory
**Branch:** `main` (prod) → `pre-dev` (staging) → `test` (dev)

## Phase Map

| #  | Phase                      | Status |
| -- | -------------------------- | ------ |
| 0  | Documentation              | Done   |
| 1  | Backend Foundation         | Done   |
| 2  | Frontend Foundation        | Done   |
| 3  | Security Hardening         | Done   |
| 4  | Crawler / Data Engine      | Done   |
| 5  | Matching Engine            | Done   |
| 6  | Email Notifications        | Done   |
| 7  | Tracker & Change Detection | Done   |
| 8  | Monetization               | Done   |
| 9  | Testing & QA               | Done   |
| 10 | Deployment                 | Done   |

## API Routes (50+ total)

**Auth (6):** register, login, refresh, logout, forgot-password, google-oauth
**Users (3):** getProfile, updateProfile, deleteAccount
**Jobs (8):** list, detail, upcoming, recent, track, untrack, trackedJobs, trackerStats
**Crawler (4):** crawlSource, crawlAll, stats, crawlHistory (ADMIN)
**Matching (4):** myJobs, search, score, stats
**Email (5):** sendDigest, getPreferences, updatePreferences, notifications, unsubscribe
**Changes (3):** jobChanges, recentChanges, unnotifiedChanges
**Documents (4):** upload, list, setDefault, delete
**Feedback (3):** createBug, listBugs, updateBugStatus (ADMIN)
**Admin Logs (7):** audit, auditByUser, errors, errorStats, logFiles, logFile, cleanup (ADMIN)
**Health (1):** healthCheck

## Security

- Argon2 hashing (memoryCost: 65536)
- JWT 15min access + 7d refresh in Redis
- Account lockout: 5 fails = 15min lock
- Rate limiting per route
- Helmet CSP, HSTS, referrer policy
- Role-based access (USER/ADMIN)
- Input validation (whitelist, max length)
- Error messages hidden in production

## Logging & Observability

- Daily rotating log files (logs/YYYY-MM/YYYY-MM-DD.log)
- Separate audit logs (user actions tracked)
- Separate error logs (24hr window with user context)
- HTTP request/response interceptor (method, URL, status, ms, userId)
- Global exception filter (stack, cause, IP, user agent)
- Admin API for log viewing and cleanup
- Database audit_logs and error_logs tables

## Deployment

- Docker multi-stage build (node:20-alpine)
- docker-compose.prod.yml (API + MySQL + Redis + Nginx)
- Nginx reverse proxy with rate limiting, gzip, security headers
- deploy.bat / start-prod.bat scripts
- .dockerignore for clean builds
- Production .env.example with all vars documented

## Database Schema (19 tables, 8 enums)

**Core:** users, profiles, jobs, sources
**Tracking:** user_jobs, job_changes, notification_logs, email_preferences
**Content:** user_documents, bug_reports, subscriptions, mock_tests, mock_questions, mock_test_attempts, previous_papers
**Logs:** audit_logs, error_logs, crawl_logs
**Enums:** Role, Category, JobStatus, TrackerStage, NotificationType, ChangeType, SourceType, JobCategory

## Sprints (5/5 Complete)

| Sprint   | Focus                                                                                     | Status |
| -------- | ----------------------------------------------------------------------------------------- | ------ |
| Sprint 1 | Schema alignment — BRD fields, EmailPreference, CrawlLog, 51 seeded jobs                 | Done   |
| Sprint 2 | Crawler upgrade — source-specific parsers, crawl logging, retry, stats API               | Done   |
| Sprint 3 | Eligibility matching — 6-factor scoring (edu/state/category/age/gender/qual)             | Done   |
| Sprint 4 | Email service — digest, instant alerts, unsubscribe, preferences, notification log       | Done   |
| Sprint 5 | Application tracker — track/untrack, stage management, tracker stats, upcoming deadlines | Done   |
| Sprint 6 | Mock Test Engine — 10 endpoints, CRUD, start/submit scoring, leaderboard, 5 tests       | Done   |
| Sprint 7 | Previous Year Papers — 7 endpoints, download tracking, 20 papers                        | Done   |
| Sprint 8 | SEO — Open Graph, JSON-LD, sitemap.xml, robots.txt, canonical URLs                      | Done   |
| Sprint 9 | Document Wallet — photo, signature, certificates upload                                  | Done   |
| Sprint 10| Performance + QA — TypeScript clean, tests passing                                       | Done   |
| Sprint 11| Email Preferences — digest/instant/weekly toggles, notification history                  | Done   |
| Sprint 12| Admin Dashboard — overview/sources/crawlers tabs, crawl all                              | Done   |
| Sprint 13| Footer + 404 + Layout — Footer, NotFound, Privacy, AppLayout, AdminRoute                | Done   |
| Sprint 14| SEO upgrade — OG, Twitter, JSON-LD, sitemap.xml, canonical, robots meta                 | Done   |
| Sprint 15| Expanded seed — 96 jobs, 11 tests, 110 questions, 20 papers                            | Done   |
| Sprint 16| Landing redesign — Live data, expiring soon, stats counter, state/category links         | Done   |
| Sprint 17| Dashboard upgrade — 4-stat grid, quick actions, deadline sidebar, stage badges           | Done   |
| Sprint 18| Dark mode — ThemeContext, localStorage, OS preference, Navbar toggle                     | Done   |
| Sprint 19| Job sharing + tracking — Share button, track/untrack toggle, eligibility details         | Done   |
| Sprint 20| Final polish — Category filter, deadline countdown, proper state names                   | Done   |
| Sprint 21| Exam Calendar + Results + Admit Cards — Timeline, declared/upcoming, available/uploading  | Done   |
| Sprint 22| Related jobs + breadcrumbs — Breadcrumbs, related jobs, scroll-to-top, loading skeletons | Done   |
| Sprint 23| FAQ + About + Testimonials — Accordion, mission/features/sources/team, reviews           | Done   |
| Sprint 24| Toast notifications — Success/error/info toasts, auto-dismiss, slide-in animation        | Done   |
| Sprint 25| Massive data expansion — 200+ jobs, 22+ tests, 220+ questions, 100+ papers              | Done   |
| Sprint 26| Awwwards UI — Custom cursor, page transitions, 3D effects, noise texture, skeletons      | Done   |
| Sprint 27| USP section — "Why We're Different" with 6 differentiators                               | Done   |
| Sprint 28| Profile upgrade — TiltCard + ScrollReveal on profile form                                | Done   |
| Sprint 29| Leaderboard — Top scorers with medals, test history with scores                          | Done   |
| Sprint 30| Notification bell — Deadline alerts dropdown, unread count, auto-refresh                 | Done   |
| Sprint 31| Progress analytics — Pipeline visualization, animated counters, study streak             | Done   |
| Sprint 32| Revenue strategy — Free first, ads + affiliate, premium later documentation             | Done   |

## Testing

- Jest + ts-jest unit tests (50 tests, 8 suites — all passing)
- Auth: 22 tests (timing-safe, rotation, reuse, generic errors)
- Users: 3 tests, Jobs: 7 tests, Health: 4 tests
- E2E infrastructure ready (supertest not installed)

## Auth & User Management

- Google OAuth SSO via Passport.js (passport-google-oauth20)
- Email/password registration with argon2
- JWT 15min access + 7d refresh in Redis
- Token rotation + reuse detection
- Account lockout: 5 fails = 15min lock
- Email verification (UUID tokens, Redis TTL)
- Password reset flow

## crewAI Agents (Full SDLC)

10 specialized agents in `crewai/`:

1. Product Manager — PRDs, backlog, feature prioritization
2. Solution Architect — system design, API contracts, patterns
3. Senior Developer — production TypeScript code
4. QA Engineer — tests, validation, bug reports
5. DevOps Engineer — Docker, CI/CD, monitoring
6. Security Engineer — OWASP audits, vulnerability scanning
7. Data Engineer — crawlers, scraping, data normalization
8. UX Designer — UI/UX reviews, accessibility, responsive
9. Competitive Intelligence — competitor monitoring, market research
10. Scrum Master — sprint planning, progress tracking

Run: `python crewai/run.py [research|security|feature|data|sprint]`

## Features (Exceeding Competitors)

- Document Wallet (photo, signature, certificates) — Free for life
- Bug/Feedback reporting (public form + admin panel)
- Job categories: GOVERNMENT, PSU, BANKING, RAILWAY, DEFENCE, POLICE, TEACHING, etc.
- State-wise jobs: /state/:state (15 states)
- Qualification-wise: /qualifications/:qual (5 levels)
- Affiliate cards on job detail (Amazon, coaching)
- Competitive analysis document (7 competitors analyzed)
- Seed data: 14 diverse jobs across 8 categories

## Revenue Strategy (Free First → Ads → Premium Later)

**Core principle:** Keep everything free for 6-12 months. Build user base. Monetize with ads + affiliate. Premium comes AFTER trust is proven.

### Phase 1: Launch → 10K Users (Months 1-6)
| Feature | Access | Revenue |
|---------|--------|---------|
| Job listings | Free | Display ads (AdSense) |
| Mock tests | Free | Affiliate cards (Testbook/Adda247) |
| Previous papers | Free | Sponsored listings |
| Email alerts | Free | — |
| Application tracker | Free | — |
| Document wallet | Free | — |

### Phase 2: 10K+ Users (Month 6+)
| Feature | Access | Revenue |
|---------|--------|---------|
| Everything above | Free | Ads + affiliate |
| Ad-free experience | Premium ₹49/mo | Subscription |
| Priority alerts | Premium ₹49/mo | Subscription |
| Unlimited trackers | Premium ₹99/mo | Subscription |
| Resume builder | Premium ₹99/mo | Subscription |

### Why Free First Works
1. **SEO** — Google indexes free content (mock tests, papers rank high)
2. **Trust** — Users try before they buy (no upfront risk)
3. **Growth** — Aspirants share free content in WhatsApp/Telegram groups
4. **Data** — Learn what users want before building premium features
5. **Competitors** — Testbook/Adda247 already charge; we undercut with free

### Revenue Projections (Conservative)
| Month | Users | Pageviews/mo | Ad Revenue | Affiliate | Total |
|-------|-------|--------------|------------|-----------|-------|
| 3 | 2K | 20K | ₹4K | ₹2K | ₹6K |
| 6 | 10K | 100K | ₹20K | ₹10K | ₹30K |
| 12 | 50K | 500K | ₹1L | ₹50K | ₹1.5L |
| 18 | 100K | 1M | ₹2.5L | ₹1L | ₹3.5L |

### Premium Tier (Later)
- **Lite ₹49/mo:** Ad-free, 10 trackers, priority crawl
- **Pro ₹99/mo:** Unlimited trackers, analytics, resume builder, no ads
- **Conversion target:** 2-4% after month 6 (when trust is proven)

### Code Status
- ✅ No paywalls in frontend (mock tests, papers, tracker all free)
- ✅ No premium checks in backend
- ✅ Affiliate cards ready on job detail pages
- ✅ Ad placeholders ready (Google AdSense integration)
- ✅ FAQ confirms: "Core features will always remain free"
