# @poll/database

> Database package with Prisma schema and client for the polling dashboard

---

## Overview

This package contains the complete database schema, migrations, and Prisma client for the polling dashboard. It serves as the single source of truth for all data models and database operations.

## 📦 Package Contents

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Complete database schema
│   ├── seed.ts            # Seed data script
│   └── migrations/        # Migration history
├── src/
│   └── index.ts           # Prisma client exports
└── package.json
```

## 🗄️ Database Schema

### Core Tables

- **races** - Election race information
- **polls** - Poll results and metadata
- **pollsters** - Pollster organizations and quality metrics
- **forecasts** - Statistical model predictions
- **scenarios** - User-created "what-if" scenarios
- **results** - Election night results
- **alerts** - Race change notifications

### User Tables

- **users** - User accounts and profiles
- **predictions** - User prediction game entries
- **api_keys** - API access keys and tiers

### Schema Features

✅ **UUID Primary Keys** - For distributed systems and security
✅ **Timestamps** - Created/updated tracking on all tables
✅ **JSONB Fields** - Flexible data storage for candidates, results
✅ **Enums** - Type-safe race types, methodologies, etc.
✅ **Indexes** - Optimized for common query patterns
✅ **Cascading Deletes** - Referential integrity maintained
✅ **TimescaleDB Ready** - Can use time-series extensions

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Environment variable `DATABASE_URL` set

### Installation

```bash
cd packages/database
npm install
```

### Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 📝 Usage

### In Your Application

```typescript
import { prisma } from '@poll/database'

// Query races
const races = await prisma.race.findMany({
  where: { status: 'ACTIVE' },
  include: { polls: true },
})

// Create a poll
const poll = await prisma.poll.create({
  data: {
    raceId: 'race-uuid',
    pollsterId: 'pollster-uuid',
    pollDate: new Date('2024-01-15'),
    sampleSize: 1200,
    methodology: 'PHONE',
    populationType: 'LV',
    results: {
      'Candidate A': 48.5,
      'Candidate B': 47.2,
    },
    marginOfError: 2.8,
  },
})

// Get race with all related data
const raceDetail = await prisma.race.findUnique({
  where: { slug: '2024-presidential' },
  include: {
    polls: {
      include: { pollster: true },
      orderBy: { pollDate: 'desc' },
      take: 10,
    },
    forecasts: {
      orderBy: { forecastDate: 'desc' },
      take: 1,
    },
  },
})
```

### Type Safety

All Prisma types are automatically exported:

```typescript
import { Race, Poll, Pollster, RaceType, PollMethodology } from '@poll/database'

const race: Race = {
  id: '...',
  raceType: 'PRESIDENT',
  // ... TypeScript knows all fields!
}
```

## 🔧 Available Scripts

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create a migration
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# Reset database and re-seed
npm run db:migrate:reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Format schema file
npm run db:format
```

## 📊 Schema Details

### Race Model

```prisma
model Race {
  id               String     @id @default(uuid())
  raceType         RaceType
  raceName         String
  slug             String     @unique
  state            String?
  electionDate     DateTime
  status           RaceStatus @default(UPCOMING)
  candidates       Json       // Flexible JSONB
  competitiveRating String?
  importanceScore  Int?
  // ... relations
}
```

**Race Types**: `PRESIDENT`, `SENATE`, `HOUSE`, `GOVERNOR`, `MAYOR`, `STATE_LEG`, `OTHER`

**Race Status**: `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`

### Poll Model

```prisma
model Poll {
  id                  String           @id @default(uuid())
  raceId              String
  pollsterId          String
  pollDate            DateTime
  sampleSize          Int?
  methodology         PollMethodology?
  populationType      PopulationType?
  results             Json             // JSONB: candidate -> percentage
  marginOfError       Decimal?
  transparencyScore   Decimal?
  // ... more fields
}
```

**Methodologies**: `PHONE`, `ONLINE`, `IVR`, `MIXED`, `IN_PERSON`, `OTHER`

**Population Types**: `RV` (Registered Voters), `LV` (Likely Voters), `A` (Adults), `V` (Voters)

### Pollster Model

```prisma
model Pollster {
  id                String   @id @default(uuid())
  name              String   @unique
  slug              String   @unique
  overallAccuracy   Decimal?
  methodologyGrade  String?  // A+, A, B+, etc.
  transparencyScore Decimal?
  partisanLean      String?  // D+2.5, neutral, etc.
  // ... quality metrics
}
```

## 🌱 Seed Data

The seed script creates sample data for development:

- 5 major pollsters (Quinnipiac, Marist, Siena, Emerson, Monmouth)
- 4 races (Presidential, PA Senate, GA Senate, AZ Senate)
- 5 sample polls
- 1 demo user

Run with:
```bash
npm run db:seed
```

## 🔍 Querying Best Practices

### Use Indexes

All common query patterns are indexed:

```typescript
// Optimized: Uses index on (raceId, pollDate)
const recentPolls = await prisma.poll.findMany({
  where: { raceId: 'race-id' },
  orderBy: { pollDate: 'desc' },
  take: 10,
})
```

### Select Only What You Need

```typescript
// Good: Select specific fields
const races = await prisma.race.findMany({
  select: {
    id: true,
    raceName: true,
    slug: true,
    status: true,
  },
})

// Avoid: Selecting everything when you don't need it
const races = await prisma.race.findMany() // Returns all fields
```

### Use Pagination

```typescript
const PAGE_SIZE = 20

const polls = await prisma.poll.findMany({
  take: PAGE_SIZE,
  skip: page * PAGE_SIZE,
  orderBy: { pollDate: 'desc' },
})
```

## 🏗️ Migration Workflow

### Development

```bash
# Make schema changes in schema.prisma
# Then create a migration
npm run db:migrate -- --name add_new_field

# Or push directly (no migration file)
npm run db:push
```

### Production

```bash
# Apply all pending migrations
npm run db:migrate:deploy
```

### Migration Naming

Use descriptive names:
- `init` - Initial schema
- `add_forecasts_table` - Adding new table
- `add_race_importance` - Adding new field
- `fix_poll_indexes` - Performance optimization

## 🔒 Security Considerations

1. **Never commit `.env`** - Contains database credentials
2. **Use environment variables** - For all sensitive config
3. **Parameterized queries** - Prisma handles this automatically
4. **Row-level security** - Implement in your API layer
5. **Backup regularly** - Production databases

## 🌐 Environment Variables

Required in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/poll_db"
```

Optional:
```env
PRISMA_STUDIO_PORT=5555
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB](https://docs.timescale.com/) - For time-series optimization

## 🔗 Used By

This package is imported by:
- `apps/api` - Backend API server
- `apps/web` - Next.js frontend (via API)
- `apps/scraper` - Python scrapers (via Prisma Python client)
- `apps/forecasting` - Forecasting service

## 🤝 Contributing

When making schema changes:

1. **Discuss first** - Schema changes affect all instances
2. **Create migration** - Always use migrations, never push directly
3. **Update seed data** - If adding required fields
4. **Test locally** - Run `db:reset` and verify
5. **Document** - Update this README
6. **Notify team** - Other instances need to apply migrations

## ⚠️ Important Notes

- **Never modify existing migrations** - Create new ones
- **Test migrations locally first** - Before applying to production
- **Coordinate with team** - Schema changes are breaking changes
- **Keep seed data realistic** - Helps with development

---

## Instance 4 Checklist

✅ Database schema designed
✅ Prisma client configured
✅ Seed data created
✅ TypeScript types exported
✅ Migrations ready
✅ Documentation complete

**Status**: Ready for other instances to use! 🚀

---

**Instance 4: Database** - Foundation complete and ready for parallel development!
