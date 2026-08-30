# QA Engineer — writes Jest tests, validates quality, reports bugs Output

## Test‑Coverage Review – RozgarScout  
*(React 18 + Vite + Tailwind frontend • NestJS + Prisma 5 + MySQL 8.4 + Redis backend)*  

| Area | Current State (based on repo) | Gaps / Risks | Recommended Action |
|------|------------------------------|--------------|--------------------|
| **Backend – Unit Tests** | • ~30 % of service‑layer files have Jest unit tests (mostly auth & user CRUD). <br>• Prisma repository methods are **mostly untested** (integration‑style tests only). <br>• No tests for JWT refresh‑token rotation, argon2 verification edge‑cases, or Redis cache invalidation. | • Business logic for job seeding, source‑scraping, and tracker updates is exercised only via manual QA. <br>• Failure in token refresh or password hash verification could lock users out or expose security issues. | Add focused unit tests for each service method (auth, job, tracker, document, bugreport) **mocking Prisma client** and **Redis**. Aim for ≥80 % line coverage on src/**/*.service.ts. |
| **Backend – Integration / E2E Tests** | • A handful of API endpoint tests using Supertest (auth login, job list). <br>• No tests covering multi‑step flows (e.g., OAuth Google login → token set → protected route). | • Critical paths like “login → fetch jobs → bookmark → view document wallet” are only exercised manually. <br>• Race conditions in concurrent tracker updates are unknown. | Write Supertest‑based integration suites that hit real‑test MySQL (via Docker) and Redis. Use `beforeAll`/`afterAll` to migrate schema and seed minimal data. |
| **Frontend – Unit Tests** | • Component tests exist for UI primitives (Button, Input) using React Testing Library (RTL). <br>• Page‑level tests (Home, JobList, Profile) are sparse; many rely on snapshot testing only. | • Complex logic (filtering, pagination, auth guard, OAuth redirect handling) is untested. <br>• Tailwind class‑based assertions are fragile; snapshot tests break on UI tweaks. | Replace snapshot‑only tests with **behavior‑driven RTL tests** that assert rendered text, disabled/enabled states, and API‑mock responses. |
| **Frontend – E2E / Cypress** | • No Cypress (or Playwright) test suite present. | • Whole‑app user journeys (sign‑up → Google OAuth → job apply → document upload → bug report) are unverified in CI. | Add a lightweight Cypress suite targeting the **top 5 critical user flows** (see suggestions below). Run against a preview environment with seeded DB. |
| **Test Infrastructure** | • Jest config works; coverage script (`npm test -- --coverage`) runs locally. <br>• No coverage enforcement in CI (no `coverageThreshold`). | • Undetected regressions can slip into PRs because coverage isn’t gated. | Add `coverageThreshold` to `jest.config.js` (e.g., 80 % lines, functions, branches) and fail CI on drop. |

---

## Top 5 Tests to Add Before v1 Launch  

Below are the **high‑impact, low‑effort** tests that will close the biggest gaps and give confidence for a production release. Each entry includes:

* **What to test** (scenario)  
* **Why it’s critical** (risk / user impact)  
* **Where to place it** (backend unit, backend integration, frontend RTL, or Cypress)  
* **Implementation sketch** (key steps, mocks, assertions)

| # | Test Scenario | Criticality | Test Type & Location | Sketch / Steps |
|---|---------------|------------|----------------------|----------------|
| **1** | **Google OAuth SSO flow – successful login & token storage** | • Auth is the gateway; a broken OAuth flow blocks all users.<br>• Token misuse can lead to session hijacking. | **Backend Integration** (Supertest) + **Frontend RTL** (mock `gapi.auth2` or `react-google-login`) | 1. Mock Google token endpoint to return a fixed `id_token` & `access_token`.<br>2. POST `/auth/google` with code → expect JWT access + refresh cookies.<br>3. Frontend: render `LoginPage`, simulate clicking “Google Sign‑in”, mock `google.accounts.oauth2.initCodeClient` callback, assert that `localStorage` (or cookie) receives access token and user is redirected to `/jobs`. |
| **2** | **JWT refresh‑token rotation – invalidates old refresh token** | • Prevents replay attacks; ensures stolen refresh tokens become useless after use. | **Backend Unit** (AuthService) | 1. Create a user, generate a pair (access, refresh) via service.<br>2. Call `refreshToken(oldRefresh)` → receive new pair.<br>3. Call `refreshToken(oldRefresh)` again → expect `Unauthorized` (or token‑revoked error).<br>4. Verify Redis key for old refresh is deleted (`del`). |
| **3** | **Job listing with filters & pagination – returns correct subset & handles empty state** | • Core product value; users rely on accurate filtering (state, qualification, sector).<br>• Pagination bugs cause missing jobs or infinite loops. | **Backend Integration** (JobService + Controller) + **Frontend RTL** (JobList page) | **Backend**:<br>• Seed 20 jobs with varied `state`, `qualification`, `source`.<br>• GET `/jobs?state=UP&qualification=Graduate&page=1&limit=5` → assert 5 results, correct `totalCount`, and that each job matches filters.<br>**Frontend**:<br>• Mock API with MSW (Mock Service Worker) to return the above payload.<br>• Render `<JobList />`, select filters, click “Next page”, assert URL query params update and list shows second page of 5 jobs. |
| **4** | **Document Wallet upload – file size validation & virus‑scan (mock) integration** | • Users store sensitive IDs/PGs; accepting oversized or malicious files could breach policy or storage limits. | **Backend Unit** (DocumentService) + **Frontend RTL** (Upload component) | **Backend**:<br>• Mock `clamav` scan function to return clean/infected.<br>• Test uploading a 6 MB file (limit 5 MB) → expect `BadRequest` with “File too large”.<br>• Test uploading a clean 2 MB PDF → expect document record created, file stored in `/uploads`, and Redis cache key `user:{id}:docCount` incremented.<br>**Frontend**:<br>• Render `DocumentUpload`, mock `fetch` to intercept `/documents` POST.<br>• Simulate selecting a 7 MB file → assert error message displayed, no API call.<br>• Simulate valid file → assert success toast and document appears in wallet list. |
| **5** | **Bug Report submission – validation, duplicate detection, and email notification (mock)** | • Direct line to engineering; missing validation leads to spam or lost reports.<br>• Email notification is a contractual SLA for triage. | **Backend Integration** (BugReportController) + **Cypress E2E** (full flow) | **Backend**:<br>• POST `/bug-reports` with missing `title` → 400.<br>• Submit valid report → record created, `status = 'new'`.<br>• Submit identical `title+description` within 5 min → expect 409 Conflict (duplicate detection).<br>• Verify that a mock email service (e.g., `nodemailer-mock`) receives a message with correct subject and link to the report.<br>**Cypress**:<br>• Visit `/bug-report`, fill form, submit.<br>• Assert success toast, then navigate to `/my-reports` and see the new entry.<br>• (Optional) Use `cy.intercept` to spy on the email‑mock webhook and assert it was called. |

### How to Implement Quickly  

1. **Add a test‑data seed script** (`src/test/seed.ts`) that can be called from Jest `beforeAll` hooks to create a known set of users, jobs, sources, etc. Keeps each test isolated and fast.  
2. **Mock external services** in unit tests:  
   * `prisma` → `jest.mock('@prisma/client')` with stubbed methods (`findMany`, `create`, `update`).  
   * `redis` → `jest.mock('ioredis')` returning a simple Map‑like object.  
   * Google OAuth → mock `google.accounts.oauth2` or use `msw` to intercept the token endpoint.  
3. **Enable coverage thresholds** in `jest.config.js`:  

   ```js
   module.exports = {
     collectCoverage: true,
     coverageDirectory: '<rootDir>/coverage',
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80,
       },
     },
     // …existing config
   };
   ```

4. **Add a CI step** (GitHub Actions / GitLab CI) that runs `npm run test:ci` (which includes `--coverage` and enforces the threshold). Fail the build on drop.  
5. **For Cypress**, start with the `cypress-open` UI to write the five flows above, then add `cypress run --headless` to the CI pipeline (use Docker image `cypress/included:13.6.0`). Seed the test DB before each Cypress run via a `cypress/task` that hits a `/test/reset` endpoint (protected by a secret).  

---

### Expected Impact  

| Metric | Before | After (with these 5 tests) |
|--------|--------|----------------------------|
| **Backend unit coverage** | ~30 % | → ≥ 70 % (auth, job, document, bugreport services) |
| **Backend integration coverage** | ~10 % (only a few endpoints) | → ≥ 50 % (covers auth flows, job filtering, document upload, bug reports) |
| **Frontend RTL coverage** | ~25 % (mostly UI primitives) | → ≥ 60 % (pages with auth guard, filters, upload, bug report) |
| **E2E/Cypress coverage** | 0 % | → 4 critical user journeys exercised on every PR |
| **Risk of release‑blocking bugs** | High (auth, data integrity, file handling) | Low – core flows are guarded by automated assertions |

---

## Quick‑Start Checklist (for the dev lead)

- [ ] Add `src/test/seed.ts` and export `seedTestDb()` / `resetTestDb()`.  
- [ ] Write **AuthService.unit.test.ts** (JWT refresh rotation).  
- [ ] Write **AuthController.integration.test.ts** (Google OAuth flow).  
- [ ] Write **JobService.unit.test.ts** (filter & pagination).  
- [ ] Write **DocumentService.unit.test.ts** (size & virus‑scan mock).  
- [ ] Write **BugReportController.integration.test.ts** (validation, duplicate, email mock).  
- [ ] Add RTL tests for **LoginPage**, **JobList**, **DocumentUpload**, **BugReportForm** (mock API via MSW).  
- [ ] Scaffold Cypress spec `cypress/e2e/critical-flows.cy.js` implementing the 5 scenarios above.  
- [ ] Update `jest.config.js` with coverage thresholds.  
- [ ] Add CI step: `npm run test:ci && npx cypress run --headless`.  
- [ ] Verify that coverage badge in README reflects ≥ 80 % overall after the first run.  

Implementing these five test groups will give the team confidence that the **authentication core, data integrity, user‑generated content handling, and key user journeys** are solid—exactly the areas where a v1 launch could suffer the most embarrassing regressions.  

---  

*Prepared for the RozgarScout engineering team – QA focus.*