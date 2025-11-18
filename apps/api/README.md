# Poll Dashboard - API Service

Fastify backend API with TypeScript, Prisma ORM, and PostgreSQL.

## 🎯 Workstream 2: Backend/API

This is the workspace for **Instance 2** in parallel development.

## 📁 Structure

```
apps/api/
├── src/
│   ├── index.ts          # Server entry point
│   ├── routes/           # API route handlers
│   │   ├── races.ts     # Race endpoints
│   │   ├── polls.ts     # Poll endpoints
│   │   ├── pollsters.ts # Pollster endpoints
│   │   ├── forecasts.ts # Forecast endpoints
│   │   └── health.ts    # Health check
│   ├── services/         # Business logic (TODO)
│   ├── models/           # Data models (TODO)
│   ├── config/           # Configuration
│   │   └── env.ts       # Environment variables
│   └── utils/            # Utilities
│       ├── prisma.ts    # Prisma client
│       ├── logger.ts    # Logging
│       └── redis.ts     # Redis client
└── tests/                # Test files
```

## 🚀 Quick Start

### 1. Install dependencies (from project root)

```bash
cd /home/user/poll
npm install
```

### 2. Set up environment variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your configuration
# Key variables for API:
# DATABASE_URL=postgresql://user:password@localhost:5432/poll_db
# REDIS_URL=redis://localhost:6379
# API_PORT=3001
# API_SECRET=your-secret-key
```

### 3. Set up database

```bash
# Start PostgreSQL (via Docker Compose recommended)
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

### 4. Run development server

```bash
# From project root
npm run dev:api

# Or from this directory
npm run dev
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3001/health

# Test endpoint
curl http://localhost:3001/api/races

# Or open Swagger docs (if implemented)
open http://localhost:3001/docs
```

## 📋 Current Tasks (Week 1-2)

See `TASK_ASSIGNMENTS.md` for full task list.

**Priority tasks**:
- [ ] Set up Fastify server structure
- [ ] Implement core API endpoints
- [ ] Add input validation (Zod)
- [ ] Implement error handling middleware
- [ ] Add request logging
- [ ] Set up rate limiting

## 🔨 Development Workflow

### Creating a new endpoint

```typescript
// src/routes/races.ts
import { FastifyPluginAsync } from 'fastify'

const racesRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/races
  fastify.get('/races', async (request, reply) => {
    const races = await fastify.prisma.race.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    })

    return { races }
  })

  // GET /api/races/:slug
  fastify.get('/races/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const race = await fastify.prisma.race.findUnique({
      where: { slug },
      include: {
        polls: true,
        candidates: true
      }
    })

    if (!race) {
      return reply.code(404).send({ error: 'Race not found' })
    }

    return { race }
  })
}

export default racesRoute
```

### Adding validation

```typescript
import { z } from 'zod'

const getRacesSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  state: z.string().optional(),
  year: z.number().optional()
})

fastify.get('/races', async (request, reply) => {
  const params = getRacesSchema.parse(request.query)

  const races = await fastify.prisma.race.findMany({
    take: params.limit,
    skip: params.offset,
    where: {
      state: params.state,
      year: params.year
    }
  })

  return { races }
})
```

### Creating a service

```typescript
// src/services/poll-aggregation.ts

interface PollAggregationResult {
  raceId: string
  aggregatedResults: {
    candidate: string
    average: number
    margin: number
  }[]
  lastUpdated: Date
}

export class PollAggregationService {
  /**
   * Calculate weighted poll average for a race
   */
  async aggregateRacePolls(raceId: string): Promise<PollAggregationResult> {
    // TODO: Implement weighted average algorithm
    // - Fetch polls for race
    // - Apply recency weighting
    // - Apply sample size weighting
    // - Apply pollster quality weighting
    // - Calculate aggregates

    return {
      raceId,
      aggregatedResults: [],
      lastUpdated: new Date()
    }
  }

  /**
   * Calculate poll weight based on multiple factors
   */
  private calculatePollWeight(poll: any): number {
    const recencyWeight = this.calculateRecencyWeight(poll.date)
    const sampleWeight = this.calculateSampleWeight(poll.sampleSize)
    const pollsterWeight = this.getPollsterQuality(poll.pollsterId)

    return recencyWeight * sampleWeight * pollsterWeight
  }

  private calculateRecencyWeight(date: Date): number {
    const daysOld = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    // Exponential decay: half-life of 30 days
    return Math.exp(-0.0231 * daysOld)
  }

  private calculateSampleWeight(sampleSize: number): number {
    // Diminishing returns for larger samples
    return Math.sqrt(sampleSize / 1000)
  }

  private getPollsterQuality(pollsterId: string): number {
    // TODO: Implement pollster quality scoring
    return 1.0
  }
}
```

## 🗄️ Database

### Using Prisma

```typescript
// Query examples
import { prisma } from './utils/prisma'

// Find many
const races = await prisma.race.findMany({
  where: { year: 2024 },
  include: { polls: true }
})

// Find one
const race = await prisma.race.findUnique({
  where: { id: 'race-id' }
})

// Create
const newPoll = await prisma.poll.create({
  data: {
    pollster: 'Emerson',
    date: new Date(),
    raceId: 'race-id',
    // ... more fields
  }
})

// Update
const updated = await prisma.race.update({
  where: { id: 'race-id' },
  data: { featured: true }
})
```

### Running migrations

```bash
# Create migration
npm run db:migrate -- --name add_featured_field

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## 🧪 Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

Example test:
```typescript
import { test } from 'tap'
import { build } from './app'

test('GET /api/races returns races', async (t) => {
  const app = await build()

  const response = await app.inject({
    method: 'GET',
    url: '/api/races'
  })

  t.equal(response.statusCode, 200)
  t.ok(response.json().races)

  await app.close()
})
```

## 🔗 Integration Points

### With Frontend (Instance 1)

- Provides REST API endpoints
- Uses shared types from `packages/types/`
- CORS configured for local development

**API Contract**: Document in `docs/API.md`

### With Data/ML (Instance 3)

- Receives data from scrapers
- Provides endpoints for forecast data
- Shared database access

### With Infrastructure (Instance 4)

- Database schema coordination
- Deployment configuration
- Environment variables

## 🔒 Security

### Authentication (Phase 2)

```typescript
// Middleware for authenticated routes
fastify.addHook('onRequest', async (request, reply) => {
  const token = request.headers.authorization

  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }

  // Verify JWT token
  const user = await verifyToken(token)
  request.user = user
})
```

### Rate Limiting

```typescript
import rateLimit from '@fastify/rate-limit'

await fastify.register(rateLimit, {
  max: 100, // 100 requests
  timeWindow: '15 minutes'
})
```

## 📊 Logging

```typescript
// Use built-in logger
fastify.log.info('Server started')
fastify.log.error({ err }, 'Error occurred')
fastify.log.debug({ data }, 'Debug info')
```

## 🐛 Debugging

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run with inspector
node --inspect src/index.ts
```

## 📚 Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: BullMQ (Phase 2)
- **Validation**: Zod
- **Testing**: Tap / Vitest

## 🎯 Phase Roadmap

### Phase 1 (Current)
- ✅ Fastify server setup
- ✅ Route stubs created
- [ ] Core API endpoints
- [ ] Input validation
- [ ] Error handling
- [ ] Poll aggregation algorithm
- [ ] OpenAPI docs

### Phase 2 (Future)
- [ ] Authentication system
- [ ] User management
- [ ] API key system
- [ ] GraphQL endpoint
- [ ] Webhooks
- [ ] Advanced caching

---

**Instance 2 starts here! ⚙️**

See `PARALLEL_DEV_GUIDE.md` for coordination with other workstreams.

## 🚀 Your First Task

1. Review existing code in `src/routes/`
2. Create branch: `git checkout -b feature/api-core-endpoints`
3. Implement the races endpoint with real database queries!
4. Update `WORKSTREAM_STATUS.md` when you start
