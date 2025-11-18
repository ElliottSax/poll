# 📚 Track Starter Guides

Detailed guides for each parallel development track to help you get started quickly and build confidently.

---

## 🗺️ Available Guides

### Core Development Tracks

#### [🔌 Track 2: API Development](./TRACK_02_API_DEVELOPMENT.md)
**Duration**: 3-4 weeks | **Priority**: P0 (Critical)

Build the complete REST API with Fastify, Zod validation, Redis caching, and comprehensive testing.

**Key Tasks**:
- Fix existing type errors
- Implement races, polls, pollsters, and forecasts endpoints
- Add validation, error handling, and caching
- Write unit and integration tests
- Update Swagger documentation

**Start Here**: Fix logger type error in `apps/api/src/index.ts`

---

#### [🎨 Track 3: Frontend Components](./TRACK_03_FRONTEND_COMPONENTS.md)
**Duration**: 4-5 weeks | **Priority**: P0 (Critical)

Create a comprehensive React component library with Tailwind CSS, responsive design, and data visualizations.

**Key Tasks**:
- Build UI foundation components (Button, Card, Modal, etc.)
- Create layout components (Header, Footer, Navigation)
- Develop poll-specific components (RaceCard, PollTable, etc.)
- Add data visualization components (Charts, Gauges)
- Implement loading and error states

**Start Here**: Copy component template and build Button component

---

#### [📥 Track 4: Data Scrapers](./TRACK_04_DATA_SCRAPERS.md)
**Duration**: 3-4 weeks | **Priority**: P0 (Critical)

Build reliable web scrapers to collect polling data from multiple sources with automation and error handling.

**Key Tasks**:
- Create base scraper class with utilities
- Implement RealClearPolitics scraper
- Implement FiveThirtyEight data import
- Add scheduling with BullMQ
- Implement validation and duplicate detection

**Start Here**: Set up scraper directory structure and copy scraper template

---

#### [🗄️ Track 6: Database & Data Models](./TRACK_06_DATABASE.md)
**Duration**: 2-3 weeks | **Priority**: P0 (Foundation)

Design and implement the database schema, migrations, seed data, and utilities.

**Key Tasks**:
- Refine Prisma schema with proper relationships
- Add indexes for performance
- Create comprehensive seed data
- Write database utilities
- Set up connection pooling

**Start Here**: Review existing schema and set up local database with Docker

**⚠️ IMPORTANT**: This is the foundational track - start this first or early!

---

### Additional Tracks (Guides Coming Soon)

#### Track 5: Frontend Pages
Build Next.js pages that consume the API and use components.

#### Track 7: Testing Infrastructure
Set up Jest, React Testing Library, and Playwright for comprehensive testing.

#### Track 8: DevOps & Infrastructure
Configure Docker, CI/CD, deployment, and monitoring.

---

## 🚀 How to Use These Guides

### 1. Choose Your Track

Review the guides above and pick a track that:
- Matches your skills and interests
- Is **🟡 AVAILABLE** in `.claude/WORK_ASSIGNMENTS.md`
- Doesn't conflict with tracks others are working on

**Pro Tip**: Check `.claude/WORK_ASSIGNMENTS.md` first to see what's claimed!

### 2. Read the Complete Guide

Each guide includes:
- ✅ **Task Breakdown** - Week-by-week checklist
- ✅ **Getting Started** - Setup instructions
- ✅ **Implementation Guide** - Code examples and patterns
- ✅ **Testing Requirements** - How to test your work
- ✅ **Definition of Done** - When the track is complete
- ✅ **Resources** - Links to documentation

### 3. Follow the Workflow

```bash
# 1. Claim the track
# Edit .claude/WORK_ASSIGNMENTS.md
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track [N] - [Name]"
git push

# 2. Create your feature branch
git checkout -b claude/poll-[feature]-[YOUR-SESSION-ID]

# 3. Use code templates
cp .claude/templates/[template].ts [your-file].ts

# 4. Develop following the guide

# 5. Test your work
npm run type-check
npm run lint
npm test

# 6. Commit and push
git add .
git commit -m "feat: add [feature]"
git push -u origin claude/poll-[feature]-[YOUR-SESSION-ID]
```

### 4. Update Progress

As you complete tasks:
1. Check off items in the track guide
2. Update `.claude/WORK_ASSIGNMENTS.md` progress
3. Commit the updates
4. Keep working!

---

## 📋 Quick Reference

### Track Dependencies

```
Track 6 (Database)
    ↓
    ├─→ Track 2 (API) ──→ Track 5 (Pages)
    ├─→ Track 4 (Scrapers)
    │
Track 3 (Components) ──→ Track 5 (Pages)
    │
Track 7 (Testing) ─────→ (All tracks)
    │
Track 8 (DevOps) ──────→ (All tracks)
```

### Recommended Parallel Combinations

**Phase 1** (Weeks 1-2):
- Track 6: Database (foundational)
- Track 7: Testing (independent)
- Track 8: DevOps (independent)

**Phase 2** (Weeks 3-5):
- Track 2: API Development
- Track 3: Frontend Components
- Track 4: Data Scrapers

**Phase 3** (Weeks 6-7):
- Track 5: Frontend Pages (depends on 2 & 3)

### Quick Links

- **Work Assignments**: `../.claude/WORK_ASSIGNMENTS.md`
- **Parallel Dev Guide**: `../.claude/PARALLEL_DEV_GUIDE.md`
- **Quick Start**: `../.claude/QUICK_START.md`
- **Code Templates**: `../.claude/templates/`
- **Known Issues**: `../.claude/KNOWN_ISSUES.md`

---

## 🎯 Best Practices

### Before You Start

- [ ] Read the complete track guide
- [ ] Claim the track in WORK_ASSIGNMENTS.md
- [ ] Check for dependencies on other tracks
- [ ] Review known issues that might affect you
- [ ] Set up your local environment

### While Developing

- [ ] Follow the code templates
- [ ] Write tests as you go
- [ ] Commit frequently with clear messages
- [ ] Update progress in WORK_ASSIGNMENTS.md
- [ ] Run type-check and lint before pushing
- [ ] Document complex logic

### Before Marking Complete

- [ ] All tasks in guide checked off
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and cleaned
- [ ] WORK_ASSIGNMENTS.md marked ✅ COMPLETE

---

## 💡 Tips for Success

### 1. Start Small
Don't try to complete everything at once. Work through the weekly task breakdowns.

### 2. Use the Templates
Code templates in `.claude/templates/` save time and ensure consistency.

### 3. Test Early, Test Often
Don't wait until the end to test. Write tests as you build features.

### 4. Ask for Help
Check existing code, documentation, and guides. Everything you need is documented!

### 5. Stay Organized
Keep track of your progress in WORK_ASSIGNMENTS.md and commit regularly.

---

## 🤝 Contributing to Guides

Found an issue or improvement?

1. Fix it in the guide
2. Update this README if needed
3. Commit with clear message
4. Share knowledge with the team!

---

## 📊 Track Completion Status

Check `.claude/WORK_ASSIGNMENTS.md` for real-time status of all tracks.

---

**Ready to build? Pick a guide and get started! 🚀**
