# Workspace Architecture for Parallel Development

> Visual guide to the monorepo structure and instance boundaries

---

## Monorepo Overview

```
polling-dashboard/
│
├── apps/                           # Application packages (instances work here)
│   ├── web/                        # 📱 Instance 1: Next.js Frontend
│   ├── api/                        # 🔌 Instance 2: Fastify Backend
│   ├── scraper/                    # 🕷️  Instance 3: Python Scrapers
│   └── forecasting/                # 📊 Instance 5: Forecasting Service
│
├── packages/                       # Shared packages (coordinated)
│   ├── database/                   # 💾 Instance 4: Prisma Schema
│   ├── types/                      # 📝 Shared: TypeScript Types
│   ├── ui/                         # 🎨 Instance 1: UI Components
│   ├── utils/                      # 🛠️  Shared: Utilities
│   └── config/                     # ⚙️  Shared: Configuration
│
├── docs/                           # 📚 Documentation
├── .github/                        # 🤖 CI/CD workflows
└── config files                    # 📄 Root configuration
```

---

## Instance Responsibilities Matrix

| Instance | Primary Workspace | Secondary Workspace | Language/Framework | Port |
|----------|------------------|---------------------|-------------------|------|
| **Instance 1** | `apps/web/` | `packages/ui/` | TypeScript/Next.js | 3000 |
| **Instance 2** | `apps/api/` | - | TypeScript/Fastify | 3001 |
| **Instance 3** | `apps/scraper/` | - | Python | N/A |
| **Instance 4** | `packages/database/` | - | Prisma/SQL | 5432 |
| **Instance 5** | `apps/forecasting/` | - | Python/FastAPI | 8000 |

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
│                    (Frontend - Instance 1)                      │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/WebSocket
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Server (Port 3001)                     │
│                    (Backend - Instance 2)                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Routes     │ Controllers  │   Services   │  Middleware  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└────────┬────────────────────────────────────────────┬───────────┘
         │                                            │
         │ Read/Write                                 │ Read
         ▼                                            ▼
┌─────────────────────────────────────────┐   ┌─────────────────┐
│   PostgreSQL Database (Port 5432)       │   │ Forecasting API │
│   (Schema - Instance 4)                 │   │  (Instance 5)   │
│  ┌────────┬────────┬────────┬────────┐ │   │   Port 8000     │
│  │ races  │ polls  │pollster│results │ │   └─────────────────┘
│  └────────┴────────┴────────┴────────┘ │
└──────────▲──────────────────────────────┘
           │
           │ Insert
           │
┌──────────┴───────────────────────────────┐
│      Scraping Pipeline                   │
│      (Scraper - Instance 3)              │
│  ┌────────┬────────┬────────┬────────┐  │
│  │  RCP   │  538   │ Econ.  │ Others │  │
│  └────────┴────────┴────────┴────────┘  │
└──────────────────────────────────────────┘
```

---

## Instance 1: Frontend Architecture

```
apps/web/
├── app/                                # Next.js App Router
│   ├── (main)/                        # Main layout group
│   │   ├── page.tsx                   # Homepage
│   │   ├── races/
│   │   │   ├── page.tsx              # Race listing
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # Race detail
│   │   │       ├── demographics/     # Demo breakdown
│   │   │       └── history/          # Historical data
│   │   ├── pollsters/
│   │   │   ├── page.tsx              # Pollster list
│   │   │   └── [slug]/page.tsx       # Pollster detail
│   │   └── forecast/
│   │       ├── page.tsx              # Forecast overview
│   │       └── scenarios/            # What-if tool
│   ├── (dashboard)/                   # User dashboard
│   │   └── user/
│   │       ├── dashboard/
│   │       └── settings/
│   └── api/                           # API routes (if needed)
│
├── components/
│   ├── features/                      # Feature-specific
│   │   ├── race/
│   │   │   ├── RaceCard.tsx
│   │   │   ├── RaceHeader.tsx
│   │   │   └── PollingTable.tsx
│   │   ├── forecast/
│   │   │   ├── ScenarioBuilder.tsx
│   │   │   └── ElectoralMap.tsx
│   │   └── pollster/
│   │       └── AccuracyChart.tsx
│   ├── charts/                        # Visualization
│   │   ├── TrendChart.tsx
│   │   ├── ProbabilityDist.tsx
│   │   └── BarChart.tsx
│   └── layout/                        # Layout
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/
│   ├── api/                           # API client
│   ├── hooks/                         # Custom hooks
│   └── utils/                         # Utilities
│
└── styles/
    └── globals.css
```

**Key Responsibilities**:
- User interface and experience
- Client-side routing
- State management
- API consumption
- Data visualization
- Responsive design

---

## Instance 2: Backend Architecture

```
apps/api/
├── src/
│   ├── routes/                        # API routes
│   │   ├── races.ts                  # /api/races
│   │   ├── polls.ts                  # /api/polls
│   │   ├── pollsters.ts              # /api/pollsters
│   │   ├── forecasts.ts              # /api/forecasts
│   │   └── scenarios.ts              # /api/scenarios
│   │
│   ├── controllers/                   # Business logic
│   │   ├── race.controller.ts
│   │   ├── poll.controller.ts
│   │   └── pollster.controller.ts
│   │
│   ├── services/                      # Data services
│   │   ├── race.service.ts
│   │   ├── poll.service.ts
│   │   └── cache.service.ts
│   │
│   ├── middleware/                    # Middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── error-handler.ts
│   │   └── rate-limit.ts
│   │
│   ├── schemas/                       # Zod schemas
│   │   ├── race.schema.ts
│   │   └── poll.schema.ts
│   │
│   └── index.ts                       # Server entry
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── package.json
```

**Key Responsibilities**:
- RESTful API endpoints
- Request validation
- Business logic
- Database queries
- Authentication
- Rate limiting
- Error handling
- API documentation

---

## Instance 3: Scraper Architecture

```
apps/scraper/
├── src/
│   ├── scrapers/                      # Source-specific scrapers
│   │   ├── __init__.py
│   │   ├── base.py                   # Base scraper class
│   │   ├── rcp.py                    # RealClearPolitics
│   │   ├── fivethirtyeight.py        # FiveThirtyEight
│   │   ├── economist.py              # The Economist
│   │   └── state_sources.py          # State-level sources
│   │
│   ├── validators/                    # Data validation
│   │   ├── __init__.py
│   │   ├── poll_validator.py
│   │   └── race_validator.py
│   │
│   ├── transformers/                  # Data normalization
│   │   ├── __init__.py
│   │   └── normalize.py
│   │
│   ├── schedulers/                    # Cron jobs
│   │   ├── __init__.py
│   │   └── scheduler.py
│   │
│   ├── utils/                         # Utilities
│   │   ├── __init__.py
│   │   ├── http.py
│   │   └── db.py
│   │
│   └── main.py                        # Entry point
│
├── tests/
├── requirements.txt
└── README.md
```

**Key Responsibilities**:
- Web scraping
- Data extraction
- Data validation
- Data normalization
- Error handling
- Retry logic
- Scheduling
- Database insertion

---

## Instance 4: Database Architecture

```
packages/database/
├── prisma/
│   ├── schema.prisma                  # Main schema
│   ├── migrations/                    # Migration history
│   │   ├── 20240101_init/
│   │   ├── 20240102_add_polls/
│   │   └── migration_lock.toml
│   └── seed.ts                        # Seed data
│
├── src/
│   ├── client.ts                      # Prisma client
│   └── types.ts                       # Generated types
│
├── tests/
│   └── schema.test.ts
│
└── package.json
```

**Schema Tables**:
```
races         → Core race information
polls         → Poll results
pollsters     → Pollster metadata
candidates    → Candidate information
forecasts     → Model predictions
scenarios     → User scenarios
results       → Election results
alerts        → Alert configurations
users         → User accounts
```

**Key Responsibilities**:
- Database schema design
- Migration management
- Seed data creation
- Type generation
- Query optimization
- Index management

---

## Instance 5: Forecasting Architecture

```
apps/forecasting/
├── src/
│   ├── models/                        # Statistical models
│   │   ├── __init__.py
│   │   ├── poll_aggregation.py       # Weighted average
│   │   ├── forecast.py               # Forecast engine
│   │   └── monte_carlo.py            # Simulations
│   │
│   ├── api/                           # FastAPI endpoints
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── routes/
│   │       ├── forecast.py
│   │       └── simulation.py
│   │
│   ├── utils/                         # Utilities
│   │   ├── __init__.py
│   │   └── stats.py
│   │
│   └── tests/
│       └── test_models.py
│
├── notebooks/                         # Jupyter notebooks
│   └── model_development.ipynb
│
├── requirements.txt
└── README.md
```

**Key Responsibilities**:
- Poll aggregation
- Statistical modeling
- Monte Carlo simulations
- Uncertainty quantification
- Model validation
- FastAPI service
- Model endpoints

---

## Shared Packages

### packages/types/

```
packages/types/
├── src/
│   ├── api/                           # API contracts
│   │   ├── races.ts
│   │   ├── polls.ts
│   │   └── forecasts.ts
│   ├── models/                        # Data models
│   │   ├── race.ts
│   │   ├── poll.ts
│   │   └── pollster.ts
│   └── index.ts                       # Exports
```

**Used by**: All instances
**Owner**: Coordinated (usually follows database schema)

---

### packages/ui/

```
packages/ui/
├── src/
│   ├── components/                    # Reusable components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── index.ts
```

**Used by**: Instance 1 (Frontend)
**Owner**: Instance 1

---

### packages/utils/

```
packages/utils/
├── src/
│   ├── date.ts                        # Date utilities
│   ├── format.ts                      # Formatters
│   ├── validation.ts                  # Validators
│   └── index.ts
```

**Used by**: All instances
**Owner**: Shared

---

## Development Environment Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Machine                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Instance 1  │  │  Instance 2  │  │  Instance 3  │     │
│  │   Port 3000  │  │   Port 3001  │  │   (Python)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │             │
│         └─────────────────┼──────────────────┘             │
│                           │                                │
│                           ▼                                │
│         ┌─────────────────────────────────┐               │
│         │   PostgreSQL (Port 5432)        │               │
│         │   + TimescaleDB                 │               │
│         │   + Redis (Port 6379)           │               │
│         └─────────────────────────────────┘               │
│                                                             │
│  All instances share the same local database               │
└─────────────────────────────────────────────────────────────┘
```

---

## Git Branch Structure

```
main (protected)
│
├── claude/frontend-homepage-01BwXNyfHH (Instance 1)
├── claude/frontend-race-pages-01BwXNyfHH (Instance 1)
│
├── claude/backend-api-endpoints-01BwXNyfHH (Instance 2)
├── claude/backend-auth-01BwXNyfHH (Instance 2)
│
├── claude/scraper-rcp-01BwXNyfHH (Instance 3)
├── claude/scraper-538-01BwXNyfHH (Instance 3)
│
├── claude/database-schema-01BwXNyfHH (Instance 4)
└── claude/database-seed-01BwXNyfHH (Instance 4)
```

**Merge flow**: Instances merge independently to main when ready

---

## Dependency Graph

```
                    ┌──────────────┐
                    │   Instance 4 │
                    │   Database   │
                    └──────┬───────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
         ┌──────────┬──────────┬──────────┐
         │Instance 2│Instance 3│Instance 5│
         │   API    │ Scraper  │Forecast  │
         └────┬─────┴──────────┴──────────┘
              │
              ▼
         ┌──────────┐
         │Instance 1│
         │ Frontend │
         └──────────┘
```

**Read this as**:
- Instance 4 must complete first (foundation)
- Instances 2, 3, 5 depend on database
- Instance 1 depends on Instance 2 API

---

## CI/CD Pipeline

```
Push to branch
     │
     ▼
┌─────────────────┐
│  Run Lint       │
│  Run Type Check │
│  Run Tests      │
└────────┬────────┘
         │
    Pass │ Fail
         │    └──→ Notify developer
         ▼
┌─────────────────┐
│  Build          │
└────────┬────────┘
         │
    Pass │ Fail
         │    └──→ Notify developer
         ▼
┌─────────────────┐
│  Deploy Preview │ (Optional for PRs)
└─────────────────┘
```

---

## Production Deployment Architecture

```
                     ┌─────────────┐
                     │   Vercel    │
                     │  (Frontend) │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   CDN       │
                     │ CloudFlare  │
                     └─────────────┘

┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   Railway    │───▶│   AWS RDS   │◀───│   Render    │
│  (Backend)   │    │(PostgreSQL) │    │  (Scraper)  │
└──────────────┘    └─────────────┘    └─────────────┘
```

---

## Instance Communication Patterns

### During Development

**Instance 1 ← → Instance 2**:
- Frontend consumes API
- API contract defined in `packages/types`
- Mock data used until API ready

**Instance 3 → Instance 4**:
- Scraper inserts data into database
- Uses Prisma client from `packages/database`

**Instance 2 ← → Instance 4**:
- API queries database
- Uses Prisma client from `packages/database`

**Instance 2 ← → Instance 5**:
- API calls forecasting service
- HTTP requests to FastAPI endpoints

---

## Best Practices Summary

1. **Stay in your workspace** - Respect boundaries
2. **Commit frequently** - Small, focused commits
3. **Update from main often** - Avoid divergence
4. **Use shared types** - Don't duplicate definitions
5. **Test locally** - Before pushing
6. **Document changes** - Especially to shared packages
7. **Communicate blockers** - Don't work in silence
8. **Merge strategically** - Follow dependency order

---

## Quick Reference: Instance Cheat Sheet

| Want to... | Instance | Location |
|------------|----------|----------|
| Add a new page | 1 | `apps/web/app/` |
| Add UI component | 1 | `packages/ui/src/` |
| Add API endpoint | 2 | `apps/api/src/routes/` |
| Add database table | 4 | `packages/database/prisma/schema.prisma` |
| Add scraper | 3 | `apps/scraper/src/scrapers/` |
| Add shared type | Any | `packages/types/src/` |
| Add utility function | Any | `packages/utils/src/` |
| Add forecast model | 5 | `apps/forecasting/src/models/` |

---

**Use this architecture guide to navigate the monorepo and understand workspace boundaries!** 🏗️
