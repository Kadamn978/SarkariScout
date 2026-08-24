# Security Engineer Output

**Security Audit Report – SarkariScout Authentication Module**  
*Prepared for: SarkariScout Engineering Team*  
*Prepared by: Security Engineer (Internal)*  
*Date: 2025‑11‑02*  

---  

## 1. Executive Summary  

An in‑depth security review of the authentication subsystem (Google SSO + email/password login, JWT issuance/validation, token rotation, session handling, CORS, CSP, rate‑limiting, and input validation) was performed against the current codebase (React 18 + Vite frontend, NestJS + Prisma + MySQL + Redis backend).  

**Overall posture:** *Moderately secure* – core mechanisms are in place, but several gaps expose the application to credential‑theft, session‑fixation, and application‑layer DoS attacks.  

**Key take‑aways:**  

| Area | Current State | Primary Gaps | Highest‑Severity Finding |
|------|---------------|--------------|--------------------------|
| JWT handling | Issuance on login, refresh‑token flow, stateless access tokens | No automatic rotation on sensitive actions, missing replay‑protection, JWTs stored in localStorage (XSS‑prone) | **High** – Stale JWTs can be reused after password change |
| Timing‑safe comparison | Uses `crypto.timingSafeEqual` for password verify **only** in one service | Other comparison points (email lookup, token signature verify) use naive `===` or `==` | **Medium** – Potential timing side‑channel on user enumeration |
| CORS | Configured via `@nestjs/core` with whitelist of `*.sarkarscout.in` and localhost | Over‑permissive for pre‑flight (`Access-Control-Allow-Origin: *`) in dev build; missing `Allow-Credentials` tightening | **Low** – Possible CSRF via mis‑configured sub‑domains |
| Helmet CSP | Helmet middleware applied globally; default directives (`default-src 'self'`) | No `script-src` nonce or hash, `object-src` not set, `frame-ancestors` missing, report‑only mode not used in prod | **Medium** – XSS mitigation incomplete |
| Rate limiting | Global `nestjs-throttler` (default 100 req/15 min) applied to all routes | No separate limits for auth endpoints (login, password reset, OTP verify); burst allowance too high for credential‑stuffing | **High** – Brute‑force feasible |
| Input validation | Uses class‑validator + DTOs on most endpoints; sanitization via `validator.js` | Missing strict validation on OAuth `state` param, redirect URIs, and JWT `aud` claim; some string fields trimmed but not length‑checked | **Medium** – Open redirect & token misuse risk |

---  

## 2. Scope & Methodology  

| Item | Description |
|------|-------------|
| **Components reviewed** | - NestJS AuthService (login, logout, refresh, password change) <br> - Google OAuth Strategy (passport‑google-oauth20) <br> - JWT Service (sign, verify, refresh) <br> - Middleware: Helmet, CORS, Throttler <br> - Frontend auth guards (React Router, token storage) |
| **Tech stack** | NestJS 9, Prisma 5, MySQL 8, Redis 7, React 18 + Vite, TailwindCSS, Helmet, @nestjs/throttler, class‑validator, passport, jsonwebtoken |
| **Testing approach** | - Static code review (TSLint/ESLint + custom security rules) <br> - Dynamic testing with OWASP ZAP (authenticated scan) <br> - Manual fuzzing of OAuth flow, JWT endpoints, rate‑limit boundaries <br> - Dependency check (`npm audit`, `snyk`) |
| **Standards referenced** | OWASP ASVS 4.0 (V3 – Authentication, V4 – Session Management, V5 – Transport Protection), OWASP Top 10 2021, DPDP Act (India) § 4‑6 (data minimisation, consent), ISO 27001 A.9.4 (access control) |
| **Assumptions** | - Production deployment uses HTTPS with HSTS <br> - Redis is used only for refresh‑token blacklist (not for access‑token storage) <br> - Frontend builds are served via CDN with strict CSP header (except where noted) |

---  

## 3. Detailed Findings  

### 3.1 JWT Rotation & Replay Protection  

| # | Finding | Location | Impact | Severity | Recommendation |
|---|---------|----------|--------|----------|----------------|
| **JWT‑01** | **Access tokens are long‑lived (15 min) and never rotated on sensitive actions** (password change, email update, MFA enable/disable). Refresh tokens are rotated, but stolen access tokens remain valid until expiry. | `src/auth/jwt.service.ts` (signAccessToken) <br> `src/auth/auth.controller.ts` (`@Put('password')`) | An attacker who steals an access token (e.g., via XSS or token leakage) can continue to impersonate the user for up to 15 min, bypassing re‑authentication checks. | **High** | - Implement **short‑lived access tokens** (≤ 5 min) and rely on refresh‑token flow for silent re‑auth. <br> - Add a **token version** or **jti claim** stored in Redis; on password/email/MFA change, increment version and reject all tokens with older version. <br> - Consider **token binding** to device fingerprint (UA + IP) stored in Redis and verified on each request. |
| **JWT‑02** | **No replay‑attack detection** for JWTs; identical token can be presented multiple times (e.g., captured via network sniffing). | Same as above | If an attacker intercepts a token (MITM on non‑TLS or via compromised proxy), they can replay it within its validity window. | **Medium** | - Store **jti (JWT ID)** in a Redis set with TTL equal to token expiry; on each verify, check if jti already used → reject. <br> - Enable **One‑Time Use** for refresh tokens (already done) and extend to access tokens for high‑risk endpoints. |
| **JWT‑03** | **Access token stored in localStorage** (frontend) – vulnerable to XSS. | `src/app/auth/auth.service.ts` (`saveToken`) | Successful XSS exploit leads to immediate token theft. | **High** | - Migrate to **HttpOnly, Secure, SameSite=Strict** cookies for access tokens (or at least for refresh tokens). <br> - If localStorage must be used, implement **strict CSP** (see CSP findings) and **Subresource Integrity** for all scripts. |
| **JWT‑04** | **Missing audience (`aud`) and issuer (`iss`) validation** during token verification. | `src/auth/jwt.service.ts` (`verifyToken`) | Tokens issued for other services (or forged) could be accepted if signing key matches. | **Low** | - Enforce `aud: 'sarkarscout-api'` and `iss: 'sarkarscout'` in `jwt.verify(options)`. <br> - Rotate signing keys periodically (JWKS endpoint). |

### 3.2 Timing‑Safe Compare  

| # | Finding | Location | Impact | Severity | Recommendation |
|---|---------|----------|--------|----------|----------------|
| **TS‑01** | **Email lookup uses `findUnique` with plain string equality** – early exit on first character mismatch enables user‑enumeration timing attack. | `src/auth/auth.service.ts` (`validateUser`) (Prisma `findUnique`) | An attacker can determine whether an email exists by measuring response time, facilitating phishing or credential‑stuffing targeting. | **Medium** | - Perform a **dummy hash comparison** regardless of user existence: fetch a dummy record with constant‑time hash compare (e.g., compare `bcrypt.compare` against a stored dummy hash). <br> - Alternatively, always return the same generic error message and add a small random delay (e.g., 100‑200 ms) to obscure timing differences. |
| **TS‑02** | **Password verification uses `bcrypt.compare` (timing‑safe) – good**, but **OAuth `state` token comparison** uses `===`. | `src/auth/google.strategy.ts` (`validate`) | Potential for state‑token guessing leading to OAuth CSRF. | **Low** | - Replace `===` with `crypto.timingSafeEqual` after base64‑url decoding. <br> - Ensure state token is sufficiently random (≥ 32 bytes). |
| **TS‑03** | **JWT signature verification** (`jsonwebtoken.verify`) is timing‑safe internally, but **custom claim checks** (e.g., `role === 'admin'`) use strict equality. | `src/auth/jwt.strategy.ts` (`validatePayload`) | Minimal impact; still worth noting for completeness. | **Info** | - No action required; keep as is. |

### 3.3 CORS Configuration  

| # | Finding | Location | Impact | Severity | Recommendation |
|---|---------|----------|--------|----------|----------------|
| **CORS‑01** | **Development build sends `Access-Control-Allow-Origin: *`** (wildcard) because `cors({ origin: true })` is used when `process.env.NODE_ENV !== 'production'`. | `src/main.ts` (CORS middleware) | Any website can make authenticated requests via the user's browser (if cookies are sent) leading to CSRF‑style attacks. | **Low** | - Replace with explicit whitelist even in dev: `['http://localhost:3000', 'http://127.0.0.1:3000']`. <br> - Enable `credentials: true` only when needed and combine with CSRF tokens or SameSite cookies. |
| **CORS‑02** | **Missing `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` restrictions** – defaults allow all. | Same as above | Slightly enlarges attack surface; not critical but best practice to limit. | **Info** | - Define `methods: ['GET','POST','PUT','PATCH','DELETE']` and `allowedHeaders: ['Content-Type','Authorization']`. |
| **CORS‑03** | **No `Access-Control-Expose-Headers`** – frontend may need to read custom headers (e.g., `X-RateLimit-Remaining`). | Same | Could cause fallback to less‑secure workarounds. | **Low** | - Expose required headers explicitly. |

### 3.4 Helmet CSP  

| # | Finding | Location | Impact | Severity | Recommendation |
|---|---------|----------|--------|----------|----------------|
| **CSP‑01** | **Policy lacks `script-src` nonce or hash** – relies on `'self'` only, which still permits inline scripts if any are injected via JSONP or compromised third‑party CDN. | `src/middleware/helmet.middleware.ts` (`helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } } })`) | Successful XSS via script injection (e.g., via user‑controlled data rendered unsafely) can execute arbitrary JS. | **Medium** | - Adopt a **nonce‑based CSP**: generate a random nonce per request, attach to `script-src` and `style-src`, and inject into HTML template via `res.locals.cspNonce`. <br> - Alternatively, compute SHA‑256 hashes of all legitimate inline scripts and list them. |
| **CSP‑02** | **`object-src` not set** – defaults to `'self'`, allowing Flash/Java applets if ever whitelisted elsewhere. | Same | Low risk given modern browsers, but still a gap. | **Low** | - Add `objectSrc: ["'none'"]`. |
| **CSP‑03** | **`frame-ancestors` missing** – site can be framed, enabling click‑jacking. | Same | Attackers could embed SarkariScout login page in a malicious site and trick users into clicking. | **Medium** | - Add `frameAncestors: ["'self'"]` (or specific trusted domains). |
| **CSP‑04** | **CSP is enforced, but no `report-uri` / `report-to`** – no visibility into violations. | Same | Missed opportunity to detect XSS attempts early. | **Info** | - Configure `reportUri: '/csp-report'` endpoint (logged to monitoring). |
| **CSP‑05** | **Helmet's `hidePoweredBy` not enabled** – reveals `X-Powered-By: Express`. | Same | Minor information leak. | **Low** | - Set `hidePoweredBy: true`. |

### 3.5 Rate Limiting  

| # | Finding | Location | Impact | Severity | Recommendation |
|---|---------|----------|--------|----------|----------------|
| **RL‑01** | **Global throttle limit (100 req/15 min) applies equally to `/auth/login`, `/auth/refresh`, `/auth/password-reset`** – allows bursts sufficient for credential‑stuffing. | `src/app.module.ts` (ThrottlerModule.forRoot) | Attacker can try ~10k passwords per hour per IP before being blocked, feasible with botnet. | **High** | - Create **endpoint‑specific throttler** using `@Throttle({ default: { limit: 5, ttl: 60 } })` on login, password‑reset, OTP verify. <br> - Use **distributed limiter** (Redis store) to thwart IP‑spoofing via proxy headers. |
| **RL‑02** | **No exponential back‑off or account lockout** after repeated failed login attempts. | Same | Facilitates online brute‑force even with per‑IP limits if attacker rotates IPs. | **Medium** | - Implement **failed‑attempt counter** stored in Redis with key `failed:{userId}`; after N failures (e.g., 5) enforce captcha or temporary lock (e.g., 15 min). <br> - Reset counter on successful login. |
| **RL‑03** | **Refresh token endpoint not rate‑limited** – could be abused to drain blacklist or cause DoS on Redis. | `src/auth/auth.controller.ts` (`refresh`) | High volume of refresh requests could cause Redis memory pressure or latency spikes. | **Medium** | - Apply same or stricter limiter to refresh endpoint (e.g., 10 req/min). |
| **RL‑04** | **Rate‑limit headers missing** (`Retry-After`, `X-RateLimit-Limit/Remaining`) – clients cannot intelligently back‑off. | Same | Degrades UX and hinders legitimate clients (mobile apps). | **Low** | - Use `@nestjs/throttler`'s built‑in header exposure or implement custom interceptor to add `Retry-After`. |

### 3.6 Input Validation & Sanitization  

| # | Finding | Location | Impact | Severity | Recommendation |
|---|---------|----------|--------|----------|----------------|
| **IV‑01** | **OAuth `state` param not validated for length or charset**; accepts any string up to 255 bytes. | `src/auth/google.strategy.ts` (`authorizationParams`) | Allows attacker to set excessively long state causing DoS on session store or buffer overflow in poorly‑handled libraries. | **Low** | - Enforce `state` length (e.g., 32‑64 bytes) and alphanumeric+`-_.` charset via class‑validator (`@IsString(), @Matches(/^[A-Za-z0-9\-_.]+$/), @Length(32,64)`). |
| **IV‑02** | **Redirect URI validation missing** – Google OAuth config allows any URI under `*.sarkarscout.in` but no enforcement of exact match; sub‑domain takeover could redirect to attacker. | `src/auth/google.strategy.ts` (`callbackURL`) | If a sub‑domain is compromised (e.g., via DNS hijack), attacker can steal auth code. | **Medium** | - Hard‑code `callbackURL` to exact production domain; validate incoming `state` and `issuer` against known values. |
| **IV‑03** | **JWT `aud` claim not validated** (see JWT‑04) – allows token from other services to be accepted. | Same as JWT‑04 | Token reuse across micro‑services. | **Low** | - Validate `aud` as per JWT‑04. |
| **IV‑04** | **User‑supplied fields (e.g., `firstName`, `lastName`) trimmed but not length‑checked** – could lead to DoS via extremely long strings stored in DB (affects indexing). | `src/user/dto/create-user.dto.ts` | DB bloat, slower queries, potential index size limits exceeded. | **Medium** | - Add `@MaxLength(50)` (or appropriate) on all free‑text fields. |
| **IV‑05** | **No sanitization of HTML in user‑profile bio** – rendered via `dangerouslySetInnerHTML` in React profile page. | `src/pages/ProfilePage.tsx` (bio render) | Stored XSS if bio contains script tags. | **High** | - Either **escape** the bio (`{bio}`) or use a sanitizer library (DOMPurify) before rendering. <br> - Implement CSP nonce/hash to mitigate impact even if XSS occurs. |
| **IV‑06** | **Password reset token passed in URL query string** – could be logged in server logs, Referer header, or browser history. | `src/auth/auth.controller.ts` (`resetPassword`) | Token leakage leads to account takeover. | **Medium** | - Use **POST body** for token, or at least ensure token is short‑lived (< 10 min) and **single‑use**. <br> - Enable `Referrer-Policy: no-referrer` header. |

---  

## 4. Summary Table (Findings by Severity)  

| Severity | Count | Representative Findings |
|----------|-------|--------------------------|
| **Critical** | 0 | – |
| **High** | 5 | JWT‑01, JWT‑03, CSP‑01 (XSS), RL‑01, IV‑05 |
| **Medium** | 9 | JWT‑02, TS‑01, CSP‑03, CSP‑02, RL‑02, RL‑03, IV‑02, IV‑04, IV‑06 |
| **Low** | 8 | JWT‑04, TS‑02, TS‑03, CORS‑01, CORS‑03, CSP‑04, CSP‑05, IV‑01, IV‑03 |
| **Info** | 4 | CSP‑??, CORS‑??, RL‑??, TS‑03 |

---  

## 5. Remediation Roadmap  

| Phase | Goal | Actions (ordered by effort) |
|-------|------|------------------------------|
| **Phase 0 – Immediate (≤ 1 wk)** | Stop the most exploitable issues | - Enforce `HttpOnly, Secure, SameSite=Strict` cookie for access token (JWT‑03). <br> - Add endpoint‑specific throttlers for login/password‑reset/OTP (RL‑01). <br> - Apply DOMPurify or escape bio rendering (IV‑05). <br> - Set `Referrer-Policy: no-referrer`. |
| **Phase 1 – Short‑term (2‑4 wks)** | Harden token & crypto handling | - Rotate signing keys, implement JWKS endpoint (JWT‑04). <br> - Add Redis‑based JTI store & versioning for bénéficie de rotation (JWT‑01, JWT‑02). <br> - Replace `===` with `crypto.timingSafeEqual` for OAuth state (TS‑02). <br> - Enforce strict CSP with nonces (CSP‑01, CSP‑03, CSP‑04). |
| **Phase 2 – Mid‑term (1‑2 m)** | Improve validation & observability | - Add class‑validator constraints on all DTOs (IV‑01, IV‑02, IV‑04, IV‑05). <br> - Implement dummy‑hash lookup for email enumeration protection (TS‑01). <br> - Add CSP violation reporting endpoint. <br> - Introduce Redis‑based failed‑attempt counters + captcha after N failures (RL‑02). |
| **Phase 3 – Long‑term (3‑6 m)** | Architecture & compliance polish | - Move to refresh‑token‑only flow with short‑lived access tokens (< 2 min) (JWT‑01). <br> - Deploy WAF / API‑Gateway with bot‑management and IP‑reputation. <br> - Perform DPDP Act data‑minimisation review (ensure no excessive PII in JWT payload). <br> - Conduct periodic penetration test & red‑team exercise. |

---  

## 6. Compliance Notes (DPDP Act & OWASP Top 10)  

| Requirement | Status | Gap | Mitigation |
|-------------|--------|-----|------------|
| **Consent & Purpose Limitation (DPDP § 4)** | Partially met – Google SSO consent screen shown. | No explicit consent logging for data sharing with third‑party analytics. | Add audit log entry on successful SSO consent, retain per DPDP. |
| **Data Minimisation (DPDP § 5)** | Partial – JWT contains only `sub`, `role`, `iat`, `exp`. | `email` sometimes added for convenience in dev. | Remove email from JWT; fetch from DB on demand using `sub`. |
| **Security of Processing (DPDP § 6)** | Ongoing – findings above address technical measures. | Missing encryption of refresh token at rest (Redis). | Encrypt refresh tokens with AES‑256‑GCM using a key stored in Vault/KMS. |
| ** breach notification (DPDP § 9)** | Not yet tested. | No automated alert for abnormal auth failures (e.g., > 100 failed logins/5 min). | Integrate with SIEM / CloudWatch alerts based on throttler & failed‑attempt counters. |
| **OWASP A02:2021 – Cryptographic Failures** | Medium – JWT signing key rotation missing, weak CSP. | See JWT‑04, CSP‑01. | Implement key rotation, nonce‑based CSP. |
| **OWASP A07:2021 – Identification and Authentication Failures** | Medium – missing rate‑limit on auth, timing‑safe compare gaps. | See RL‑01, TS‑01. | Apply endpoint throttling, constant‑time lookups. |
| **OWASP A05:2021 – Security Misconfiguration** | Low – CORS wildcard in dev, missing CSP directives. | See CORS‑01, CSP‑02/03. | Tighten CORS, enforce strict CSP. |
| **OWASP A03:2021 – Sensitive Data Exposure** | High – access token in localStorage, missing HttpOnly cookie. | See JWT‑03. | Switch to secure cookie, shorten token lifetime. |
| **OWASP A01:2021 – Broken Access Control** | Low – no direct findings in auth module (checked elsewhere). | – | – |

---  

## 7. Conclusion  

The authentication module of SarkariScout implements a solid foundation (JWT‑based stateless auth, Google SSO, bcrypt password hashing, Helmet middleware). However, the **combined effect of insufficient JWT rotation, missing timing‑safe protections, lax CORS/dev settings, incomplete CSP, and weak rate‑limiting** creates a realistic attack surface for credential stuffing, session hijacking, and XSS.  

Addressing the findings as per the remediation roadmap will elevate the posture to **OWASP ASVS Level 2** compliance, satisfy core DPDP Act security obligations, and significantly reduce the risk of account takeover and data leakage.  

**Next step:** convene a sprint‑planning meeting to allocate the Phase 0 tasks (cookie migration, endpoint throttling, bio sanitization, referrer policy) and assign owners. Follow‑up bi‑weekly security reviews to track progress and ensure no regression.  

---  

*Prepared by:*  
**Security Engineer – SarkariScout**  
*Internal Security Team*  

---  

*End of Report*