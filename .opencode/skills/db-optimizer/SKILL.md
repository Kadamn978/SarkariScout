---
name: db-optimizer
description: Use when optimizing database schema, queries, indexes, migrations, or Prisma ORM usage. Trigger on words like "database", "db", "mysql", "prisma", "schema", "migration", "index", "query", "slow query", "n+1", "relation", "foreign key", "composite index".
---

# Database Optimizer Skill

You are an expert MySQL + Prisma database optimizer. The project is SarkariScout.

## Project Context
- **Database**: MySQL 8.4
- **ORM**: Prisma 5.22
- **Schema**: `prisma/schema.prisma` (19 models, 8 enums)
- **Connection**: Via PrismaService singleton

## Schema Analysis

### Current Models (19 total)
User, Profile, Source, Job, JobChange, UserJob, NotificationLog, EmailPreference, CrawlLog, Subscription, AuditLog, ErrorLog, UserDocument, BugReport, MockTest, MockQuestion, MockTestAttempt, PreviousPaper, PageView, DailyStats

### Index Audit Checklist

#### High Priority (query patterns from API)
```prisma
model Job {
  // Currently indexed: id (PK), fingerprint (unique)
  // Should add:
  state       String   @index              # Filter by state
  category    String   @index              # Filter by category
  status      String   @index              # Filter by OPEN/CLOSED
  applyEnd    DateTime @index              # Sort by deadline, upcoming queries
  examFamily  String?  @index              # Filter by exam type
  org         String   @index              # Search by organization
  
  // Composite index for common filter combination
  @@index([status, state, category])
  @@index([status, applyEnd])
  @@index([examFamily, status])
}

model UserJob {
  // Currently: unique([userId, jobId])
  // Should add:
  userId      String   @index              # User's tracked jobs
  jobId       String   @index              # Job's trackers
  stage       String?  @index              # Filter by stage
}

model CrawlLog {
  sourceId    String   @index              # Source history
  createdAt   DateTime @index              # Time-based queries
}

model PageView {
  path        String   @index              # Page analytics
  createdAt   DateTime @index              # Time-based aggregation
}

model UserDocument {
  userId      String   @index              # User's documents
}
```

## Query Optimization

### Common Anti-Patterns

#### 1. N+1 Query Problem
```typescript
// BAD: N+1 queries
const jobs = await prisma.job.findMany();
for (const job of jobs) {
  const source = await prisma.source.findUnique({ where: { id: job.sourceId } });
}

// GOOD: Single query with include
const jobs = await prisma.job.findMany({
  include: { source: { select: { name: true, url: true } } },
});
```

#### 2. Unbounded Queries
```typescript
// BAD: Fetches all jobs
const allJobs = await prisma.job.findMany();

// GOOD: Paginated
const jobs = await prisma.job.findMany({
  where: { status: 'OPEN' },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { applyEnd: 'asc' },
});
```

#### 3. Missing Select
```typescript
// BAD: Fetches all columns
const jobs = await prisma.job.findMany();

// GOOD: Only needed fields
const jobs = await prisma.job.findMany({
  select: {
    id: true, title: true, org: true, state: true,
    totalVacancies: true, applyEnd: true, category: true,
  },
});
```

#### 4. Missing Count Query
```typescript
// BAD: Two separate queries
const jobs = await prisma.job.findMany({ take: 10 });
const total = await prisma.job.count();

// GOOD: Parallel queries
const [jobs, total] = await Promise.all([
  prisma.job.findMany({ take: 10, skip: 0 }),
  prisma.job.count({ where: { status: 'OPEN' } }),
]);
```

## Migration Best Practices

### DO
- Use `prisma migrate dev` in development
- Use `prisma migrate deploy` in production
- Add indexes for new filter/sort columns
- Test migrations on copy of production data
- Keep migrations small and focused

### DON'T
- Use `prisma db push` in production (destructive)
- Drop columns without checking dependencies
- Add indexes on large tables during peak hours
- Rename columns without a migration plan

## How to Optimize

1. Read the Prisma schema
2. Analyze API query patterns (read controllers/services)
3. Identify missing indexes
4. Check for N+1 queries
5. Add select fields to reduce payload
6. Verify with `npx prisma db push` (dev only)
7. Run tests to ensure no regressions

## Performance Measurement
```sql
-- Check slow queries
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- Analyze query execution
EXPLAIN SELECT * FROM jobs WHERE state = 'Maharashtra' AND status = 'OPEN';

-- Check index usage
SHOW INDEX FROM jobs;
```
