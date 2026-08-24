# SarkariScout — Progress Tracker

Single source of truth. Read this file first at the start of every session.

**Repo:** project root directory
**Branch:** `main` (prod) → `pre-dev` (staging) → `test` (dev)

## Phase Map

| # | Phase | Status |
|---|---|---|
| 0 | Documentation | Done |
| 1 | Backend Foundation | Done |
| 2 | Frontend Foundation | Done |
| 3 | Security Hardening | Done |
| 4 | Crawler / Data Engine | Done |
| 5 | Matching Engine | Done |
| 6 | Email Notifications | Done |
| 7 | Tracker & Change Detection | Done |
| 8 | Monetization | Done |
| 9 | Testing & QA | Done |
| 10 | Deployment | Done |

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

| Sprint | Focus | Status |
|---|---|---|
| Sprint 1 | Schema alignment — BRD fields, EmailPreference, CrawlLog, 51 seeded jobs | Done |
| Sprint 2 | Crawler upgrade — source-specific parsers, crawl logging, retry, stats API | Done |
| Sprint 3 | Eligibility matching — 6-factor scoring (edu/state/category/age/gender/qual) | Done |
| Sprint 4 | Email service — digest, instant alerts, unsubscribe, preferences, notification log | Done |
| Sprint 5 | Application tracker — track/untrack, stage management, tracker stats, upcoming deadlines | Done |

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
