# 09 — Runbook (run on ANY local system)

**Version:** 2.0 · **Tested on:** Windows 11 (Laragon) · **Goal:** fresh machine → working full stack in < 30 minutes

---

## 1. Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | ≥ 20 LTS (v22.11.0 tested) | all services |
| npm | ≥ 9 | package management |
| MySQL 8.4 | via Laragon | primary database |
| Redis 5.0 | via Laragon | session cache + JWT storage |
| Git | latest | version control |
| Python | ≥ 3.12 | crewAI agents |
| Browser | Chrome/Edge/Firefox | dev |

**Laragon path:** `D:\Nilesh\laragon`
**MySQL binary:** `D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe` (root, no password)

---

## 2. One-time setup

```bash
# 1. Clone
git clone <repo-url> "New folder"
cd "New folder"

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Start infrastructure (Laragon)
#    - Start MySQL and Redis from Laragon tray

# 5. Start Redis manually (if not in Laragon)
Start-Process "D:\Nilesh\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe"

# 6. Create database
& "D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS sarkariscout;"

# 7. Configure environment
cd backend
cp .env.example .env
# Edit .env with your settings (at minimum: JWT_SECRET, DATABASE_URL)

# 8. Run Prisma migration
npx prisma migrate dev

# 9. Seed database
npx prisma db seed

# 10. Start backend
cd backend
npx ts-node src/main.ts
# OR for dev with watch:
npx nest start --watch

# 11. Start frontend (new terminal)
cd frontend
npm run dev
```

---

## 3. What should be running

| Service | URL | Health check |
|---|---|---|
| API | http://localhost:3000/api/health | `{"status":"ok","db":"up","redis":"up"}` |
| Frontend | http://localhost:5173 | landing page |
| MySQL | localhost:3306 | `mysql -u root -e "SELECT 1"` |
| Redis | localhost:6379 | `redis-cli ping` → PONG |

---

## 4. Everyday commands

```bash
# Backend
cd backend
npx nest start --watch          # dev with hot reload
npx ts-node src/main.ts        # single run
npx jest --forceExit            # run all 50 tests
npx prisma migrate dev          # create migration
npx prisma db seed              # reseed database

# Frontend
cd frontend
npm run dev                     # dev server with HMR
npx tsc --noEmit                # typecheck
npm run build                   # production build

# crewAI agents
cd crewai
python run.py research          # competitive research
python run.py security          # security audit
python run.py feature "add mock tests"  # new feature
python run.py data              # data pipeline
python run.py sprint "full sprint goal"  # all 10 agents
```

---

## 5. crewAI Agent System

### Setup
```bash
# Install Python deps (Windows)
python -m pip install crewai crewai-core json-repair json5 pydantic pydantic_settings litellm aiofiles aiosqlite chromadb appdirs regex imageio Pillow img2pdf

# Set API keys in crewai/.env
OPENAI_API_KEY=sk-...          # for GPT-4o agents
ANTHROPIC_API_KEY=sk-ant-...   # for Claude agents
```

### 10 Agents
| # | Agent | Role | Model |
|---|---|---|---|
| 1 | Product Manager | PRDs, backlog, prioritization | GPT-4o |
| 2 | Solution Architect | System design, API contracts | GPT-4o |
| 3 | Senior Developer | Production TypeScript code | Claude |
| 4 | QA Engineer | Tests, validation, bug reports | GPT-4o |
| 5 | DevOps Engineer | Docker, CI/CD, monitoring | GPT-4o |
| 6 | Security Engineer | OWASP audits, vulnerabilities | Claude |
| 7 | Data Engineer | Crawlers, scraping, normalization | GPT-4o |
| 8 | UX Designer | UI/UX, accessibility, responsive | GPT-4o |
| 9 | Competitive Intel | Competitor monitoring | GPT-4o |
| 10 | Scrum Master | Sprint planning, progress tracking | GPT-4o |

### Run commands
```bash
# Quick tasks
python crewai/run.py research           # weekly competitive analysis
python crewai/run.py security           # security audit of codebase
python crewai/run.py data               # data pipeline health check

# Feature development (full SDLC)
python crewai/run.py feature "document wallet upload limit increase"

# Full sprint (all 10 agents)
python crewai/run.py sprint "implement mock test engine with 100 questions"
```

### 5 Crew Formations
- **full_sdlc_crew** — all 10 agents, sequential
- **feature_crew** — PM → Architect → Dev → QA
- **security_crew** — Security → Dev → DevOps
- **data_crew** — Data → Architect → Dev
- **research_crew** — Competitive Intel → PM → UX

---

## 6. First-time smoke test

1. Open http://localhost:5173 → see landing page
2. Click "Sign in with Google" or "Register" → create account
3. Build profile: Graduate, Maharashtra, GEN
4. Dashboard → see applicable jobs from seed data (14 jobs)
5. Browse /jobs → filter by category, state, qualification
6. Open /documents → upload a test document
7. Open /bug-report → submit a test bug report
8. Run `npx jest --forceExit` → 50/50 tests passing

---

## 7. Git workflow

```bash
# Branches
main          # production
pre-dev       # staging
test          # development

# Hooks (automatic)
pre-commit    # blocks .env files, warns on hardcoded secrets
commit-msg    # enforces Nilesh Kadam author identity

# Commit format
git add <files>
git commit -m "feat: description"
git commit -m "fix: description"
git commit -m "docs: description"
git commit -m "test: description"
```

---

## 8. Windows-specific notes

- **PowerShell:** use `;` not `&&` for chaining commands
- **MySQL:** use full path: `& "D:\Nilesh\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root`
- **Redis:** start manually: `Start-Process "D:\Nilesh\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe"`
- **npm install:** may fail with caniuse-lite issue in npm 11.12.1; use `npm pack` workaround for individual packages
- **nest build:** fails (missing lodash in CLI); use `npx ts-node src/main.ts` directly
- **Python crewAI:** uvloop not supported on Windows; install deps individually

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `DATABASE_URL` connect fail | Start MySQL in Laragon; check port 3306 free |
| Prisma migrate fails | `npx prisma generate` then `npx prisma migrate dev` |
| Redis connection refused | Start Redis: `Start-Process "D:\Nilesh\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe"` |
| `nest build` fails | Use `npx ts-node src/main.ts` instead |
| npm install fails | Try `npm install --legacy-peer-deps` or `npm pack` workaround |
| crewAI import errors | Install missing deps: `python -m pip install <module>` |
| Google OAuth callback fails | Check GOOGLE_CLIENT_ID/SECRET in .env, verify callback URL |
| 50/50 tests failing | Run `npx jest --forceExit` from backend/ directory |

---

## 10. Key file locations

```
New folder/
├── backend/
│   ├── src/main.ts              # NestJS bootstrap
│   ├── src/app.module.ts        # 16 modules
│   ├── prisma/schema.prisma     # 18 tables, 6 enums
│   ├── prisma/seed.ts           # 14 jobs, 10 sources
│   ├── .env                     # secrets (gitignored)
│   └── .env.example             # template
├── frontend/
│   ├── src/App.tsx              # 17 routes
│   ├── src/pages/               # 16 pages
│   └── src/components/          # reusable UI
├── crewai/
│   ├── agents.py                # 10 specialized agents
│   ├── run.py                   # CLI runner
│   └── requirements.txt         # Python deps
├── infra/
│   ├── docker-compose.yml       # MySQL + Redis
│   └── docker-compose.prod.yml  # production stack
├── docs/                        # 19 documentation files
├── agents/                      # 6 role charters
├── PROGRESS.md                  # single source of truth
├── SECURITY-CHECKLIST.md        # OWASP compliance
└── MISTAKES.md                  # self-learning loop
```

---

### Change log
| Date | Change |
|---|---|
| Aug 24, 2026 | v2.0 — Updated for crewAI, Google OAuth, MySQL, current stack |
| Aug 20, 2026 | v1.0 — Initial runbook |
