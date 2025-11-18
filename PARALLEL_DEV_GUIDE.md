# 🔀 Parallel Development Guide

> Coordinate multiple Claude Code web instances working simultaneously on the Poll Dashboard project

---

## 📋 Overview

This project is structured to support **4 parallel development workstreams**, each focused on a specific part of the stack. Multiple Claude Code instances can work simultaneously without conflicts.

---

## 🎯 Workstream Assignments

### Workstream 1: Frontend/UI 🎨

**Directory**: `apps/web/`
**Branch Prefix**: `feature/ui-*` or `feature/web-*`

**Responsibilities**:
- Next.js app pages and routing
- React components (shadcn/ui)
- Interactive visualizations (D3.js, Recharts, Mapbox)
- TailwindCSS styling
- Client-side state management (Zustand, React Query)
- User experience and responsive design

**Key Tasks from Roadmap**:
- [ ] Homepage and race listing pages
- [ ] Individual race detail pages
- [ ] Poll table component
- [ ] Trend charts and visualizations
- [ ] Interactive electoral maps
- [ ] "What-If" scenario builder UI
- [ ] User dashboard and profile pages
- [ ] Prediction game interface

**Dependencies**:
- Needs API endpoints from Workstream 2
- Needs shared types from `packages/types/`

**Development Commands**:
```bash
npm run dev:web          # Start Next.js dev server (port 3000)
npm run build:web        # Build frontend
npm run type-check       # TypeScript validation
```

---

### Workstream 2: Backend/API ⚙️

**Directory**: `apps/api/`
**Branch Prefix**: `feature/api-*` or `feature/backend-*`

**Responsibilities**:
- Fastify REST API endpoints
- GraphQL API (Phase 3)
- Authentication & authorization (NextAuth.js integration)
- Business logic and services
- Database operations (Prisma ORM)
- Data validation (Zod)
- Rate limiting and security
- Job queue management (BullMQ)

**Key Tasks from Roadmap**:
- [ ] Core API endpoints (races, polls, pollsters)
- [ ] User authentication system
- [ ] Poll aggregation algorithm
- [ ] Alert system backend
- [ ] API key management
- [ ] Webhook system
- [ ] Payment processing (Stripe integration)
- [ ] Premium feature gates

**Dependencies**:
- Needs database schema from `packages/database/`
- Needs shared types from `packages/types/`
- Provides data to Workstream 1

**Development Commands**:
```bash
npm run dev:api          # Start Fastify server (port 3001)
npm run build:api        # Build backend
npm run test:unit        # Run backend tests
```

---

### Workstream 3: Data & ML 🔬

**Directory**: `apps/ml/`
**Branch Prefix**: `feature/ml-*` or `feature/data-*`

**Responsibilities**:
- Poll scrapers (RealClearPolitics, FiveThirtyEight, etc.)
- Data validation and normalization
- Python FastAPI service
- Forecasting models (statistical analysis)
- Monte Carlo simulations
- Demographic analysis algorithms
- Sentiment analysis
- Data quality monitoring

**Key Tasks from Roadmap**:
- [ ] RealClearPolitics scraper
- [ ] FiveThirtyEight data importer
- [ ] Data normalization pipeline
- [ ] Basic forecasting algorithm
- [ ] Advanced statistical models
- [ ] Monte Carlo simulation engine
- [ ] Demographic analysis tools
- [ ] Early vote tracker integration

**Dependencies**:
- Writes to database (coordinate with Workstream 2)
- Needs Python environment and dependencies

**Development Commands**:
```bash
cd apps/ml
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

### Workstream 4: Infrastructure & DevOps 🏗️

**Directory**: Root, `.github/`, `infrastructure/`, `scripts/`
**Branch Prefix**: `feature/infra-*` or `feature/devops-*`

**Responsibilities**:
- Docker and Docker Compose configuration
- CI/CD pipelines (GitHub Actions)
- Database migrations and seeding
- Testing framework setup (Jest, Playwright)
- Build optimization
- Deployment configuration
- Monitoring and logging setup
- Performance optimization

**Key Tasks from Roadmap**:
- [ ] Docker Compose for local development
- [ ] GitHub Actions CI pipeline
- [ ] Automated testing setup
- [ ] Database migration system
- [ ] Seed data creation
- [ ] Production build optimization
- [ ] Deployment scripts (Vercel, Railway)
- [ ] Load testing and scaling

**Dependencies**:
- Coordinates with all workstreams
- Needs to understand all services

**Development Commands**:
```bash
docker-compose up -d     # Start all services
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run test             # Run all tests
npm run build            # Build all apps
```

---

## 🌿 Git Workflow for Parallel Development

### Branch Naming Convention

```
feature/[workstream]-[description]

Examples:
- feature/ui-race-detail-page
- feature/api-poll-aggregation
- feature/ml-rcp-scraper
- feature/infra-docker-setup
```

### Workflow Steps

1. **Start Work**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/[workstream]-[description]
   ```

2. **During Development**
   ```bash
   # Commit frequently with clear messages
   git add .
   git commit -m "feat(ui): add race detail page component"

   # Push to remote regularly
   git push -u origin feature/[workstream]-[description]
   ```

3. **Before Creating PR**
   ```bash
   # Sync with main to avoid conflicts
   git fetch origin main
   git rebase origin/main

   # Resolve any conflicts
   # Run tests
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Create Pull Request**
   - Use GitHub PR or `gh pr create` command
   - Link to relevant issue or roadmap item
   - Request review from team
   - Ensure CI passes

### Avoiding Conflicts

**Shared Files** (coordinate changes):
- `package.json` (root)
- `packages/types/` (shared TypeScript types)
- `packages/database/` (Prisma schema)
- `.env.example`
- `docker-compose.yml`

**Communication**:
- Document your changes in commit messages
- Update relevant documentation
- Leave clear TODO comments for interdependencies
- Tag related PRs when features depend on each other

---

## 📦 Shared Packages

### `packages/types/`
**Shared TypeScript types and interfaces**

All workstreams should import from here:
```typescript
import type { Poll, Race, Pollster } from '@poll/types'
```

**When to update**:
- Adding new API endpoints → add response types
- Database schema changes → update model types
- New features → add feature-specific types

**Coordination**: Changes here affect ALL workstreams!

### `packages/database/`
**Prisma schema and migrations**

**When to update**:
- New database tables or fields
- Relationship changes
- Index optimizations

**Process**:
1. Update `schema.prisma`
2. Create migration: `npm run db:migrate`
3. Regenerate Prisma client: `npm run db:generate`
4. Commit both schema and migration files
5. Notify other workstreams to pull and regenerate

---

## 🔄 Synchronization Points

### Daily Standup (Async)
Each instance should check:
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers or dependencies?

### Integration Points

**Frontend ↔️ Backend**:
- API contract (OpenAPI/Swagger)
- Shared types from `packages/types/`
- Mock data for development

**Backend ↔️ Data/ML**:
- Database schema
- Data format agreements
- Job queue contracts

**All ↔️ Infrastructure**:
- Docker configuration
- Environment variables
- CI/CD requirements

---

## 🧪 Testing Strategy

### Unit Tests
Each workstream owns their unit tests:
- Frontend: Component tests (Jest + React Testing Library)
- Backend: Service/route tests (Vitest)
- ML: Algorithm tests (pytest)

### Integration Tests
Test interactions between services:
- API integration tests (Workstream 2)
- E2E tests (Workstream 4)

### Running Tests
```bash
# All tests
npm run test

# Specific workspace
npm run test:unit --filter=web
npm run test:unit --filter=api

# With coverage
npm run test:coverage
```

---

## 📊 Progress Tracking

### Using the Roadmap

Each workstream should:
1. Review `ROADMAP.md` for assigned tasks
2. Update task status with checkboxes
3. Note dependencies or blockers
4. Coordinate on shared milestones

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Scopes:
- ui, web: Frontend
- api, backend: Backend
- ml, data: Data/ML
- infra, ci: Infrastructure
- db: Database

Examples:
feat(ui): add interactive electoral map component
fix(api): correct poll weight calculation
feat(ml): implement RealClearPolitics scraper
chore(infra): configure Docker Compose for development
```

---

## 🚀 Quick Start for New Instance

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Choose your workstream** (see assignments above)

5. **Create feature branch**
   ```bash
   git checkout -b feature/[workstream]-[description]
   ```

6. **Start development**
   ```bash
   npm run dev:[workspace]  # web, api, or ml
   ```

7. **Code, commit, push, PR!**

---

## 📞 Communication & Coordination

### For Dependencies
- **Blocked by another workstream?**
  - Create a GitHub issue
  - Tag the relevant PR
  - Use mock data in the meantime

### For Schema Changes
- **Updating shared types or database?**
  - Create PR early for review
  - Document breaking changes
  - Coordinate merge timing

### For Questions
- Check existing documentation first
- Review `INFRASTRUCTURE_PLAN.md` for architecture
- Review `ROADMAP.md` for feature specs
- Leave clear comments in PRs

---

## 🎯 Current Phase Focus

**Phase 1: MVP (Active)**

Priority tasks for each workstream:

1. **Frontend**: Race listing, race detail, poll table, basic charts
2. **Backend**: Core API endpoints, poll aggregation, database setup
3. **Data/ML**: RCP scraper, data normalization, basic algorithms
4. **Infrastructure**: Docker Compose, CI pipeline, testing framework

---

## ✅ Definition of Done

Before marking a feature complete:

- [ ] Code written and tested locally
- [ ] Unit tests written (where applicable)
- [ ] TypeScript types updated (if needed)
- [ ] Documentation updated
- [ ] Linting and type-checking pass
- [ ] Committed with conventional commit message
- [ ] Pushed to feature branch
- [ ] PR created and reviewed
- [ ] CI pipeline passes
- [ ] Merged to main

---

## 🎉 Success Metrics

**We're doing parallel development right when**:
- Multiple features ship simultaneously
- Merge conflicts are rare and minor
- CI pipeline stays green
- Each workstream makes steady progress
- Communication is clear and async-friendly

---

**Happy parallel development! Let's build something amazing together! 🚀**
