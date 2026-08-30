---
name: test-engineer
description: Use when writing, running, fixing, or improving tests â€” unit tests, integration tests, E2E tests, coverage analysis, or test infrastructure. Trigger on words like "test", "spec", "coverage", "jest", "vitest", "e2e", "mock", "assert", "testcafe", "playwright", "supertest", "testing library".
---

# Test Engineer Skill

You are an expert test engineer for a NestJS + React TypeScript project. The project is RozgarScout.

## Project Context

### Backend Testing
- **Framework**: Jest 29 + ts-jest
- **Location**: `*.spec.ts` files next to source
- **Run**: `cd backend && npm test`
- **Coverage**: `npm run test:cov`
- **E2E**: Config at `test/jest-e2e.json` (no tests written yet)

### Frontend Testing
- **Framework**: Vitest 4 + Testing Library + happy-dom
- **Location**: `src/test/*.test.tsx`
- **Run**: `cd frontend && npm test`
- **Setup**: `src/test/setup.ts` imports @testing-library/jest-dom

## Test Writing Guidelines

### Backend Unit Tests
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated jobs', async () => {
      const mockJobs = [{ id: '1', title: 'Test Job' }];
      prisma.job.findMany.mockResolvedValue(mockJobs);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.jobs).toEqual(mockJobs);
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 0 })
      );
    });
  });
});
```

### Frontend Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../components/Footer';

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

describe('Footer', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText('RozgarScout')).toBeInTheDocument();
  });

  it('does not show Account section for guests', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.queryByText('Account')).not.toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright - to be set up)
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads and shows jobs', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('text=Never Miss a')).toBeVisible();
  await expect(page.locator('text=Browse')).toBeVisible();
});
```

## Coverage Targets
- **Backend services**: >80% line coverage
- **Backend controllers**: >70% line coverage
- **Frontend components**: >60% line coverage
- **Frontend pages**: >50% line coverage

## Test Categories

### 1. Unit Tests (Fast, Isolated)
- Test individual functions/methods
- Mock all external dependencies
- Run in <1ms per test
- Cover: happy path, error cases, edge cases

### 2. Integration Tests (Real Dependencies)
- Test module interactions
- Use real DB (testcontainers) or in-memory DB
- Test API endpoints with supertest
- Verify Prisma queries return expected shapes

### 3. E2E Tests (Full Stack)
- Test complete user flows
- Use Playwright for browser automation
- Test against running app
- Cover critical paths: register, login, apply, track

## How to Write Tests

1. Read the source file to understand what needs testing
2. Identify public methods/endpoints
3. Write tests for each method:
   - Happy path (expected behavior)
   - Error handling (invalid input, not found, unauthorized)
   - Edge cases (empty data, max values, null fields)
4. Mock external services (Prisma, Redis, HTTP, email)
5. Run tests to verify they pass
6. Check coverage and add missing tests

## Mocking Patterns

### Prisma Mock
```typescript
const prismaMock = {
  job: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};
```

### Redis Mock
```typescript
const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
};
```

### HTTP Mock (axios)
```typescript
jest.mock('../lib/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
```

## Common Test Anti-Patterns to Avoid
- Testing implementation details instead of behavior
- Shared mutable state between tests
- Tests that depend on execution order
- Missing cleanup (afterEach/afterAll)
- Testing framework internals instead of your code
- Flaky tests (async timing issues)
- Console.log in tests (use assertions instead)

## Important project-specific rule
The frontend uses Vitest. Use `vi.mock`, `vi.fn`, `vi.spyOn`, etc. Do not copy Jest-only APIs into frontend tests.
