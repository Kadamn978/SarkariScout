# SarkariScout — Progress Tracker

Single source of truth. Read this file first at the start of every session.

**Repo:** `D:\Nilesh\laragon\www\New folder`
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

## API Routes (32 total)

**Auth (5):** register, login, refresh, logout, forgot-password
**Users (3):** getProfile, updateProfile, deleteAccount
**Jobs (4):** list, detail, track, trackedJobs
**Crawler (3):** crawlSource, crawlAll, status (ADMIN)
**Matching (2):** myJobs, stats
**Email (2):** sendDigest, testWelcome (ADMIN)
**Changes (3):** jobChanges, recentChanges, unnotifiedChanges
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

## Testing

- Jest + ts-jest unit tests (10 tests, 4 services)
- E2E infrastructure ready
