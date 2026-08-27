# AGENTS.md — SarkariScout Development Guide

## Project Overview
SarkariScout is a government job notification aggregator for Indian aspirants.
- **Backend**: NestJS + TypeScript + Prisma ORM + MySQL + Redis
- **Frontend**: React 18 + Vite 6 + Tailwind CSS v4 + React Router v6
- **Testing**: Jest (backend), Vitest + Testing Library (frontend)
- **Deployment**: Docker + Nginx + GitHub Actions CI/CD

## Architecture Rules
- Backend modules: `src/modules/<name>/` — each has controller, service, module, DTO, spec
- Frontend pages: `src/pages/<Name>.tsx` — lazy-loaded via React.lazy()
- Shared components: `src/components/` — reusable UI primitives
- Contexts: `src/contexts/` — Auth, Theme, Toast providers
- Prisma schema: `prisma/schema.prisma` — single source of truth for DB

## Code Style
- TypeScript strict mode is NOT enabled (strictNullChecks: false) — don't introduce strict-only patterns
- Use `class-validator` decorators for DTOs
- Use `@nestjs/common` decorators for controllers/services
- Frontend: functional components only, hooks for state
- CSS: Tailwind utility classes, dark mode via `dark:` prefix
- No inline styles — use Tailwind classes or custom CSS in index.css

## Testing Rules
- Backend: `.spec.ts` files next to source files, run with `npm test`
- Frontend: `.test.tsx` files in `src/test/`, run with `npm test` or `npx vitest`
- Always mock external services (email, Redis, HTTP) in unit tests
- E2E tests go in `e2e/` directory (currently empty — needs Playwright setup)

## Git Conventions
- Branch: `pre-dev` (staging), `main` (production)
- Commit messages: `<type>: <description>` (feat, fix, chore, docs, refactor, test)
- Never commit secrets, .env files, or hardcoded credentials
- Pre-commit: run lint + typecheck before committing

## Security Rules
- NEVER log or expose: JWT secrets, DB passwords, API keys, tokens
- Use environment variables for all secrets
- Validate all user input with class-validator
- Rate limit auth endpoints (5/min register, 10/min login)
- Use argon2id for password hashing (NOT bcrypt)
- Helmet security headers enabled in production

## API Conventions
- All routes prefixed with `/api`
- Use DTOs with class-validator for request validation
- Return consistent response shapes: `{ data, total, page, limit }`
- Use HTTP status codes correctly: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found
- Paginate list endpoints with `page`, `limit`, `search` query params

## Frontend Rules
- Dark mode: add `dark:` variants to ALL new components
- Loading states: use Skeleton components, never show blank screens
- Error handling: use ErrorBoundary + toast notifications
- Auth: check `useAuth()` hook, redirect to /login if not authenticated
- Links: always add `onClick={() => window.scrollTo(0, 0)}` for page navigation

## Environment Variables
- Backend: see `backend/.env.example` for all required vars
- Frontend: only `VITE_API_URL` and `VITE_APP_NAME`
- Never hardcode URLs, ports, or credentials in source code

## Common Tasks
- **Add new endpoint**: Create controller + service + module + DTO + spec
- **Add new page**: Create page component, add lazy import + route in App.tsx
- **Add dark mode**: Add `dark:bg-*`, `dark:text-*`, `dark:border-*` classes
- **Run tests**: `cd backend && npm test` or `cd frontend && npm test`
- **Build**: `cd backend && npm run build` or `cd frontend && npm run build`
- **Database changes**: Edit `prisma/schema.prisma`, then `npx prisma db push`
