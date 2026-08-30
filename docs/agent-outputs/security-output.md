# Security Engineer — OWASP audits, vulnerability scanning, security review Output

# Security Audit Report – RozgarScout  
**Scope:** JWT authentication, input validation, SQL injection, rate limiting, CORS, secret management  
**Tech Stack:** React 18 + Vite + Tailwind (frontend) • NestJS + Prisma 5 + MySQL 8.4 + Redis 5.0 (backend)  

> **Methodology** – The audit is based on a review of the typical implementation patterns for the listed technologies, the public repository structure (as inferred from the description), and common OWASP‑Top‑10 findings. No live penetration testing was performed; the findings are **potential** issues that should be verified against the actual codebase.

---

## 📋 Summary of Findings  

| # | Area | Issue | Severity | Likely Location | Recommended Fix |
|---|------|-------|----------|-----------------|-----------------|
| 1 | **JWT Auth** | Access token stored in `localStorage` (or `sessionStorage`) → XSS theft risk | **High** | Frontend auth service (`src/auth/*`) | Switch to **HttpOnly, Secure, SameSite=Strict** cookies for access & refresh tokens; if localStorage is unavoidable, add strict CSP & XSS mitigations. |
| 2 | **JWT Auth** | No token revocation / refresh‑token rotation | **Medium** | Auth service (`src/auth/jwt.strategy.ts`, `refresh-token.controller.ts`) | Implement **refresh‑token rotation** + **token blacklist** (Redis) on logout / password change; enforce short‑lived access tokens (≤15 min) and rotate refresh tokens on each use. |
| 3 | **JWT Auth** | Missing audience (`aud`) / issuer (`iss`) claims validation | **Low** | JWT strategy (`jwt.strategy.ts`) | Verify `aud` (e.g., `sarkari-scout`) and `iss` (your auth server) in `JwtStrategy.validate()`. |
| 4 | **Input Validation** | Reliance on manual DTO checks or missing validation on nested objects (e.g., `Job.create`, `UserDocument.upload`) | **Medium** | DTOs (`src/*/dto/*.dtos.ts`) | Adopt **class‑validator** + **class‑transformer** globally; enable `whitelist: true` and `forbidNonWhitelisted: true`. For complex schemas, consider **Zod** or **joi**. |
| 5 | **SQL Injection** | Use of raw queries (`Prisma.$queryRaw`) without proper parameterisation in admin/reporting endpoints | **High** | Any service using `$queryRaw` or `$executeRaw` (e.g., `src/report/report.service.ts`) | **Never** concatenate user input into SQL strings. Use Prisma’s typed API or, if raw is unavoidable, pass values via **parameter placeholders** (`?`) and let Prisma handle escaping. |
| 6 | **Rate Limiting** | No global rate limiter; only ad‑hoc throttling on auth endpoints | **Medium** | Main module (`src/app.module.ts`) | Install `@nestjs/throttler` (or `express-rate-limit`) and configure: <br>• **Global**: 100 req/min per IP <br>• **Auth**: 5 req/min per IP (login) <br>• **Refresh**: 10 req/min per IP <br>• **API**: 30 req/min per authenticated user (via `UserId` guard). |
| 7 | **CORS** | Wildcard origin (`*`) enabled in development and possibly leaked to production via env override | **Medium** | Main NestJS bootstrap (`main.ts`) | Replace `origin: true` with a **whitelist** of allowed origins (e.g., `https://sarkarscout.in`, `https://app.sarkarscout.in`). In production, set `credentials: true` only if cookies are used. |
| 8 | **Secret Management** | JWT secret, DB credentials, and OAuth client secrets stored in plain `.env` committed to repo (or visible in Dockerfiles) | **High** | `.env`, `docker-compose.yml`, CI configs | • Add `.env` to `.gitignore`. <br>• Use **environment‑specific secret stores** (AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets). <br>• In CI/CD, inject secrets as masked variables. <br>• Rotate OAuth client secrets quarterly. |
| 9 | **Transport Security** | Missing `Helmet` middleware (no CSP, HSTS, X‑Frame‑Options, etc.) | **Low** | `main.ts` | Install `@nestjs/helmet` and enable: <br>• `helmet()` <br>• `hsts({ maxAge: 31536000, includeSubDomains: true })` <br>• `contentSecurityPolicy({ directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", "data:", "https:"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"] } })` (adjust for Tailwind/JIT). |
|10| **Session / Cookie Settings** | If cookies are used, missing `Secure; SameSite=Strict; HttpOnly` flags | **Medium** | Auth cookie setter (`auth.service.ts`) | Ensure cookies are set with: `Secure: true` (HTTPS only), `SameSite: 'Strict'`, `HttpOnly: true`. |
|11| **Refresh Token Storage** | Refresh token stored in plain DB column without hashing | **Medium** | `User` entity (`refreshToken` column) | Store a **bcrypt/argon2** hash of the refresh token; compare hash on verification. |
|12| **Error Handling** | Stack traces or DB error messages returned to client in 500 responses | **Low** | Global exception filter (`all-exceptions.filter.ts`) | Catch exceptions, log internally, and return a generic message (`"Internal server error"`). Do not expose Prisma or MySQL details. |

---

## 🔧 Detailed Remediation Guidance  

### 1. JWT Authentication  
| Problem | Fix |
|---------|-----|
| **Token storage in localStorage** – vulnerable to XSS. | Move to **HttpOnly, Secure, SameSite=Strict** cookies. If you must keep tokens in JS storage (e.g., for SPA refresh), implement a **strict Content‑Security‑Policy** and sanitize all user‑generated content. |
| **No refresh‑token rotation** – stolen refresh token can be reused indefinitely. | On each refresh request: <br>1. Verify the token’s hash against stored hash.<br>2. Issue a **new** refresh token (hash & store).<br>3. **Delete/blacklist** the old token (Redis SET with TTL = old token’s expiry). |
| **Missing audience/issuer validation** – tokens from other services could be accepted. | In `JwtStrategy.validate(payload)`, add: <br>`if (payload.iss !== process.env.JWT_ISSUER || !payload.aud.includes(process.env.JWT_AUDIENCE)) throw new UnauthorizedException();` |
| **Short access token but no replay protection** – token can be used after password change. | Maintain a **token version** (e.g., `authVersion` column on User). Increment on password/email change; include `authVersion` in JWT payload and reject if mismatch. |

### 2. Input Validation  
* Use **class-validator** decorators on every DTO (`@IsString()`, `@IsEmail()`, `@IsOptional()`, `@IsInt({ min: 1 })`, etc.).  
* Enable global validation pipe:  

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    forbidUnknownValues: true,
  })
);
```

* For nested objects (e.g., `Job.create({ requirements: [...] })`), create **nested DTOs** and apply `@ValidateNested()` + `@Type(() => RequirementDto)`.  

* Consider **Zod** for runtime schema validation if you prefer a functional approach; it integrates nicely with NestJS via `zod-to-ts` or custom pipes.

### 3. SQL Injection Prevention  
* **Never** use string interpolation with user data in `$queryRaw`.  
* If raw SQL is unavoidable (e.g., complex reporting), use **parameterised queries**:  

```ts
const results = await prisma.$queryRaw`
  SELECT * FROM jobs WHERE location = ${location} AND posted_at > ${since}
`;
```

* Prefer Prisma’s **type‑safe query builder** (`prisma.job.findMany({ where: { location, postedAt: { gt: since } } })`).  
* Add a **lint rule** (e.g., `eslint-plugin-security`) to flag `$queryRaw`/`$executeRaw` usage without a comment explaining safety.

### 4. Rate Limiting  
* Install `@nestjs/throttler`:  

```bash
npm i @nestjs/throttler
```

* Register globally:  

```ts
ThrottlerModule.forRoot([
  {
    ttl: 60,
    limit: 100, // per IP
  },
]),
```

* Override for specific routes via `@Throttle({ default: false })` or custom limits:  

```ts
@Throttle({ short: { ttl: 60, limit: 5 } }) // login
@Post('login')
async login(@Body() dto: LoginDto) { … }
```

* For authenticated users, create a **custom guard** that extracts `userId` and uses it as the throttler key (prevents one user from exhausting IP‑based limits).  

* Monitor throttler metrics via Redis (`throttler` store) and alert on spikes.

### 5. CORS Hardening  
* Replace the permissive setup:  

```ts
app.enableCors({
  origin: [
    'https://sarkarscout.in',
    'https://app.sarkarscout.in',
    // add staging/dev origins as needed
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

* In production, **disable** `origin: true` and **do not** allow `Access-Control-Allow-Origin: *` when `credentials: true`.  

* Test with a tool like **curl** or **Postman** to confirm that requests from unauthorized origins are blocked (`403` or CORS error).

### 6. Secret Management  
| Item | Action |
|------|--------|
| `.env` file | Add to `.gitignore`. Provide a `.env.example` with placeholder values. |
| Docker / Kubernetes | Use **secret mounts** (`docker run --env-file` is discouraged; prefer `--secret` or K8s `Secret` objects). |
| CI/CD (GitHub Actions, GitLab CI) | Store secrets as **encrypted variables**; mask logs (`::add-mask::${{ secrets.JWT_SECRET }}`). |
| Rotation | Implement a **secret rotation script** that updates JWT secret, DB password, and OAuth client secrets, then redeploys. Keep the old secret valid for a short grace period (e.g., 2 h) to avoid downtime. |
| Auditing | Periodically run `git log -p -S "SECRET"` or `git-secrets` scan to ensure no secrets have been committed. |

### 7. Additional Hardening (Low‑effort, high‑impact)  
* **Helmet** – as noted, adds CSP, HSTS, XSS protection.  
* **Response Headers** – remove `X-Powered-By` (`app.use helmet.hidePoweredBy()`).  
* **Database** – enforce **SSL/TLS** for MySQL connections (`?sslMode=REQUIRED` in connection string).  
* **Logging** – never log raw tokens, passwords, or PII. Use a structured logger (Winston/Pino) with redaction.  
* **Dependency Scanning** – run `npm audit` and `npm outdated` regularly; consider **Dependabot** or **Snyk**.  
* **Static Analysis** – integrate **ESLint security plugin** and **SonarQube** (or similar) into CI.  
* **Pen‑Testing** – schedule quarterly external pen‑test focusing on auth flows, IDOR, and API abuse.

---

## ✅ Action Plan (Suggested Timeline)

| Week | Activity |
|------|----------|
| **1** | - Add `.env` to `.gitignore`; create `.env.example`.<br>- Enable global `ValidationPipe` with whitelist/forbid.<br>- Install and configure `@nestjs/throttler` (global + auth‑specific limits). |
| **2** | - Replace JWT storage with HttpOnly cookies; implement refresh‑token rotation + Redis blacklist.<br>- Add audience/issuer validation to `JwtStrategy`. |
| **3** | - Audit all `$queryRaw`/`$executeRaw` calls; replace with Prisma query builder or parameterised placeholders.<br>- Add lint rule to prevent future raw‑SQL misuse. |
| **4** | - Harden CORS (whitelist origins, disable credentials wildcard).<br>- Install `@nestjs/helmet` and configure CSP/HSTS. |
| **5** | - Migrate refresh token column to store argon2 hash; update auth service accordingly.<br>- Implement secret injection via Docker/K8s secrets; remove plain `.env` from images. |
| **6** | - Run dependency audit (`npm audit`, `snyk test`).<br>- Add global exception filter that strips stack traces.<br>- Conduct internal QA: verify login, refresh, JWT cookie behavior, rate‑limit responses, CORS preflight. |
| **7+** | - Schedule external pen‑test.<br>- Set up secret rotation cron job.<br>- Document security headers and monitoring alerts (rate‑limit throttler, failed auth spikes). |

---

## 📚 References & Tools  

| Topic | Resource |
|-------|----------|
| NestJS JWT & Guards | <https://docs.nestjs.com/security/authentication> |
| class-validator | <https://github.com/typestack/class-validator> |
| Zod validation | <https://zod.dev/> |
| Prisma Raw Queries Safety | <https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access> |
| @nestjs/throttler | <https://github.com/nrwl/nx/tree/master/packages/nest/throttler> |
| Helmet for NestJS | <https://docs.nestjs.com/middleware#helmet-middleware> |
| OWASP Authentication Cheat Sheet | <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html> |
| OWASP Input Validation Cheat Sheet | <https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html> |
| OWASP Rate Limiting Cheat Sheet | <https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html> |
| Secret Management (AWS Secrets Manager) | <https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html> |
| Docker Secrets | <https://docs.docker.com/engine/swarm/secrets/> |
| Kubernetes Secrets | <https://kubernetes.io/docs/concepts/configuration/secret/> |

---

### 🎯 Bottom Line  

By addressing the items above—especially moving JWT storage to secure cookies, enforcing strict input validation, eliminating raw SQL, implementing global rate limiting, locking down CORS, and managing secrets through a vault‑style system—RozgarScout will move from a **potentially vulnerable** state to a **defensible, production‑grade** security posture aligned with OWASP best practices.  

Feel free to ask for deeper dive‑into any specific module (e.g., OAuth flow, document wallet file uploads, or bug‑report handling) if you need concrete code snippets. Happy securing!