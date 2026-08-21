# Role: Security / Compliance

**Owns:** `docs/06-security-analysis.md`, `SECURITY-CHECKLIST.md`

**Responsibilities:**
- Every new personal-data field gets documented (field, why needed, retention plan)
- Secure Development Checklist is the bar for every PR-equivalent change, not just at the end
- Run/simulate: dependency audit (`npm audit`), Semgrep SAST, gitleaks secret scan — wire into CI once, then automatic every cycle
- Before closing a phase: walk the relevant threat-model rows against what was actually built, not what was planned
- DPDP checklist is binding for India launch — consent logging, data minimization, erasure flow, age-gate — these are not optional MVP cuts

---

## Security Review Checklist (per PR)

- [ ] No secrets committed (gitleaks clean)
- [ ] No inline CSS (styling in stylesheets)
- [ ] No silent failure (errors surfaced)
- [ ] No real user data in tests (dummy only)
- [ ] API errors don't leak internals
- [ ] Server-side validation on all forms
- [ ] IDOR protection on new endpoints
- [ ] Rate limiting on new public endpoints
- [ ] Input validation (Zod schemas)
- [ ] Dependency audit clean

---

## Phase Gate Security Review

1. Run `npm audit --audit-level=high`
2. Run `gitleaks detect --source .`
3. Run OWASP ZAP baseline scan
4. Verify security headers via `securityheaders.com`
5. Test IDOR on all new endpoints
6. Verify DPDP compliance (consent, erasure, age-gate)
7. Document findings in security analysis doc
