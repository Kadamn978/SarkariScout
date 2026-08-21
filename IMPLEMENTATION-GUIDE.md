# Implementation Guide — Generic Project Template

## Quick Start

### 1. Read These Files First
```
PROGRESS.md                              ← Where we are, what's done
docs/11-implementation-improvements.md   ← What to implement
SECURITY-CHECKLIST.md                    ← Security gate
```

### 2. Set Up Agent System
```bash
# Copy agents/ folder to your project
# Read agents/00-orchestrator.md
# Start with Cycle 1
```

### 3. Track Progress
```markdown
# After each cycle, update PROGRESS.md:
### Cycle N — YYYY-MM-DD
**Role worn:** [role]
**Did:** [changes]
**Verified:** [test results]
**Decisions:** [assumptions]
```

---

## File Structure (Template)

```
your-project/
├── PROGRESS.md                         ← Single source of truth
├── IMPLEMENTATION-GUIDE.md             ← This file
├── SECURITY-CHECKLIST.md               ← Security gate
├── agents/
│   ├── 00-orchestrator.md              ← Team lead
│   ├── 01-architect.md                 ← Architecture
│   ├── 02-developer.md                 ← Code
│   ├── 03-qa.md                        ← Testing
│   ├── 04-security.md                  ← Security
│   └── 05-devops.md                    ← CI/CD
├── docs/
│   ├── 00-project-overview.md
│   ├── 01-brd.md
│   ├── 02-feature-plan.md
│   ├── 03-architecture.md
│   ├── 04-data-sources.md
│   ├── 05-risk-analysis.md
│   ├── 06-security-analysis.md
│   ├── 07-revenue-plan.md
│   ├── 08-roadmap.md
│   ├── 09-runbook.md
│   ├── 10-test-plan.md
│   ├── 11-implementation-improvements.md
│   └── 12-agent-system.md
├── src/                                ← Your source code
├── tests/                              ← Your tests
└── infra/                              ← Infrastructure configs
```

---

## Implementation Priority

### P0 (Launch Blockers) — 13-19 days
1. Security hardening (3-7 days)
2. Agent system (1 day)
3. QA infrastructure (2-4 days)
4. Core features (varies)

### P1 (Revenue/Growth) — 7-10 days
5. Revenue features (2-3 days)
6. SEO/Offline (3-4 days)
7. UX polish (2-3 days)

### P2 (Nice to Have) — Future
8. Mobile app
9. Advanced analytics
10. Marketing automation

---

## How to Run Tests

### Security Tests
```bash
# npm audit (Node.js)
npm audit --audit-level=high

# pip audit (Python)
pip audit

# Gitleaks secret scan
gitleaks detect --source . --verbose

# OWASP ZAP baseline
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

### Unit Tests
```bash
# Node.js
npm run test:cov

# Python
pytest --cov=src tests/

# Go
go test -coverprofile=coverage.out ./...
```

### E2E Tests
```bash
# Playwright
npx playwright test --project=chromium

# Cypress
npx cypress run
```

---

## How to Deploy

### Local Development
```bash
# Docker
docker-compose up -d

# Or native
cp .env.example .env
npm run dev
```

### Production
```bash
# One-line deployment (customize for your stack)
./deploy.sh

# Or manual
docker-compose -f docker-compose.prod.yml up -d
```

---

## Common Patterns

### IDOR Protection
```typescript
// Always check ownership
async getData(id: string, userId: string) {
  const ownership = await this.checkOwnership(id, userId);
  if (!ownership) throw new ForbiddenException();
  return this.repository.findById(id);
}
```

### Rate Limiting
```typescript
// Apply to all public endpoints
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Post('endpoint')
async handler() { ... }
```

### Skeleton Loaders
```tsx
// Replace "Loading..." with skeletons
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
```

### Three-Section Digest
```html
<!-- For notifications/digests -->
<h2>🔴 Closing Today</h2>
<h2>🟠 Closing This Week</h2>
<h2>🟡 Closing in 3 Days</h2>
```

---

## Getting Help

### Documentation
- `docs/00-project-overview.md` — What we're building
- `docs/01-brd.md` — Business requirements
- `docs/03-architecture.md` — Tech stack
- `docs/06-security-analysis.md` — Security plan
- `docs/11-implementation-improvements.md` — What to implement
- `docs/12-agent-system.md` — How agents work

### Agents
- `agents/00-orchestrator.md` — Session management
- `agents/04-security.md` — Security review

### Checklists
- `SECURITY-CHECKLIST.md` — Pre-launch gate
- `docs/10-test-plan.md` — Test requirements

---

## Version History

| Date | Change |
|---|---|
| Aug 21, 2026 | Initial generic implementation guide |
