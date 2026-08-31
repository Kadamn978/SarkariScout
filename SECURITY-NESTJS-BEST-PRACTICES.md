# Security & NestJS Best Practices — RozgarScout

**Stack:** NestJS 10 + Prisma 5 + MySQL 8.4 + Redis 7 + React 18 + Tailwind CSS v4  
**Last Updated:** 2026-08-31  
**Owner:** RozgarScout Engineering

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Password Security](#2-password-security)
3. [Input Validation](#3-input-validation)
4. [Rate Limiting](#4-rate-limiting)
5. [API Security](#5-api-security)
6. [Database Security](#6-database-security)
7. [Redis Security](#7-redis-security)
8. [Deployment Security](#8-deployment-security)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [Testing Security](#10-testing-security)
11. [OWASP Top 10:2025 Compliance](#11-owasp-top-102025-compliance)
12. [Overnight Agent QA Template](#12-overnight-agent-qa-template)
13. [Competitor Scraping Strategies](#13-competitor-scraping-strategies)
14. [Recommended NPM Packages](#14-recommended-npm-packages)

---

## 1. Authentication & Authorization

### 1.1 JWT Access + Refresh Tokens in HttpOnly Cookies

**Implementation:** `backend/src/modules/auth/auth.controller.ts:30-47`

```typescript
// Tokens are set as HttpOnly cookies — never accessible via JavaScript
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,        // No JS access (XSS protection)
    secure: isProd,        // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/',
    domain: COOKIE_DOMAIN,
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: COOKIE_DOMAIN,
  })
}
```

**Guard extracts tokens from both cookies and Authorization header:** `backend/src/modules/auth/jwt-auth.guard.ts:23-33`

```typescript
private extractToken(request: Request): string | undefined {
  // 1. Try Authorization header (backward compat / API clients)
  const [type, headerToken] = request.headers.authorization?.split(' ') ?? []
  if (type === 'Bearer' && headerToken) return headerToken

  // 2. Try HttpOnly cookie (browser sessions)
  const cookieToken = request.cookies?.access_token
  if (cookieToken) return cookieToken

  return undefined
}
```

### 1.2 Token Rotation with Reuse Detection

**Implementation:** `backend/src/modules/auth/auth.service.ts:101-127`

```typescript
async refreshTokens(refreshToken: string) {
  const payload = await this.jwt.verifyAsync(refreshToken)

  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('Invalid token type')
  }

  const stored = await this.redis.get(`refresh:${payload.sub}`)
  if (!stored || !this.timingSafeCompare(stored, refreshToken)) {
    // Potential token reuse — invalidate ALL tokens for this user
    if (stored) {
      await this.redis.del(`refresh:${payload.sub}`)
    }
    throw new ForbiddenException('Invalid refresh token')
  }

  // Token rotation: generate new pair, store in Redis
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: { emailVerifiedAt: true }
  })
  const newTokens = await this.generateTokens(
    payload.sub, payload.email, payload.role, user?.emailVerifiedAt
  )
  await this.redis.set(`refresh:${payload.sub}`, newTokens.refreshToken, 604800)
  return newTokens
}
```

**Key security properties:**
- Timing-safe comparison prevents timing attacks (`auth.service.ts:292-305`)
- Reuse detection: if a stolen refresh token is used after rotation, all sessions are killed
- Each user has only ONE valid refresh token at a time (stored in Redis)

### 1.3 Google OAuth 2.0

**Implementation:** `backend/src/modules/auth/google.strategy.ts` + `google-auth.controller.ts`

```typescript
// Strategy config — scopes limited to email + profile only
super({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  scope: ['email', 'profile'],
})

// Callback sets HttpOnly cookies just like email/password login
async googleCallback(@Request() req: any, @Res() res: Response) {
  const { id, email, name } = req.user
  // ... generate tokens, set cookies, redirect to frontend
}
```

### 1.4 Session Fingerprinting

**Implementation:** `backend/src/common/middleware/fingerprint.middleware.ts`

```typescript
// Generates fingerprint from UA + Accept-Language + Accept-Encoding
const raw = `${ua}|${acceptLang}|${acceptEnc}`
const fingerprint = crypto.createHash('sha256').update(raw).digest('hex')

// Stores fingerprint per session in Redis (7-day TTL)
const sessionKey = `session:${crypto.createHash('sha256').update(sessionId).digest('hex')}`
this.redis.get(sessionKey).then((storedFp) => {
  if (storedFp && storedFp !== fingerprint) {
    this.logger.warn(`Fingerprint mismatch for session`)
  } else if (!storedFp) {
    this.redis.set(sessionKey, fingerprint, 604800)
  }
})
```

### 1.5 Email Verification

**Implementation:** `backend/src/modules/auth/auth.service.ts:139-179`

```typescript
async sendVerificationEmail(userId: string, email: string) {
  const token = randomUUID()
  await this.redis.set(`verify:${token}`, userId, 86400) // 24 hours

  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`
  await this.emailService.sendEmail({
    to: email,
    subject: 'RozgarScout - Verify your email',
    html: `...`,
  })
}

// Login blocked until email verified
if (!user.emailVerifiedAt) {
  this.sendVerificationEmail(user.id, user.email).catch(...)
  throw new UnauthorizedException(
    'Please verify your email before logging in. A new verification link has been sent.',
  )
}
```

### 1.6 Password Reset

**Implementation:** `backend/src/modules/auth/auth.service.ts:183-223`

```typescript
async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  // Always return same message to prevent email enumeration
  if (!user) return { message: 'If email exists, reset link sent' }

  const token = randomUUID()
  await this.redis.set(`reset:${token}`, user.id, 900) // 15 minutes

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`
  // ... send email

  return { message: 'If email exists, reset link sent' } // Same message regardless
}

async resetPassword(token: string, newPassword: string) {
  const userId = await this.redis.get(`reset:${token}`)
  if (!userId) throw new GoneException('Invalid or expired reset token')

  const passwordHash = await argon2.hash(newPassword, { memoryCost: 65536, timeCost: 3 })
  await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })

  // Invalidate ALL refresh tokens for this user
  await this.redis.del(`refresh:${userId}`)
  await this.redis.del(`reset:${token}`)
}
```

### 1.7 Account Lockout with Exponential Backoff

**Implementation:** `backend/src/modules/auth/auth.service.ts:225-252`

```typescript
private async handleFailedLogin(email: string) {
  const lockKey = `lock:${email.toLowerCase()}`
  const failKey = `exp_fail:${email.toLowerCase()}`
  const attempts = await this.redis.incr(lockKey)
  const failCount = await this.redis.incr(failKey)

  if (attempts === 1) await this.redis.expire(lockKey, 900)
  if (failCount === 1) await this.redis.expire(failKey, 86400)

  // Exponential backoff thresholds
  const lockoutThresholds = [
    { failures: 5,  lockoutMinutes: 15 },      // 5 fails  → 15 min lock
    { failures: 10, lockoutMinutes: 60 },      // 10 fails → 1 hour lock
    { failures: 15, lockoutMinutes: 1440 },    // 15 fails → 24 hour lock
  ]

  for (let i = lockoutThresholds.length - 1; i >= 0; i--) {
    if (failCount >= lockoutThresholds[i].failures) {
      const lockoutMinutes = lockoutThresholds[i].lockoutMinutes
      await this.redis.set(lockKey, failCount.toString(), lockoutMinutes * 60)
      break
    }
  }
}
```

**Dedicated guard for brute-force protection:** `backend/src/common/guards/exponential-throttle.guard.ts`

```typescript
// Sets X-RateLimit-Remaining and X-RateLimit-Reset headers
response.setHeader('X-RateLimit-Remaining', remainingAttempts.toString())
response.setHeader('X-RateLimit-Reset', Math.ceil(expiryTime / 1000).toString())
```

### 1.8 Role-Based Access Control (RBAC)

**Implementation:** `backend/src/modules/auth/roles.guard.ts` + `roles.decorator.ts`

```typescript
// Usage on controller methods:
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
async crawlSource(@Param('sourceId') sourceId: string) { ... }
```

### 1.9 Timing-Safe Comparison

**Implementation:** `backend/src/modules/auth/auth.service.ts:292-305`

```typescript
// Prevents timing attacks on token comparison
private timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    const maxLen = Math.max(bufA.length, bufB.length)
    const paddedA = Buffer.alloc(maxLen, 0)
    const paddedB = Buffer.alloc(maxLen, 0)
    bufA.copy(paddedA)
    bufB.copy(paddedB)
    timingSafeEqual(paddedA, paddedB) // Constant-time even for length mismatch
    return false
  }
  return timingSafeEqual(bufA, bufB)
}
```

### 1.10 Dummy Hash for Email Enumeration Prevention

**Implementation:** `backend/src/modules/auth/auth.service.ts:20-21, 76-78`

```typescript
// Even when user doesn't exist, argon2.verify runs against a dummy hash
// This prevents timing-based email enumeration
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

const hashToVerify = user?.passwordHash || DUMMY_HASH
const valid = await argon2.verify(hashToVerify, passwordToVerify)
if (!user || !valid) {
  await this.handleFailedLogin(identifier)
  throw new UnauthorizedException('Invalid credentials') // Same message for both cases
}
```

---

## 2. Password Security

### 2.1 OWASP 2024 Guidelines

**Current policy (enforced in DTO):** `backend/src/modules/auth/auth.dto.ts:44-48`

```typescript
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, {
  message: 'Password must contain uppercase, lowercase, number, and special character',
})
```

**OWASP 2024 recommendation (to adopt):**

| Rule | Current | OWASP 2024 |
|------|---------|------------|
| Min length | 8 | **8** (minimum) |
| Max length | 32 | **64** (increase) |
| Composition rules | Require upper+lower+digit+special | **Remove** — length is the primary security factor |
| Max consecutive chars | Not checked | 3+ identical chars rejected |
| Breach dictionary | HIBP k-anonymity | ✅ Already implemented |

**Recommended change:** Remove the `@Matches` regex composition rule. Rely on zxcvbn score >= 3 + HIBP check instead. Composition rules reduce usability without meaningfully improving security.

### 2.2 argon2id Configuration

**Implementation:** `backend/src/modules/auth/auth.service.ts:48`

```typescript
const passwordHash = await argon2.hash(dto.password, {
  memoryCost: 65536,  // 64 MB memory
  timeCost: 3,        // 3 iterations
  // type: argon2.argon2id (default)
  // parallelism: 1 (default)
})
```

**OWASP recommended config:**
```typescript
{
  type: argon2.argon2id,
  memoryCost: 65536,   // 64 MB
  timeCost: 3,
  parallelism: 1,
  saltLength: 16,
  hashLength: 32,
}
```

### 2.3 Leaked Password Check (HIBP k-anonymity)

**Implementation:** `backend/src/common/validation/password-strength.ts:57-84`

```typescript
private async checkPwnedPassword(password: string): Promise<{ pwned: boolean; count: number }> {
  // SHA-1 the password, send only first 5 chars to HIBP API
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)

  const response = await fetch(`${HIBP_API}/${prefix}`)
  const text = await response.text()
  const lines = text.split('\n')

  for (const line of lines) {
    const [hashSuffix, count] = line.split(':')
    if (hashSuffix?.trim() === suffix) {
      return { pwned: true, count: parseInt(count?.trim() || '0', 10) }
    }
  }
  return { pwned: false, count: 0 }
}
```

**Why k-anonymity:** The full password hash never leaves the server. HIBP only sees the prefix, and the suffix comparison happens client-side.

### 2.4 zxcvbn Strength Estimation

**Implementation:** `backend/src/common/validation/password-strength.ts:21-37`

```typescript
async evaluatePassword(password: string): Promise<PasswordStrengthResult> {
  const result = (zxcvbn as any).default
    ? (zxcvbn as any).default(password)
    : (zxcvbn as any)(password)

  const isPwned = await this.checkPwnedPassword(password)

  return {
    score: result.score,           // 0-4 scale
    feedback: {
      warning: result.feedback.warning || '',
      suggestions: result.feedback.suggestions || [],
    },
    isPwned: isPwned.pwned,
    pwnedCount: isPwned.count,
  }
}

// Enforced during registration:
if (result.score < 3) {
  throw new BadRequestException(
    `Password is too weak (score: ${result.score}/4). Suggestions: ${suggestions}`,
  )
}
```

**zxcvbn scoring:**
| Score | Meaning | Action |
|-------|---------|--------|
| 0 | Too guessable | Reject |
| 1 | Very guessable | Reject |
| 2 | Somewhat guessable | Reject |
| 3 | Safely unguessable | **Accept** |
| 4 | Very unguessable | Accept |

### 2.5 Disposable Email Detection

**Implementation:** `backend/src/common/validation/disposable-emails.ts` + `auth.service.ts:38-41`

```typescript
// 200+ disposable email domains blocked
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'mailinator.com', 'guerrillamail.com', 'yopmail.com', '10minutemail.com',
  'tempmail.com', 'throwaway.email', 'maildrop.cc', 'trashmail.com',
  // ... 200+ domains
])

// Checked during registration:
const emailDomain = dto.email.toLowerCase().trim().split('@')[1]
if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
  throw new ConflictException('Disposable email addresses are not allowed')
}
```

**Applied as middleware:** `backend/src/app.module.ts:52-53`

```typescript
consumer
  .apply(TempEmailGuard)
  .forRoutes({ path: 'auth/register', method: RequestMethod.POST })
```

---

## 3. Input Validation

### 3.1 Global ValidationPipe

**Implementation:** `backend/src/main.ts:86-94`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Strip unknown properties
    forbidNonWhitelisted: true, // Throw 400 for unknown properties
    transform: true,            // Auto-transform payloads to DTO instances
    forbidUnknownValues: true,  // Reject unknown values in nested objects
    disableErrorMessages: process.env.NODE_ENV === 'production', // Hide details in prod
  }),
)
```

### 3.2 DTO Pattern with class-validator

**Registration DTO:** `backend/src/modules/auth/auth.dto.ts:36-54`

```typescript
export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  @Validate(StrongPasswordValidator)  // Custom validator — zxcvbn + HIBP
  password: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string
}
```

**Profile update DTO:** `backend/src/modules/users/users.dto.ts`

```typescript
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) educationLevel?: string
  @IsOptional() @IsString() @MaxLength(1000) degrees?: string
  @IsOptional() @IsString() @MaxLength(50) state?: string
  @IsOptional() @IsDateString() dob?: string
  @IsOptional() @IsBoolean() notifyInstant?: boolean
  // ... all fields optional, all have MaxLength constraints
}
```

### 3.3 XSS Prevention

**HTML escaping utility:** `backend/src/modules/crawler/url-validator.ts:113-120`

```typescript
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

**CSP headers in Helmet:** `backend/src/main.ts:47-72`

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],  // No inline scripts allowed
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],  // Clickjacking protection
      formAction: ["'self'"],
    },
  },
  xssFilter: true,
}))
```

### 3.4 SQL Injection Prevention (Prisma)

Prisma ORM uses parameterized queries by default — raw SQL injection is not possible through normal Prisma operations.

```typescript
// SAFE — Prisma parameterizes automatically
const user = await this.prisma.user.findUnique({
  where: { email: identifier },
})

// SAFE — search query with interpolation
const jobs = await this.prisma.job.findMany({
  where: {
    OR: [
      { title: { contains: search } },
      { description: { contains: search } },
    ],
  },
})

// ⚠️ AVOID — Raw queries require explicit parameterization
// await this.prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`
```

### 3.5 SSRF Prevention for URL Fetching

**Implementation:** `backend/src/modules/crawler/url-validator.ts:6-74`

```typescript
// Private IP ranges blocked
const PRIVATE_IP_RANGES = [
  /^127\./,           // Loopback
  /^10\./,            // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
  /^192\.168\./,      // Class C private
  /^169\.254\./,      // Link-local
  /^::1$/,            // IPv6 loopback
  /^fc00:/, /^fe80:/, /^fd00:/, // IPv6 ULA/link-local
]

// Blocked headers that could be used for SSRF
const BLOCKED_HEADERS = [
  'host', 'authorization', 'cookie', 'set-cookie',
  'x-forwarded-for', 'x-forwarded-host', 'x-real-ip', 'x-client-ip',
]

export function validateUrl(url: string, allowedDomains?: string[]) {
  const parsed = new URL(url)

  // Only http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Blocked protocol: ${parsed.protocol}` }
  }

  // Block private IPs
  if (isPrivateIP(parsed.hostname)) {
    return { valid: false, reason: `Blocked private IP: ${parsed.hostname}` }
  }

  // Block encoded bypasses
  if (hostname.includes('%') || url.includes('@') || url.includes('\\')) {
    return { valid: false, reason: `Suspicious URL encoding detected` }
  }

  // Domain allowlist
  if (allowedDomains?.length > 0) {
    const isAllowed = allowedDomains.some(d => hostname === d || hostname.endsWith(`.${d}`))
    if (!isAllowed) return { valid: false, reason: `Domain not in allowlist` }
  }

  return { valid: true, reason: 'OK' }
}
```

### 3.6 Request Size Limits

```typescript
// In main.ts or via NestJS config
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: true }))
```

---

## 4. Rate Limiting

### 4.1 Global ThrottlerGuard

**Implementation:** `backend/src/app.module.ts:28, 47`

```typescript
// Global: 10 requests per 60-second window
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),

// Applied to ALL routes
providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
```

### 4.2 Endpoint-Specific Throttling

**Implementation:** `backend/src/modules/auth/auth.controller.ts`

```typescript
// Registration: 5 per minute (prevent mass account creation)
@Post('register')
@Throttle({ default: { limit: 5, ttl: 60000 } })

// Login: 10 per minute
@Post('login')
@Throttle({ default: { limit: 10, ttl: 60000 } })

// Token refresh: 20 per minute
@Post('refresh')
@Throttle({ default: { limit: 20, ttl: 60000 } })

// Resend verification: 3 per hour
@Post('resend-verification')
@Throttle({ default: { limit: 3, ttl: 3600000 } })

// Forgot password: 3 per hour
@Post('forgot-password')
@Throttle({ default: { limit: 3, ttl: 3600000 } })

// Reset password: 5 per 15 minutes
@Post('reset-password')
@Throttle({ default: { limit: 5, ttl: 900000 } })
```

**Crawler admin endpoints:** `backend/src/modules/crawler/crawler.controller.ts`

```typescript
@Post('crawl/:sourceId')
@Roles('ADMIN')
@Throttle({ default: { limit: 5, ttl: 60000 } })     // 5/min

@Post('crawl-all')
@Roles('ADMIN')
@Throttle({ default: { limit: 2, ttl: 300000 } })    // 2/5min

@Post('competitor-pipeline')
@Roles('ADMIN')
@Throttle({ default: { limit: 1, ttl: 600000 } })    // 1/10min
```

### 4.3 Exponential Backoff Throttle Guard

**Implementation:** `backend/src/common/guards/exponential-throttle.guard.ts`

```typescript
// Dedicated guard for sensitive operations (login, password reset)
// Tracks failures per email/IP, escalates lockout duration
const lockoutThresholds = [
  { failures: 5,  lockoutMinutes: 15 },
  { failures: 10, lockoutMinutes: 60 },
  { failures: 15, lockoutMinutes: 1440 },
]

// Rate limit headers returned to client
response.setHeader('X-RateLimit-Remaining', remainingAttempts.toString())
response.setHeader('X-RateLimit-Reset', Math.ceil(expiryTime / 1000).toString())
```

### 4.4 Rate Limit Summary Table

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `POST /auth/register` | 5 | 1 min | Prevent mass registration |
| `POST /auth/login` | 10 | 1 min | Brute force mitigation |
| `POST /auth/refresh` | 20 | 1 min | Token refresh |
| `POST /auth/forgot-password` | 3 | 1 hour | Password reset abuse |
| `POST /auth/reset-password` | 5 | 15 min | Reset abuse |
| `POST /auth/resend-verification` | 3 | 1 hour | Email bombing |
| `POST /crawler/crawl/:id` | 5 | 1 min | Admin crawl |
| `POST /crawler/crawl-all` | 2 | 5 min | Full crawl |
| `POST /crawler/competitor-pipeline` | 1 | 10 min | Competitor scan |
| Global (all other) | 10 | 1 min | Default protection |

---

## 5. API Security

### 5.1 CORS Configuration

**Implementation:** `backend/src/main.ts:78-84`

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,                              // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // No HEAD/OPTIONS abuse
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,                                  // Preflight cache: 24h
})
```

**Production guard:** `backend/src/main.ts:33-35`

```typescript
if (isProd && !process.env.ALLOWED_ORIGINS) {
  throw new Error('ALLOWED_ORIGINS is required in production')
}
```

### 5.2 Helmet Security Headers

**Implementation:** `backend/src/main.ts:46-73`

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Strict policy (see 3.3) | XSS, data injection |
| HSTS | `maxAge: 31536000, includeSubDomains` | Force HTTPS |
| Referrer-Policy | `strict-origin-when-cross-origin` | Limit referrer leakage |
| X-Content-Type-Options | `nosniff` | Prevent MIME sniffing |
| X-XSS-Protection | `1; mode=block` | Legacy XSS filter |
| Cross-Origin-Resource-Policy | `cross-origin` | Resource loading |
| X-Frame-Options | `DENY` (via frameAncestors) | Clickjacking |

### 5.3 Request Tracing

**Implementation:** `backend/src/common/interceptors/logging.interceptor.ts`

```typescript
// Every request logged with method, URL, status, duration, IP, userId
this.logger.log(`${method} ${url} ${res.statusCode} ${ms}ms`, {
  method, url, status: res.statusCode, ms, ip, userId,
})

// Audit trail for compliance
this.logger.audit(`${method} ${url} ${res.statusCode}`, userId, {
  method, url, status: res.statusCode, ms, ip,
})
```

### 5.4 Error Sanitization

**Implementation:** `backend/src/common/filters/all-exceptions.filter.ts:26-27`

```typescript
// In production, raw error messages are hidden from clients
const isProd = process.env.NODE_ENV === 'production'
message = isProd ? 'Internal server error' : exception.message
```

**URL validator error sanitization:** `backend/src/modules/crawler/url-validator.ts:103-111`

```typescript
export function sanitizeError(error: unknown): string {
  const msg = (error as Error).message || 'Unknown error'
  return msg
    .replace(/[A-Z]:\\[^\s]+/g, '[path]')        // Remove Windows paths
    .replace(/\/[^\s]+/g, '[path]')               // Remove Unix paths
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[ip]') // Remove IPs
    .substring(0, 200)                             // Truncate
}
```

### 5.5 Email Header Injection Prevention

```typescript
export function sanitizeEmailSubject(subject: string): string {
  return subject.replace(/[\r\n]/g, '').substring(0, 200) // Strip newlines
}
```

---

## 6. Database Security

### 6.1 Prisma Best Practices

**Service lifecycle:** `backend/src/prisma/prisma.service.ts`

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

**Key rules:**
- Always use Prisma Client methods (auto-parameterized)
- Use `$transaction` for multi-step writes
- Use `select` or `include` to limit data exposure
- Never expose raw Prisma errors to clients

### 6.2 Connection Pooling

```typescript
// In prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // Connection pool managed by Prisma
  // Default pool size: number of CPU cores * 2 + 1
}

// For production, append connection limit to DATABASE_URL:
// mysql://user:pass@host:3306/db?connection_limit=20&pool_timeout=10
```

### 6.3 Safe Query Patterns

```typescript
// ✅ SAFE — parameterized via Prisma
const user = await this.prisma.user.findUnique({
  where: { email: dto.email },
  select: { id: true, email: true, role: true, passwordHash: true },
})

// ✅ SAFE — filtered results
const jobs = await this.prisma.job.findMany({
  where: {
    status: 'ACTIVE',
    deadline: { gte: new Date() },
  },
  take: Math.min(limit, 100), // Cap result set
  skip: (page - 1) * limit,
})

// ✅ SAFE — transaction for atomicity
await this.prisma.$transaction([
  this.prisma.user.update({ where: { id }, data: { passwordHash } }),
  this.prisma.refreshToken.deleteMany({ where: { userId: id } }),
])

// ❌ NEVER — string interpolation in raw queries
// await this.prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`)
```

### 6.4 Migration Safety

```bash
# Always preview before applying
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma

# Generate migration
npx prisma migrate dev --name add_user_profile

# Apply in production
npx prisma migrate deploy

# Never use db push in production (data loss risk)
# npx prisma db push --accept-data-loss  # DEV ONLY
```

### 6.5 Backup Strategy

```bash
# MySQL dump (daily cron)
mysqldump -u sarkari -p rozgarscout > backups/rozgarscout-$(date +%Y%m%d).sql

# Redis backup
redis-cli -a $REDIS_PASSWORD BGSAVE

# Prisma schema version control
git add prisma/schema.prisma prisma/migrations/
```

---

## 7. Redis Security

### 7.1 Configuration

**Implementation:** `backend/src/common/redis/redis.service.ts`

```typescript
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis

  async onModuleInit() {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    // For production with auth:
    // redis://:password@host:6379
  }

  async onModuleDestroy() {
    await this.redisClient.disconnect()
  }
}
```

**Docker Redis config:** `docker-compose.yml:21-35`

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --requirepass sarkariRedis2024  # Password auth
  ports:
    - "6379:6379"  # Dev only; in prod, bind to 127.0.0.1 or use Docker network
  volumes:
    - redis_data:/data  # Persistent storage
  healthcheck:
    test: ["CMD", "redis-cli", "-a", "sarkariRedis2024", "ping"]
```

### 7.2 Key Naming Convention

```
refresh:{userId}         → Refresh token (7-day TTL)
verify:{uuid}            → Email verification token (24h TTL)
reset:{uuid}             → Password reset token (15min TTL)
lock:{email}             → Account lockout counter (15min TTL)
exp_fail:{email}         → Failed login counter (24h TTL)
exp_lock:{email}         → Exponential lock flag
exp_lock:{email}:expiry  → Lock expiry timestamp
session:{hash}           → Session fingerprint (7-day TTL)
```

### 7.3 Cache Invalidation

```typescript
// On password reset: invalidate all sessions
await this.redis.del(`refresh:${userId}`)

// On logout: remove refresh token
await this.redis.del(`refresh:${userId}`)

// On token rotation: old token automatically replaced
await this.redis.set(`refresh:${userId}`, newRefreshToken, 604800)
```

### 7.4 Redis Security Checklist

- [ ] Password authentication enabled (`requirepass`)
- [ ] Bind to 127.0.0.1 or Docker internal network in production
- [ ] No `FLUSHALL` or `FLUSHDB` exposed
- [ ] Rename dangerous commands (`CONFIG`, `DEBUG`, `KEYS`)
- [ ] Max memory policy: `allkeys-lru`
- [ ] AOF persistence enabled for durability

---

## 8. Deployment Security

### 8.1 Docker Security

**Backend Dockerfile:** `backend/Dockerfile`

```dockerfile
# Multi-stage build — dev dependencies excluded
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts          # Skip post-install scripts
COPY prisma ./prisma/
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/
RUN npm run build

# Production — non-root user
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S sarkari && adduser -S sarkari -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p logs && chown -R sarkari:sarkari /app

USER sarkari                    # Non-root user

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Security features:**
- Multi-stage build (no dev dependencies in production)
- Non-root user (`sarkari:1001`)
- `--ignore-scripts` prevents supply chain attacks
- No secrets baked into image

**Recommended additions:**
```dockerfile
# Read-only filesystem (docker-compose)
# security_opt:
#   - no-new-privileges:true
# read_only: true
# tmpfs:
#   - /tmp
#   - /app/logs
```

### 8.2 Nginx Security (Frontend)

**Frontend Dockerfile:** `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Recommended nginx.conf security headers:**

```nginx
server {
    listen 80;
    server_name rozgarscout.in;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No dotfiles
    location ~ /\. {
        deny all;
    }
}
```

### 8.3 Environment Management

**Files committed to git:**
- `backend/.env.example` — Template with placeholder values
- `backend/.env.prod.example` — Production template
- `backend/.env.development` — Dev defaults (safe for local)

**Never committed:**
- `backend/.env` — Real secrets (in `.gitignore`)
- Any file with real credentials

**Startup validation:** `backend/src/main.ts:16-29`

```typescript
const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters')
}
```

### 8.4 Health Checks

**Implementation:** `backend/src/modules/health/health.controller.ts`

```typescript
@Get()
async check() {
  const result: Record<string, string> = { timestamp: new Date().toISOString() }

  try {
    await this.prisma.$queryRaw`SELECT 1`
    result.database = 'connected'
  } catch {
    result.database = 'disconnected'
  }

  try {
    await this.redis.ping()
    result.redis = 'connected'
  } catch {
    result.redis = 'disconnected'
  }

  if (result.database !== 'connected' || result.redis !== 'connected') {
    throw new HttpException({ status: 'error', ...result }, HttpStatus.SERVICE_UNAVAILABLE)
  }

  return { status: 'ok', ...result }
}
```

**Docker healthchecks:** `docker-compose.yml`

```yaml
mysql:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 5s
    timeout: 3s
    retries: 10

redis:
  healthcheck:
    test: ["CMD", "redis-cli", "-a", "sarkariRedis2024", "ping"]
    interval: 5s
    timeout: 3s
    retries: 10
```

---

## 9. Monitoring & Logging

### 9.1 Structured Logging

**Implementation:** `backend/src/common/logger/logger.service.ts`

```typescript
interface LogEntry {
  timestamp: string
  level: LogLevel      // 'info' | 'warn' | 'error' | 'debug'
  context: string      // Module name
  message: string
  meta?: Record<string, any>
}

// Output format:
// [2026-08-31T10:00:00.000Z] [INFO ] [HTTP] GET /api/jobs 200 45ms {"method":"GET","url":"/api/jobs","status":200,"ms":45,"ip":"127.0.0.1","userId":"abc-123"}
```

**Log rotation:** Files auto-rotate at 10MB (`logger.service.ts:33-40`)

**Monthly directory structure:**
```
logs/
  2026-08/
    2026-08-31.log          # All logs
    2026-08-31-errors.log   # Errors + warnings
    2026-08-31-audit.log    # Audit trail
```

### 9.2 Audit Trail

```typescript
// Every HTTP request logged to audit file
this.logger.audit(`${method} ${url} ${res.statusCode}`, userId, {
  method, url, status: res.statusCode, ms, ip,
})

// Audit entries include userId (or 'anonymous')
// File: logs/YYYY-MM/YYYY-MM-DD-audit.log
```

### 9.3 Error Sanitization

```typescript
// Production: generic error messages
// Development: full error details
message = isProd ? 'Internal server error' : exception.message

// Path/IP scrubbing in crawler errors
sanitizeError(error) // Removes Windows paths, IPs, internal details
```

### 9.4 Sentry Integration

**Frontend:** `@sentry/react` in `frontend/package.json`

```typescript
// In frontend entry point
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // 10% of transactions
})
```

**Backend:** `SENTRY_DSN` in `.env.prod.example`

```bash
# Recommended packages:
# @sentry/node for backend
# @sentry/react for frontend
# @sentry/profiling-node for performance
```

### 9.5 Log Levels by Environment

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: isProd
    ? ['error', 'warn', 'log']                    // Production: minimal
    : ['error', 'warn', 'log', 'debug', 'verbose'], // Development: full
})
```

---

## 10. Testing Security

### 10.1 Unit Tests

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('should reject weak passwords', async () => {
    await expect(
      service.register({ email: 'test@test.com', password: '123', name: 'Test' })
    ).rejects.toThrow('Password is too weak')
  })

  it('should reject disposable emails', async () => {
    await expect(
      service.register({ email: 'test@mailinator.com', password: 'StrongP@ss1', name: 'Test' })
    ).rejects.toThrow('Disposable email addresses are not allowed')
  })

  it('should lock account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await service.login({ email: 'test@test.com', password: 'wrong' }).catch(() => {})
    }
    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' })
    ).rejects.toThrow('Account locked')
  })

  it('should not reveal if email exists', async () => {
    const result = await service.forgotPassword('nonexistent@test.com')
    expect(result.message).toBe('If email exists, reset link sent')
  })
})
```

### 10.2 Integration Tests

```typescript
// auth-scenarios.spec.ts
describe('Auth E2E', () => {
  it('should set HttpOnly cookies on login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'StrongP@ss1' })

    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some(c => c.startsWith('access_token='))).toBe(true)
    expect(cookies.some(c => c.startsWith('refresh_token='))).toBe(true)
    // Verify httpOnly flag
    expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true)
  })

  it('should reject expired tokens', async () => {
    const expiredToken = jwt.sign({ sub: '123', type: 'access' }, secret, { expiresIn: '0s' })
    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401)
  })
})
```

### 10.3 Security Testing Checklist

```bash
# Dependency audit
npm audit --audit-level=high

# Secret scanning
npx gitleaks detect --source . --verbose

# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

# Security headers check
curl -I http://localhost:3000 | grep -E "(X-Frame|HSTS|CSP|X-Content-Type)"

# XSS payload test
curl -X POST http://localhost:3000/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"search": "<script>alert(1)</script>"}'

# SQL injection test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "\" OR 1=1 --", "password": "test"}'
```

---

## 11. OWASP Top 10:2025 Compliance

| # | Category | RozgarScout Implementation | Status |
|---|----------|---------------------------|--------|
| A01 | **Broken Access Control** | JWT guards, RBAC (`@Roles('ADMIN')`), ownership checks, IDOR prevention | ✅ |
| A02 | **Cryptographic Failures** | argon2id hashing, HttpOnly secure cookies, TLS enforcement, JWT_SECRET ≥32 chars | ✅ |
| A03 | **Injection** | Prisma parameterized queries, ValidationPipe whitelist, XSS escape utilities | ✅ |
| A04 | **Insecure Design** | Threat modeling via SECURITY-CHECKLIST.md, SSRF URL validation, fake site detection | ✅ |
| A05 | **Security Misconfiguration** | Helmet headers, CORS allowlist, production env validation, error sanitization | ✅ |
| A06 | **Vulnerable Components** | `npm audit`, package-lock.json committed, minimal dependencies | ⚠️ Needs automation |
| A07 | **Auth Failures** | Account lockout, exponential backoff, timing-safe comparison, HIBP leak check | ✅ |
| A08 | **Data Integrity Failures** | Token rotation with reuse detection, session fingerprinting, timing-safe compare | ✅ |
| A09 | **Logging Failures** | Structured logging, audit trail, Sentry integration, error sanitization | ✅ |
| A10 | **SSRF** | Private IP blocking, domain allowlisting, protocol validation, header sanitization | ✅ |

**Gaps to address:**
- A06: Add automated dependency scanning to CI/CD (Snyk/Dependabot)
- A04: Formal threat model document
- A01: Add per-resource ownership verification middleware

---

## 12. Overnight Agent QA Template

### 12.1 Read-Only DB Access

```bash
# Create readonly DB user for QA agent
CREATE USER 'qa_readonly'@'%' IDENTIFIED BY 'random_password';
GRANT SELECT ON rozgarscout.* TO 'qa_readonly'@'%';
FLUSH PRIVILEGES;

# Usage in QA script
DATABASE_URL=mysql://qa_readonly:random_password@localhost:3306/rozgarscout
```

### 12.2 Structural No-Destructive Checks

```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'rozgarscout'
ORDER BY table_name;

-- Check for missing indexes
SELECT * FROM information_schema.statistics
WHERE table_schema = 'rozgarscout'
AND index_name IS NULL;

-- Verify foreign key constraints
SELECT * FROM information_schema.key_column_usage
WHERE table_schema = 'rozgarscout'
AND referenced_table_name IS NOT NULL;

-- Check for orphaned records
SELECT u.id FROM users u
LEFT JOIN profiles p ON u.id = p.userId
WHERE p.id IS NULL;
```

### 12.3 Write-Don't-Execute Cleanup

```bash
# Generate migration diff without applying
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > /tmp/analysis.sql

# Review SQL without executing
cat /tmp/analysis.sql
```

### 12.4 Sentry MCP Integration

```typescript
// QA agent queries Sentry for recent errors
const issues = await sentryApi.listIssues({
  project: 'rozgarscout-backend',
  query: 'is:unresolved level:error',
  statsPeriod: '24h',
})

// Check for security-relevant errors
const securityIssues = issues.filter(i =>
  i.metadata.value.includes('Unauthorized') ||
  i.metadata.value.includes('Forbidden') ||
  i.metadata.value.includes('SQL') ||
  i.metadata.value.includes('injection')
)
```

### 12.5 Mission Template

```markdown
## Overnight QA Mission — [DATE]

### Pre-Flight
- [ ] `npm audit --audit-level=high` — no new high/critical
- [ ] `npx gitleaks detect --source .` — no secrets committed
- [ ] Docker builds succeed — `docker-compose build`
- [ ] Health check returns 200 — `curl localhost:3000/api/health`

### Structural Checks
- [ ] All Prisma models have corresponding tables
- [ ] No orphaned records in junction tables
- [ ] All migrations applied — `npx prisma migrate status`
- [ ] Redis keys within memory limits — `redis-cli INFO memory`

### Security Checks
- [ ] Auth endpoints rate-limited — 11th request returns 429
- [ ] Expired JWT rejected — `curl -H "Authorization: Bearer expired" ...`
- [ ] SQL injection payload rejected — `' OR 1=1 --` in search
- [ ] XSS payload escaped — `<script>` in profile fields
- [ ] SSRF blocked — `http://127.0.0.1` in crawler URL
- [ ] Private IP blocked — `http://192.168.1.1` in feed URL

### Performance Checks
- [ ] P95 response time < 500ms
- [ ] Database connection pool not exhausted
- [ ] Redis memory < 100MB
- [ ] No N+1 queries in hot paths

### Error Report
- [ ] New Sentry issues triaged
- [ ] No unhandled promise rejections
- [ ] Log files rotated (no > 10MB files)
- [ ] Audit trail complete for admin actions
```

### 12.6 Claims vs Reality Audit

```typescript
// Script to verify security claims against actual implementation
const claims = [
  {
    claim: 'All passwords hashed with argon2id',
    verify: async () => {
      const users = await prisma.user.findMany({ select: { passwordHash: true } })
      return users.every(u => u.passwordHash.startsWith('$argon2id$'))
    }
  },
  {
    claim: 'All auth endpoints rate-limited',
    verify: async () => {
      const throttlerConfig = app.get(ThrottlerModule)
      return throttlerConfig !== undefined // Verify global guard registered
    }
  },
  {
    claim: 'JWT_SECRET >= 32 chars',
    verify: async () => {
      return (process.env.JWT_SECRET?.length || 0) >= 32
    }
  },
  {
    claim: 'No secrets in source code',
    verify: async () => {
      const result = execSync('npx gitleaks detect --source src/ --report-format json')
      return JSON.parse(result.toString()).length === 0
    }
  },
]
```

---

## 13. Competitor Scraping Strategies

### 13.1 How Top 25 Competitors Get Data

| Competitor | Primary Method | Data Sources | Update Frequency |
|-----------|---------------|-------------|-----------------|
| **SarkariResult.com** | Manual + semi-automated | Official notifications, PDF parsing | 2-3x/day |
| **FreeJobAlert.com** | RSS + web scraping | Employment News, official portals | Real-time |
| **Adda247** | API + scraping + user submissions | SSC, UPSC, IBPS portals | Hourly |
| **Testbook** | Official API integrations + scraping | Government portals, RSS feeds | Multiple times/day |
| **Gradeup (BYJU'S)** | Hybrid (API + scraping + crowdsourcing) | User submissions + official sources | Real-time |
| **JagranJosh** | CMS-based manual entry | Official notifications | 2-3x/day |
| **EmploymentNews.gov.in** | Official government portal | Direct government data | Daily |
| **NCS (National Career Service)** | Government API | ncs.gov.in | Real-time |
| **SarkariNaukri.com** | RSS + scraping | Multiple government portals | Multiple times/day |
| **CareerPower** | Scraping + manual | SSC, Railway, Bank exams | 2-3x/day |

### 13.2 Common Data Acquisition Methods

```typescript
// 1. RSS Feed Monitoring (most common, legal)
// Sources: Employment News, many government portals
const RSS_FEEDS = [
  'https://employmentnews.gov.in/rss/new-jobs.xml',
  'https://www.ssc.gov.in/rss/notices',
  // State PSCs often have RSS feeds
]

// 2. Official API Integration (when available)
// NCS API, some state portals
const NCS_API = 'https://api.ncs.gov.in/v1/jobs'

// 3. HTML Scraping (public data only)
// SSC, UPSC, IBPS portals
// Respect robots.txt, rate limit, use caching

// 4. PDF Parsing (official notifications)
// Government notifications are often PDFs
// Extract: deadline, vacancy count, eligibility

// 5. Google Alerts / News API
// Monitor for new government job announcements
```

### 13.3 Hidden APIs & Data Sources

```typescript
// Government portals often have undocumented APIs:

// SSC — ssc.gov.in
// Network tab reveals JSON endpoints for exam schedules, results

// UPSC — upsc.gov.in
// Calendar data available via internal API

// IBPS — ibps.in
// Exam calendar and results via XHR requests

// State PSCs
// Many use WordPress/Drupal with REST APIs exposed

// Employment News
// RSS feeds with full job details

// India Post GDS
// gdsop릉.indiapost.gov.in has JSON API for results
```

### 13.4 Legal & Ethical Scraping Rules

```typescript
// ✅ ALLOWED
// - Scraping publicly available job listings
// - Following robots.txt
// - Respecting rate limits (1 req/sec per domain)
// - Caching responses (reduce server load)
// - Providing attribution

// ❌ NOT ALLOWED
// - Scraping behind login walls
// - Circumventing CAPTCHAs
// - Overwhelming servers with requests
// - Scraping personal data
// - Ignoring robots.txt disallow rules

// RozgarScout implementation:
// 1. Only scrapes .gov.in and official domains
// 2. Uses FakeSiteDetector to verify sources
// 3. Respects robots.txt
// 4. Rate limits all crawler requests
// 5. Caches responses for 24h
```

### 13.5 Our Crawler Architecture

```typescript
// backend/src/modules/crawler/ — Our implementation
// 
// crawler.service.ts           — Main crawl orchestration
// rss-monitor.service.ts       — RSS feed monitoring
// url-validator.ts             — SSRF protection, domain validation
// fake-site-detector.service.ts — Official vs phishing detection
// competitor-monitor.service.ts — Competitor data source discovery
// notification-pdf.service.ts  — PDF parsing for official notifications
// job-deletion-detector.service.ts — Detect removed listings
// adaptive-scheduler.service.ts — Smart crawl scheduling
// 
// agents/
//   competitor-pipeline.service.ts   — End-to-end competitor pipeline
//   competitor-discovery.agent.ts    — Auto-discover new sources
//   source-resolver.agent.ts         — Resolve canonical URLs
//   source-manager.agent.ts          — Manage source lifecycle
//   official-scraper.agent.ts        — Scrape official portals
//   job-validator.agent.ts           — Validate scraped job data
```

---

## 14. Recommended NPM Packages

### 14.1 Authentication & Security

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `argon2` | ^0.41.0 | Password hashing (argon2id) | ✅ Installed |
| `@nestjs/jwt` | ^10.2.0 | JWT sign/verify | ✅ Installed |
| `@nestjs/passport` | ^10.0.0 | Passport integration | ✅ Installed |
| `passport-google-oauth20` | ^2.0.0 | Google OAuth | ✅ Installed |
| `helmet` | ^7.1.0 | Security headers | ✅ Installed |
| `express-rate-limit` | ^7.x | Basic rate limiting | Consider adding |
| `csrf-csrf` | ^3.x | CSRF token generation | Consider adding |
| `otplib` | ^12.x | TOTP 2FA generation | **Recommended** |
| `speakeasy` | ^2.x | 2FA (alternative) | **Recommended** |

### 14.2 Validation & Sanitization

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `class-validator` | ^0.14.0 | DTO validation decorators | ✅ Installed |
| `class-transformer` | ^0.5.1 | DTO transformation | ✅ Installed |
| `zxcvbn` | ^4.4.2 | Password strength estimation | ✅ Installed |
| `dompurify` | ^3.x | XSS sanitization (frontend) | **Recommended** |
| `isomorphic-dompurify` | ^2.x | XSS sanitization (universal) | **Recommended** |
| `validator.js` | ^13.x | String validation utilities | Consider adding |

### 14.3 Rate Limiting & Throttling

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `@nestjs/throttler` | ^5.1.0 | NestJS throttler | ✅ Installed |
| `bottleneck` | ^2.x | Advanced rate limiting | Consider adding |
| `rate-limiter-flexible` | ^5.x | Redis-based rate limiting | **Recommended** |

### 14.4 Database & ORM

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `@prisma/client` | ^5.22.0 | Prisma ORM client | ✅ Installed |
| `prisma` | ^5.22.0 | Prisma CLI | ✅ Installed |
| `@prisma/extension-accelerate` | ^1.x | Prisma Accelerate (connection pooling) | Consider adding |

### 14.5 Redis & Caching

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `ioredis` | ^5.4.0 | Redis client | ✅ Installed |
| `cache-manager` | ^5.x | Caching abstraction | Consider adding |
| `@nestjs/cache-manager` | ^2.x | NestJS cache integration | Consider adding |

### 14.6 Logging & Monitoring

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `@sentry/node` | ^8.x | Error tracking (backend) | **Recommended** |
| `@sentry/react` | ^10.71.0 | Error tracking (frontend) | ✅ Installed |
| `pino` | ^9.x | Structured logging | Consider adding |
| `@nestjs/event-emitter` | ^2.x | Audit event system | Consider adding |

### 14.7 Email Security

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `nodemailer` | ^6.9.0 | Email sending | ✅ Installed |
| `@nestjs-modules/mailer` | ^1.x | NestJS mailer integration | Consider adding |
| `handlebars` | ^4.x | Email templates | Consider adding |

### 14.8 Testing & Security Audit

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `jest` | ^29.7.0 | Unit testing | ✅ Installed |
| `supertest` | ^7.2.2 | HTTP testing | ✅ Installed |
| `@nestjs/testing` | ^10.4.0 | NestJS test utilities | ✅ Installed |
| `gitleaks` | - | Secret scanning (CLI) | **Recommended** |
| `npm-audit-resolver` | ^3.x | Audit resolution | Consider adding |

### 14.9 File Upload Security

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `multer` | ^1.4.5-lts.1 | File upload handling | ✅ (via @types/multer) |
| `file-type` | ^19.x | File type detection (magic bytes) | **Recommended** |
| `sharp` | ^0.33.x | Image processing/validation | **Recommended** |
| `@types/multer` | ^1.4.12 | Multer types | ✅ Installed |

### 14.10 Infrastructure Security

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `dotenv` | ^16.4.0 | Env management | ✅ Installed |
| `compression` | ^1.8.1 | Response compression | ✅ Installed |
| `cookie-parser` | ^1.4.6 | Cookie parsing | ✅ Installed |

---

## Quick Reference: Security Configuration

### Environment Variables (Production)

```bash
# Database
DATABASE_URL=mysql://user:strong_password@host:3306/rozgarscout?connection_limit=20

# Redis
REDIS_URL=redis://:strong_password@host:6379

# JWT — minimum 32 characters, use: openssl rand -hex 32
JWT_SECRET=your_64_char_random_hex_string_here

# CORS
ALLOWED_ORIGINS=https://rozgarscout.in,https://www.rozgarscout.in

# Security
NODE_ENV=production
COOKIE_DOMAIN=rozgarscout.in

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rozgarscout@gmail.com
SMTP_PASS=your_app_password
```

### Security Headers Summary

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY (via CSP frame-ancestors)
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

---

## Appendix: Security Commands

```bash
# Run all security checks
npm audit --audit-level=high
npx gitleaks detect --source . --verbose
curl -I http://localhost:3000 | grep -E "(X-Frame|HSTS|CSP|X-Content-Type)"

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

# Check for secrets in git history
git log --all --oneline | head -20
npx gitleaks detect --log-opts="--all"

# Verify Docker security
docker inspect sarkari-backend | jq '.[0].Config.User'
# Should output: "sarkari"

# Check SSL/TLS
openssl s_client -connect rozgarscout.in:443 -tls1_2
```

---

*Document generated from RozgarScout codebase analysis. Update when security patterns change.*
