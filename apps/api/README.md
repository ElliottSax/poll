# @poll/api

> Fastify REST API server for the polling dashboard

---

## Overview

High-performance API server built with Fastify, providing RESTful endpoints for election polling data, forecasts, and analysis.

## 🚀 Features

✅ **Fast & Lightweight** - Fastify framework for maximum performance
✅ **Type-Safe** - Full TypeScript with Zod validation
✅ **Auto-Documentation** - OpenAPI/Swagger UI at `/docs`
✅ **Security** - Helmet, CORS, rate limiting
✅ **Database** - Prisma ORM with PostgreSQL
✅ **Error Handling** - Consistent error responses
✅ **Development** - Hot reload with tsx watch

## 📦 Package Contents

```
apps/api/
├── src/
│   ├── routes/
│   │   ├── races.ts           # Race endpoints
│   │   ├── polls.ts           # Poll endpoints
│   │   └── pollsters.ts       # Pollster endpoints
│   ├── controllers/           # (Future: business logic)
│   ├── services/              # (Future: data services)
│   ├── middleware/
│   │   └── error-handler.ts   # Global error handling
│   ├── schemas/               # (Future: Zod schemas)
│   ├── config/
│   │   └── env.ts             # Environment validation
│   └── index.ts               # Server entry point
├── tsconfig.json
└── package.json
```

## 🏁 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (running)
- Database setup complete (from `@poll/database`)

### Installation

```bash
cd apps/api
npm install
```

### Environment Setup

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://poll_user:poll_password@localhost:5432/poll_db"

# Server
API_PORT=3001
API_HOST=localhost
NODE_ENV=development

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Optional: Redis for distributed rate limiting
# REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL=debug
```

### Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

## 📚 API Documentation

### Interactive Docs

Visit `http://localhost:3001/docs` for Swagger UI

### Endpoints

#### Races

```
GET /api/races
  Query: type, state, status, limit, offset
  Returns: List of races

GET /api/races/:slug
  Returns: Detailed race info with recent polls

GET /api/races/:slug/polls
  Query: limit, offset
  Returns: All polls for a race
```

#### Polls

```
GET /api/polls
  Query: methodology, populationType, pollsterId, fromDate, toDate, limit, offset
  Returns: List of polls

GET /api/polls/:id
  Returns: Detailed poll information
```

#### Pollsters

```
GET /api/pollsters
  Query: orderBy (name|accuracy|pollCount), limit, offset
  Returns: List of pollsters

GET /api/pollsters/:slug
  Returns: Detailed pollster info with recent polls

GET /api/pollsters/:slug/polls
  Query: limit, offset
  Returns: All polls from a pollster
```

#### Health

```
GET /health
  Returns: Server health status
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Compile TypeScript to JavaScript
npm run start            # Run production build

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Lint and auto-fix
npm run type-check       # Type check without emitting

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

## 📊 Example Requests

### List All Races

```bash
curl http://localhost:3001/api/races
```

Response:
```json
{
  "races": [
    {
      "id": "uuid",
      "raceType": "PRESIDENT",
      "raceName": "2024 United States Presidential Election",
      "slug": "2024-presidential",
      "state": null,
      "electionDate": "2024-11-05",
      "status": "ACTIVE",
      "candidates": {...},
      "currentLeader": "Joe Biden",
      "competitiveRating": "Toss-up",
      "importanceScore": 10,
      "_count": { "polls": 45 }
    }
  ],
  "total": 4,
  "limit": 20,
  "offset": 0
}
```

### Get Race by Slug

```bash
curl http://localhost:3001/api/races/2024-presidential
```

### List Polls with Filters

```bash
curl "http://localhost:3001/api/polls?methodology=PHONE&limit=10"
```

### Get Pollster Rankings

```bash
curl "http://localhost:3001/api/pollsters?orderBy=accuracy"
```

## 🛡️ Security Features

### Rate Limiting

Default: 100 requests per minute per IP

Can be configured via environment variables:
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

For distributed rate limiting, set `REDIS_URL`.

### CORS

Configured to allow requests from frontend (localhost:3000)

Update `ALLOWED_ORIGINS` in `.env` for production.

### Helmet

Security headers automatically applied:
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (production)
- Content-Security-Policy (production)

## 🔍 Request Validation

All endpoints use Zod for request validation:

```typescript
// Example: Query validation
const listRacesSchema = z.object({
  type: z.nativeEnum(RaceType).optional(),
  state: z.string().length(2).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
```

Invalid requests return 400 with detailed error messages.

## ⚠️ Error Handling

Consistent error format:

```json
{
  "error": "Error Type",
  "message": "Human-readable message",
  "details": [] // Optional: validation errors
}
```

Error types:
- 400 - Bad Request (validation errors)
- 404 - Not Found
- 409 - Conflict (duplicate records)
- 429 - Too Many Requests (rate limit)
- 500 - Internal Server Error

## 🏗️ Architecture

### Database Access

Uses `@poll/database` package:

```typescript
import { prisma, Race, Poll } from '@poll/database'

const races = await prisma.race.findMany()
```

### Route Structure

```typescript
// src/routes/races.ts
export async function raceRoutes(server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    // Handler logic
  })
}
```

Routes are registered in `src/index.ts`:

```typescript
await server.register(raceRoutes, { prefix: '/api/races' })
```

## 📈 Performance

### Optimizations

- **Database Indexes** - All queries use indexed fields
- **Pagination** - Default limit of 20, max 100
- **Selective Queries** - Only fetch needed fields
- **Connection Pooling** - Prisma handles connection reuse

### Monitoring

Fastify's built-in logger (Pino) provides:
- Request/response logging
- Error logging
- Performance metrics

## 🧪 Testing

(Coming soon)

```bash
npm run test
```

Test structure:
```
tests/
├── unit/
│   └── routes/
├── integration/
│   └── api/
└── fixtures/
```

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Required for production:
```env
NODE_ENV=production
DATABASE_URL=<production-db-url>
ALLOWED_ORIGINS=<production-frontend-url>
REDIS_URL=<redis-url> # Recommended for rate limiting
```

### Docker (Future)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## 🔗 Integration with Other Instances

### Used By

- **Instance 1 (Frontend)** - Consumes all API endpoints
- **Instance 3 (Scraper)** - (Future: webhook triggers)
- **Instance 5 (Forecasting)** - (Future: forecast endpoints)

### Depends On

- **Instance 4 (Database)** - `@poll/database` package

## 🤝 Contributing

### Adding New Endpoints

1. Create route file in `src/routes/`
2. Define Zod schemas for validation
3. Implement handlers with Prisma queries
4. Register route in `src/index.ts`
5. Add OpenAPI schema for docs
6. Test endpoints

### Code Style

- Use TypeScript strict mode
- Validate all inputs with Zod
- Handle errors gracefully
- Add JSDoc comments
- Follow existing patterns

## 📝 Instance 2 Checklist

✅ Fastify server setup with middleware
✅ Race endpoints (list, detail, polls)
✅ Poll endpoints (list, detail)
✅ Pollster endpoints (list, detail, polls)
✅ Request validation with Zod
✅ Error handling middleware
✅ OpenAPI documentation
✅ Type-safe with TypeScript
✅ CORS and security headers
✅ Rate limiting
✅ Environment configuration

**Status**: Core API ready for frontend integration! 🚀

## 🔮 Future Enhancements

- [ ] Authentication middleware (JWT)
- [ ] API key management
- [ ] WebSocket support for real-time updates
- [ ] Caching layer (Redis)
- [ ] Forecast endpoints
- [ ] Scenario endpoints
- [ ] User endpoints
- [ ] Analytics endpoints
- [ ] Comprehensive test suite
- [ ] Performance benchmarks

---

**Instance 2: Backend API** - Ready to serve data to the frontend!
