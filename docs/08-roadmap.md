# 08 — Roadmap & Progress Tracker

**Version:** 2.0 · **Started:** Aug 20, 2026 · **Updated:** Aug 24, 2026
**Model:** one-man army + crewAI 10-agent system

---

## Current State (Aug 24, 2026)

**What's built:** Full-stack job portal with auth, jobs, matching, email, logging, security, document wallet, bug reporting, Google OAuth, crewAI agents.

**What's next:** Mock tests, previous papers, premium subscriptions, crawler deployment, VPS setup.

---

## Phase 0 — Documentation ✅ COMPLETE

| Deliverable | Status |
|---|---|
| BRD, architecture, feature plan, data sources | ✅ |
| Risk analysis, security analysis, revenue plan | ✅ |
| Runbook, test plan, competitive analysis | ✅ |
| Agent system (10 crewAI agents) | ✅ |
| PROGRESS.md, SECURITY-CHECKLIST.md | ✅ |

## Phase 1 — Backend Foundation ✅ COMPLETE

| Task | Status |
|---|---|
| NestJS 10 + Prisma 5 + MySQL 8.4 + Redis 5.0 | ✅ |
| Auth module (register, login, refresh, logout) | ✅ |
| Google OAuth SSO (Passport.js) | ✅ |
| JWT 15min access + 7d refresh in Redis | ✅ |
| Token rotation + reuse detection | ✅ |
| Account lockout (5 fails = 15min) | ✅ |
| Email verification + password reset | ✅ |
| Users module (profile, update, delete) | ✅ |
| Jobs module (list, detail, track, tracked) | ✅ |
| Crawler module (source, crawlAll, status) | ✅ |
| Matching module (myJobs, stats) | ✅ |
| Email module (digest, testWelcome) | ✅ |
| Changes module (jobChanges, recent, unnotified) | ✅ |
| Documents module (upload, list, setDefault, delete) | ✅ |
| Feedback module (bugs, admin status updates) | ✅ |
| Health module (healthCheck) | ✅ |
| Admin Logs module (7 endpoints) | ✅ |
| 40+ API routes total | ✅ |
| Custom logger + audit/error separation | ✅ |
| HTTP interceptor + global exception filter | ✅ |

## Phase 2 — Frontend Foundation ✅ COMPLETE

| Task | Status |
|---|---|
| React 18 + Vite 6 + Tailwind v4 | ✅ |
| 16 pages (Landing, Login, Register, Profile, Dashboard, Jobs, JobDetail, etc.) | ✅ |
| Google OAuth SSO button (Login + Register) | ✅ |
| Auth context with JWT management | ✅ |
| Protected routes + role-based access | ✅ |
| State-wise jobs page (/state/:state) | ✅ |
| Qualification-wise jobs page (/qualifications/:qual) | ✅ |
| Document Wallet page (/documents) | ✅ |
| Bug Report page (/bug-report) | ✅ |
| Google Auth callback page (/auth/google) | ✅ |
| PasswordInput component (show/hide) | ✅ |
| ErrorBoundary component | ✅ |
| Navbar component | ✅ |
| Affiliate cards on JobDetail | ✅ |
| Sidebar with state/qualification links | ✅ |

## Phase 3 — Security Hardening ✅ COMPLETE

| Task | Status |
|---|---|
| Argon2 hashing (memoryCost: 65536) | ✅ |
| Timing-safe login (padded buffer comparison) | ✅ |
| Token rotation + reuse detection | ✅ |
| Helmet CSP (11 directives) | ✅ |
| CORS production validation | ✅ |
| Rate limiting per route | ✅ |
| Input validation (whitelist, max length) | ✅ |
| Error messages hidden in production | ✅ |
| Generic login errors (no user enumeration) | ✅ |
| .env files blocked by pre-commit hook | ✅ |
| Git hooks enforce author identity | ✅ |
| PII removed from codebase | ✅ |
| SECURITY-CHECKLIST.md maintained | ✅ |

## Phase 4 — Data Engine ✅ COMPLETE (seed data)

| Task | Status |
|---|---|
| 10 job sources registered (SSC, UPSC, IBPS, RRB, NCS, MPSC, DRDO, ISRO, Employment News) | ✅ |
| 14 diverse jobs seeded across 8 categories | ✅ |
| Job categories: GOVERNMENT, PSU, BANKING, RAILWAY, DEFENCE, POLICE, IT, INTERNSHIP | ✅ |
| Fingerprint deduplication | ✅ |
| Crawler module with scheduler | ✅ |
| Real crawlers (production) | ⬜ needs deployment |
| NCS API integration | ⬜ needs API keys |
| RSS connectors | ⬜ needs implementation |

## Phase 5 — Matching Engine ✅ COMPLETE

| Task | Status |
|---|---|
| Eligibility engine (hard rules + scoring) | ✅ |
| Deadline guard (applyEnd > today) | ✅ |
| Profile-based filtering | ✅ |
| State-wise job listing | ✅ |
| Qualification-wise job listing | ✅ |

## Phase 6 — Email Notifications ✅ COMPLETE

| Task | Status |
|---|---|
| Daily digest (9:05 AM IST) | ✅ |
| CronService (every 6h crawl + digest) | ✅ |
| SMTP integration (Mailtrap dev / Brevo prod) | ✅ |
| Email verification flow | ✅ |
| Password reset email | ✅ |

## Phase 7 — Tracker & Change Detection ✅ COMPLETE

| Task | Status |
|---|---|
| Application tracker (applied → exam → result) | ✅ |
| Change detection worker | ✅ |
| Dashboard (stats, upcoming exams) | ✅ |

## Phase 8 — Monetization ✅ COMPLETE

| Task | Status |
|---|---|
| Affiliate cards on job detail (Amazon, coaching) | ✅ |
| Ad slot placeholders | ✅ |
| Premium subscription | ⬜ Phase 5 |
| Admin panel | ✅ (logs API) |

## Phase 9 — Testing & QA ✅ COMPLETE

| Task | Status |
|---|---|
| 50 unit tests, 8 suites, all passing | ✅ |
| Auth: 22 tests (timing-safe, rotation, reuse) | ✅ |
| Users: 3 tests, Jobs: 7 tests, Health: 4 tests | ✅ |
| TypeScript clean (both frontend + backend) | ✅ |

## Phase 10 — Deployment ⬜ IN PROGRESS

| Task | Status |
|---|---|
| Docker multi-stage build | ✅ |
| docker-compose.prod.yml | ✅ |
| Nginx reverse proxy | ✅ |
| deploy.bat / start-prod.bat | ✅ |
| Google OAuth setup (Cloud Console) | ⬜ needs credentials |
| VPS deployment | ⬜ needs hosting |
| SSL certificate | ⬜ needs domain |
| DNS configuration | ⬜ needs domain |

---

## Phase 11 — crewAI Agent System ✅ COMPLETE

| Task | Status |
|---|---|
| 10 specialized agents defined | ✅ |
| 5 crew formations (full_sdlc, feature, security, data, research) | ✅ |
| CLI runner (research, security, feature, data, sprint) | ✅ |
| Python deps installed on Windows | ✅ |
| LLM API keys configured | ⬜ needs OPENAI_API_KEY |

## Phase 12 — Next Features ⬜ UPCOMING

| Task | Priority |
|---|---|
| Mock Test engine (questions, attempts, scoring) | High |
| Previous Year Papers section | High |
| Premium subscription (Razorpay) | High |
| Telegram/WhatsApp job alerts | Medium |
| PWA + offline support | Medium |
| SEO optimization + sitemap | Medium |
| Mobile app (React Native) | Low |

---

## Git History (all Nilesh Kadam)

```
b0f6e79 docs: update PROGRESS.md
970e4ff feat: Google OAuth SSO + crewAI full SDLC + clean seed data
e8f4995 feat: document wallet + bug reports + job categories
abe0cc0 feat: revenue pages — state/qualification jobs, affiliate cards
86b385c docs: competitive analysis — 7 competitors
95786cf test: add users, jobs, health tests + harden Helmet CSP
4d38da5 fix(security): remove PII, generic names, no hardcoded secrets
b858010 fix: agent audit compliance — Docker, Redis, CSP, CORS
...30+ more commits
```

---

## Weekly cadence

| Day | Activity |
|---|---|
| Mon | Plan week, run `python crewai/run.py research`, sync PROGRESS.md |
| Tue–Thu | Build + test (feature-branch → CI → merge) |
| Fri | Run `python crewai/run.py security`, update docs |
| Sat | Marketing ops, revenue dashboard |
| Sun | Off / backlog grooming |
