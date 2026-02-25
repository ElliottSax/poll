# Database Setup Guide

## Quick Start with Supabase (Recommended for MVP)

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login
3. Click "New Project"
4. Choose a name: `poll-mvp`
5. Set a strong database password
6. Choose a region close to you
7. Click "Create new project"

### 2. Get Your Database URL
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to "Connection String"
3. Copy the "URI" connection string (starts with `postgresql://`)
4. Replace `[YOUR-PASSWORD]` with your actual password

### 3. Update .env Files
Update both `.env` and `packages/database/.env`:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 4. Run Migrations
```bash
npm run db:migrate:dev --workspace=@poll/database
```

### 5. Seed Database
```bash
npm run db:seed --workspace=@poll/database
```

## Alternative: Local PostgreSQL with Docker

If you have Docker installed:

```bash
# Start PostgreSQL container
docker run --name poll-postgres \
  -e POSTGRES_PASSWORD=poll \
  -e POSTGRES_USER=poll \
  -e POSTGRES_DB=poll \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://poll:poll@localhost:5432/poll"

# Run migrations
npm run db:migrate:dev --workspace=@poll/database

# Seed database
npm run db:seed --workspace=@poll/database
```

## Current Status

- ✅ Prisma schema configured for PostgreSQL
- ✅ Seed data ready (2024 races, pollsters, polls)
- ⏳ Waiting for database connection
