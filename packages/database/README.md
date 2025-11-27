# Database Package

This package contains the Prisma schema, migrations, and database utilities for the Polling Dashboard.

## Setup

### Prerequisites
- PostgreSQL 14+ installed and running
- Node.js 18+
- Access to a PostgreSQL database

### Environment Variables

Create a `.env` file in the root of the monorepo with:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/polling_dashboard?schema=public"
```

## Prisma Commands

### Generate Prisma Client

After any schema changes:

```bash
npm run db:generate
```

This generates the TypeScript types and Prisma Client based on your schema.

### Create a Migration

When you make changes to `schema.prisma`:

```bash
npm run db:migrate:dev -- --name your_migration_name
```

This creates a new migration file and applies it to your development database.

### Apply Migrations

To apply pending migrations:

```bash
npm run db:migrate:deploy
```

Use this in production or CI/CD pipelines.

### Reset Database

⚠️ **Warning**: This drops all data!

```bash
npm run db:reset
```

This drops the database, recreates it, applies all migrations, and runs seed scripts.

### Seed Database

To populate the database with initial data:

```bash
npm run db:seed
```

### View Database in Studio

Open Prisma Studio to browse and edit data:

```bash
npm run db:studio
```

## Migration Workflow

### Development

1. Make changes to `schema.prisma`
2. Run `npm run db:migrate:dev -- --name descriptive_name`
3. Test your changes
4. Commit both the schema and migration files

### Production

1. Merge your PR with migrations
2. In production, run `npm run db:migrate:deploy`
3. Restart application servers

## Schema Structure

### Core Entities

- **User**: User accounts and preferences
- **Race**: Elections being tracked
- **Candidate**: Candidates running in races
- **Pollster**: Polling organizations
- **Poll**: Individual poll results
- **Forecast**: Model-generated predictions
- **Prediction**: User predictions
- **Scenario**: User-created electoral scenarios

### System Tables

- **ApiKey**: API authentication keys
- **AuditLog**: System audit trail

## Best Practices

### Migration Guidelines

1. **Never edit existing migrations** - Create new ones instead
2. **Test migrations** on a copy of production data before deploying
3. **Include rollback plans** for destructive changes
4. **Use descriptive names** for migrations (e.g., `add_poll_verification_flags`)
5. **Keep migrations small** - One logical change per migration

### Schema Changes

1. **Additive changes** (new tables/columns) are safe
2. **Destructive changes** (dropping columns) require careful planning:
   - Add new column
   - Migrate data
   - Update application code
   - Deploy
   - Remove old column in subsequent migration

3. **Default values** should be provided for new non-nullable columns
4. **Indexes** should be added for foreign keys and frequently queried fields

### Data Types

- **IDs**: Use UUID (`@id @default(uuid())`)
- **Timestamps**: Always include `createdAt` and `updatedAt`
- **Flexible data**: Use `Json` type for dynamic structures
- **Enums**: Define as strings for flexibility

## Common Tasks

### Adding a New Table

1. Add model to `schema.prisma`:
```prisma
model MyNewTable {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
}
```

2. Generate migration:
```bash
npm run db:migrate:dev -- --name add_my_new_table
```

3. Generate client:
```bash
npm run db:generate
```

### Adding an Index

```prisma
model Poll {
  // ... existing fields

  @@index([raceId, pollDate])
}
```

### Adding a Relation

```prisma
model Comment {
  id         String   @id @default(uuid())
  pollId     String
  userId     String
  content    String
  createdAt  DateTime @default(now())

  poll       Poll     @relation(fields: [pollId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([pollId])
  @@index([userId])
}
```

## Troubleshooting

### Migration Conflicts

If you have migration conflicts:

```bash
# Reset your local database
npm run db:reset

# Or manually resolve
npm run db:migrate:resolve --rolled-back "migration_name"
```

### Schema Drift

If your database schema doesn't match your Prisma schema:

```bash
# Check for drift
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource env(DATABASE_URL)

# Fix drift
npm run db:migrate:deploy
```

### Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings
- Verify database user permissions

## Performance Tips

1. **Use indexes** on foreign keys and frequently queried fields
2. **Limit JSON queries** - they're slower than native columns
3. **Use connection pooling** in production (PgBouncer recommended)
4. **Monitor slow queries** with `EXPLAIN ANALYZE`
5. **Regular VACUUM** operations on PostgreSQL

## Security

- **Never commit** `.env` files
- **Hash sensitive data** before storing (passwords, API keys)
- **Use prepared statements** (Prisma does this automatically)
- **Validate input** before database operations
- **Audit sensitive operations** using AuditLog table

## Backup & Recovery

### Backup

```bash
pg_dump -U username -d polling_dashboard > backup.sql
```

### Restore

```bash
psql -U username -d polling_dashboard < backup.sql
```

### Automated Backups

Consider using:
- AWS RDS automated backups
- pgBackRest
- Cron jobs with `pg_dump`

## Monitoring

Recommended tools:
- **pgAdmin** - GUI management
- **pg_stat_statements** - Query performance
- **Datadog** - APM and monitoring
- **Sentry** - Error tracking with Prisma integration
