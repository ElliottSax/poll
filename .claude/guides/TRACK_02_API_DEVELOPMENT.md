# 🔌 Track 2: API Development - Starter Guide

**Status**: 🟡 Available
**Duration**: 3-4 weeks
**Priority**: P0 (Critical for MVP)
**Dependencies**: Track 6 (Database) recommended but not required

---

## 🎯 Objectives

Build a complete REST API for the polling dashboard with:
- Clean, RESTful endpoints
- Strong type safety with Zod validation
- Comprehensive error handling
- OpenAPI/Swagger documentation
- Rate limiting and security
- Unit and integration tests

---

## 📋 Task Breakdown

### Week 1: Core Setup & Races API
- [ ] Fix existing type errors in `apps/api/src/index.ts` (logger issue)
- [ ] Fix type errors in `apps/api/src/utils/prisma.ts` (error handlers)
- [ ] Review and enhance `GET /api/races` endpoint
- [ ] Review and enhance `GET /api/races/:slug` endpoint
- [ ] Add comprehensive input validation
- [ ] Add response caching optimization
- [ ] Write unit tests for races routes
- [ ] Update Swagger documentation

### Week 2: Polls API
- [ ] Enhance `GET /api/polls` - List polls with pagination
- [ ] Enhance `GET /api/polls/:id` - Get single poll
- [ ] Add advanced filtering (race, pollster, date range, methodology)
- [ ] Add aggregation endpoint (weighted averages by race)
- [ ] Add trend analysis endpoint
- [ ] Write comprehensive unit tests
- [ ] Update Swagger docs

### Week 3: Pollsters & Forecasts APIs
- [ ] Enhance `GET /api/pollsters` - List pollsters with rankings
- [ ] Enhance `GET /api/pollsters/:slug` - Get pollster details & accuracy
- [ ] Implement `GET /api/forecasts` - List forecasts
- [ ] Implement `GET /api/forecasts/:raceSlug` - Get race forecast with history
- [ ] Add pollster comparison endpoint
- [ ] Write unit tests
- [ ] Update Swagger docs

### Week 4: Middleware, Testing & Polish
- [ ] Create custom error handling middleware
- [ ] Add request validation middleware
- [ ] Enhance rate limiting configuration
- [ ] Add request logging middleware
- [ ] Write integration tests for all endpoints
- [ ] Add API response time monitoring
- [ ] Performance optimization
- [ ] Final code review and cleanup
- [ ] Complete API documentation

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
# Update .claude/WORK_ASSIGNMENTS.md
# Change Track 2 status to 🔵 IN PROGRESS
# Add your session ID and instance name

git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 2 - API Development"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-api-development-[YOUR-SESSION-ID]

# Example:
# git checkout -b claude/poll-api-development-ABC123XYZ
```

### 3. Fix Known Issues First

**Priority**: Fix these type errors before adding new features

#### Issue 1: Logger Type in index.ts

**File**: `apps/api/src/index.ts:22`

```typescript
// Current (causes type error):
import { logger } from './utils/logger'

const fastify = Fastify({
  logger: logger,  // ❌ Type mismatch
  requestIdHeader: 'x-request-id',
  // ...
})

// Fix - Use Fastify's built-in logger:
const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    prettyPrint: config.nodeEnv !== 'production',
  },
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  trustProxy: true,
})

// You can remove the custom logger import if not needed elsewhere
```

#### Issue 2: Error Handlers in prisma.ts

**File**: `apps/api/src/utils/prisma.ts:35,40`

```typescript
// Current (implicit any):
.catch((e) => {  // ❌ Parameter 'e' implicitly has an 'any' type
  console.error('Prisma error:', e)
})

// Fix - Add explicit type:
.catch((e: Error) => {
  console.error('Prisma error:', e.message)
})

// Or for more type safety:
.catch((e: unknown) => {
  if (e instanceof Error) {
    console.error('Prisma error:', e.message)
  } else {
    console.error('Unknown error:', e)
  }
})
```

### 4. Verify Type Checking Passes

```bash
npm run type-check
```

Should show no errors after fixes!

---

## 💡 Implementation Patterns

### Pattern 1: Request Validation with Zod

The starter code already uses Zod. Here's the pattern to follow:

```typescript
import { z } from 'zod'

// Define schema for query parameters
const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  state: z.string().length(2).optional(),
  type: z.enum(['president', 'senate', 'house', 'governor']).optional(),
})

// Infer TypeScript type from schema
type QueryType = z.infer<typeof QuerySchema>

// Use in route handler
fastify.get('/', async (request, reply) => {
  // Parse and validate
  const query = QuerySchema.parse(request.query)

  // Now query is typed and validated!
  // query.page is number
  // query.state is string | undefined
})
```

### Pattern 2: Response Caching with Redis

Example from `races.ts`:

```typescript
// Build cache key
const cacheKey = `races:${JSON.stringify(where)}:${query.limit}:${query.offset}`

// Try cache first
const cached = await cache.get(cacheKey)
if (cached) {
  return reply.send(cached)
}

// Query database if cache miss
const data = await prisma.race.findMany(/* ... */)

// Cache for 5 minutes (300 seconds)
await cache.set(cacheKey, data, 300)

return reply.send(data)
```

**Cache TTL Guidelines**:
- Race list: 5 minutes (300s)
- Individual race: 5 minutes (300s)
- Polls list: 2 minutes (120s)
- Individual poll: 10 minutes (600s)
- Forecasts: 1 minute (60s) - changes frequently
- Pollster data: 1 hour (3600s) - rarely changes

### Pattern 3: Pagination Response Format

Consistent format across all list endpoints:

```typescript
const response = {
  data: items,
  meta: {
    total: totalCount,
    limit: query.limit,
    offset: query.offset,
    hasMore: totalCount > query.offset + query.limit,
    page: Math.floor(query.offset / query.limit) + 1,
    totalPages: Math.ceil(totalCount / query.limit),
  },
}
```

### Pattern 4: Error Handling

```typescript
try {
  // Validate input
  const params = ParamsSchema.parse(request.params)

  // Query database
  const item = await prisma.model.findUnique({ where: { id: params.id } })

  // Handle not found
  if (!item) {
    return reply.code(404).send({
      error: 'Not Found',
      message: 'Resource not found',
      statusCode: 404,
    })
  }

  return reply.send(item)

} catch (error) {
  // Validation error
  if (error instanceof z.ZodError) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: 'Invalid request parameters',
      details: error.errors,
      statusCode: 400,
    })
  }

  // Log unexpected errors
  fastify.log.error(error)

  return reply.code(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  })
}
```

---

## 📝 Endpoint Specifications

### Races Endpoints

#### `GET /api/races`
**Description**: List all races with filtering and pagination

**Query Parameters**:
- `type` - Filter by race type (president, senate, house, governor, mayor)
- `state` - Filter by state code (e.g., "CA", "TX")
- `status` - Filter by status (upcoming, active, completed)
- `year` - Filter by election year
- `limit` - Items per page (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

**Response**: 200 OK
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "2024-president",
      "name": "2024 Presidential Election",
      "raceType": "president",
      "state": "US",
      "electionDate": "2024-11-05",
      "status": "active",
      "importanceScore": 100
    }
  ],
  "meta": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "page": 1,
    "totalPages": 8
  }
}
```

#### `GET /api/races/:slug`
**Description**: Get detailed race information

**Path Parameters**:
- `slug` - Race slug (e.g., "2024-president", "2024-senate-pennsylvania")

**Query Parameters**:
- `includePoll` - Include recent polls (default: true)
- `pollLimit` - Number of polls to include (default: 10, max: 50)
- `includeForecast` - Include latest forecast (default: true)

**Response**: 200 OK
```json
{
  "id": "uuid",
  "slug": "2024-president",
  "name": "2024 Presidential Election",
  "raceType": "president",
  "state": "US",
  "electionDate": "2024-11-05",
  "polls": [ /* recent polls */ ],
  "forecasts": [ /* latest forecast */ ],
  "averages": {
    "lastUpdated": "2024-01-15T10:30:00Z",
    "candidates": [
      { "name": "Candidate A", "party": "D", "average": 48.5 },
      { "name": "Candidate B", "party": "R", "average": 46.2 }
    ]
  }
}
```

**Response**: 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Race not found",
  "statusCode": 404
}
```

### Polls Endpoints

#### `GET /api/polls`
**Description**: List polls with advanced filtering

**Query Parameters**:
- `raceId` or `raceSlug` - Filter by race
- `pollsterId` or `pollsterSlug` - Filter by pollster
- `startDate` - Filter polls from date (ISO 8601)
- `endDate` - Filter polls to date (ISO 8601)
- `methodology` - Filter by methodology (phone, online, ivr, mixed)
- `population` - Filter by population (lv, rv, a)
- `minSampleSize` - Minimum sample size
- `limit` - Items per page (default: 20, max: 100)
- `offset` - Pagination offset

#### `GET /api/polls/:id`
**Description**: Get single poll with full details

### Pollsters Endpoints

#### `GET /api/pollsters`
**Description**: List all pollsters with rankings

**Query Parameters**:
- `sortBy` - Sort field (rating, accuracy, recency)
- `minRating` - Filter by minimum rating (A+, A, B, C, D, F)
- `limit`, `offset` - Pagination

#### `GET /api/pollsters/:slug`
**Description**: Get pollster details with accuracy metrics

**Includes**:
- Historical accuracy by race type
- Methodologies used
- House effects (partisan lean)
- Recent polls
- Transparency score

### Forecasts Endpoints

#### `GET /api/forecasts`
**Description**: List forecasts for all active races

#### `GET /api/forecasts/:raceSlug`
**Description**: Get forecast with historical data

**Includes**:
- Current win probabilities
- Historical forecast changes
- Confidence intervals
- Monte Carlo simulation results

---

## 🧪 Testing Requirements

### Unit Tests (Jest)

Create tests in `apps/api/tests/routes/`

**Example**: `apps/api/tests/routes/races.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { build } from '../helper'

describe('Races API', () => {
  let app: any

  beforeAll(async () => {
    app = await build()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/races', () => {
    it('should return paginated races', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?limit=10',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toHaveProperty('data')
      expect(response.json()).toHaveProperty('meta')
      expect(response.json().meta.limit).toBe(10)
    })

    it('should filter by race type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?type=president',
      })

      expect(response.statusCode).toBe(200)
      const races = response.json().data
      races.forEach((race: any) => {
        expect(race.raceType).toBe('president')
      })
    })

    it('should return 400 for invalid query params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races?limit=invalid',
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /api/races/:slug', () => {
    it('should return race details', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/races/2024-president',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toHaveProperty('slug', '2024-president')
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

**Test Coverage Goals**:
- Unit tests: >80% coverage
- All endpoints tested
- All error cases tested
- Validation rules tested

### Integration Tests

Test database interactions, caching, and full request flow.

---

## 📚 Resources

### Existing Files to Review
- `apps/api/src/index.ts` - Main server setup (fix type errors here)
- `apps/api/src/routes/races.ts` - Example routes implementation
- `apps/api/src/routes/polls.ts` - Polls routes (enhance these)
- `apps/api/src/routes/pollsters.ts` - Pollsters routes (enhance these)
- `apps/api/src/routes/forecasts.ts` - Forecasts routes (implement these)
- `apps/api/src/utils/prisma.ts` - Database client (fix error handlers)
- `apps/api/src/utils/redis.ts` - Cache client

### Documentation
- Fastify docs: https://www.fastify.io/docs/latest/
- Zod docs: https://zod.dev/
- Prisma docs: https://www.prisma.io/docs/

### Code Templates
- `.claude/templates/api-route-template.ts` - Route template

---

## ✅ Definition of Done

Track 2 is complete when:

- [ ] All type errors fixed
- [ ] All 4 main endpoint groups implemented (races, polls, pollsters, forecasts)
- [ ] Full Zod validation on all inputs
- [ ] Proper error handling with meaningful messages
- [ ] Redis caching implemented
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests for critical paths
- [ ] Swagger documentation updated
- [ ] Code reviewed and clean
- [ ] Performance tested (response times <200ms)
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 💬 Need Help?

- Review existing routes in `apps/api/src/routes/`
- Check `.claude/KNOWN_ISSUES.md` for known problems
- Use the template: `.claude/templates/api-route-template.ts`
- Refer to the parallel dev guide: `.claude/PARALLEL_DEV_GUIDE.md`

---

**Good luck building the API! 🚀**
