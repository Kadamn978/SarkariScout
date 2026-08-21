# Security Checklist — Generic Project Template

**Source:** TrailSync, Hawkeye Mockingbird agent, OWASP Top 10
**Usage:** Copy this checklist into your project. Customize the "Where" column for your stack.

---

## Pre-Launch Security Gate (must pass ALL)

### Authentication & Authorization
- [ ] Passwords hashed with argon2id/bcrypt (cost ≥12)
- [ ] No plain text passwords in DB
- [ ] JWT access token: short-lived (15 min recommended)
- [ ] Refresh token rotation with reuse detection
- [ ] httpOnly cookies for tokens (not localStorage)
- [ ] Email verification required
- [ ] Account lockout after failed attempts (5 tries → 15 min)
- [ ] Password reset: token expiry (15 min)
- [ ] Logout invalidates all sessions (jti blocklist)

### IDOR Protection
- [ ] Every endpoint checks user ownership
- [ ] User A cannot access User B's data
- [ ] Admin endpoints have RBAC
- [ ] Input validation on all :id params (UUID format)

### Rate Limiting
- [ ] Auth endpoints: 10/min per IP
- [ ] Search/list: 60/min per user
- [ ] Data ingestion: 30/min admin
- [ ] Sensitive operations: 5/min
- [ ] Password reset: 3/hour

### Input Validation
- [ ] Schema validation on every input (Zod, Joi, etc.)
- [ ] Parameterized queries (no raw SQL)
- [ ] CSP headers configured
- [ ] Sanitize untrusted content (DOMPurify, etc.)
- [ ] XSS payload test in all user inputs

### Data Protection
- [ ] TLS 1.2+ everywhere
- [ ] Sensitive fields encrypted at rest (AES-256-GCM)
- [ ] No secrets in code (gitleaks/trufflehog clean)
- [ ] .env.example only (no real secrets in repo)
- [ ] API errors don't leak stack traces

### Infrastructure
- [ ] Docker ports bound to 127.0.0.1 (dev only)
- [ ] CORS allowlist configured
- [ ] Security headers (helmet, etc.)
- [ ] HSTS enabled
- [ ] X-Frame-Options DENY
- [ ] Dependency audit clean (npm audit, pip audit, etc.)

### Email Security (if applicable)
- [ ] SPF + DKIM + DMARC configured
- [ ] One-click unsubscribe (RFC 8058)
- [ ] Bounce handling (3x → auto-mute)
- [ ] Double opt-in for notifications

### Compliance (DPDP / GDPR / applicable)
- [ ] Consent screen at signup
- [ ] Data minimization (only what's needed)
- [ ] Account deletion flow (full purge)
- [ ] Age gate (if applicable)
- [ ] Privacy policy link

---

## Pentest Scenarios (run at each phase gate)

### Auth Tests
- [ ] Register with existing email → error
- [ ] Login wrong password 5x → locked
- [ ] Access protected route without token → 401
- [ ] Use expired token → 401
- [ ] Use refresh token twice → rejected

### IDOR Tests
- [ ] Get another user's data → 403
- [ ] Modify another user's data → 403

### Injection Tests
- [ ] SQL injection in search → blocked
- [ ] XSS in profile fields → rendered inert
- [ ] CSRF on state-changing endpoint → blocked

### Rate Limit Tests
- [ ] Exceed auth rate limit → blocked
- [ ] Exceed search rate limit → blocked

### SSRF Tests (if scraping)
- [ ] Unknown domain in feed → rejected
- [ ] Redirect to internal IP → blocked
- [ ] Oversized feed → quarantined

---

## How to Run

```bash
# npm audit
npm audit --audit-level=high

# Gitleaks secret scan
gitleaks detect --source . --verbose

# OWASP ZAP baseline
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

# Security headers check
curl -I http://localhost:3000 | grep -E "(X-Frame|HSTS|CSP)"
```

---

## Industry-Standard Compulsory Checks

From Hawkeye QA Agent — apply to EVERY PR:

1. **No inline CSS** — styling in stylesheets only
2. **No secrets committed** — API keys, tokens, passwords
3. **No silent failure** — functions must surface errors
4. **Dependency freshness** — CVE-based, not age-based
5. **No real user data in tests** — dummy data only
6. **API errors don't leak internals** — no stack traces to client
7. **Server-side validation on all forms** — client-side is supplementary

---

## References

- OWASP Top 10 (2021)
- India DPDP Act 2023
- TrailSync security patterns
- Hawkeye Mockingbird agent
- NIST Cybersecurity Framework
