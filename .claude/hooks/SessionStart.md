# Poll Dashboard - Session Start Hook

This hook automatically sets up your development environment when starting a new Claude Code web session.

## Environment Setup

### 1. Check Node.js and Dependencies
```bash
node --version
npm --version
```

### 2. Install Dependencies (if needed)
Check if node_modules exists, if not install:
```bash
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
else
  echo "✅ Dependencies already installed"
fi
```

### 3. Environment Variables
Check for .env file:
```bash
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp .env.example .env
  echo "🔧 Please update .env with your configuration"
else
  echo "✅ .env file exists"
fi
```

### 4. Database Status
Check if we need to run migrations:
```bash
if [ -d "node_modules" ] && [ -f ".env" ]; then
  echo "📊 Checking database status..."
  # Note: Actual DB commands would need a running PostgreSQL instance
  # For parallel development, each instance should use the same shared DB
else
  echo "⏭️  Skipping database check (dependencies not ready)"
fi
```

## Parallel Development Context

### Current Branch Information
```bash
echo "🌿 Current branch: $(git branch --show-current)"
echo "📍 Latest commit: $(git log -1 --oneline)"
```

### Workspace Assignments

**This project supports parallel development across 4 workstreams:**

1. **Frontend/UI** (`apps/web/`)
   - Next.js app
   - React components
   - Visualizations (D3.js, Recharts)
   - TailwindCSS/shadcn/ui styling

2. **Backend/API** (`apps/api/`)
   - Fastify API server
   - Business logic
   - Database operations
   - Authentication

3. **Data/ML** (`apps/ml/`)
   - Poll scrapers
   - Forecasting models
   - Data processing
   - Python/FastAPI service

4. **Infrastructure** (root & `.github/`)
   - Docker/Docker Compose
   - CI/CD pipelines
   - Testing setup
   - Deployment configs

### Development Commands

```bash
# Start all services in development mode
npm run dev

# Start specific workspace
npm run dev:web    # Frontend only
npm run dev:api    # Backend only

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

## Session Ready!

Your environment is configured for parallel development.

**Key Files to Check:**
- `ROADMAP.md` - Feature roadmap and priorities
- `INFRASTRUCTURE_PLAN.md` - Architecture details
- `PARALLEL_DEV_GUIDE.md` - Parallel development guidelines
- `package.json` - Available scripts

**Before starting work:**
1. Check which workstream you're assigned to
2. Create/checkout your feature branch
3. Review the PARALLEL_DEV_GUIDE.md for coordination
4. Start coding!

---

**Happy coding! 🚀**
