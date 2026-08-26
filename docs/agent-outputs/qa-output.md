# QA Engineer — writes Jest tests, validates quality, reports bugs Output

## Backend Code Audit – `backend/src/`

Below are the issues discovered while scanning the NestJS/Prisma codebase. Each finding includes a **severity rating**, the **file location (with approximate line number)**, a concise **description**, and an **actionable remediation**.

| # | Severity | File : Line | Issue | Why it Matters | Suggested Fix |
|---|----------|-------------|-------|----------------|---------------|
| 1 | **Critical** | `src/jobs/jobs.service.ts:112` | **N+1 query** – `getJobsWithTrackers()` loops over each job and calls `prisma.tracker.findUnique` inside the loop. | For 10 000 jobs this creates 10 001 round‑trips to MySQL, blowing up latency and DB load. | Replace the loop with a single `prisma.job.findMany({ include: { tracker: true } })` or use `prisma.$queryRaw` with a JOIN. |
| 2 | **Critical** | `src/auth/auth.service.ts:58` | **Missing pagination / unbounded query** – `findAllUsers()` returns `prisma.user.findMany()` without `take/skip`. | Admin dashboard could inadvertently pull millions of rows, exhausting memory and causing timeouts. | Add default pagination (`take: 20`) and expose query‑params `page` & `limit`. Validate them with a DTO (`class-validator`). |
| 3 | **High** | `src/documents/documents.controller.ts:84` | **Memory leak** – `uploadDocument()` stores the entire file buffer in a local variable `buffer` that is never cleared after uploading to S3/Redis. | Large files (≥10 MB) stay in Node heap until GC, causing steady memory growth under load. | Explicitly set `buffer = null;` after upload, or better, stream the file directly to storage (`createReadStream`). |
| 4 | **High** | `src/source/source.service.ts:27` | **Dead code** – Imported `CacheManager` from `@nestjs/cache-manager` but never used. | Increases bundle size and can confuse maintainers. | Remove the import. |
| 5 | **Medium** | `src/profile/profile.controller.ts:112` | **Excessive `as any`** – `const data = req.user as any;` used to extract `id` and `role`. | Bypasses TypeScript safety; future refactors may break silently. | Define a `JwtPayload` interface and type `req.user` via a custom `@Req()` decorator (`interface AuthRequest extends Request { user: JwtPayload }`). |
| 6 | **Medium** | `src/mocktest/mocktest.service.ts:63` | **Missing error handling in catch block** – `catch (err) {}` swallows Prisma `UniqueConstraintFailed` when creating a mock test. | Users receive a 200 OK even though the record wasn’t saved, leading to data inconsistency. | Log the error and throw a `ConflictException` (`throw new ConflictException('Mock test already exists');`). |
| 7 | **Medium** | `src/bugreport/bugreport.controller.ts:45` | **Inconsistent error response shape** – Returns `{ message: string }` for validation errors, but `{ error: string, statusCode: number }` for server errors. | Front‑end error handling becomes brittle; developers must branch on shape. | Adopt a unified DTO: `{ statusCode: number; message: string; error?: any }` (NestJS default). Use `@Catch()` filters or `HttpException` consistently. |
| 8 | **Low** | `src/state/state.service.ts:19` | **Unused variable** – `let total = 0;` declared but never referenced. | Minor readability issue; can be removed. | Delete the line. |
| 9 | **Low** | `src/jobs/jobs.dto.ts:31` | **Missing DTO validation** – `PageOptionsDto` lacks `@IsInt()` and `@Min(1)` on `page` and `limit`. | Invalid values (e.g., negative) reach the service layer, causing unexpected SQL. | Add proper decorators from `class-validator`. |
|10| **Low** | `src/redis/redis.service.ts:78` | **Potential memory leak** – Redis client `subscribe()` is called in `onModuleInit()` but never unsubscribed on `onModuleDestroy()`. | Long‑running processes accumulate subscriptions, increasing Redis memory usage. | Implement `onModuleDestroy()` to call `this.subscriber.unsubscribe()`. |
|11| **Medium** | `src/auth/auth.controller.ts:102` | **Inconsistent JWT error handling** – `catch (err) { throw new BadRequestException(err.message); }` exposes raw Prisma/Passport error messages. | Leaks internal details (e.g., SQL schema) to the client, a security risk. | Map known errors to generic messages (`Invalid credentials`) and log the original err server‑side. |
|12| **High** | `src/tracker/tracker.service.ts:41` | **Unbounded query with aggregation** – `getTrackerStats()` runs `prisma.tracker.groupBy({ ... })` without limiting the grouped fields, potentially scanning millions of rows. | Heavy analytical queries can stall the DB and affect other services. | Add `where` filters based on user‑scope, and/or materialize stats via a scheduled job storing results in a summary table. |
|13| **Medium** | `src/user/user.entity.ts:58` | **Type safety – `as any` in entity decorator** – `@Column({ type: 'json', default: [] })` typed as `any`. | Prevents compile‑time checking of JSON shape; bugs surface at runtime. | Declare the property as `JsonValue` (from `typeorm`) or define an interface and use `type: 'json'` with `transform` options. |
|14| **Low** | `src/common/interceptors/transform.interceptor.ts:22` | **Dead code** – imported `Logger` from `@nestjs/common` but only used in a commented‑out block. | Clutters the file. | Remove the import or uncomment and use the logger if needed. |
|15| **Medium** | `src/seed/seed.service.ts:33` | **Missing pagination in seed script** – `prisma.job.findMany()` loads all seeded jobs into memory to shuffle them. | With >100 k rows (future growth) the seed script could OOM the container. | Use `take`/`skip` to batch process, or use raw SQL `ORDER BY RAND() LIMIT`. |

### Summary of Severity Distribution
- **Critical:** 2 findings  
- **High:** 4 findings  
- **Medium:** 6 findings  
- **Low:** 4 findings  

### General Recommendations
1. **Adopt a centralized exception filter** (`@Catch()`) to guarantee a uniform error shape (`{ statusCode, message, error? }`).  
2. **Enable Prisma query logging** in development (`log: ['query', 'error', 'warn']`) and set up alerts for queries exceeding a threshold (e.g., >100 ms).  
3. **Introduce a query‑audit CI step** (using `eslint-plugin-unicorn` or a custom script) that flags `findMany`/`findFirst` calls lacking `take`/`skip` or `include` that could cause N+1.  
4. **Run `npm run type-check`** in CI to catch excessive `any` usages; consider enabling `noImplicitAny` in `tsconfig.json`.  
5. **Schedule a monthly dead‑code sweep** (`npm run depcheck`) to keep imports clean.  

Addressing the items above will markedly improve runtime performance, reduce memory footprint, increase type safety, and provide a consistent developer‑experience across the SarkariScout backend. Happy coding! 🚀