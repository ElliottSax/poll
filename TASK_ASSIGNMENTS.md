# 📋 Task Assignments - Parallel Development

> Quick reference for distributing work across multiple Claude Code instances

---

## 🎯 Current Sprint: Phase 1 MVP

**Goal**: Launch basic polling dashboard with core functionality
**Timeline**: Weeks 1-12

---

## Instance 1: Frontend/UI Development 🎨

**Branch**: `feature/ui-mvp-foundation`

### Week 1-2: Core Pages & Layout
- [ ] Set up Next.js 14 app structure (App Router)
- [ ] Configure TailwindCSS + shadcn/ui
- [ ] Create base layout (header, footer, navigation)
- [ ] Implement homepage with featured races
- [ ] Build race listing page with filters
- [ ] Create responsive grid layout

### Week 3-4: Race Detail Page
- [ ] Race detail page layout
- [ ] Poll table component (sortable, filterable)
- [ ] Basic trend chart (Recharts)
- [ ] Pollster information display
- [ ] Race metadata (candidates, office, state)
- [ ] Loading states and skeletons

### Week 5-6: Data Integration
- [ ] Set up React Query for data fetching
- [ ] Connect to backend API endpoints
- [ ] Implement error boundaries
- [ ] Add data refresh mechanism
- [ ] Handle loading and error states
- [ ] Optimize performance (memoization)

### Week 7-8: Polish & Optimization
- [ ] SEO optimization (meta tags, Open Graph)
- [ ] Accessibility improvements (ARIA labels)
- [ ] Mobile responsiveness refinement
- [ ] Performance optimization (code splitting)
- [ ] Add analytics (Plausible/GA4)
- [ ] Dark mode support (optional)

**Key Files**:
- `apps/web/app/` - Pages
- `apps/web/components/` - React components
- `apps/web/lib/` - Utilities

**APIs to consume**:
- GET `/api/races` - List races
- GET `/api/races/:slug` - Race details
- GET `/api/races/:slug/polls` - Race polls
- GET `/api/pollsters` - Pollster list

---

## Instance 2: Backend/API Development ⚙️

**Branch**: `feature/api-core-endpoints`

### Week 1-2: API Foundation
- [ ] Set up Fastify server structure
- [ ] Configure TypeScript strict mode
- [ ] Set up logging (Pino)
- [ ] Implement error handling middleware
- [ ] Add request validation (Zod)
- [ ] Configure CORS and security headers
- [ ] Set up rate limiting

### Week 3-4: Core Endpoints
- [ ] GET `/api/races` - List all races (with pagination)
- [ ] GET `/api/races/:slug` - Single race details
- [ ] GET `/api/races/:slug/polls` - Polls for race
- [ ] GET `/api/polls` - All polls (paginated, filtered)
- [ ] GET `/api/pollsters` - Pollster list
- [ ] GET `/api/pollsters/:slug` - Pollster details
- [ ] OpenAPI/Swagger documentation

### Week 5-6: Poll Aggregation Service
- [ ] Implement weighted average algorithm
- [ ] Add recency weighting (exponential decay)
- [ ] Sample size adjustment calculation
- [ ] Pollster quality scoring
- [ ] Outlier detection logic
- [ ] Calculate aggregates for all races
- [ ] Add caching (Redis)

### Week 7-8: Authentication & Advanced Features
- [ ] Set up NextAuth.js integration
- [ ] User registration endpoints
- [ ] User profile management
- [ ] API key generation (for Phase 3 prep)
- [ ] User preferences storage
- [ ] Session management

**Key Files**:
- `apps/api/src/routes/` - API routes
- `apps/api/src/services/` - Business logic
- `apps/api/src/models/` - Data models
- `apps/api/src/utils/` - Helpers

**Database Access**:
- Uses Prisma ORM from `packages/database/`
- Coordinates schema changes with Instance 4

---

## Instance 3: Data & ML Pipeline 🔬

**Branch**: `feature/data-scrapers-ml`

### Week 1-2: Scraper Framework
- [ ] Set up Python FastAPI service structure
- [ ] Create base scraper class
- [ ] Implement error handling and retry logic
- [ ] Add logging and monitoring
- [ ] Set up scheduled jobs (APScheduler/BullMQ)
- [ ] Data validation framework (Pydantic)

### Week 3-4: Poll Scrapers
- [ ] RealClearPolitics scraper
- [ ] FiveThirtyEight data importer
- [ ] The Economist integration
- [ ] Duplicate detection logic
- [ ] Data normalization pipeline
- [ ] Pollster mapping/standardization

### Week 5-6: Data Quality & Processing
- [ ] Automated data quality checks
- [ ] Outlier detection
- [ ] Data validation rules
- [ ] Historical data backfill
- [ ] Daily update automation
- [ ] Alert on scraper failures

### Week 7-8: Basic Forecasting
- [ ] Simple poll average calculation
- [ ] Trend analysis
- [ ] Basic statistical models (scikit-learn)
- [ ] Historical accuracy tracking
- [ ] Model validation framework
- [ ] API endpoints for forecasts

**Key Files**:
- `apps/ml/scrapers/` - Web scrapers
- `apps/ml/models/` - Statistical models
- `apps/ml/api/` - FastAPI endpoints
- `apps/ml/utils/` - Helper functions

**Dependencies**:
- Python 3.11+
- FastAPI, BeautifulSoup, pandas, NumPy, scikit-learn
- Database write access (coordinate with Instance 2/4)

---

## Instance 4: Infrastructure & DevOps 🏗️

**Branch**: `feature/infra-docker-ci`

### Week 1-2: Local Development Environment
- [ ] Docker Compose configuration
  - [ ] PostgreSQL 16 service
  - [ ] Redis 7 service
  - [ ] Adminer (DB admin UI)
  - [ ] Volume management
- [ ] Environment variable setup (.env.example)
- [ ] Database initialization scripts
- [ ] Local development documentation

### Week 3-4: Database & Migrations
- [ ] Finalize Prisma schema
- [ ] Create initial migration
- [ ] Seed data script (sample races, polls)
- [ ] Database backup strategy
- [ ] Migration rollback procedures
- [ ] Prisma Studio setup
- [ ] Install TimescaleDB extension

### Week 5-6: CI/CD Pipeline
- [ ] GitHub Actions workflow (lint)
- [ ] GitHub Actions workflow (type-check)
- [ ] GitHub Actions workflow (tests)
- [ ] Auto-deploy to Vercel (frontend)
- [ ] Auto-deploy to Railway/Render (backend)
- [ ] Environment variable management
- [ ] Deployment documentation

### Week 7-8: Testing Framework
- [ ] Jest setup for frontend tests
- [ ] Vitest setup for backend tests
- [ ] Playwright for E2E tests
- [ ] Test coverage reporting
- [ ] Pre-commit hooks (Husky)
- [ ] CI test integration
- [ ] Mock data generators

**Key Files**:
- `docker-compose.yml`
- `.github/workflows/` - CI/CD
- `packages/database/` - Prisma schema
- `scripts/` - Build and utility scripts

**Coordinates with**: All other instances

---

## 🔄 Cross-Instance Dependencies

### Database Schema (Instance 2 & 4)
**When**: Week 3
**What**: Finalize Prisma schema for MVP
**Coordination**: Both instances review and approve

### API Contract (Instance 1 & 2)
**When**: Week 2
**What**: Agree on API endpoints, request/response formats
**Coordination**: Document in `docs/API.md`, use shared types

### Data Pipeline (Instance 2 & 3)
**When**: Week 4
**What**: Agree on data format for scraped polls
**Coordination**: Define in `packages/types/`

### Deployment (All Instances)
**When**: Week 6
**What**: Coordinate first production deployment
**Coordination**: Instance 4 leads, all test

---

## 🎯 Milestones

### Week 4: Integration Checkpoint
- [ ] Frontend can display mock data
- [ ] Backend API endpoints functional
- [ ] First scraper running successfully
- [ ] Docker Compose working locally

### Week 8: MVP Feature Complete
- [ ] All core pages built
- [ ] API serving real data
- [ ] Automated daily scraping
- [ ] CI/CD pipeline operational

### Week 12: Production Launch
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database seeded with real data
- [ ] Monitoring and alerts set up

---

## 📝 Daily Coordination

Each instance should:

1. **Morning**: Check this file for assigned tasks
2. **During**: Update task status (mark with ✅ when done)
3. **End of Day**: Push commits and update progress
4. **Blockers**: Document in commit messages or GitHub issues

---

## 🚀 Getting Started

### For New Instance

1. **Identify your role**:
   - Instance 1 → Frontend/UI
   - Instance 2 → Backend/API
   - Instance 3 → Data/ML
   - Instance 4 → Infrastructure

2. **Create your feature branch**:
   ```bash
   git checkout -b [your-branch-from-above]
   ```

3. **Start with Week 1 tasks**

4. **Check PARALLEL_DEV_GUIDE.md** for workflow details

5. **Begin coding!**

---

## ✅ How to Use This File

- **Check off tasks** as you complete them (replace `[ ]` with `[x]`)
- **Commit this file** when you mark tasks done
- **Pull regularly** to see other instances' progress
- **Add notes** if you discover new tasks or blockers

---

**Last Updated**: 2025-11-18
**Current Phase**: Phase 1 MVP - Week 1

---

**Let's build this in parallel! 🚀**
