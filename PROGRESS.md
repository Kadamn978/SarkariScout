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
| 7 | Tracker & Change Detection | Pending |
| 8 | Monetization | Pending |
| 9 | Testing & QA | Pending |
| 10 | Deployment | Pending |

## API Routes (22 total)

**Auth (5):** register, login, refresh, logout, forgot-password
**Users (3):** getProfile, updateProfile, deleteAccount
**Jobs (4):** list, detail, track, trackedJobs
**Crawler (3):** crawlSource, crawlAll, status (ADMIN)
**Matching (2):** myJobs, stats
**Email (2):** sendDigest, testWelcome (ADMIN)
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
