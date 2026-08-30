# Best Practices Implemented — RozgarScout

## Backend (NestJS + Prisma + MySQL + Redis)

### Architecture
- **Modular design**: Auth, Users, Jobs, Crawler, Matching, Email, Changes, Logs — each in its own module
- **Global modules**: RedisModule (caching), JwtModule (auth)
- **Service layer**: Business logic in services, not controllers
- **DTO validation**: class-validator with whitelist + forbidNonWhitelisted

### Security
- Argon2 password hashing (memoryCost: 65536, timeCost: 3)
- JWT access tokens (15min) + refresh tokens (7d) stored in Redis
- Account lockout: 5 failed attempts = 15min cooldown
- Rate limiting: global 10/min, auth-specific (register: 5/min, login: 10/min, forgot-password: 3/hour)
- Helmet CSP/HSTS/referrer policy headers
- CORS with credentials, allowed methods/headers whitelist
- Role-based access control (USER/ADMIN) via @Roles() decorator
- Input validation with max length, whitelist, forbidNonWhitelisted
- Error messages hidden in production (disableErrorMessages)
- Global /api prefix — no accidental exposure
- Sensitive keys redacted in error logs

### Logging
- Custom file-based Logger with daily rotation (logs/YYYY-MM/YYYY-MM-DD.log)
- Separate audit log file per day (logs/YYYY-MM/YYYY-MM-DD-audit.log)
- Separate error log file per day (logs/YYYY-MM/YYYY-MM-DD-errors.log)
- HTTP request/response logging via NestJS interceptor
- Global exception filter with structured error context (user, IP, stack, cause)
- Monthly directory organization for easy cleanup
- 10MB file rotation (auto-backup when exceeded)
- 90-day retention with cleanup endpoint

### Database
- MySQL 8.4 with Prisma ORM
- Proper indexing on frequently queried fields
- Cascading deletes for user data (GDPR compliant)
- UUID primary keys (no sequential ID leaks)
- Enum types for constrained values (Role, Category, JobStatus, etc.)
- Fingerprint-based deduplication for crawled jobs

### API Design
- RESTful conventions (GET/POST/PUT/DELETE)
- Consistent response format
- Pagination with page/limit params
- Search via query params
- 32 total routes across 8 controllers

---

## Frontend (React + Vite + Tailwind)

### Performance
- Vite 6.x for fast builds (246KB JS bundle)
- Lazy route splitting via React Router
- Debounced search (300ms delay)
- Infinite scroll pagination (IntersectionObserver)
- Skeleton loading states for perceived performance

### Accessibility
- Semantic HTML (nav, main, section, article, aside, dl/dt/dd)
- ARIA labels on all interactive elements
- Focus rings on all clickable elements
- Screen reader text (sr-only labels)
- Keyboard navigation support
- Role attributes on lists and navigation

### UX
- Password show/hide toggle
- Sticky navbar with hamburger menu on mobile
- Responsive grid layouts (mobile-first)
- Error boundaries for graceful failure
- Protected routes (redirect to login)
- Search with debounce
- Infinite scroll with loading indicators

### Code Quality
- TypeScript strict mode
- Custom Vite env type definitions (vite-env.d.ts)
- Axios interceptor for auto token refresh on 401
- Centralized API client with base URL config
- Context-based auth state management
- Component-based architecture (reusable PasswordInput, Navbar, Skeleton, ErrorBoundary)

---

## DevOps & Process

### Git
- Branch strategy: main (prod) → pre-dev (staging) → test (dev)
- 18+ atomic commits on pre-dev
- Descriptive commit messages with phase labels
- .env in .gitignore, .env.example committed

### Self-Learning
- MISTAKES.md tracks errors and prevents repeats
- Pre-session checklist for consistency
- Review checklist for over-engineering prevention

### Testing
- Jest + ts-jest for unit testing
- 10 tests across 4 services (matching, changes, crawler, email)
- Mock-based testing (no DB dependency in unit tests)
- E2E test infrastructure ready (supertest config)

---

## Revenue Features

### Monetization (from day 1)
- Google AdSense integration (AdBanner component)
- Affiliate card components for study material/coaching
- Ad slots on Landing, Jobs, and JobDetail pages
- Responsive ad formats (horizontal, vertical)
- Sponsored link attributes for SEO compliance

### Data Sources
- 20+ government job source monitoring
- HTML parser with fingerprint-based dedup
- Change detection for deadline/date/status updates
- Automatic notification to tracked users on changes
