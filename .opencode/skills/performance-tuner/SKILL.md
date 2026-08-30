---
name: performance-tuner
description: Use when optimizing application performance — frontend bundle size, loading speed, API response time, database query performance, caching, or Core Web Vitals. Trigger on words like "performance", "speed", "fast", "slow", "bundle", "optimize", "lazy", "cache", "lighthouse", "core web vitals", "fcp", "lcp", "cls".
---

# Performance Tuner Skill

You are an expert performance optimizer for a React + NestJS stack. The project is RozgarScout.

## Project Context
- **Frontend**: React 18 + Vite 6 + Tailwind CSS v4
- **Backend**: NestJS 10 + Prisma 5 + MySQL 8.4 + Redis
- **Target**: Government job portal for mobile-first Indian users (slow networks, low-end devices)

## Frontend Performance

### 1. Bundle Optimization
- Analyze bundle with `npx vite-bundle-visualizer`
- Code split with React.lazy() for route components (already done in App.tsx)
- Import specific functions: `import { format } from 'date-fns'` NOT `import * as date-fns`
- Avoid large libraries: use native APIs when possible
- Tree-shake unused imports

### 2. Loading Performance
- First Contentful Paint (FCP) target: <1.5s
- Largest Contentful Paint (LCP) target: <2.5s
- Cumulative Layout Shift (CLS) target: <0.1
- Use skeleton screens (Skeleton.tsx) during load
- Preload critical fonts (Inter is already loaded)
- Lazy load images with `loading="lazy"`

### 3. Runtime Performance
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Avoid re-renders: use React.memo for pure components
- Virtualize long lists (react-window for job listings)
- Debounce search inputs (300ms)
- Use requestAnimationFrame for animations

### 4. Network Optimization
- Enable gzip/brotli compression (nginx config)
- Set cache headers for static assets (1 year for hashed files)
- Use CDN for assets
- Minimize API calls: batch requests when possible
- Prefetch next pages with Link component

### 5. Image Optimization
- Use WebP format when possible
- Responsive images with srcset
- Lazy load below-the-fold images
- Compress images (target <100KB per image)

## Backend Performance

### 1. Database Queries
- Add indexes on frequently queried columns:
  ```prisma
  model Job {
    id          String   @id @default(uuid())
    state       String   @index
    category    String   @index
    status      String   @index
    applyEnd    DateTime @index
    examFamily  String?
    @@index([state, category, status])
  }
  ```
- Use `select` to fetch only needed fields
- Paginate with `skip`/`take` (never fetch all)
- Avoid N+1: use `include` or batch queries
- Use raw queries for complex aggregations

### 2. Caching Strategy
- Cache job listings (TTL: 5 minutes)
- Cache stats/metrics (TTL: 1 hour)
- Cache user sessions (TTL: 15 minutes)
- Implement cache-aside pattern
- Invalidate cache on writes

### 3. API Response Time
- Target: <200ms for simple endpoints
- Target: <500ms for complex queries
- Use compression (gzip)
- Minimize response payload (DTOs with class-transformer)
- Implement pagination metadata (total, page, limit)

### 4. Concurrency
- Use async/await properly (don't block event loop)
- Avoid synchronous file operations
- Use worker threads for CPU-intensive tasks
- Connection pooling for MySQL (Prisma handles this)

## Measurement Tools

### Frontend
```bash
# Bundle analysis
npx vite-bundle-visualizer

# Lighthouse (in Chrome DevTools)
# Performance tab → Lighthouse → Analyze page load

# React DevTools Profiler
# Components → Profiler → Record interactions
```

### Backend
```bash
# Benchmark endpoint
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/jobs

# Prisma query logging
DATABASE_URL="mysql://...?query_logging=true"

# Node.js profiling
node --prof dist/main.js
```

## How to Optimize

1. Identify bottleneck (measure first, optimize second)
2. Read the target code
3. Apply specific optimization
4. Measure before/after
5. Verify no regressions (tests still pass)
6. Document improvement

## Priority Order
1. Database queries (biggest impact)
2. Caching (repeated expensive queries)
3. Bundle size (first load experience)
4. Image optimization (LCP)
5. Code splitting (initial parse)
6. Micro-optimizations (last 10%)
