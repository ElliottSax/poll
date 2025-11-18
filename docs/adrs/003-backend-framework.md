# ADR 003: Backend Framework Selection - Fastify with tRPC

**Status**: Accepted
**Date**: 2025-11-18
**Deciders**: Technical Team
**Context**: Need to select backend API framework for polling dashboard

---

## Context and Problem Statement

The backend API must provide:
- **High Performance**: Handle 10K+ requests/second during election nights
- **Type Safety**: End-to-end type safety between frontend and backend
- **Developer Experience**: Fast iteration, excellent debugging, minimal boilerplate
- **Scalability**: Horizontal scaling with stateless architecture
- **Real-time**: Support for WebSocket/SSE for live poll updates
- **API Standards**: REST for public API, efficient internal communication

We need a framework that balances raw performance with developer productivity.

---

## Decision Drivers

1. **Performance**: Low latency (<50ms API response), high throughput (10K+ req/sec)
2. **Type Safety**: TypeScript end-to-end with automatic type inference
3. **Developer Experience**: Minimal boilerplate, fast iteration, good debugging
4. **Ecosystem**: Rich middleware, plugins, database integrations
5. **Real-time**: Native WebSocket/SSE support for election night updates
6. **Learning Curve**: Reasonable ramp-up for solo developer
7. **Documentation**: Comprehensive docs, active community
8. **Production Ready**: Battle-tested at scale by major companies

---

## Options Considered

### Option 1: Fastify + tRPC ✅

**Pros:**
- **Blazing Fast**: 2-3x faster than Express (76K req/sec vs 30K)
- **Low Overhead**: 8ms average latency vs Express 23ms
- **Type Safety**: tRPC provides end-to-end type safety without codegen
- **Schema Validation**: Built-in JSON Schema validation with Ajv (fastest validator)
- **Plugin System**: Rich ecosystem (CORS, auth, compression, rate limiting)
- **Async/Await**: First-class async support (no callback hell)
- **Logging**: Excellent Pino integration (fast structured logging)
- **TypeScript First**: Written in TypeScript, great DX
- **Real-time**: Native WebSocket support with @fastify/websocket
- **OpenAPI**: Automatic OpenAPI/Swagger generation with @fastify/swagger

**Cons:**
- Smaller ecosystem than Express (but growing rapidly)
- Some middleware requires Fastify-specific wrappers
- Learning curve for plugin system

**Performance Benchmarks:**
- Requests/sec: 76,000 (vs Express 30,000)
- Latency p50: 8ms (vs Express 23ms)
- Latency p99: 45ms (vs Express 120ms)
- Memory usage: 25MB baseline (vs Express 40MB)

**Developer Experience:**
```typescript
// tRPC router with end-to-end type safety
export const raceRouter = router({
  list: publicProcedure
    .input(z.object({ state: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.race.findMany({
        where: { state_code: input.state },
        include: { polls: { take: 10 } },
      });
    }),

  byId: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return ctx.db.race.findUnique({
        where: { id: input },
        include: { polls: true, forecast: true },
      });
    }),
});

// Frontend gets full type safety automatically
const race = await trpc.race.byId.query('race-123'); // Fully typed!
```

---

### Option 2: Express.js

**Pros:**
- Largest ecosystem (most npm packages)
- Proven track record (15+ years)
- Massive community
- Every library supports Express
- Extensive tutorials and documentation

**Cons:**
- ❌ **Slow**: 30K req/sec (2.5x slower than Fastify)
- ❌ **No Type Safety**: Requires manual TypeScript wrappers
- ❌ **Callback-based**: Awkward async handling (unless using middleware)
- ❌ **No Built-in Validation**: Requires express-validator or Joi
- ❌ **Higher Latency**: 23ms p50 vs Fastify 8ms
- ❌ **Legacy Design**: Built before async/await, shows its age

**Use Case Fit**: Good for simple CRUD apps, overkill for high-performance needs

---

### Option 3: NestJS

**Pros:**
- Enterprise-grade architecture (modules, dependency injection)
- TypeScript first
- Excellent documentation
- Built-in OpenAPI/Swagger
- Batteries included (validation, auth, caching, websockets)
- Similar to Angular (good for teams familiar with Angular)

**Cons:**
- ❌ **Heavy Framework**: Much larger bundle than Fastify
- ❌ **Steep Learning Curve**: Decorator-heavy, opinionated architecture
- ❌ **Overkill for Solo Dev**: Designed for large teams
- ❌ **Slower than Fastify**: Built on Express by default (can use Fastify adapter)
- ❌ **Boilerplate**: More code required for simple endpoints

**Use Case Fit**: Better for large enterprise teams, not agile solo development

---

### Option 4: Hono

**Pros:**
- Extremely fast (edge runtime optimized)
- Tiny bundle (13KB)
- Multi-runtime (Node, Bun, Deno, Cloudflare Workers)
- Simple Express-like API
- TypeScript support

**Cons:**
- ❌ **Too New**: First release in 2022 (immature)
- ❌ **Small Ecosystem**: Few plugins/middleware
- ❌ **Edge-Focused**: Optimized for edge, not traditional Node.js servers
- ❌ **Limited Database Support**: Not optimized for traditional DB connections
- ❌ **No tRPC Integration**: Would require custom setup

**Use Case Fit**: Better for edge functions, not traditional API servers with database

---

### Option 5: Koa

**Pros:**
- Created by Express team (modern reimagining)
- Async/await first-class
- Smaller core than Express
- Middleware composition
- TypeScript support

**Cons:**
- ❌ **Slower than Fastify**: 45K req/sec (40% slower)
- ❌ **Smaller Ecosystem**: Fewer plugins than Express
- ❌ **Less Popular**: Declining popularity vs Fastify
- ❌ **No Built-in Validation**: Requires external libraries
- ❌ **No Native WebSocket**: Requires additional packages

**Use Case Fit**: Good middle ground, but Fastify is faster and more popular now

---

## Decision Outcome

**Chosen Option**: Fastify 4.x + tRPC 10.x

### Rationale

Fastify + tRPC provides optimal combination of:

1. **Performance**: 2-3x faster than Express (critical for election night traffic)
2. **Type Safety**: tRPC eliminates entire class of bugs
3. **Developer Experience**: No code generation, automatic type inference
4. **Scalability**: Stateless architecture, horizontal scaling friendly
5. **Real-time Ready**: Native WebSocket support for live updates
6. **Public API**: Can expose REST endpoints alongside tRPC

### Architecture Pattern

**Monorepo Structure:**
```
apps/
  api/                    # Fastify API server
    src/
      server.ts           # Fastify server setup
      trpc/
        root.ts           # Root tRPC router
        routers/
          race.ts         # Race routes
          poll.ts         # Poll routes
          forecast.ts     # Forecast routes
        context.ts        # tRPC context (auth, db)
      rest/               # REST API for public consumption
        v1/
          routes/
            races.ts      # OpenAPI-documented routes
      plugins/
        auth.ts           # JWT authentication
        cors.ts           # CORS configuration
        rateLimit.ts      # Rate limiting
      lib/
        db.ts             # Prisma client
        redis.ts          # Redis client
```

**Fastify Server Setup:**
```typescript
// server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './trpc/root';
import { createContext } from './trpc/context';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  maxParamLength: 5000,
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL,
  credentials: true,
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Register tRPC
await fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

**tRPC Router Example:**
```typescript
// trpc/routers/race.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const raceRouter = router({
  // Public: List all active races
  list: publicProcedure
    .input(
      z.object({
        state: z.string().optional(),
        type: z.enum(['president', 'senate', 'house', 'governor']).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.race.findMany({
        where: {
          state_code: input.state,
          race_type: input.type,
          is_active: true,
        },
        take: input.limit,
        include: {
          polls: {
            take: 10,
            orderBy: { field_date: 'desc' },
          },
          forecast: true,
        },
      });
    }),

  // Public: Get race by ID with full poll history
  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const race = await ctx.db.race.findUnique({
        where: { id: input },
        include: {
          polls: {
            orderBy: { field_date: 'desc' },
          },
          forecast: true,
          candidates: true,
        },
      });

      if (!race) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Race not found',
        });
      }

      return race;
    }),

  // Protected: Create user alert for race
  createAlert: protectedProcedure
    .input(
      z.object({
        raceId: z.string().uuid(),
        threshold: z.number().min(1).max(20),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.alert.create({
        data: {
          user_id: ctx.user.id,
          race_id: input.raceId,
          threshold: input.threshold,
          is_active: true,
        },
      });
    }),

  // Subscription: Real-time poll updates
  onPollUpdate: publicProcedure
    .input(z.string().uuid())
    .subscription(async function* ({ input, ctx }) {
      // Subscribe to Redis pub/sub for real-time updates
      const subscriber = ctx.redis.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(`race:${input}:polls`);

      for await (const message of subscriber.commandIterator()) {
        if (message.type === 'message') {
          yield JSON.parse(message.data);
        }
      }
    }),
});
```

**Frontend Type Safety:**
```typescript
// apps/web/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@poll/api';

export const trpc = createTRPCReact<AppRouter>();

// In components - fully typed!
function RaceList() {
  const { data: races, isLoading } = trpc.race.list.useQuery({
    state: 'PA',
    type: 'senate',
  });

  // `races` is fully typed as Race[] with polls, forecast, candidates
  return (
    <div>
      {races?.map((race) => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  );
}
```

---

## Consequences

### Positive

✅ **Performance**: 2-3x faster than Express (76K vs 30K req/sec)
✅ **Type Safety**: tRPC eliminates API contract bugs entirely
✅ **Developer Velocity**: No API client generation, instant updates
✅ **Real-time Ready**: Native WebSocket support for election night
✅ **Validation**: Built-in JSON Schema validation with Ajv
✅ **Logging**: Structured logging with Pino (fastest Node.js logger)
✅ **OpenAPI**: Can generate OpenAPI docs for public REST API
✅ **Low Latency**: 8ms p50 response time

### Negative

⚠️ **Ecosystem**: Smaller than Express (but all major tools supported)
⚠️ **Learning Curve**: Plugin system takes time to master
⚠️ **tRPC Lock-in**: Public API needs separate REST layer
⚠️ **Debugging**: tRPC stack traces can be deep

### Mitigation Strategies

1. **Public API**: Expose REST endpoints alongside tRPC for external developers
   ```typescript
   // REST route for public API
   fastify.get('/api/v1/races/:id', async (request, reply) => {
     const race = await db.race.findUnique({
       where: { id: request.params.id },
     });
     return race;
   });
   ```

2. **Documentation**: Generate OpenAPI docs with @fastify/swagger
3. **Error Handling**: Implement global error handler with proper error codes
4. **Monitoring**: Use Pino for structured logs, send to Datadog/Sentry
5. **Rate Limiting**: Protect API with @fastify/rate-limit (100 req/min per IP)

---

## Performance Optimization Strategies

**Connection Pooling:**
```typescript
// Use PgBouncer for database connection pooling
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Points to PgBouncer
    },
  },
  log: ['error', 'warn'],
});
```

**Response Caching:**
```typescript
// Cache expensive queries with Redis
fastify.get('/api/v1/races', async (request, reply) => {
  const cacheKey = 'races:list';
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const races = await db.race.findMany();
  await redis.setex(cacheKey, 300, JSON.stringify(races)); // 5 min TTL
  return races;
});
```

**Compression:**
```typescript
import compress from '@fastify/compress';

await fastify.register(compress, {
  encodings: ['gzip', 'deflate'],
  threshold: 1024, // Only compress responses > 1KB
});
```

---

## Related Decisions

- **ADR 001**: Database selection (Prisma + PostgreSQL)
- **ADR 002**: Frontend framework (Next.js with tRPC client)
- **ADR 010**: Caching strategy (Redis for API responses)
- **ADR 012**: Deployment (Docker containers on DigitalOcean)

---

## References

- [Fastify Benchmarks](https://www.fastify.io/benchmarks/)
- [tRPC Documentation](https://trpc.io/docs)
- [Fastify vs Express Performance](https://blog.logrocket.com/fastify-vs-express/)
- [tRPC End-to-End Type Safety](https://www.youtube.com/watch?v=2LYM8gf184U)

---

## Notes

The combination of Fastify + tRPC is relatively new (tRPC released in 2020), but adoption is growing rapidly:
- Used by Cal.com, Ping.gg, and other successful startups
- Active community with 24K+ GitHub stars for tRPC
- Fastify used by Microsoft, IBM, and Red Hat in production

**Alternative Considered**: NestJS with GraphQL
**Rejected Because**: Too heavy for solo developer, GraphQL overhead not needed

**Review Date**: Month 6 (assess if tRPC meets all use cases vs REST)
