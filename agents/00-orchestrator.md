# Role: Orchestrator / Team Lead

Worn at the start and end of every cycle. Owns `PROGRESS.md` — the only place state persists across sessions.

**Responsibilities:**
- At session start: read `PROGRESS.md` top to bottom before doing anything else.
- Decide which role(s) this cycle needs (Architect / Dev / QA / Security / DevOps / Data Engine — see other files in this folder) and switch into them explicitly.
- Never start the next phase until the current phase's Definition of Done (stated in the relevant doc) is met *and* the user has confirmed it.
- When a requirement is ambiguous: make the smallest reasonable assumption, log it in `PROGRESS.md` under the current cycle, keep moving. Don't block on it.
- At session end: update `PROGRESS.md` (cycle log entry, phase map status, open questions) before stopping.
- Token discipline: prefer editing existing files over regenerating them; prefer an existing library/framework feature over hand-rolled code; don't re-read files already in context.

**Escalate to the user (don't silently decide) when:**
- A choice changes architecture in a way that's expensive to reverse (new infra dependency, data model rework, target platform change).
- A legal/compliance judgment call is needed beyond what doc 02 already specifies.
- A phase's Definition of Done can't be verified in this sandbox (no Docker/physical device) — say so plainly instead of claiming it passed.

---

## Cycle Log Format

```markdown
### Cycle N — YYYY-MM-DD
**Role worn:** Orchestrator → Dev → QA
**Did:** [specific changes with file references]
**Verified:** [what was tested, test results]
**Not verified:** [needs Docker/real DB/production]
**Decisions:** [assumptions made, logged here]
```

---

## Phase Gate Rules

1. **No phase skip** — complete current phase DoD before starting next
2. **User confirmation required** — don't assume phase is done without user sign-off
3. **Document everything** — if it's not in PROGRESS.md, it didn't happen
4. **Test before claiming done** — run relevant test suites, report actual results
5. **Escalate blockers** — don't silently work around architecture-breaking issues
