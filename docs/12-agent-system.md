# 12 — Agent Orchestration System (Generic Template)

**Version:** 1.0 · **Source:** TrailSync, Hawkeye QA Agent

---

## 1. What is the Agent System?

A structured way to organize AI-assisted development by assigning **roles** to different tasks. Each role has clear responsibilities, owns specific files, and follows defined rules. This multiplies productivity by keeping context focused and avoiding role confusion.

**Key principle:** One person (or AI) can wear multiple roles, but never two at the same time during a single task.

---

## 2. Role Charters

### 2.1 Orchestrator (Team Lead)
**Owns:** `PROGRESS.md`
**Responsibilities:**
- Read PROGRESS.md at session start
- Decide which roles this cycle needs
- Never start next phase until current DoD met
- Token discipline: edit existing files, don't regenerate
- Escalate: architecture changes, legal calls, unverifiable DoD

### 2.2 Architect
**Owns:** `docs/03-architecture.md`, tech stack decisions
**Responsibilities:**
- Own the architecture document
- Make tech stack decisions and document alternatives
- Design data models before implementation
- Define API contracts between services
- Review PRs that touch architecture

### 2.3 Developer
**Owns:** Code implementation
**Responsibilities:**
- Implement features per the feature plan
- Follow existing code conventions
- Write tests alongside code
- Run lint, typecheck, build before claiming done
- Document assumptions in PROGRESS.md

### 2.4 QA / Testing
**Owns:** `docs/10-test-plan.md`, test infrastructure
**Responsibilities:**
- Coordinate testing across all levels
- Ensure 95%+ test coverage
- Run browser matrix
- Generate test reports
- Verify security checklist at phase gates

### 2.5 Security / Compliance
**Owns:** `docs/06-security-analysis.md`, `SECURITY-CHECKLIST.md`
**Responsibilities:**
- Security review on every PR
- Run dependency audits
- Verify DPDP/GDPR compliance
- Update security checklist
- Incident response planning

### 2.6 DevOps / Infrastructure
**Owns:** `infra/`, CI/CD pipelines
**Responsibilities:**
- Maintain docker-compose
- Set up CI/CD pipelines
- Manage environment isolation
- Create deployment scripts
- Monitor infrastructure health

---

## 3. How to Set Up

### Step 1: Create agents/ folder
```
your-project/
├── agents/
│   ├── 00-orchestrator.md
│   ├── 01-architect.md
│   ├── 02-developer.md
│   ├── 03-qa.md
│   ├── 04-security.md
│   └── 05-devops.md
```

### Step 2: Create PROGRESS.md
```markdown
# Your Project — Progress Tracker

## Phase Map
| # | Phase | Status | Doc |
|---|---|---|---|
| 0 | Planning | ✅ | docs/... |
| 1 | Foundation | 🟢 building | docs/... |

## Cycle Log
### Cycle 1 — YYYY-MM-DD
**Role worn:** Orchestrator → Dev → QA
**Did:** [changes]
**Verified:** [tests]
**Decisions:** [assumptions]
```

### Step 3: Start Using
1. Begin each session by reading `PROGRESS.md`
2. Decide which role you're wearing
3. Follow that role's charter
4. Update PROGRESS.md at session end

---

## 4. Cycle Log Format

Every working session gets a cycle log entry:

```markdown
### Cycle N — YYYY-MM-DD
**Role worn:** [role1] → [role2] → [role3]
**Did:**
- [change 1 with file reference]
- [change 2 with file reference]

**Verified:**
- [test 1: result]
- [test 2: result]

**Not verified:** [needs Docker/real DB/production]
**Decisions:**
1. [assumption 1]
2. [assumption 2]
```

---

## 5. Phase Gate Rules

1. **No phase skip** — complete current phase DoD before starting next
2. **User confirmation required** — don't assume phase is done without sign-off
3. **Document everything** — if it's not in PROGRESS.md, it didn't happen
4. **Test before claiming done** — run relevant test suites, report actual results
5. **Escalate blockers** — don't silently work around architecture-breaking issues

---

## 6. Token Discipline

- Prefer editing existing files over regenerating them
- Prefer existing library features over hand-rolled code
- Don't re-read files already in context
- Drop context after each phase, start fresh for next
- Cache project knowledge in OVERVIEW.md (if using Hawkeye-style agents)

---

## 7. Escalation Rules

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

## 8. Customizing for Your Project

### Add roles as needed:
```
agents/
├── 00-orchestrator.md
├── 01-architect.md
├── 02-developer.md
├── 03-qa.md
├── 04-security.md
├── 05-devops.md
├── 06-data-engine.md    ← if you have data pipelines
├── 07-mobile.md         ← if you have mobile app
└── 08-marketing.md      ← if you have marketing tasks
```

### Customize responsibilities:
- Add project-specific responsibilities to each role
- Add project-specific escalation rules
- Add project-specific file ownership

---

## 9. References

- TrailSync `agents/` folder
- Hawkeye QA Agent `agents/` folder
- One-person army development pattern
- Token-efficient AI development

---

### Change log
| Date | Change |
|---|---|
| Aug 21, 2026 | Initial generic agent system template |
