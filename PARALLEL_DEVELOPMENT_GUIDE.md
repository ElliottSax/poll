# Parallel Development Guide for Multiple Claude Code Instances

> Strategy for developing the polling dashboard with multiple Claude Code web instances working in parallel

---

## Overview

This guide enables you to work on different parts of the polling dashboard simultaneously using multiple Claude Code web instances. Each instance focuses on a specific workspace or feature area, minimizing conflicts and maximizing productivity.

---

## Workspace Strategy

### Monorepo Structure

```
polling-dashboard/
├── apps/
│   ├── web/                    # Next.js frontend (Instance 1)
│   ├── api/                    # Fastify backend (Instance 2)
│   └── scraper/                # Python data pipeline (Instance 3)
├── packages/
│   ├── database/               # Prisma schema & migrations (Instance 4)
│   ├── types/                  # Shared TypeScript types (Shared)
│   ├── ui/                     # Shared UI components (Instance 1)
│   ├── utils/                  # Shared utilities (Shared)
│   └── config/                 # Shared configuration (Shared)
└── docs/                       # Documentation (Any instance)
```

---

## Instance Assignments

### Instance 1: Frontend Development
**Branch Pattern**: `claude/frontend-*`
**Primary Focus**: `apps/web/` and `packages/ui/`

**Responsibilities**:
- Next.js application setup
- Page components and routing
- UI component library (shadcn/ui integration)
- Data visualization components
- Frontend state management
- Responsive design implementation

**Key Files**:
- `apps/web/src/app/**/*`
- `apps/web/src/components/**/*`
- `packages/ui/**/*`
- Tailwind configuration

**Current Tasks** (from Roadmap):
- Homepage (featured races)
- Race listing page
- Individual race page
- Race card component
- Poll table component
- Trend charts (Recharts)
- Header/Navigation/Footer

---

### Instance 2: Backend API Development
**Branch Pattern**: `claude/backend-*`
**Primary Focus**: `apps/api/`

**Responsibilities**:
- Fastify server setup
- RESTful API endpoints
- GraphQL schema (optional)
- Authentication & authorization
- API middleware (validation, logging, rate limiting)
- WebSocket server for real-time updates

**Key Files**:
- `apps/api/src/routes/**/*`
- `apps/api/src/controllers/**/*`
- `apps/api/src/middleware/**/*`
- `apps/api/src/services/**/*`

**Current Tasks** (from Roadmap):
- GET /api/races endpoints
- GET /api/polls endpoints
- GET /api/pollsters endpoints
- Input validation (Zod)
- Error handling middleware
- CORS configuration
- OpenAPI documentation

---

### Instance 3: Data Pipeline & Scraping
**Branch Pattern**: `claude/scraper-*`
**Primary Focus**: `apps/scraper/`

**Responsibilities**:
- Python scraping scripts
- Data normalization and validation
- Automated scheduling (cron jobs)
- Data quality monitoring
- Error handling and retry logic
- Duplicate detection

**Key Files**:
- `apps/scraper/src/scrapers/**/*`
- `apps/scraper/src/validators/**/*`
- `apps/scraper/src/schedulers/**/*`

**Current Tasks** (from Roadmap):
- RealClearPolitics scraper
- FiveThirtyEight data import
- The Economist integration
- Data validation pipeline
- Automated scraping schedule
- Error handling and retry logic

---

### Instance 4: Database & Data Models
**Branch Pattern**: `claude/database-*`
**Primary Focus**: `packages/database/`

**Responsibilities**:
- Prisma schema design
- Database migrations
- Seed data creation
- Query optimization
- Database indexes
- TimescaleDB configuration

**Key Files**:
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/**/*`
- `packages/database/prisma/seed.ts`

**Current Tasks** (from Roadmap):
- Implement PostgreSQL schema
- Create Prisma migrations
- Set up TimescaleDB for time-series
- Create seed data
- Configure Prisma client

---

### Instance 5: Statistical Modeling & Forecasting (Optional)
**Branch Pattern**: `claude/forecasting-*`
**Primary Focus**: `apps/forecasting/` (Python/FastAPI)

**Responsibilities**:
- Poll aggregation algorithms
- Statistical forecasting models
- Monte Carlo simulations
- Model validation and backtesting
- FastAPI endpoints for model predictions

**Key Files**:
- `apps/forecasting/src/models/**/*`
- `apps/forecasting/src/api/**/*`

**Current Tasks** (Phase 2):
- Weighted poll average algorithm
- Pollster quality scoring
- Recency weighting
- Sample size adjustment
- Outlier detection

---

## Branch Strategy

### Naming Convention

```
claude/<workspace>-<feature>-<session-id>
```

**Examples**:
- `claude/frontend-homepage-01BwXNyfHH`
- `claude/backend-api-endpoints-01BwXNyfHH`
- `claude/scraper-rcp-scraper-01BwXNyfHH`
- `claude/database-schema-setup-01BwXNyfHH`

### Branch Lifecycle

1. **Create**: Each instance creates its own feature branch
2. **Develop**: Work independently in the assigned workspace
3. **Commit**: Regular commits with clear messages
4. **Push**: Push to remote frequently
5. **PR**: Create pull requests when features are complete
6. **Merge**: Merge to main after review

---

## Coordination Strategy

### 1. Shared Dependencies

**Packages that multiple instances may need**:
- `packages/types/` - Shared TypeScript types
- `packages/utils/` - Shared utility functions
- `packages/config/` - Shared configuration

**Rule**: If you need to modify shared packages:
1. Create a separate branch for the shared package
2. Get it merged first
3. Then continue with your feature work

### 2. API Contracts

**Frontend ↔ Backend Communication**:

Create API contract files in `packages/types/`:
```typescript
// packages/types/src/api/races.ts
export interface GetRacesResponse {
  races: Race[]
  total: number
  page: number
}
```

**Process**:
1. Database instance defines data models first
2. Backend instance defines API contracts
3. Frontend instance consumes the contracts
4. Everyone references `packages/types`

### 3. Daily Sync Points

**What to communicate**:
- Completed features
- Breaking changes
- New shared types or utilities
- Database schema changes
- API endpoint additions/changes

**How**:
- Git commit messages
- Pull request descriptions
- Update `CHANGELOG.md` in your workspace
- Tag other instances in PR descriptions if needed

---

## File Ownership Matrix

| Path | Primary Owner | Can Modify | Must Coordinate |
|------|--------------|------------|-----------------|
| `apps/web/` | Instance 1 | Instance 1 only | - |
| `apps/api/` | Instance 2 | Instance 2 only | - |
| `apps/scraper/` | Instance 3 | Instance 3 only | - |
| `packages/database/` | Instance 4 | Instance 4 only | All instances (schema changes) |
| `packages/types/` | Shared | Any | All instances (API contracts) |
| `packages/ui/` | Instance 1 | Instance 1 primarily | - |
| `packages/utils/` | Shared | Any | - |
| `packages/config/` | Shared | Any | All instances (config changes) |
| Root configs | Shared | Any | All instances |

---

## Conflict Prevention

### 1. Workspace Isolation

✅ **DO**:
- Work primarily in your assigned workspace
- Create new files rather than modifying shared files when possible
- Use feature flags for incomplete features
- Keep your branch up to date with main

❌ **DON'T**:
- Modify files outside your assigned workspace without coordination
- Make breaking changes to shared packages without notice
- Commit directly to main
- Let your branch diverge too far from main

### 2. Database Migrations

**Special handling for database changes**:

1. Instance 4 creates migration files
2. Other instances pull and apply migrations
3. Never create migrations in parallel
4. Always test migrations locally before committing

**Process**:
```bash
# Instance 4: Create migration
npm run db:migrate

# Other instances: Apply migration
git pull origin main
npm run db:migrate:deploy
```

### 3. Merge Strategy

**Recommended order for merging**:
1. Database schema changes (Instance 4)
2. Shared types (Any instance)
3. Backend API (Instance 2)
4. Frontend (Instance 1)
5. Scraper (Instance 3)

This ensures dependencies flow correctly.

---

## Development Workflow

### Initial Setup (Each Instance)

```bash
# 1. Clone repository
git clone <repo-url>
cd polling-dashboard

# 2. Create your feature branch
git checkout -b claude/<workspace>-<feature>-<session-id>

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.example .env
# Edit .env with your local settings

# 5. Run database migrations
npm run db:migrate

# 6. Start development server for your workspace
npm run dev:web      # Instance 1
npm run dev:api      # Instance 2
# etc.
```

### Daily Workflow

```bash
# 1. Start of session: Pull latest changes
git checkout main
git pull origin main
git checkout <your-branch>
git merge main

# 2. Make your changes in your workspace

# 3. Commit regularly
git add <your-workspace-files>
git commit -m "feat(web): add race listing page"

# 4. Push frequently
git push -u origin <your-branch>

# 5. When feature is complete: Create PR
# Use GitHub web interface or gh CLI
```

### Cross-Instance Dependencies

If Instance 1 (frontend) needs something from Instance 2 (backend):

1. **Option A**: Instance 2 merges their work first
   ```bash
   # Instance 2: Complete and merge backend endpoint
   # Instance 1: Pull from main and continue
   ```

2. **Option B**: Use mock data temporarily
   ```typescript
   // Instance 1: Use mock data until API is ready
   const mockRaces = [...]

   // Later, replace with actual API call
   const races = await fetch('/api/races')
   ```

---

## Communication Protocol

### Commit Message Format

Use conventional commits for clarity:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Scopes** (your workspace):
- `web`: Frontend
- `api`: Backend
- `scraper`: Data pipeline
- `database`: Database/Prisma
- `types`: Shared types
- `ui`: UI components

**Examples**:
```
feat(web): add race listing page
feat(api): implement GET /api/races endpoint
feat(database): add polls table schema
fix(scraper): handle missing poll data gracefully
chore(types): add Race interface
```

### PR Templates

Include in your PR description:

```markdown
## Changes
- What did you build/change?

## Workspace
- [ ] Frontend (apps/web)
- [ ] Backend (apps/api)
- [ ] Scraper (apps/scraper)
- [ ] Database (packages/database)
- [ ] Shared packages

## Breaking Changes
- Any breaking changes to shared types or APIs?

## Dependencies
- Does this PR depend on or block other work?

## Testing
- How was this tested?

## Screenshots (if UI changes)
```

---

## Example Scenarios

### Scenario 1: Building the Homepage

**Instance 1 (Frontend)**:
1. Create `apps/web/src/app/page.tsx`
2. Use mock race data initially
3. Build UI components
4. Push to `claude/frontend-homepage-<session-id>`

**Instance 2 (Backend)**:
1. Create `GET /api/races` endpoint
2. Implement race filtering and pagination
3. Push to `claude/backend-races-api-<session-id>`

**Coordination**:
- Instance 4 ensures `Race` model exists in database
- Instances 1 & 2 agree on API contract in `packages/types`
- Instance 2 merges first
- Instance 1 replaces mock data with real API calls

### Scenario 2: Adding a New Database Table

**Instance 4 (Database)**:
1. Add table to Prisma schema
2. Create migration
3. Update seed data
4. Export types from `packages/database`
5. Create PR and notify others
6. Wait for approval before merging

**All Other Instances**:
1. Pull the merged changes
2. Run `npm run db:migrate:deploy`
3. Continue with their work

### Scenario 3: Building a New Feature End-to-End

**Multi-instance collaboration**:

1. **Instance 4**: Add database tables if needed → Merge
2. **Instance 3**: Add data scraping if needed → Merge
3. **Instance 2**: Build API endpoints → Merge
4. **Instance 1**: Build UI → Merge

Each instance works in parallel where possible, merges sequentially where dependencies exist.

---

## Troubleshooting

### Merge Conflicts

If you encounter conflicts:

```bash
# 1. Fetch latest changes
git fetch origin main

# 2. Rebase your branch
git rebase origin/main

# 3. Resolve conflicts in your workspace only
# Usually conflicts in shared files indicate coordination needed

# 4. Continue rebase
git rebase --continue

# 5. Force push (your branch only!)
git push --force-with-lease
```

### Database Out of Sync

```bash
# Reset your local database
npm run db:reset

# Or apply pending migrations
npm run db:migrate:deploy
```

### Dependency Issues

```bash
# Clean and reinstall
npm run clean
npm install

# Regenerate Prisma client
npm run db:generate
```

---

## Best Practices

### For All Instances

1. **Commit early, commit often**
2. **Keep PRs focused and small**
3. **Update documentation as you go**
4. **Write tests for your code**
5. **Review your own PR before requesting review**

### For Frontend Instance

1. **Use mock data until APIs are ready**
2. **Create reusable components in `packages/ui`**
3. **Follow design system and style guide**
4. **Test on multiple screen sizes**

### For Backend Instance

1. **Document API endpoints immediately**
2. **Write OpenAPI specs**
3. **Validate all inputs**
4. **Handle errors gracefully**

### For Scraper Instance

1. **Add retry logic for all external calls**
2. **Log all scraping activity**
3. **Validate data before inserting**
4. **Handle rate limits properly**

### For Database Instance

1. **Always create migration files**
2. **Never modify existing migrations**
3. **Test migrations on local data**
4. **Document schema changes**

---

## Current Phase: MVP Setup

### Priority Order for Parallel Development

**Week 1-2**: Foundation
1. **Instance 4**: Database schema ✓ (HIGHEST PRIORITY)
2. **Instance 2**: API scaffolding
3. **Instance 1**: Next.js setup and design system
4. **Instance 3**: Scraper infrastructure

**Week 3-4**: Core Features
1. **Instance 3**: First scrapers (RCP, 538)
2. **Instance 4**: Seed data
3. **Instance 2**: Core API endpoints
4. **Instance 1**: Homepage and race pages

**Week 5-6**: Integration
1. **Instance 2**: API documentation
2. **Instance 1**: Connect frontend to backend
3. **Instance 3**: Automated scheduling
4. All: Testing and bug fixes

---

## Quick Reference

### Commands by Instance

**Instance 1 (Frontend)**:
```bash
npm run dev:web           # Start dev server
npm run build:web         # Build for production
npm run lint              # Lint code
```

**Instance 2 (Backend)**:
```bash
npm run dev:api           # Start API server
npm run build:api         # Build for production
npm run test:integration  # Run integration tests
```

**Instance 3 (Scraper)**:
```bash
cd apps/scraper
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python src/scrapers/rcp.py
```

**Instance 4 (Database)**:
```bash
npm run db:migrate        # Create migration
npm run db:studio         # Open Prisma Studio
npm run db:seed           # Seed database
npm run db:reset          # Reset database
```

---

## Success Metrics

Track your progress:

- [ ] Each instance has its workspace set up
- [ ] No merge conflicts between instances
- [ ] All shared types are in `packages/types`
- [ ] Database migrations apply cleanly
- [ ] APIs are documented
- [ ] Frontend can call backend successfully
- [ ] Scrapers populate database with real data
- [ ] All tests pass
- [ ] Documentation is up to date

---

## Questions?

If you encounter issues with parallel development:

1. Check if you're following the workspace boundaries
2. Review the file ownership matrix
3. Ensure you're on the right branch
4. Check if your work depends on unmerged changes
5. Consider using feature flags for incomplete work

---

**Remember**: The goal is to work independently while staying coordinated. When in doubt, overcommunicate in commit messages and PR descriptions!

**Let's build this polling dashboard efficiently with parallel development!** 🚀
