# 🧪 Track 7: Testing Infrastructure - Starter Guide

**Status**: 🟡 Available
**Duration**: 2-3 weeks
**Priority**: P1 (High - Quality assurance)
**Dependencies**: None (can start immediately and run parallel with all tracks)

---

## 🎯 Objectives

Set up comprehensive testing infrastructure:
- Unit testing with Jest
- Component testing with React Testing Library
- E2E testing with Playwright
- API testing
- Test coverage reporting
- CI/CD integration
- Testing best practices documentation

---

## 📋 Task Breakdown

### Week 1: Jest & Unit Testing Setup
- [ ] Configure Jest for TypeScript
- [ ] Set up test environment for API
- [ ] Set up test environment for frontend
- [ ] Configure test coverage reporting
- [ ] Write example unit tests for utilities
- [ ] Write example tests for API routes
- [ ] Configure test scripts in package.json
- [ ] Integrate with CI/CD

### Week 2: Component & Integration Testing
- [ ] Configure React Testing Library
- [ ] Set up MSW (Mock Service Worker) for API mocking
- [ ] Write component test examples
- [ ] Write integration test examples
- [ ] Configure test database
- [ ] Write database test helpers
- [ ] Add visual regression testing (optional)

### Week 3: E2E Testing & Documentation
- [ ] Configure Playwright
- [ ] Write E2E test examples
- [ ] Set up test fixtures and helpers
- [ ] Configure parallel test execution
- [ ] Add test reporting
- [ ] Write testing documentation
- [ ] Create testing guide for other developers
- [ ] Final optimization

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 7 - Testing Infrastructure"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-testing-[YOUR-SESSION-ID]
```

### 3. Install Testing Dependencies

```bash
# Root level - for workspace scripts
npm install -D jest @types/jest ts-jest

# API testing
cd apps/api
npm install -D jest @types/jest ts-jest supertest @types/supertest

# Frontend testing
cd ../web
npm install -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E testing (root level)
cd ../..
npm install -D @playwright/test
npx playwright install
```

---

## 💡 Implementation Guide

### Jest Configuration

**File**: `jest.config.js` (root)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  projects: ['<rootDir>/apps/*/jest.config.js'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'apps/*/src/**/*.{ts,tsx}',
    '!apps/*/src/**/*.d.ts',
    '!apps/*/src/**/*.stories.tsx',
  ],
}
```

**File**: `apps/api/jest.config.js`

```javascript
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.d.ts'],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

**File**: `apps/web/jest.config.js`

```javascript
/** @type {import('jest').Config} */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'web',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**File**: `apps/web/jest.setup.js`

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
```

### Test Helpers

**File**: `apps/api/tests/setup.ts`

```typescript
import { PrismaClient } from '@prisma/client'

// Set test environment
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/poll_test'
process.env.REDIS_URL = 'redis://localhost:6379/1'

// Global test timeout
jest.setTimeout(30000)

// Clean up after all tests
afterAll(async () => {
  const prisma = new PrismaClient()
  await prisma.$disconnect()
})
```

**File**: `apps/api/tests/helpers/app.ts`

```typescript
import Fastify from 'fastify'
import { FastifyInstance } from 'fastify'

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  // Register your routes
  await app.register(require('../../src/routes/races'), { prefix: '/api/races' })
  await app.register(require('../../src/routes/polls'), { prefix: '/api/polls' })

  return app
}

export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close()
}
```

**File**: `apps/api/tests/helpers/database.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function clearDatabase() {
  await prisma.pollResult.deleteMany()
  await prisma.poll.deleteMany()
  await prisma.forecast.deleteMany()
  await prisma.raceCandidate.deleteMany()
  await prisma.race.deleteMany()
  await prisma.pollster.deleteMany()
  await prisma.candidate.deleteMany()
}

export async function seedTestData() {
  // Create test pollster
  const pollster = await prisma.pollster.create({
    data: {
      slug: 'test-pollster',
      name: 'Test Pollster',
      rating: 'A',
    },
  })

  // Create test race
  const race = await prisma.race.create({
    data: {
      slug: '2024-test-race',
      name: '2024 Test Race',
      raceType: 'PRESIDENT',
      state: 'US',
      electionDate: new Date('2024-11-05'),
      status: 'ACTIVE',
    },
  })

  return { pollster, race }
}

export { prisma }
```

### Unit Test Examples

**File**: `apps/api/tests/utils/calculations.test.ts`

```typescript
import { calculateWeightedAverage } from '../../src/utils/calculations'

describe('calculateWeightedAverage', () => {
  it('should calculate simple average', () => {
    const values = [10, 20, 30]
    const weights = [1, 1, 1]

    const result = calculateWeightedAverage(values, weights)

    expect(result).toBe(20)
  })

  it('should calculate weighted average', () => {
    const values = [10, 20, 30]
    const weights = [1, 2, 1]

    const result = calculateWeightedAverage(values, weights)

    expect(result).toBe(20)
  })

  it('should handle empty arrays', () => {
    expect(() => calculateWeightedAverage([], [])).toThrow()
  })

  it('should handle mismatched array lengths', () => {
    expect(() => calculateWeightedAverage([10, 20], [1])).toThrow()
  })
})
```

### API Integration Test Examples

**File**: `apps/api/tests/routes/races.test.ts`

```typescript
import { buildTestApp, closeTestApp } from '../helpers/app'
import { clearDatabase, seedTestData, prisma } from '../helpers/database'
import { FastifyInstance } from 'fastify'

describe('Races API', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildTestApp()
    await clearDatabase()
  })

  afterAll(async () => {
    await closeTestApp(app)
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/races', () => {
    it('should return empty array when no races exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        data: [],
        meta: expect.objectContaining({
          total: 0,
        }),
      })
    })

    it('should return races when they exist', async () => {
      await seedTestData()

      const response = await app.inject({
        method: 'GET',
        url: '/api/races',
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0]).toMatchObject({
        slug: '2024-test-race',
        name: '2024 Test Race',
      })
    })

    it('should filter by race type', async () => {
      await seedTestData()

      const response = await app.inject({
        method: 'GET',
        url: '/api/races?type=president',
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.data).toHaveLength(1)
    })

    it('should paginate results', async () => {
      await seedTestData()

      const response = await app.inject({
        method: 'GET',
        url: '/api/races?limit=10&offset=0',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().meta).toMatchObject({
        limit: 10,
        offset: 0,
      })
    })
  })

  describe('GET /api/races/:slug', () => {
    it('should return race by slug', async () => {
      const { race } = await seedTestData()

      const response = await app.inject({
        method: 'GET',
        url: `/api/races/${race.slug}`,
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        slug: race.slug,
        name: race.name,
      })
    })

    it('should return 404 for non-existent race', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races/does-not-exist',
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
```

### Component Test Examples

**File**: `apps/web/components/ui/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should apply variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)

    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')

    rerender(<Button variant="danger">Danger</Button>)

    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
  })
})
```

**File**: `apps/web/components/features/polls/PollCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { PollCard } from './PollCard'

const mockPoll = {
  pollster: 'Test Pollster',
  date: new Date('2024-01-15'),
  sampleSize: 1000,
  marginOfError: 3.1,
  candidates: [
    { name: 'Candidate A', party: 'D' as const, percentage: 48.5 },
    { name: 'Candidate B', party: 'R' as const, percentage: 46.2 },
  ],
  methodology: 'Online',
  population: 'LV',
}

describe('PollCard', () => {
  it('should display pollster name', () => {
    render(<PollCard {...mockPoll} />)

    expect(screen.getByText('Test Pollster')).toBeInTheDocument()
  })

  it('should display all candidates', () => {
    render(<PollCard {...mockPoll} />)

    expect(screen.getByText('Candidate A')).toBeInTheDocument()
    expect(screen.getByText('Candidate B')).toBeInTheDocument()
  })

  it('should display percentages', () => {
    render(<PollCard {...mockPoll} />)

    expect(screen.getByText('48.5%')).toBeInTheDocument()
    expect(screen.getByText('46.2%')).toBeInTheDocument()
  })

  it('should display sample size', () => {
    render(<PollCard {...mockPoll} />)

    expect(screen.getByText(/n=1,000/i)).toBeInTheDocument()
  })

  it('should display margin of error', () => {
    render(<PollCard {...mockPoll} />)

    expect(screen.getByText(/MoE ±3.1%/i)).toBeInTheDocument()
  })
})
```

### E2E Test Configuration

**File**: `playwright.config.ts` (root)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

**File**: `tests/e2e/homepage.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/polling dashboard/i)
  })

  test('should display featured races', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /featured races/i })).toBeVisible()

    // Should have race cards
    const raceCards = page.locator('[data-testid="race-card"]')
    await expect(raceCards.first()).toBeVisible()
  })

  test('should navigate to race page when clicking race card', async ({ page }) => {
    await page.goto('/')

    // Click first race card
    await page.locator('[data-testid="race-card"]').first().click()

    // Should navigate to race detail
    await expect(page).toHaveURL(/\/races\//)
  })
})
```

**File**: `tests/e2e/race-detail.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Race Detail Page', () => {
  test('should display race information', async ({ page }) => {
    await page.goto('/races/2024-president')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/election date/i)).toBeVisible()
  })

  test('should display polls table', async ({ page }) => {
    await page.goto('/races/2024-president')

    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should filter polls', async ({ page }) => {
    await page.goto('/races/2024-president')

    // Click filter button
    await page.getByRole('button', { name: /filter/i }).click()

    // Select a pollster
    await page.getByRole('checkbox', { name: /monmouth/i }).click()

    // Apply filter
    await page.getByRole('button', { name: /apply/i }).click()

    // Table should update
    await expect(page.getByRole('table')).toBeVisible()
  })
})
```

### Package.json Scripts

Update `package.json` files with test scripts:

**Root `package.json`**:
```json
{
  "scripts": {
    "test": "turbo run test",
    "test:unit": "turbo run test:unit",
    "test:integration": "turbo run test:integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "turbo run test:coverage"
  }
}
```

**Apps `package.json`**:
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🔄 CI/CD Integration

Update `.github/workflows/ci.yml`:

```yaml
test:
  name: Run Tests
  runs-on: ubuntu-latest

  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
        POSTGRES_DB: poll_test
      ports:
        - 5432:5432

    redis:
      image: redis:7
      ports:
        - 6379:6379

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/poll_test

    - name: Install Playwright
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

---

## ✅ Definition of Done

Track 7 is complete when:

- [ ] Jest configured for all workspaces
- [ ] React Testing Library set up
- [ ] Playwright configured for E2E tests
- [ ] Test helpers and utilities created
- [ ] Example tests written for each type
- [ ] Coverage reporting configured (>70% threshold)
- [ ] Tests integrated with CI/CD
- [ ] Test database setup documented
- [ ] MSW configured for API mocking (optional)
- [ ] Testing documentation written
- [ ] All tests passing in CI/CD
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 📚 Resources

- Jest: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
- MSW: https://mswjs.io/

---

**Test everything! 🧪**
