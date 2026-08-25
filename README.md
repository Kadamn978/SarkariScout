# SarkariScout 🛰️

**Never miss a government job again.** SarkariScout monitors every major Indian government job & exam notification source (all-India + Maharashtra), filters them against each user's eligibility profile (education, state, languages, age, category), and sends email alerts **only for jobs they can actually apply to** — before deadlines close.

## 🎯 The Promise

- Enter your details **once** (degree, state, languages, category)
- We continuously **monitor 20+ official sources** (UPSC, SSC, IBPS, RRB, MPSC, NCS, Employment News + verified aggregators)
- You get a **daily digest email (9 AM IST)** + **instant alerts** when something changes
- Track every job you applied to: **exam date, admit card, result, venue changes, rule updates**
- Everything **free until we cross the first revenue mark**, funded by non-intrusive side ads + affiliate + optional premium

## 📁 Repo Structure

```
.
├── docs/                  # ALL project documentation (BRD → Runbook → Test Plan)
│   ├── 00-project-overview.md   # Executive summary + live progress tracker
│   ├── 01-brd.md                # Business Requirements Document
│   ├── 02-feature-plan.md       # Features, priorities, severity, phases
│   ├── 03-architecture.md       # System design, ERD, folder layout, deploy targets
│   ├── 04-data-sources.md       # Researched free data sources & endpoints
│   ├── 05-risk-analysis.md      # Risks, likelihood, impact, mitigations
│   ├── 06-security-analysis.md  # OWASP + India DPDP compliance plan
│   ├── 07-revenue-plan.md       # Ads + affiliate + premium until ₹10L
│   ├── 08-roadmap.md            # Phase-by-phase timeline
│   ├── 09-runbook.md            # Run on ANY local machine (Windows/Mac/Linux)
│   └── 10-test-plan.md          # Unit / integration / real-browser E2E cases
├── frontend/             # React + Vite + Tailwind + 3D (three.js) — swappable
├── backend/              # NestJS REST API + BullMQ workers — swappable
├── crawler/              # Job ingestion service (RSS + HTML + NCS API) — swappable
├── e2e/                  # Playwright real-browser E2E suite
├── infra/                # docker-compose, Dockerfiles, deploy configs, .env.example
└── README.md
```

## 🚀 Quick Start (5 min)

```bash
git clone <repo-url> sarakriradar && cd sarakriradar
docker compose -f infra/docker-compose.yml up -d   # Postgres + Redis
cp .env.example .env                               # fill secrets
npm run dev                                       # frontend :5173, backend :3000
npm run seed                                       # demo data
npm run test:e2e                                   # Playwright browser tests
```

> Full Windows/Mac/Linux instructions, troubleshooting, and production deploy steps: **[docs/09-runbook.md](docs/09-runbook.md)**

## 🧭 Read the Docs First

| Doc | What it answers |
|---|---|
| [00-project-overview](docs/00-project-overview.md) | What are we building, why, and how far along are we? |
| [01-brd](docs/01-brd.md) | Full business requirements, personas, scope, success metrics |
| [02-feature-plan](docs/02-feature-plan.md) | Every feature, when it ships, severity & effort |
| [03-architecture](docs/03-architecture.md) | Tech stack, data model, how services talk |
| [04-data-sources](docs/04-data-sources.md) | Where job data comes from (all free) |
| [05-risk-analysis](docs/05-risk-analysis.md) | What can go wrong + how we survive it |
| [06-security-analysis](docs/06-security-analysis.md) | Security & India DPDP compliance |
| [07-revenue-plan](docs/07-revenue-plan.md) | How this becomes a business, not a hobby |
| [08-roadmap](docs/08-roadmap.md) | Phases, timelines, progress % |
| [09-runbook](docs/09-runbook.md) | Run on any local system, deploy to free tiers |
| [10-test-plan](docs/10-test-plan.md) | Every test case, including real-browser E2E |

## 💰 Revenue Model (short version)

1. **Phase A — Free for users**: LHS/RHS/top/bottom static ad banners (NO popups, NO interstitials) + affiliate links (Testbook, Adda247, Oliveboard, Amazon books)
2. **Phase B — Premium ₹49–99/mo** (Razorpay): instant alerts, unlimited trackers, no ads
3. **Phase C — Scale**: job-posting fees, institutional leads, sponsored newsletters

Full breakdown with numbers: **[docs/07-revenue-plan.md](docs/07-revenue-plan.md)**

---

*Docs v1.0 — finalized before any code is written. Built by a one-man army: Developer • Architect • Tester • QA • Security Auditor • DevOps.*