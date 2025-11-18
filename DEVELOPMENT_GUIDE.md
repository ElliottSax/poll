# 🛠️ Development Guide - Polling Dashboard

Quick reference for common development tasks.

---

## 🚀 Daily Development Workflow

### Starting Development

```bash
# Start all services
docker-compose up -d

# Start development servers (both frontend + API)
npm run dev

# Or start individually
npm run dev --workspace=@poll/web    # Frontend only
npm run dev --workspace=@poll/api    # API only
```

### Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes...

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Commit with conventional commits
git commit -m "feat: add demographic filter to race page"
```

### Database Operations

```bash
# Open Prisma Studio (visual editor)
npm run db:studio

# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply migration
npm run db:migrate

# Push schema without migration (dev only)
npm run db:push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## 📁 File Structure Reference

```
poll/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utilities
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                    # Fastify backend
│       ├── src/
│       │   ├── trpc/          # tRPC routers
│       │   ├── lib/           # Utilities
│       │   └── server.ts      # Entry point
│       └── package.json
│
├── packages/
│   ├── database/              # Prisma client
│   ├── types/                 # Shared types
│   └── config/                # TS configs
│
├── docs/                      # Documentation
│   ├── adrs/                  # Architecture decisions
│   ├── INFRASTRUCTURE_PLAN.md
│   ├── API_SPECIFICATION.md
│   └── ...
│
├── .github/workflows/         # CI/CD
├── docker-compose.yml         # Local services
├── schema.sql                 # Raw SQL schema
├── prisma-schema.prisma       # Prisma schema
└── package.json               # Root package
```

---

## 🔧 Common Tasks

### Adding a New API Endpoint

1. **Create tRPC procedure** in `apps/api/src/trpc/routers/[entity].ts`:

```typescript
export const entityRouter = router({
  myNewEndpoint: publicProcedure
    .input(z.object({
      param: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.db.entity.findMany({
        where: { param: input.param },
      });
    }),
});
```

2. **Use in frontend** (`apps/web/src/components/MyComponent.tsx`):

```typescript
'use client';
import { trpc } from '@/lib/trpc';

export function MyComponent() {
  const { data, isLoading } = trpc.entity.myNewEndpoint.useQuery({
    param: 'value',
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data}</div>;
}
```

3. **Types are automatically synced!** ✨

---

### Adding a New Page

1. **Create page** in `apps/web/src/app/my-page/page.tsx`:

```typescript
export default function MyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My Page</h1>
    </main>
  );
}
```

2. **Add to navigation** (when you create a header component)

3. **Route is automatic!** Visit `/my-page`

---

### Adding a Database Table

1. **Update Prisma schema** (`prisma-schema.prisma`):

```prisma
model MyNewTable {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  
  @@map("my_new_table")
}
```

2. **Create migration**:

```bash
npx prisma migrate dev --name add_my_new_table
```

3. **Use in code**:

```typescript
const items = await db.myNewTable.findMany();
```

---

### Adding a React Component

1. **Create component** in `apps/web/src/components/MyComponent.tsx`:

```typescript
interface MyComponentProps {
  title: string;
  count: number;
}

export function MyComponent({ title, count }: MyComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{count} items</p>
    </div>
  );
}
```

2. **Import and use**:

```typescript
import { MyComponent } from '@/components/MyComponent';

<MyComponent title="Polls" count={42} />
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm run test

# Frontend tests only
npm run test --workspace=@poll/web

# API tests only
npm run test --workspace=@poll/api

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Write Tests

**Frontend (Vitest + React Testing Library)**:

```typescript
// apps/web/src/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" count={5} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

**Backend (Jest)**:

```typescript
// apps/api/src/trpc/routers/entity.test.ts
import { appRouter } from '../root';

describe('Entity Router', () => {
  it('returns entities', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.entity.list();
    expect(result).toHaveLength(10);
  });
});
```

---

## 🐛 Debugging

### Frontend Debugging

1. **Browser DevTools**: `F12` or Right-click → Inspect
2. **React DevTools**: Install browser extension
3. **Console logs**: `console.log()` (remove before committing!)
4. **VS Code Debugger**: Use built-in debugger with breakpoints

### Backend Debugging

1. **Logs**: Check Fastify logs in terminal
2. **Database queries**: Enable Prisma query logging in `.env`:
   ```
   DATABASE_URL="postgresql://...?schema=public&logging=true"
   ```
3. **API testing**: Use `curl`, Postman, or Thunder Client
4. **VS Code Debugger**: Set breakpoints and run debug configuration

### Common Issues

**"Module not found"**
```bash
npm install
npm run db:generate  # Regenerate Prisma Client
```

**"Port 3000 already in use"**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

**"Database connection failed"**
```bash
# Check Docker services
docker-compose ps

# Restart services
docker-compose restart postgres
```

**"tRPC type errors"**
```bash
# Rebuild packages
npm run build

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 📦 Building for Production

### Build All Packages

```bash
npm run build
```

### Build Individually

```bash
npm run build --workspace=@poll/web
npm run build --workspace=@poll/api
```

### Preview Production Build

```bash
npm run build --workspace=@poll/web
npm run start --workspace=@poll/web
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel --prod
```

### Backend (DigitalOcean)

```bash
# Build Docker image
docker build -t poll-api apps/api

# Push to registry
docker push poll-api

# Deploy to DigitalOcean App Platform
# (Use their UI or doctl CLI)
```

### Database (DigitalOcean Managed Database)

1. Create managed PostgreSQL database
2. Run migrations:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
3. Update `.env` in production

---

## 🔐 Environment Variables

### Required Variables

**Development** (`.env.local`):
```bash
DATABASE_URL="postgresql://poll_user:poll_password@localhost:5432/poll_db"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**Production** (set in hosting platform):
```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
NEXT_PUBLIC_API_URL="https://api.pollviz.com"
JWT_SECRET="your-secret-key"
```

See `.env.example` for full list (100+ variables).

---

## 📊 Monitoring

### Local Development

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/health
- **Database GUI**: http://localhost:8080 (Adminer)
- **Redis GUI**: http://localhost:8081 (Redis Commander)

### Production

- **Error Tracking**: Sentry
- **Analytics**: Plausible / PostHog
- **Uptime**: UptimeRobot
- **Performance**: Vercel Analytics
- **Logs**: DigitalOcean logs or LogDNA

---

## 🆘 Getting Help

1. **Check documentation** in `docs/`
2. **Search GitHub Issues** for similar problems
3. **Review API docs** in `docs/API_SPECIFICATION.md`
4. **Check external docs**:
   - [Next.js](https://nextjs.org/docs)
   - [Fastify](https://www.fastify.io/)
   - [tRPC](https://trpc.io/docs)
   - [Prisma](https://www.prisma.io/docs)

---

## ⚡ Performance Tips

### Frontend

- ✅ Use `next/image` for images (automatic optimization)
- ✅ Implement React.lazy() for code splitting
- ✅ Use `useCallback` and `useMemo` for expensive operations
- ✅ Avoid unnecessary re-renders with React.memo()
- ✅ Optimize bundle size (check with `npm run analyze`)

### Backend

- ✅ Use database indexes on frequently queried fields
- ✅ Implement Redis caching for expensive queries
- ✅ Use Prisma query optimization (select only needed fields)
- ✅ Batch database queries when possible
- ✅ Enable gzip compression in Fastify

### Database

- ✅ Use TimescaleDB continuous aggregates
- ✅ Implement connection pooling with PgBouncer
- ✅ Add indexes on timestamp fields
- ✅ Archive old data to keep tables small
- ✅ Monitor query performance with EXPLAIN ANALYZE

---

**Happy Coding!** 🚀
