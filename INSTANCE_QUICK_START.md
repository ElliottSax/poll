# Instance Quick Start Guides

> Fast setup guides for each Claude Code instance working in parallel

---

## Instance 1: Frontend Development

### Your Mission
Build the Next.js web application with beautiful visualizations and responsive design.

### Your Workspace
- `apps/web/` - Main Next.js application
- `packages/ui/` - Shared UI components

### Your Branch
```bash
git checkout -b claude/frontend-<feature>-01BwXNyfHHhoRwfu1QKXmUDH
```

### First Steps

1. **Create the Next.js app**:
```bash
mkdir -p apps/web
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

2. **Install dependencies**:
```bash
npm install @tanstack/react-query zustand
npm install recharts lucide-react
npm install date-fns
npm install -D @types/node
```

3. **Set up shadcn/ui**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card table
```

4. **Create basic structure**:
```bash
mkdir -p app/races app/polls app/pollsters
mkdir -p components/features components/charts components/layout
```

5. **Start developing**:
```bash
npm run dev
```

### Your First Tasks
- [ ] Set up homepage with layout
- [ ] Create race card component
- [ ] Build race listing page
- [ ] Add basic trend chart
- [ ] Implement responsive navigation

### Mock Data Until Backend is Ready
```typescript
// lib/mock-data.ts
export const mockRaces = [
  {
    id: '1',
    name: '2024 Presidential Election',
    type: 'president',
    status: 'active',
    // ...
  }
]
```

---

## Instance 2: Backend API Development

### Your Mission
Build a fast, secure Fastify API server with comprehensive endpoints.

### Your Workspace
- `apps/api/` - Fastify application

### Your Branch
```bash
git checkout -b claude/backend-<feature>-01BwXNyfHHhoRwfu1QKXmUDH
```

### First Steps

1. **Create the API app**:
```bash
mkdir -p apps/api
cd apps/api
npm init -y
```

2. **Install dependencies**:
```bash
npm install fastify @fastify/cors @fastify/helmet
npm install @prisma/client
npm install zod
npm install dotenv
npm install -D typescript @types/node
npm install -D tsx nodemon
```

3. **Initialize TypeScript**:
```bash
npx tsc --init
```

4. **Create basic structure**:
```bash
mkdir -p src/routes src/controllers src/services src/middleware
touch src/index.ts
```

5. **Create server**:
```typescript
// src/index.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

const server = Fastify({ logger: true })

server.register(cors)
server.register(helmet)

server.get('/health', async () => {
  return { status: 'ok' }
})

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
```

6. **Start developing**:
```bash
npm run dev
```

### Your First Tasks
- [ ] Set up Fastify server
- [ ] Create GET /api/races endpoint
- [ ] Create GET /api/polls endpoint
- [ ] Add input validation with Zod
- [ ] Implement error handling middleware
- [ ] Add OpenAPI documentation

---

## Instance 3: Data Scraping Pipeline

### Your Mission
Build robust web scrapers to collect polling data from multiple sources.

### Your Workspace
- `apps/scraper/` - Python scraping application

### Your Branch
```bash
git checkout -b claude/scraper-<feature>-01BwXNyfHHhoRwfu1QKXmUDH
```

### First Steps

1. **Create Python project**:
```bash
mkdir -p apps/scraper
cd apps/scraper
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate on Windows
```

2. **Install dependencies**:
```bash
pip install requests beautifulsoup4 lxml
pip install playwright
pip install pandas numpy
pip install python-dotenv
pip install psycopg2-binary
pip install prisma
```

3. **Create structure**:
```bash
mkdir -p src/scrapers src/validators src/utils
touch src/__init__.py
touch requirements.txt
```

4. **Save requirements**:
```bash
pip freeze > requirements.txt
```

5. **Create first scraper**:
```python
# src/scrapers/rcp.py
import requests
from bs4 import BeautifulSoup

def scrape_rcp():
    """Scrape RealClearPolitics polling data"""
    url = "https://www.realclearpolitics.com/epolls/latest_polls/"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    # Parse data...
    return polls

if __name__ == "__main__":
    polls = scrape_rcp()
    print(f"Found {len(polls)} polls")
```

### Your First Tasks
- [ ] Set up Python environment
- [ ] Create RealClearPolitics scraper
- [ ] Create FiveThirtyEight scraper
- [ ] Implement data validation
- [ ] Add error handling and retries
- [ ] Set up scheduling with cron

---

## Instance 4: Database & Schema

### Your Mission
Design and implement the PostgreSQL schema with Prisma ORM.

### Your Workspace
- `packages/database/` - Prisma schema and migrations

### Your Branch
```bash
git checkout -b claude/database-<feature>-01BwXNyfHHhoRwfu1QKXmUDH
```

### First Steps

1. **Create database package**:
```bash
mkdir -p packages/database
cd packages/database
npm init -y
```

2. **Install Prisma**:
```bash
npm install @prisma/client
npm install -D prisma
```

3. **Initialize Prisma**:
```bash
npx prisma init
```

4. **Configure database** (edit `.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/polling_dashboard"
```

5. **Create schema** (edit `prisma/schema.prisma`):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Race {
  id            String   @id @default(uuid())
  raceType      String   @map("race_type")
  raceName      String   @map("race_name")
  slug          String   @unique
  state         String?
  electionDate  DateTime @map("election_date")
  status        String   @default("upcoming")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  polls         Poll[]

  @@map("races")
}

model Poll {
  id           String   @id @default(uuid())
  raceId       String   @map("race_id")
  pollDate     DateTime @map("poll_date")
  sampleSize   Int?     @map("sample_size")
  methodology  String?
  results      Json
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  race         Race     @relation(fields: [raceId], references: [id])

  @@map("polls")
}

// Add more models...
```

6. **Create first migration**:
```bash
npx prisma migrate dev --name init
```

7. **Generate Prisma Client**:
```bash
npx prisma generate
```

### Your First Tasks
- [ ] Complete database schema (all tables)
- [ ] Create initial migration
- [ ] Set up TimescaleDB extensions
- [ ] Create seed data script
- [ ] Test schema locally
- [ ] Document schema in README

---

## Instance 5: Forecasting & Analytics (Phase 2)

### Your Mission
Build statistical models for poll aggregation and election forecasting.

### Your Workspace
- `apps/forecasting/` - Python/FastAPI forecasting service

### Your Branch
```bash
git checkout -b claude/forecasting-<feature>-01BwXNyfHHhoRwfu1QKXmUDH
```

### First Steps

1. **Create Python project**:
```bash
mkdir -p apps/forecasting
cd apps/forecasting
python3 -m venv venv
source venv/bin/activate
```

2. **Install dependencies**:
```bash
pip install fastapi uvicorn
pip install pandas numpy scipy
pip install scikit-learn statsmodels
pip install python-dotenv
pip install psycopg2-binary
```

3. **Create structure**:
```bash
mkdir -p src/models src/api src/utils
touch src/__init__.py
```

4. **Create FastAPI server**:
```python
# src/main.py
from fastapi import FastAPI

app = FastAPI(title="Polling Forecast API")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/forecast/{race_id}")
async def get_forecast(race_id: str):
    # Calculate forecast
    return {"race_id": race_id, "forecast": {...}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

5. **Start developing**:
```bash
python src/main.py
```

### Your First Tasks
- [ ] Set up FastAPI server
- [ ] Implement weighted poll average
- [ ] Create pollster quality scoring
- [ ] Add recency weighting algorithm
- [ ] Build simple forecast endpoint
- [ ] Write model tests

---

## Coordination Checklist

Before starting work, ensure:

- [ ] You know your instance number (1-5)
- [ ] You've read the PARALLEL_DEVELOPMENT_GUIDE.md
- [ ] You've created your feature branch with correct naming
- [ ] You understand your workspace boundaries
- [ ] You know which shared packages you might need
- [ ] You have the latest code from main branch

During development:

- [ ] Commit frequently with clear messages
- [ ] Push your branch regularly
- [ ] Use `feat(<workspace>):` commit format
- [ ] Test your code before committing
- [ ] Document new features
- [ ] Update package.json scripts if needed

When ready to merge:

- [ ] Create a pull request
- [ ] Fill out PR template completely
- [ ] Tag dependencies or blocking work
- [ ] Request review
- [ ] Address feedback
- [ ] Merge when approved

---

## Getting Help

### If you're blocked by another instance:

1. **Check their branch**: See if they've pushed recent work
2. **Use mocks**: Mock the dependency temporarily
3. **Coordinate**: Note the dependency in your PR
4. **Merge order**: Follow the recommended merge sequence

### If you need to modify shared code:

1. **Check ownership**: See the file ownership matrix
2. **Create separate PR**: Make shared changes in dedicated PR
3. **Notify others**: Tag in PR description
4. **Merge first**: Get shared changes merged before continuing

### If you encounter merge conflicts:

1. **Stay in your workspace**: Usually conflicts mean you've crossed boundaries
2. **Rebase from main**: Get latest changes
3. **Resolve carefully**: Don't modify other workspaces
4. **Ask for help**: If conflicts are in shared files

---

## Success Criteria

You're doing it right if:

✅ Your branch only touches files in your workspace
✅ You can develop without waiting for other instances
✅ Your PRs are focused and reviewable
✅ You're committing regularly
✅ Your code works locally
✅ Tests pass
✅ Documentation is updated

---

## Quick Commands Reference

### Git Workflow
```bash
# Start new feature
git checkout main
git pull
git checkout -b claude/<workspace>-<feature>-<session-id>

# Regular development
git add .
git commit -m "feat(<workspace>): description"
git push -u origin <branch-name>

# Update from main
git checkout main
git pull
git checkout <your-branch>
git merge main
```

### Development
```bash
# Install all dependencies
npm install

# Run your workspace
npm run dev:web      # Instance 1
npm run dev:api      # Instance 2
# (Python instances use their own commands)

# Run tests
npm run test

# Lint and format
npm run lint
npm run format
```

### Database (All Instances)
```bash
# Apply migrations
npm run db:migrate:deploy

# View database
npm run db:studio

# Reset database
npm run db:reset
```

---

**Ready to start? Pick your instance, create your branch, and start building!** 🚀

See `PARALLEL_DEVELOPMENT_GUIDE.md` for comprehensive details.
