# 🗄️ Track 6: Database & Data Models - Starter Guide

**Status**: 🟡 Available
**Duration**: 2-3 weeks
**Priority**: P0 (Critical - Foundation for all tracks)
**Dependencies**: None (start this FIRST!)

---

## 🎯 Objectives

Create a robust database foundation with:
- Refined Prisma schema
- Efficient migrations
- Realistic seed data
- Optimized indexes
- Database utilities
- Connection pooling
- Backup strategies

---

## 📋 Task Breakdown

### Week 1: Schema Refinement
- [ ] Review existing Prisma schema
- [ ] Add missing fields and relationships
- [ ] Optimize data types
- [ ] Add indexes for performance
- [ ] Add constraints and validations
- [ ] Document schema relationships
- [ ] Create first migration
- [ ] Test schema locally

### Week 2: Seed Data & Utilities
- [ ] Create comprehensive seed data
- [ ] Add realistic poll data (2020-2024)
- [ ] Add pollster ratings and metadata
- [ ] Add race data for upcoming elections
- [ ] Create database utility functions
- [ ] Add data import helpers
- [ ] Add data export helpers
- [ ] Test seed scripts

### Week 3: Optimization & Tools
- [ ] Add database indexes
- [ ] Optimize queries
- [ ] Set up connection pooling
- [ ] Create backup scripts
- [ ] Add database monitoring
- [ ] Write migration guides
- [ ] Create database documentation
- [ ] Final testing and validation

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
# Update .claude/WORK_ASSIGNMENTS.md
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 6 - Database & Data Models"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-database-[YOUR-SESSION-ID]
```

### 3. Review Existing Schema

```bash
# View the current schema
cat prisma-schema.prisma

# Or if in packages/database:
cat packages/database/prisma/schema.prisma
```

### 4. Set Up Local Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Verify it's running
docker ps

# Generate Prisma client
npm run db:generate

# Run migrations (if any exist)
npm run db:migrate

# Open Prisma Studio to explore
npm run db:studio
```

---

## 💡 Schema Design Guide

### Current Schema Overview

The project has a root-level `prisma-schema.prisma` file. Here are the main models:

**Core Entities**:
- `Race` - Election races (president, senate, house, etc.)
- `Poll` - Individual polls
- `Pollster` - Polling organizations
- `Forecast` - Election forecasts
- `Candidate` - Candidates in races
- `PollResult` - Results for each candidate in a poll

### Schema Best Practices

#### 1. Use Appropriate Field Types

```prisma
model Poll {
  id             String   @id @default(uuid())
  pollDate       DateTime  // Use DateTime for dates
  sampleSize     Int       // Use Int for numbers
  marginOfError  Float?    // Use Float for decimals, ? for optional
  url            String    @db.Text  // Use Text for long strings
  methodology    Methodology // Use enums for fixed values

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum Methodology {
  LIVE_PHONE
  ONLINE
  IVR
  MIXED
}
```

#### 2. Define Relationships Clearly

```prisma
model Race {
  id       String @id @default(uuid())
  slug     String @unique

  // One-to-many: A race has many polls
  polls    Poll[]

  // One-to-many: A race has many forecasts
  forecasts Forecast[]

  // Many-to-many: A race has many candidates
  candidates RaceCandidate[]
}

model Poll {
  id      String @id @default(uuid())

  // Many-to-one: A poll belongs to one race
  race    Race   @relation(fields: [raceId], references: [id])
  raceId  String

  // Many-to-one: A poll is conducted by one pollster
  pollster   Pollster @relation(fields: [pollsterId], references: [id])
  pollsterId String

  // One-to-many: A poll has many results
  results PollResult[]
}
```

#### 3. Add Indexes for Performance

```prisma
model Poll {
  // ... fields ...

  @@index([raceId])           // Index foreign keys
  @@index([pollsterId])
  @@index([pollDate])         // Index frequently queried fields
  @@index([raceId, pollDate]) // Composite index for common queries
}

model Race {
  slug String @unique  // Unique indexes are automatic

  @@index([raceType, state]) // For filtering
  @@index([electionDate])    // For sorting
}
```

#### 4. Add Constraints

```prisma
model PollResult {
  id          String @id @default(uuid())
  percentage  Float  @db.DoublePrecision

  // Ensure percentages are valid
  @@check(percentage >= 0 AND percentage <= 100, name: "valid_percentage")
}

model Poll {
  sampleSize Int

  // Ensure sample size is positive
  @@check(sampleSize > 0, name: "positive_sample_size")
}
```

### Enhanced Schema Example

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Race {
  id             String    @id @default(uuid())
  slug           String    @unique
  name           String
  raceType       RaceType
  state          String    @db.Char(2)  // US state code
  district       String?   // For house races
  electionDate   DateTime
  status         RaceStatus @default(ACTIVE)

  // Metadata
  description    String?   @db.Text
  importanceScore Int      @default(50)  // 0-100

  // Relationships
  polls          Poll[]
  forecasts      Forecast[]
  candidates     RaceCandidate[]

  // Timestamps
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([raceType, state])
  @@index([electionDate])
  @@index([status])
  @@index([importanceScore])
}

enum RaceType {
  PRESIDENT
  SENATE
  HOUSE
  GOVERNOR
  MAYOR
  OTHER
}

enum RaceStatus {
  UPCOMING
  ACTIVE
  COMPLETED
}

model Pollster {
  id                String   @id @default(uuid())
  slug              String   @unique
  name              String

  // Quality metrics
  rating            String?  // A+, A, B, C, D, F
  methodology       String?
  transparency      Int?     // 0-100

  // Bias measurements
  partisanLean      Float?   // Positive = R lean, Negative = D lean
  houseEffect       Float?

  // Accuracy
  historicalAccuracy Float?  // 0-100

  // Metadata
  website           String?
  founded           Int?

  // Relationships
  polls             Poll[]

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([rating])
  @@index([historicalAccuracy])
}

model Poll {
  id                String      @id @default(uuid())

  // Basic info
  pollDate          DateTime
  sampleSize        Int
  marginOfError     Float?

  // Population and methodology
  population        Population
  methodology       Methodology

  // Metadata
  sponsor           String?
  url               String?     @db.Text
  notes             String?     @db.Text

  // Relationships
  race              Race        @relation(fields: [raceId], references: [id], onDelete: Cascade)
  raceId            String

  pollster          Pollster    @relation(fields: [pollsterId], references: [id])
  pollsterId        String

  results           PollResult[]

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([raceId])
  @@index([pollsterId])
  @@index([pollDate])
  @@index([raceId, pollDate])
  @@check(sampleSize > 0, name: "positive_sample")
}

enum Population {
  LV  // Likely Voters
  RV  // Registered Voters
  A   // Adults
}

enum Methodology {
  LIVE_PHONE
  ONLINE
  IVR
  MIXED
}

model PollResult {
  id          String   @id @default(uuid())

  poll        Poll     @relation(fields: [pollId], references: [id], onDelete: Cascade)
  pollId      String

  candidate   Candidate @relation(fields: [candidateId], references: [id])
  candidateId String

  percentage  Float    @db.DoublePrecision

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([pollId, candidateId])
  @@index([pollId])
  @@index([candidateId])
  @@check(percentage >= 0 AND percentage <= 100, name: "valid_percentage")
}

model Candidate {
  id          String   @id @default(uuid())

  name        String
  party       Party
  incumbency  Boolean  @default(false)

  // Optional demographics
  age         Int?
  gender      String?

  // Relationships
  races       RaceCandidate[]
  pollResults PollResult[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([party])
}

enum Party {
  DEMOCRAT
  REPUBLICAN
  INDEPENDENT
  GREEN
  LIBERTARIAN
  OTHER
}

// Junction table for many-to-many Race <-> Candidate
model RaceCandidate {
  race        Race      @relation(fields: [raceId], references: [id], onDelete: Cascade)
  raceId      String

  candidate   Candidate @relation(fields: [candidateId], references: [id])
  candidateId String

  // Current status in this race
  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())

  @@id([raceId, candidateId])
  @@index([raceId])
  @@index([candidateId])
}

model Forecast {
  id            String   @id @default(uuid())

  race          Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)
  raceId        String

  forecastDate  DateTime @default(now())

  // Win probabilities (should sum to ~100)
  winProbabilities Json  // { "candidate_id": probability }

  // Confidence intervals
  confidenceIntervals Json  // { "candidate_id": [lower, upper] }

  // Model metadata
  modelVersion  String?
  methodology   String?  @db.Text

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([raceId])
  @@index([forecastDate])
  @@index([raceId, forecastDate])
}
```

---

## 🌱 Creating Seed Data

**File**: `packages/database/prisma/seed.ts`

```typescript
import { PrismaClient, RaceType, RaceStatus, Party, Population, Methodology } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create pollsters
  const pollsters = await Promise.all([
    prisma.pollster.create({
      data: {
        slug: 'monmouth-university',
        name: 'Monmouth University',
        rating: 'A+',
        methodology: 'Live Phone',
        transparency: 95,
        historicalAccuracy: 92,
        partisanLean: 0.1,
      },
    }),
    prisma.pollster.create({
      data: {
        slug: 'marist-college',
        name: 'Marist College',
        rating: 'A',
        methodology: 'Live Phone',
        transparency: 90,
        historicalAccuracy: 89,
        partisanLean: -0.2,
      },
    }),
    // Add more pollsters...
  ])

  console.log(`✅ Created ${pollsters.length} pollsters`)

  // Create candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        name: 'Joe Biden',
        party: Party.DEMOCRAT,
        incumbency: true,
      },
    }),
    prisma.candidate.create({
      data: {
        name: 'Donald Trump',
        party: Party.REPUBLICAN,
        incumbency: false,
      },
    }),
    // Add more candidates...
  ])

  console.log(`✅ Created ${candidates.length} candidates`)

  // Create races
  const presidentialRace = await prisma.race.create({
    data: {
      slug: '2024-president',
      name: '2024 Presidential Election',
      raceType: RaceType.PRESIDENT,
      state: 'US',
      electionDate: new Date('2024-11-05'),
      status: RaceStatus.ACTIVE,
      importanceScore: 100,
      description: '2024 United States Presidential Election',
    },
  })

  // Link candidates to race
  await Promise.all([
    prisma.raceCandidate.create({
      data: {
        raceId: presidentialRace.id,
        candidateId: candidates[0].id,
      },
    }),
    prisma.raceCandidate.create({
      data: {
        raceId: presidentialRace.id,
        candidateId: candidates[1].id,
      },
    }),
  ])

  console.log(`✅ Created presidential race`)

  // Create sample polls
  const poll = await prisma.poll.create({
    data: {
      pollDate: new Date('2024-01-15'),
      sampleSize: 1000,
      marginOfError: 3.1,
      population: Population.LV,
      methodology: Methodology.LIVE_PHONE,
      raceId: presidentialRace.id,
      pollsterId: pollsters[0].id,
      url: 'https://example.com/poll',
    },
  })

  // Create poll results
  await Promise.all([
    prisma.pollResult.create({
      data: {
        pollId: poll.id,
        candidateId: candidates[0].id,
        percentage: 48.5,
      },
    }),
    prisma.pollResult.create({
      data: {
        pollId: poll.id,
        candidateId: candidates[1].id,
        percentage: 46.2,
      },
    }),
  ])

  console.log(`✅ Created sample polls`)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Run seed**:
```bash
npm run db:seed
```

---

## 🔧 Database Utilities

**File**: `packages/database/src/utils.ts`

```typescript
import { PrismaClient } from '@prisma/client'

export async function healthCheck(prisma: PrismaClient): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

export async function getDatabaseStats(prisma: PrismaClient) {
  const [races, polls, pollsters, candidates] = await Promise.all([
    prisma.race.count(),
    prisma.poll.count(),
    prisma.pollster.count(),
    prisma.candidate.count(),
  ])

  return { races, polls, pollsters, candidates }
}

export async function clearDatabase(prisma: PrismaClient) {
  // Use with caution! Only for test environments
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear database in production')
  }

  await prisma.pollResult.deleteMany()
  await prisma.poll.deleteMany()
  await prisma.forecast.deleteMany()
  await prisma.raceCandidate.deleteMany()
  await prisma.race.deleteMany()
  await prisma.pollster.deleteMany()
  await prisma.candidate.deleteMany()
}
```

---

## ✅ Definition of Done

Track 6 is complete when:

- [ ] Prisma schema refined and documented
- [ ] All relationships properly defined
- [ ] Indexes added for all frequently queried fields
- [ ] Migrations created and tested
- [ ] Seed data script with realistic data
- [ ] Database utilities created
- [ ] Connection pooling configured
- [ ] Documentation written
- [ ] Schema validated with real queries
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 📚 Resources

- Prisma docs: https://www.prisma.io/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
- TimescaleDB docs: https://docs.timescale.com/

---

**Build a solid foundation! 🗄️**
