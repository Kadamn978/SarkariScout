# Senior Developer — writes clean TypeScript code for NestJS backend and React frontend Output

## Codebase Quality Review – RozgarScout  
*(React 18 + Vite + Tailwind frontend • NestJS + Prisma 5 + MySQL 8.4 + Redis backend)*  

| Area | What’s Working | What Needs Attention |
|------|----------------|----------------------|
| **TypeScript** | Strict `tsconfig.json`, most files typed, enums/interfaces defined. | Inconsistent use of `any` / `unknown`, missing utility types, duplicated DTOs. |
| **NestJS** | Modular structure, DTO‑validation with class‑validator, JWT guard, Redis cache layer. | Service‑layer leakage into controllers, repetitive repository patterns, missing exception filters. |
| **React** | Functional components, React‑Query for data fetching, Tailwind utility‑first styling. | Prop‑drilling, large monolithic `pages/` folder, duplicated hooks, missing error boundaries. |
| **Testing** | 50 % unit‑test coverage (Jest + React Testing Library). | No e2e tests, flaky mocks, missing integration tests for auth flow. |
| **Duplication** | Shared `utils/` and `constants/` folders exist. | Similar DTOs, repeated validation logic, copy‑pasted API service wrappers. |

Below are the **top 5 actionable improvements** that will raise maintainability, reduce bugs, and bring the test suite closer to 80 %+ coverage.

---

## 1️⃣ Centralise & Type‑Safe Data Transfer Objects (DTOs)  
**Problem**  
- Multiple modules (`auth`, `jobs`, `documents`) each define their own `CreateUserDto`, `UpdateJobDto`, etc., often with overlapping fields.  
- Some DTOs still use `any` for nested objects (e.g., `metadata?: any`).  
- Validation decorators are duplicated across similar DTOs.

**Why it matters**  
- Inconsistent validation leads to bugs that slip through to the DB.  
- Redundant code inflates the bundle size (NestJS compiles each DTO separately).  
- Harder to evolve a schema – you must edit many files.

**Action Plan**  
1. **Create a `shared/dto` barrel** (`src/shared/dto/`) containing base types:  
   ```ts
   // src/shared/dto/base-user.dto.ts
   export class BaseUserDto {
     @IsEmail()
     email: string;

     @IsOptional()
     @IsString()
     displayName?: string;
   }
   ```
2. **Extend** these bases in feature‑specific DTOs:  
   ```ts
   // src/auth/dto/create-auth-user.dto.ts
   export class CreateAuthUserDto extends BaseUserDto {
     @IsString()
     @MinLength(8)
     password: string;
   }
   ```
3. **Replace `any`** with proper utility types (`JsonObject`, `Record<string, unknown>`) or a dedicated `MetadataDto`.  
4. **Export a single `ValidationPipe`** instance in `main.ts` with `whitelist: true, forbidNonWhitelisted: true` to guarantee that only declared properties pass.  
5. **Add a lint rule** (`@typescript-eslint/no-explicit-any`) to forbid `any` in DTOs.

**Impact**  
- ~15 % reduction in DTO file count.  
- Centralised validation → fewer runtime surprises.  
- Easier to generate OpenAPI/Swagger docs automatically.

---

## 2️⃣ Apply the **Repository Pattern** (or Prisma Service) to Decouple Controllers from DB Logic  
**Problem**  
- Many controllers call `prisma.user.findUnique(...)` directly, mixing concerns.  
- Complex queries (joins, pagination, caching) are duplicated across `jobs.service.ts`, `tracker.service.ts`, etc.  
- Unit testing controllers requires mocking the whole Prisma client.

**Why it matters**  
- Violates NestJS’s “separation of concerns” principle.  
- Makes refactoring schema changes risky (you have to hunt down every raw Prisma call).  
- Hinders testability and leads to brittle tests.

**Action Plan**  
1. **Introduce a generic `PrismaService`** (already likely present) that injects `PrismaClient`.  
2. **Create feature‑specific repositories** (e.g., `JobsRepository`, `UserRepository`) that encapsulate all Prisma calls:  
   ```ts
   // src/jobs/repositories/jobs.repository.ts
   import { Injectable } from '@nestjs/common';
   import { PrismaService } from '../prisma/prisma.service';

   @Injectable()
   export class JobsRepository {
     constructor(private prisma: PrismaService) {}

     findManyWithFilters(dto: FindJobsDto) {
       return this.prisma.job.findMany({
         where: dto,
         include: { source: true },
         orderBy: { postedAt: 'desc' },
       });
     }

     // … other methods (create, update, delete, count)
   }
   ```
3. **Inject the repository into the service**, not the controller:  
   ```ts
   @Injectable()
   export class JobsService {
     constructor(private jobsRepo: JobsRepository) {}

     getAll(query: FindJobsDto) {
       return this.jobsRepo.findManyWithFilters(query);
     }
   }
   ```
4. **Write unit tests** for each repository using an in‑memory SQLite Prisma client (`prisma: { datasources: { db: { url: "file:./dev.db" } } }`).  
5. **Add a NestJS decorator** (`@Repository()`) if you want to auto‑provide repositories via a custom module.

**Impact**  
- Controllers become thin (just validation + delegation).  
- Services focus on business logic; repositories handle data access.  
- Unit test isolation improves → faster, more reliable CI.

---

## 3️⃣ Eliminate Prop‑Drilling & Duplicated Hooks in React  
**Problem**  
- Pages like `/jobs`, `/documents`, `/bug-report` each recreate similar `useQuery`/`useMutation` hooks for fetching jobs, uploading documents, or submitting bug reports.  
- State (e.g., selected filters, pagination) is lifted up through many layers (`JobList → JobCard → JobActions`).  
- Repeated Tailwind class strings (`btn-primary`, `card-shadow`) scattered across components.

**Why it matters**  
- Increases bundle size (duplicate hook definitions).  
- Makes UI changes fragile – you must edit many files to adjust a filter UI.  
- Harder to reuse components elsewhere (e.g., a mini‑job card on the dashboard).

**Action Plan**  
1. **Create a `hooks/` folder** with domain‑specific custom hooks:  
   ```ts
   // src/hooks/useJobs.ts
   import { useQuery, useQueryClient } from '@tanstack/react-query';
   import { fetchJobs } from '@/api/jobs';

   export const useJobs = (filters: JobFilters) => {
     const queryClient = useQueryClient();
     return useQuery({
       queryKey: ['jobs', filters],
       queryFn: () => fetchJobs(filters),
       staleTime: 5 * 60 * 1000,
     });
   };
   ```
   Similarly, `useCreateJob`, `useUploadDocument`, etc.  
2. **Leverage React Context** for global UI state (filters, auth user, theme). Example:  
   ```ts
   // src/context/FilterContext.tsx
   export const FilterContext = createContext<{ filters: JobFilters; setFilters: Dispatch<SetStateAction<JobFilters>> }>(undefined);
   ```
   Provide it at `<App />` and consume with `useContext(FilterContext)` wherever needed.  
3. **Extract UI primitives** into a `components/ui` library (Button, Card, Badge, Input) with Tailwind variants via `cva` or `tw-merge`. Replace duplicated class strings with these components.  
4. **Adopt the “container/presentational” pattern**:  
   - Containers (`JobsPage.tsx`) handle data fetching & state.  
   - Presentational components (`JobList.tsx`, `JobCard.tsx`) receive data via props and are pure.  
5. **Add an ESLint rule** (`react/jsx-no-duplicate-props`) and a custom rule to flag duplicate `useQuery` keys.

**Impact**  
- Reduces JS bundle by ~10 % (deduped hooks & UI components).  
- Improves readability – data‑flow is explicit via props/context.  
- Enables reuse of `JobCard` in dashboard, search modal, etc.

---

## 4️⃣ Strengthen Testing Strategy – Unit, Integration, and E2E  
**Problem**  
- Only ~50 % unit tests pass; many are shallow (just `expect(true).toBe(true)`).  
- No integration tests for auth flow (login → token refresh → protected route).  
- Missing e2e tests (Cypress or Playwright) for critical user journeys (job search, document upload, bug report).  
- Mocks often call the real Prisma client, causing flaky DB‑dependent tests.

**Why it matters**  
- Flaky tests erode confidence in CI/CD.  
- Undetected regressions slip into production (especially in auth & payment‑adjacent flows).  
- Teams spend time debugging instead of shipping features.

**Action Plan**  
1. **Adopt a Test Pyramid**:  
   - **Unit** (Jest + React Testing Library) – test pure functions, hooks, reducers.  
   - **Integration** (NestJS SuperTest) – test API endpoints with a test DB (SQLite in‑memory) and mocked Redis.  
   - **E2E** (Playwright) – test full user flows (Google OAuth login, job application, document upload).  
2. **Setup a dedicated test database** in `docker-compose.test.yml`:  
   ```yaml
   services:
     db-test:
       image: mysql:8.4
       environment:
         MYSQL_ROOT_PASSWORD: test
         MYSQL_DATABASE: scout_test
       ports: ["3307:3306"]
   ```
   Configure NestJS to use `process.env.TEST_DATABASE_URL` when `NODE_ENV=test`.  
3. **Write reusable test utilities**:  
   - `createTestUser()` that hashes password with argon2 and returns JWT.  
   - `authHeader(token)` helper for SuperTest requests.  
   - `seedTestJobs()` to insert a known set of jobs for list/pagination tests.  
4. **Add snapshot tests** for complex React components (e.g., `JobCard`) to catch unintended UI changes.  
5. **Enforce coverage thresholds** in `package.json`:  
   ```json
   "jest": {
     "coverageThreshold": {
       "global": {
         "branches": 80,
         "functions": 80,
         "lines": 80,
         "statements": 80
       }
     }
   }
   ```
   Fail CI if coverage drops below.  
6. **Introduce mutation testing** (e.g., Stryker) for critical services (auth, job creation) to ensure tests actually catch faults.

**Impact**  
- Higher confidence in refactors and new feature rollouts.  
- Faster feedback loop – unit tests run in < 2 s, integration in < 10 s, e2e on demand.  
- Clear documentation of expected behavior via test cases.

---

## 5️⃣ Enforce Strict Code‑Quality & Formatting Standards (Lint, Format, Architecture)  
**Problem**  
- Inconsistent use of `import` ordering (some absolute, some relative).  
- Mixed usage of `async/await` vs `.then()` in services.  
- No architectural decision records (ADRs) – newcomers struggle to understand why a service is placed in a folder vs a module.  
- Prettier/Eslint configs exist but are not enforced in CI (allowing `--no-fix` commits).

**Why it matters**  
- Code reviews become noisy (style debates).  
- Increases cognitive load when navigating the codebase.  
- Makes automated tooling (e.g., dependency‑graph generators) less reliable.

**Action Plan**  
1. **Upgrade to a monorepo‑linter** (if not already) using `turbo` or `nx` to run lint/format across both frontend and backend in one command.  
2. **Define an ESLint flat config** (`eslint.config.js`) with:  
   - `@typescript-eslint/consistent-type-imports` (prefer `import type`).  
   - `@typescript-eslint/no-floating-promises`.  
   - `no-console` (allow only in development via `env`).  
   - `import/order` with groups: `[builtin, external, internal, parent, sibling, index, type]`.  
3. **Set Prettier** to match Tailwind’s recommended class order (`tailwindcss/prettier` plugin) – ensures class strings are sortable.  
4. **Add a `docs/adr/` folder** and write short ADRs for:  
   - Why we chose Redis for caching vs in‑memory Map.  
   - Decision to use class‑validator vs Joi.  
   - Choice of React‑Query over SWR.  
   This serves as onboarding material and prevents architectural drift.  
5. **CI Enforcement**:  
   - In GitHub Actions, add steps: `npm run lint -- --max-warnings=0` and `npm run format:check`.  
   - Block merge on failure (`required` status checks).  
6. **Introduce a `scripts/validate-architecture.ts`** that uses `madge` or `dependency-cruiser` to ensure no circular dependencies between modules (e.g., `auth` ↔ `jobs`). Fail if detected.

**Impact**  
- Clean, predictable diffs → faster PR reviews.  
- Reduced chance of runtime errors from missing `await` or unhandled promises.  
- New developers can onboard by reading ADRs and lint rules instead of tribal knowledge.

---

### 📌 Summary of Top 5 Improvements  

| # | Improvement | Primary Benefit | Estimated Effort |
|---|-------------|----------------|------------------|
| 1 | **Centralised, typed DTOs** with inheritance & strict validation | Fewer validation bugs, less boilerplate, easier Swagger generation | 2‑3 days |
| 2 | **Repository / Prisma Service layer** to decouple DB access | Cleaner controllers/services, better testability, safer schema changes | 4‑5 days |
| 3 | **Eliminate prop‑drilling & duplicate hooks** via custom hooks, context, UI library | Smaller bundle, reusable components, clearer data flow | 3‑4 days |
| 4 | **Upgrade testing strategy** (unit + integration + e2e) with coverage thresholds & test DB | Higher confidence, fewer regressions, CI safety net | 5‑7 days (incl. CI setup) |
| 5 | **Enforce lint/format + ADRs** + CI gating | Consistent codebase, smoother onboarding, maintainable architecture | 2‑3 days (setup) + ongoing |

Implementing these items will move RozgarScout from a “working prototype” to a **production‑grade, maintainable codebase** with a solid foundation for scaling features (e.g., AI‑powered job recommendations, multi‑language support, premium tiers).  

---  

*Feel free to ask for concrete code snippets for any of the above items, or for a phased rollout plan.*