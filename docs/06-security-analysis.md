# 06 — Security Analysis

**Version:** 1.0 · **Standard:** OWASP Top 10 (2021) + India DPDP Act 2023 · **Review:** pre-launch security pass + quarterly

---

## 1. Assets & trust boundaries

| Asset | Sensitivity | Where |
|---|---|---|
| User PII (email, name, DOB, category, district) | High (DPDP personal data) | Postgres (Neon), encrypted at rest (provider-managed) |
| Passwords | Critical | bcrypt (cost 12) — never stored plain |
| Session tokens | Critical | JWT (short-lived) + refresh token (httpOnly cookie, rotation) |
| Source credentials (NCS/NAPIX keys, email API keys) | Critical | env/secrets manager only, never in repo or logs |
| Job data | Public | Postgres (public reads OK) |
| Payment records | High | Razorpay (we never store card data — PCI out of scope) |

## 2. OWASP Top 10 mapping

| OWASP | Our control |
|---|---|
| A01 Broken Access Control | RBAC (user/admin), ownership checks on all resources (userId scoping), route guards, no IDOR — tested in E2E |
| A02 Cryptographic Failures | TLS 1.2+ everywhere, bcrypt for passwords, Argon2id optional, JWT with HS256/ES256, secure env storage |
| A03 Injection | Prisma parameterized queries; Zod validation on every input; no raw SQL; CSP headers |
| A04 Insecure Design | Threat-model review per module; rate limits; quota caps (alerts, crawls); admin approval for dangerous ops |
| A05 Security Misconfiguration | No default creds; strict CORS (allowlist); HSTS; security headers; env templates with no secrets; automated dependency audit (npm audit in CI) |
| A06 Vulnerable Components | Renovate/Dependabot auto-update PRs; pinned lockfiles; `npm audit` gate in CI |
| A07 Auth Failures | Email verification, OTP lockout (5 tries → 15 min), refresh-token rotation + reuse detection, password reset tokens 15-min expiry, logout all devices |
| A08 Software/Data Integrity | Signed webhooks (Razorpay signature verify), checksum on ingest payloads, immutable change-log for jobs |
| A09 Logging & Monitoring | Structured logs (no PII), alert on anomalies (failed logins, source failures), audit trail for admin actions |
| A10 SSRF | **Scraping = SSRF surface.** Crawler fetches only allowlisted domains from a registry; no user-supplied URLs ever fetched server-side; redirects validated; DNS pinning to expected IPs |

## 3. Application-level controls

- **Rate limiting:** per-IP + per-user (Redis sliding window): auth 10/min, search 60/min, ingest admin 30/min.
- **Captcha** on registration + password reset (Cloudflare Turnstile free) to stop bot accounts.
- **CSRF:** same-site cookies + origin checks for state-changing API calls.
- **XSS:** React default escaping, strict CSP, sanitize all scraped content server-side (DOMPurify) before render — scraped HTML is untrusted input!
- **Clickjacking:** X-Frame-Options DENY / frame-ancestors 'none'.
- **Secrets:** `.env.example` only; real secrets in Render/Neon/Upstash dashboards; secret scanner in CI (gitleaks).
- **Email security:** SPF + DKIM + DMARC on sending domain; double opt-in for digest/instant; one-click unsubscribe (RFC 8058); bounce handling.

## 4. India DPDP Act 2023 compliance (built-in, not bolted-on)

| Requirement | Implementation |
|---|---|
| Notice & consent | Consent screen at signup (plain language, what we collect + why); separate consent for notifications; withdraw anytime |
| Purpose limitation | Data used only for matching + notifications; never sold/shared (affiliate links are click-tracking only, no PII passed) |
| Data minimization | We store only what matching needs (no phone unless user adds; no location tracking) |
| Accuracy | Profile edit self-service; deletion = full purge |
| Storage limitation | Retention policy: inactive account auto-purge after 24 months (configurable) |
| DPIA | Simple DPIA recorded pre-launch (this doc + BRD) |
| Breach notification | Incident plan below; notify regulator + users within required window |
| Rights | SAR (access), correction, erasure, portability (JSON export) endpoints in admin/API |
| Children | Age-gate: govt jobs require 18+; profile builder enforces DOB ≥ 18 |

## 5. Data-flow protections

```
Browser ──TLS──▶ API (WAF/lambda edge optional) ──▶ Zod validate ──▶ AuthZ ──▶ DB
Scraper ──▶ allowlisted domains only (SSRF control) ──▶ sanitize HTML ──▶ DB
Email API key: server-side only, never in frontend bundle
```

## 6. Testing security (in test plan)

- Unit: password hashing, JWT expiry/rotation, Zod schemas, dedup fingerprint collision, date/TZ edge cases
- Integration: auth flows, ownership (IDOR) probes, rate-limit enforcement, webhook signature rejection
- E2E (real browser): XSS payload in profile renders inert; unauth user can't open /admin; scrape-sourced HTML injection attempt sanitized

## 7. Incident response plan (breach or abuse)

1. **Detect** → monitoring alerts (failed-login spike, unusual egress, uptime drops)
2. **Contain** → revoke tokens (jti blocklist), disable affected keys, isolate worker
3. **Assess** → determine scope + data affected (logs are PII-free by design)
4. **Notify** → users + DPDP authority per timelines; public statement if required
5. **Remediate** → fix root cause, rotate all secrets, re-run security suite
6. **Post-mortem** → document in this file's change log; adjust controls

## 8. Pre-launch security checklist (gate to go-live)

### Authentication & Authorization
- [ ] Passwords hashed with argon2id/bcrypt (cost ≥12)
- [ ] No plain text passwords in DB
- [ ] JWT access token: short-lived (15 min)
- [ ] Refresh token rotation with reuse detection
- [ ] httpOnly cookies (not localStorage)
- [ ] Email verification required
- [ ] OTP lockout: 5 tries → 15 min
- [ ] Password reset: 15-min token expiry
- [ ] Logout invalidates all sessions (jti blocklist)

### IDOR Protection
- [ ] Every endpoint checks user ownership
- [ ] User A cannot access User B's data
- [ ] Admin endpoints have RBAC
- [ ] ParseUUIDPipe on all :id params

### Rate Limiting
- [ ] Auth endpoints: 10/min per IP
- [ ] Search: 60/min per user
- [ ] Data ingestion: 30/min admin
- [ ] Invite/join: 5/min (treated as credential)
- [ ] Password reset: 3/hour

### Input Validation
- [ ] Zod validation on every input
- [ ] Prisma parameterized queries (no raw SQL)
- [ ] CSP headers configured
- [ ] DOMPurify on scraped/untrusted content
- [ ] XSS payload test in profile fields

### Data Protection
- [ ] TLS 1.2+ everywhere
- [ ] Sensitive fields encrypted (AES-256-GCM)
- [ ] No secrets in code (gitleaks clean)
- [ ] .env.example only (no real secrets)
- [ ] API errors don't leak stack traces

### Infrastructure
- [ ] Docker ports bound to 127.0.0.1 (dev only)
- [ ] CORS allowlist configured
- [ ] Security headers (helmet)
- [ ] HSTS enabled
- [ ] X-Frame-Options DENY
- [ ] npm audit clean

### Email Security
- [ ] SPF + DKIM + DMARC configured
- [ ] One-click unsubscribe (RFC 8058)
- [ ] Bounce handling (3x → auto-mute)
- [ ] Double opt-in for digest

### Compliance (DPDP / GDPR / applicable)
- [ ] Consent screen at signup
- [ ] Data minimization (only what's needed)
- [ ] Account deletion flow (full purge)
- [ ] Age gate (if applicable)
- [ ] Privacy policy link

### Automated Security Tools
- [ ] npm audit clean / known-vuln exceptions reviewed
- [ ] gitleaks scan clean
- [ ] OWASP ZAP baseline scan: no HIGH/CRITICAL findings
- [ ] Dependency update PRs merged
- [ ] Security headers verified via `securityheaders.com` (score ≥ A)

## 9. Pentest scenarios (run at each phase gate)

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

## 10. How to run security checks

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

### Change log
| Date | Change |
|---|---|
| Aug 20, 2026 | Baseline security analysis |
| Aug 21, 2026 | Added comprehensive security checklist, pentest scenarios, automated tool commands (from TrailSync, Hawkeye reference projects) |