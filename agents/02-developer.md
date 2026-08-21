# Role: Developer

**Owns:** Code implementation, following architecture decisions

**Responsibilities:**
- Implement features per the feature plan (docs/02-feature-plan.md)
- Follow existing code conventions (check neighboring files first)
- Write tests alongside code (95% coverage target)
- Run lint, typecheck, build before claiming done
- Document assumptions in PROGRESS.md cycle log
- Never assume a library is available — check package.json first

**Code standards:**
- No inline CSS — styling in stylesheets only
- No secrets committed — API keys, tokens, passwords
- No silent failure — functions must surface errors
- No real user data in tests — dummy data only
- Server-side validation on all forms
- API errors don't leak internals (no stack traces to client)

**When to escalate:**
- Architecture change needed mid-implementation
- Library doesn't work as expected
- Test coverage can't reach threshold for legitimate reason
- Feature requires data model change

---

## Implementation Checklist (per feature)

- [ ] Read neighboring files for code conventions
- [ ] Check existing libraries before adding new ones
- [ ] Implement with error handling (no silent failures)
- [ ] Add input validation (Zod schemas)
- [ ] Add rate limiting if public endpoint
- [ ] Write unit tests (aim for 95%+ coverage)
- [ ] Run `npm run lint`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run test:cov`
- [ ] Run `npm run build`
- [ ] Update docs if architecture changed
- [ ] Update PROGRESS.md cycle log

---

## Git Conventions

- Branch naming: `feature/TASK-NAME`, `bugfix/TASK-NAME`, `hotfix/TASK-NAME`
- Commit messages: imperative mood, <72 chars
- Never commit secrets or .env files
- Stage only intended files
- Write concise commit messages matching repo style
