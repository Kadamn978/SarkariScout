# 12 — Agent Orchestration System

**Version:** 2.0 · **Started:** Aug 21, 2026 · **Updated:** Aug 24, 2026

---

## 1. What is the Agent System?

A structured way to organize AI-assisted development by assigning **roles** to different tasks. Each role has clear responsibilities, owns specific files, and follows defined rules.

**Two layers:**
1. **Manual agents** (docs/12 + agents/) — role charters for human/AI-assisted development
2. **crewAI agents** (crewai/) — automated Python agents that run autonomously with LLM API keys

---

## 2. crewAI Agent System (Automated)

### 2.1 Setup

```bash
# Install Python deps
python -m pip install crewai crewai-core json-repair json5 pydantic pydantic_settings litellm aiofiles aiosqlite chromadb

# Set API keys in crewai/.env
OPENAI_API_KEY=sk-...          # for GPT-4o agents
ANTHROPIC_API_KEY=sk-ant-...   # for Claude agents
```

### 2.2 The 10 Agents

| # | Agent | Role | Model | File |
|---|---|---|---|---|
| 1 | Product Manager | PRDs, backlog, feature prioritization | GPT-4o | agents.py |
| 2 | Solution Architect | System design, API contracts, patterns | GPT-4o | agents.py |
| 3 | Senior Developer | Production TypeScript code | Claude | agents.py |
| 4 | QA Engineer | Tests, validation, bug reports | GPT-4o | agents.py |
| 5 | DevOps Engineer | Docker, CI/CD, monitoring | GPT-4o | agents.py |
| 6 | Security Engineer | OWASP audits, vulnerabilities | Claude | agents.py |
| 7 | Data Engineer | Crawlers, scraping, normalization | GPT-4o | agents.py |
| 8 | UX Designer | UI/UX, accessibility, responsive | GPT-4o | agents.py |
| 9 | Competitive Intel | Competitor monitoring, market research | GPT-4o | agents.py |
| 10 | Scrum Master | Sprint planning, progress tracking | GPT-4o | agents.py |

### 2.3 Running Agents

```bash
cd crewai

# Quick tasks
python run.py research           # weekly competitive analysis
python run.py security           # security audit of codebase
python run.py data               # data pipeline health check

# Feature development (full SDLC)
python run.py feature "document wallet upload limit increase"

# Full sprint (all 10 agents, sequential)
python run.py sprint "implement mock test engine with 100 questions"
```

### 2.4 Crew Formations

| Crew | Agents | Use Case |
|---|---|---|
| full_sdlc_crew | All 10 | Full sprint planning |
| feature_crew | PM → Architect → Dev → QA | New feature development |
| security_crew | Security → Dev → DevOps | Security audit |
| data_crew | Data → Architect → Dev | Data pipeline work |
| research_crew | Competitive Intel → PM → UX | Market research |

### 2.5 File Structure

```
crewai/
├── agents.py           # 10 agent definitions + crew formations
├── run.py              # CLI runner (research, security, feature, data, sprint)
├── requirements.txt    # Python dependencies
└── .env                # API keys (gitignored)
```

---

## 3. Manual Agent System (Role Charters)

### 3.1 Orchestrator (Team Lead)
**Owns:** `PROGRESS.md`
**Responsibilities:**
- Read PROGRESS.md at session start
- Decide which roles this cycle needs
- Never start next phase until current DoD met

### 3.2 Architect
**Owns:** `docs/03-architecture.md`, tech stack decisions
**Responsibilities:**
- Design data models before implementation
- Define API contracts between services
- Review PRs that touch architecture

### 3.3 Developer
**Owns:** Code implementation
**Responsibilities:**
- Implement features per the feature plan
- Follow existing code conventions
- Write tests alongside code
- Run lint, typecheck, build before claiming done

### 3.4 QA / Testing
**Owns:** `docs/10-test-plan.md`, test infrastructure
**Responsibilities:**
- Coordinate testing across all levels
- Ensure 95%+ test coverage
- Generate test reports

### 3.5 Security / Compliance
**Owns:** `docs/06-security-analysis.md`, `SECURITY-CHECKLIST.md`
**Responsibilities:**
- Security review on every PR
- Run dependency audits
- Verify DPDP/GDPR compliance

### 3.6 DevOps / Infrastructure
**Owns:** `infra/`, CI/CD pipelines
**Responsibilities:**
- Maintain docker-compose
- Set up CI/CD pipelines
- Create deployment scripts

---

## 4. Phase Gate Rules

1. **No phase skip** — complete current phase DoD before starting next
2. **User confirmation required** — don't assume phase is done without sign-off
3. **Document everything** — if it's not in PROGRESS.md, it didn't happen
4. **Test before claiming done** — run relevant test suites, report actual results
5. **Escalate blockers** — don't silently work around architecture-breaking issues

---

## 5. Token Discipline

- Prefer editing existing files over regenerating them
- Prefer existing library features over hand-rolled code
- Don't re-read files already in context
- Drop context after each phase, start fresh for next

---

## 6. Escalation Rules

**Always escalate to user:**
- Architecture change expensive to reverse
- Legal/compliance judgment call
- Phase DoD can't be verified in current environment
- New infrastructure dependency
- Cost implication beyond free tier

**Never silently decide:**
- Stack changes
- Data model rework
- Production deployments
- Security exceptions

---

### Change log
| Date | Change |
|---|---|
| Aug 24, 2026 | v2.0 — Added crewAI 10-agent system, updated for current stack |
| Aug 21, 2026 | v1.0 — Initial generic agent system template |
