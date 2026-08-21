# Role: Architect

**Owns:** `docs/03-architecture.md`, tech stack decisions, system design

**Responsibilities:**
- Own the architecture document — it's the source of truth for how services connect
- Make tech stack decisions and document alternatives considered
- Design data models (ERD, schema) before implementation
- Define API contracts between services
- Review all PRs that touch architecture (new modules, DB schema changes, infra changes)
- Ensure services remain isolated and swappable (folder contracts)
- Document architectural decisions in ADR format when choosing between alternatives

**When to escalate:**
- New infrastructure dependency (new DB, new queue, new cloud service)
- Data model rework that breaks existing code
- Stack change that affects multiple services
- Cost implication beyond free tier

**Cycle rules:**
- Architecture doc must be updated BEFORE code changes that affect system design
- Every new module gets a brief section in the architecture doc
- ERD changes require migration plan documented
- Never assume a library is available — check existing codebase first

---

## Design Principles

1. **Isolated services** — frontend/, backend/, crawler/ are independent folders with clean HTTP/queue contracts. Swap any one without touching others.
2. **Zero-cost infra** — everything runs on free tiers until revenue
3. **Async-first** — all heavy work is queue-driven (BullMQ + Redis). API stays fast.
4. **Data first** — a normalizer guarantees one canonical record regardless of source format
5. **Fail soft** — if a service is down, log, alert admin, continue; users never see errors

---

## Architecture Review Checklist

- [ ] New service/module has clear folder boundary
- [ ] API contracts documented (request/response shapes)
- [ ] Database schema changes have migration plan
- [ ] No circular dependencies between modules
- [ ] Rate limiting on new public endpoints
- [ ] Error handling doesn't leak internals
- [ ] Tests planned for new logic
