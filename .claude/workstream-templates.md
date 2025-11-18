# 🎯 Workstream Templates

Quick copy-paste templates for each parallel development workstream.

## Instance 1: Frontend/UI 🎨

```bash
# Branch name
git checkout -b feature/ui-[description]

# Example branches
git checkout -b feature/ui-race-listing-page
git checkout -b feature/ui-poll-table-component
git checkout -b feature/ui-trend-charts

# Development
npm run dev:web

# Your focus areas
- apps/web/app/ (pages)
- apps/web/components/ (React components)
- apps/web/lib/ (utilities)
```

## Instance 2: Backend/API ⚙️

```bash
# Branch name
git checkout -b feature/api-[description]

# Example branches
git checkout -b feature/api-race-endpoints
git checkout -b feature/api-poll-aggregation
git checkout -b feature/api-authentication

# Development
npm run dev:api

# Your focus areas
- apps/api/src/routes/ (API endpoints)
- apps/api/src/services/ (business logic)
- apps/api/src/models/ (data models)
```

## Instance 3: Data/ML 🔬

```bash
# Branch name
git checkout -b feature/ml-[description]

# Example branches
git checkout -b feature/ml-rcp-scraper
git checkout -b feature/ml-forecasting-model
git checkout -b feature/ml-data-pipeline

# Development
cd apps/ml
python -m venv venv
source venv/bin/activate
uvicorn main:app --reload

# Your focus areas
- apps/ml/scrapers/ (web scrapers)
- apps/ml/models/ (statistical models)
- apps/ml/api/ (FastAPI endpoints)
```

## Instance 4: Infrastructure 🏗️

```bash
# Branch name
git checkout -b feature/infra-[description]

# Example branches
git checkout -b feature/infra-docker-setup
git checkout -b feature/infra-ci-pipeline
git checkout -b feature/infra-database-migrations

# Development
docker-compose up -d
npm run db:migrate

# Your focus areas
- docker-compose.yml
- .github/workflows/
- packages/database/
- scripts/
```

## Common Commands (All Instances)

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test

# Format code
npm run format

# Database operations
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data
npm run db:studio       # Open Prisma Studio
```

## Commit Message Templates

```bash
# Features
git commit -m "feat(ui): add race detail page component"
git commit -m "feat(api): implement poll aggregation endpoint"
git commit -m "feat(ml): add RealClearPolitics scraper"
git commit -m "feat(infra): configure Docker Compose services"

# Fixes
git commit -m "fix(ui): correct poll table sorting logic"
git commit -m "fix(api): handle missing pollster data gracefully"
git commit -m "fix(ml): resolve scraper timeout issues"
git commit -m "fix(infra): update Prisma schema migration"

# Documentation
git commit -m "docs(ui): add component usage examples"
git commit -m "docs(api): document authentication flow"
git commit -m "docs(ml): explain forecasting algorithm"
git commit -m "docs(infra): update deployment instructions"
```

## Pull Request Templates

### Frontend PR
```markdown
## Description
[Brief description of the UI changes]

## Screenshots
[Add screenshots of new UI]

## Checklist
- [ ] Components are responsive
- [ ] Accessibility checked
- [ ] Types updated
- [ ] Tested on mobile
```

### Backend PR
```markdown
## Description
[Brief description of API changes]

## API Changes
- New endpoints: [list]
- Modified endpoints: [list]

## Checklist
- [ ] API tests added
- [ ] Types updated
- [ ] Documentation updated
- [ ] Error handling implemented
```

### Data/ML PR
```markdown
## Description
[Brief description of data/ML changes]

## Data Sources
[List data sources used]

## Checklist
- [ ] Data validation added
- [ ] Error handling for scraper failures
- [ ] Logging implemented
- [ ] Tests added
```

### Infrastructure PR
```markdown
## Description
[Brief description of infrastructure changes]

## Impact
[Who is affected by these changes]

## Checklist
- [ ] Tested locally
- [ ] Documentation updated
- [ ] Breaking changes communicated
- [ ] Migration path provided
```
