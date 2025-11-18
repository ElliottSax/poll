# @poll/database

Shared Prisma database client for the Polling Dashboard monorepo.

## Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## Usage

```typescript
import { db } from '@poll/database';

const races = await db.race.findMany();
```
