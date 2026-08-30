---
name: backend-optimizer
description: Use when optimizing, refactoring, or improving NestJS backend code, API performance, database queries, module architecture, or TypeScript code quality. Trigger on words like "backend", "api", "nestjs", "controller", "service", "module", "refactor", "optimize", "performance", "cache", "query", "prisma".
---

# Backend Optimizer Skill

You are an expert NestJS + Prisma backend optimizer. The project is RozgarScout — a government job notification API.

## Project Context
- **Framework**: NestJS 10 + TypeScript
- **ORM**: Prisma 5.22 with MySQL 8.4
- **Cache**: Redis via ioredis
- **Auth**: JWT (access 15min + refresh 7d) + Google OAuth
- **Password**: argon2id
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, rate limiting (throttler), CORS

## Architecture Rules
- Modules live in `src/modules/<name>/`
- Each module has: controller, service, module, DTO, spec
- PrismaService is a global singleton (src/prisma/prisma.service.ts)
- RedisService wraps ioredis (src/common/redis/redis.service.ts)
- All routes prefixed with `/api`
- Strict input validation with class-validator decorators

## Optimization Checklist

### 1. Database Queries (Prisma)
- Use `select` instead of fetching all fields
- Use `include` only when needed (avoid N+1)
- Add `skip`/`take` for pagination (never fetch all records)
- Use `findMany` with `where` clauses that leverage indexes
- Check prisma/schema.prisma for missing indexes on frequently queried fields
- Use transactions for multi-step operations
- Avoid raw SQL unless Prisma can't express the query

### 2. Caching Strategy
- Cache frequently accessed, rarely changing data (job lists, stats)
- Use Redis with appropriate TTL:
  - Job listings: 5-15 minutes
  - Stats/metrics: 1 hour
  - User sessions: 15 minutes (access token TTL)
- Implement cache invalidation on data writes
- Use cache-aside pattern: check cache → miss → query DB → set cache

### 3. API Response Optimization
- Paginate all list endpoints (page, limit params)
- Return only fields the client needs (DTOs with class-transformer)
- Use `@nestjs/swagger` decorators for API documentation
- Return consistent response shapes: `{ data, total, page, limit }`
- Implement ETag or Last-Modified for cacheable responses

### 4. Error Handling
- Use AllExceptionsFilter for consistent error responses
- Never expose internal errors to clients
- Log errors with context (request ID, user ID, timestamp)
- Use HTTP exceptions with proper status codes:
  - 400: Validation error
  - 401: Unauthenticated
  - 403: Forbidden
  - 404: Not found
  - 409: Conflict (duplicate)
  - 429: Rate limited
  - 500: Internal error

### 5. Security Hardening
- Validate all input with class-validator
- Use DTOs for every endpoint (never accept raw body)
- Rate limit auth endpoints: 5/min register, 10/min login
- Use timing-safe comparison for secrets
- Log security events (failed logins, permission denied)
- Never log passwords, tokens, or PII
- Use Helmet with strict CSP in production

### 6. Code Quality
- Remove unused imports
- Use `@nestjs/common` decorators consistently
- Prefer async/await over .then() chains
- Extract reusable logic into services
- Keep controllers thin (delegate to services)
- Use interfaces for complex data shapes

### 7. Testing
- Unit tests: mock PrismaService, RedisService
- Integration tests: use real DB with testcontainers
- E2E tests: full HTTP requests with supertest
- Maintain >80% coverage on services
- Test error paths, not just happy paths

## How to Optimize

1. Read the target file
2. Identify specific optimization opportunities
3. Prioritize by impact (high: DB queries, caching; medium: code quality; low: style)
4. Apply changes with Edit tool
5. Run `npm run typecheck` to verify
6. Run `npm test` to ensure no regressions
7. Document what was changed and why

## Red Flags to Look For
- `findMany()` without `take`/`skip` (unbounded queries)
- Missing `await` on async operations
- Console.log in production code
- Hardcoded strings that should be env vars
- Missing validation decorators on DTOs
- Services doing HTTP calls in tight loops
- Synchronous file operations in request handlers
- Memory leaks from uncleaned intervals/timeouts
