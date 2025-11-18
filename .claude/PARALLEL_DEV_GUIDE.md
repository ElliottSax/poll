# 🚀 Parallel Development Guide

## Overview

This guide helps coordinate multiple Claude Code web instances working on the poll project simultaneously. Each instance should work on independent features to avoid merge conflicts.

## Quick Start

1. **Check Work Assignments**: Review `.claude/WORK_ASSIGNMENTS.md` to see what's being worked on
2. **Claim Your Task**: Add your instance/task to the assignments file
3. **Create Feature Branch**: Work on `claude/poll-[feature-name]-[session-id]`
4. **Commit & Push**: Push to your branch when done
5. **Update Status**: Mark your task as complete in assignments

## Branch Strategy

Each Claude Code instance works on its own feature branch:

```
claude/poll-[feature-name]-[session-id]
```

Examples:
- `claude/poll-api-routes-ABC123`
- `claude/poll-frontend-components-DEF456`
- `claude/poll-scrapers-GHI789`

**Important**: Branch names must start with `claude/` and end with the session ID to push successfully.

## Independent Work Tracks

These tracks can be developed in parallel with minimal conflicts:

### Track 1: API Development
**Location**: `apps/api/src/routes/`
**Focus**: REST API endpoints
- Polls endpoints (`/api/polls`)
- Races endpoints (`/api/races`)
- Pollsters endpoints (`/api/pollsters`)
- Forecasts endpoints (`/api/forecasts`)

### Track 2: Frontend Components
**Location**: `apps/web/components/`
**Focus**: React components
- UI components (`components/ui/`)
- Feature components (`components/features/`)
- Layout components (`components/layout/`)
- Charts and visualizations

### Track 3: Data Scrapers
**Location**: `apps/api/src/scrapers/` (create if needed)
**Focus**: Data collection
- RealClearPolitics scraper
- FiveThirtyEight scraper
- The Economist scraper
- Data normalization utilities

### Track 4: Database & Models
**Location**: `packages/database/`
**Focus**: Prisma schema and migrations
- Schema refinements
- Seed data
- Migrations
- Database utilities

### Track 5: Infrastructure & DevOps
**Location**: Root level config files
**Focus**: Project configuration
- Docker setup
- CI/CD workflows
- Testing setup
- Build optimization

### Track 6: Frontend Pages
**Location**: `apps/web/app/`
**Focus**: Next.js pages
- Race detail pages
- Poll listing pages
- Pollster pages
- About/methodology pages

## Avoiding Conflicts

### High-Conflict Areas (Coordinate Before Editing)
- `package.json` (root and workspace)
- Shared types/interfaces
- Database schema (`prisma/schema.prisma`)
- Environment configuration (`.env.example`)
- CI/CD workflows

### Safe to Edit in Parallel
- New component files
- New route files
- New utility functions
- New test files
- Documentation files
- New scrapers

## Communication Protocol

### Before Starting Work
1. Check `WORK_ASSIGNMENTS.md`
2. Choose an unclaimed track
3. Update assignments with your task

### During Work
- Commit frequently with clear messages
- Push to your feature branch regularly
- Update progress in assignments file

### After Completing Work
1. Mark task as complete in assignments
2. Push final changes
3. Note any dependencies or blockers
4. Document any new environment variables or setup steps

## Example Workflow

```bash
# 1. Check current branch
git branch

# 2. Ensure you're on the correct feature branch
# (Should already be: claude/poll-parallel-setup-[session-id])

# 3. Create a new feature branch if needed for your specific task
git checkout -b claude/poll-api-endpoints-[session-id]

# 4. Make your changes
# ... code ...

# 5. Commit with clear messages
git add .
git commit -m "feat: add polls API endpoints with pagination"

# 6. Push to your branch
git push -u origin claude/poll-api-endpoints-[session-id]

# 7. Update work assignments to mark complete
```

## Merge Strategy

Since multiple branches are being developed in parallel:

1. **Feature branches merge to `main`** (or designated integration branch)
2. **Regular syncing**: Pull latest changes from main regularly
3. **Small, focused PRs**: Keep changes scoped to avoid large conflicts
4. **Integration testing**: Test together periodically

## Testing Parallel Changes

When multiple features need to work together:

1. Create a temporary integration branch
2. Merge feature branches into it
3. Test integration
4. Fix any conflicts
5. Merge to main once validated

## Project Structure Reference

```
poll/
├── apps/
│   ├── api/              # Backend API (Fastify)
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── config/   # Configuration
│   │   │   └── utils/    # Utilities
│   │   └── package.json
│   └── web/              # Frontend (Next.js)
│       ├── app/          # Pages (App Router)
│       ├── components/   # React components
│       └── package.json
├── packages/
│   └── database/         # Prisma schema
├── docs/                 # Documentation
├── .claude/              # Claude Code configuration
│   ├── hooks/            # Session hooks
│   └── WORK_ASSIGNMENTS.md
└── package.json          # Root workspace config
```

## Common Commands

```bash
# Install dependencies (happens automatically via SessionStart hook)
npm install

# Run all apps in development mode
npm run dev

# Run specific app
npm run dev:web    # Frontend only
npm run dev:api    # Backend only

# Build everything
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## Tips for Efficient Parallel Development

1. **Start with independent features**: Choose tasks that don't depend on others
2. **Communicate through files**: Use `WORK_ASSIGNMENTS.md` as central coordination
3. **Commit early, commit often**: Small commits are easier to merge
4. **Write clear commit messages**: Help others understand your changes
5. **Document as you go**: Update docs/comments for new code
6. **Test your changes**: Ensure your feature works before pushing

## Troubleshooting

### Dependency Conflicts
If multiple instances install different packages:
- Coordinate package installations through assignments file
- One instance should handle package.json updates
- Others pull changes before installing

### Git Push Failures
- Ensure branch name starts with `claude/`
- Ensure branch name ends with session ID
- Check network connection
- Retry with exponential backoff (automatic)

### Type Errors from Parallel Changes
- Pull latest changes regularly
- Run `npm run type-check` before committing
- Coordinate shared type definitions

## Questions?

Check the main project documentation:
- `README.md` - Project overview
- `ROADMAP.md` - Feature roadmap
- `INFRASTRUCTURE_PLAN.md` - Technical architecture
- `QUICKSTART.md` - Getting started guide

---

**Happy parallel coding! 🚀**
