# Multi-Instance Session Planning

> Plan and coordinate work across multiple Claude Code instances

---

## Session Overview

**Date**: [Fill in]
**Sprint Goal**: [e.g., "Set up MVP foundation"]
**Active Instances**: [e.g., "1, 2, 4"]

---

## Instance Work Assignments

### Instance 1: Frontend
**Branch**: `claude/frontend-<feature>-<session-id>`
**Today's Goal**: [e.g., "Build homepage and race listing"]

**Tasks**:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Dependencies**:
- Waiting on: [e.g., "Instance 2: GET /api/races endpoint"]
- Blocking: [None or list]

**Estimated Completion**: [e.g., "End of session"]

---

### Instance 2: Backend
**Branch**: `claude/backend-<feature>-<session-id>`
**Today's Goal**: [e.g., "Implement core API endpoints"]

**Tasks**:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Dependencies**:
- Waiting on: [e.g., "Instance 4: Database schema complete"]
- Blocking: [e.g., "Instance 1: API contracts needed"]

**Estimated Completion**: [e.g., "End of session"]

---

### Instance 3: Scraper
**Branch**: `claude/scraper-<feature>-<session-id>`
**Today's Goal**: [e.g., "Build RCP and 538 scrapers"]

**Tasks**:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Dependencies**:
- Waiting on: [e.g., "Instance 4: polls table ready"]
- Blocking: [None or list]

**Estimated Completion**: [e.g., "End of session"]

---

### Instance 4: Database
**Branch**: `claude/database-<feature>-<session-id>`
**Today's Goal**: [e.g., "Complete schema and migrations"]

**Tasks**:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Dependencies**:
- Waiting on: [None - foundation layer]
- Blocking: [e.g., "All instances need schema"]

**Estimated Completion**: [e.g., "First half of session"]

---

### Instance 5: Forecasting
**Branch**: `claude/forecasting-<feature>-<session-id>`
**Today's Goal**: [e.g., "Phase 2 - Not active yet"]

**Tasks**:
- [ ] N/A for MVP

**Dependencies**:
- Waiting on: [MVP completion]
- Blocking: [None]

**Estimated Completion**: [Phase 2]

---

## Shared Package Updates

### packages/types
**Changes Needed**: [e.g., "Add Race and Poll interfaces"]
**Owner**: [Instance that will update]
**Status**: [Not started / In progress / Complete]

### packages/database
**Changes Needed**: [e.g., "Initial schema setup"]
**Owner**: [Instance 4]
**Status**: [Not started / In progress / Complete]

### packages/ui
**Changes Needed**: [e.g., "Set up shadcn/ui base components"]
**Owner**: [Instance 1]
**Status**: [Not started / In progress / Complete]

---

## Merge Order Plan

**Priority Queue** (top to bottom):

1. [ ] Instance 4: Database schema - **MUST GO FIRST**
2. [ ] Instance X: Shared types update
3. [ ] Instance 2: API endpoints
4. [ ] Instance 1: Frontend pages
5. [ ] Instance 3: Scrapers

**Reasoning**: Foundation layers must be merged before dependent layers.

---

## Risk Assessment

### Potential Blockers
1. **Risk**: [e.g., "Database schema not finalized"]
   - **Mitigation**: [e.g., "Instance 4 prioritizes schema completion"]
   - **Status**: [Active / Resolved]

2. **Risk**: [e.g., "API contract mismatch"]
   - **Mitigation**: [e.g., "Define types in packages/types first"]
   - **Status**: [Active / Resolved]

---

## Daily Standup Notes

### Morning Sync
**What was completed yesterday**:
- Instance 1: [achievements]
- Instance 2: [achievements]
- Instance 3: [achievements]
- Instance 4: [achievements]

**What's planned for today**:
- Instance 1: [plans]
- Instance 2: [plans]
- Instance 3: [plans]
- Instance 4: [plans]

**Blockers or dependencies**:
- [List any issues]

### End of Day
**What was completed**:
- Instance 1: [achievements]
- Instance 2: [achievements]
- Instance 3: [achievements]
- Instance 4: [achievements]

**What's carrying over**:
- [Incomplete tasks]

**New issues discovered**:
- [Any problems found]

---

## Communication Log

### Cross-Instance Messages

**[Timestamp] Instance X → Instance Y**:
> Message content

**[Timestamp] Instance X → Instance Y**:
> Message content

---

## Session Progress Tracker

### Overall MVP Progress

**Database Setup**: [░░░░░░░░░░] 0%
**API Development**: [░░░░░░░░░░] 0%
**Frontend Development**: [░░░░░░░░░░] 0%
**Scraper Development**: [░░░░░░░░░░] 0%
**Integration**: [░░░░░░░░░░] 0%

**Overall**: [░░░░░░░░░░] 0%

---

## Key Milestones

- [ ] Database schema complete and migrated
- [ ] All instances can connect to database
- [ ] GET /api/races endpoint working
- [ ] Homepage renders race data
- [ ] First scraper populates database
- [ ] End-to-end data flow working
- [ ] All tests passing

---

## Template: Daily Session Plan

### Quick Daily Template

Copy this for each new parallel development session:

```markdown
## Session: YYYY-MM-DD

### Instance 1 (Frontend)
- Goal: [1-2 sentence goal]
- Tasks: [3-5 specific tasks]
- Status: [Not started / In progress / Complete]

### Instance 2 (Backend)
- Goal: [1-2 sentence goal]
- Tasks: [3-5 specific tasks]
- Status: [Not started / In progress / Complete]

### Instance 3 (Scraper)
- Goal: [1-2 sentence goal]
- Tasks: [3-5 specific tasks]
- Status: [Not started / In progress / Complete]

### Instance 4 (Database)
- Goal: [1-2 sentence goal]
- Tasks: [3-5 specific tasks]
- Status: [Not started / In progress / Complete]

### Coordination
- Merge order: [List in order]
- Blockers: [None or list]
- Notes: [Any important info]
```

---

## Example: Week 1 Plan

### Monday: Foundation Setup

**Instance 4 (Database)** - PRIORITY
- Create complete Prisma schema
- Set up initial migrations
- Test schema locally
- **Must complete before others can proceed**

**Instance 2 (Backend)**
- Set up Fastify project structure
- Configure middleware
- Create health check endpoint
- Prepare for database integration

**Instance 1 (Frontend)**
- Set up Next.js project
- Install and configure shadcn/ui
- Create basic layout components
- Use mock data for now

**Instance 3 (Scraper)**
- Set up Python environment
- Install dependencies
- Research RCP scraping approach
- Write pseudo-code

**Merge Order**: 4 → 2 → 1 → 3

---

### Tuesday: Core Features

**Instance 4 (Database)**
- Create seed data
- Document schema
- Help others integrate

**Instance 2 (Backend)**
- Implement GET /api/races
- Implement GET /api/polls
- Add Zod validation
- Test endpoints

**Instance 1 (Frontend)**
- Build homepage
- Create race card component
- Set up React Query
- Connect to API

**Instance 3 (Scraper)**
- Build RCP scraper
- Add data validation
- Test scraper output
- Insert into database

**Merge Order**: 2 → 1 → 3

---

### Wednesday: Polish & Integration

**All Instances**
- Test end-to-end flow
- Fix integration issues
- Write tests
- Update documentation

**Merge Order**: Bug fixes → Documentation

---

## Success Metrics

Track daily:
- [ ] All instances pushed code today
- [ ] No blocking merge conflicts
- [ ] At least one PR merged
- [ ] All builds are green
- [ ] Documentation updated

Track weekly:
- [ ] All planned features completed
- [ ] Integration working end-to-end
- [ ] No major technical debt
- [ ] All instances in sync with main

---

## Tips for Effective Parallel Development

1. **Start with Instance 4 (Database)** - Foundation first
2. **Define API contracts early** - Avoid rework
3. **Use mocks liberally** - Don't wait for dependencies
4. **Commit small and often** - Easier to review
5. **Test locally before pushing** - Catch issues early
6. **Merge frequently** - Avoid divergence
7. **Communicate proactively** - Overcommunicate is better
8. **Document as you go** - Don't leave it for later

---

## Troubleshooting Multi-Instance Issues

### Issue: Instances are blocked waiting for each other
**Solution**: Use mock data, feature flags, or temporary implementations

### Issue: Merge conflicts in shared files
**Solution**: Better coordination on shared packages, more frequent small merges

### Issue: Database schema keeps changing
**Solution**: Finalize schema first in Instance 4, then lock it

### Issue: API contracts don't match frontend expectations
**Solution**: Define types in `packages/types` first, both reference it

### Issue: Work is uneven across instances
**Solution**: Reassign tasks, help each other, pair on complex features

---

## Next Steps

After completing MVP with parallel development:

1. **Retrospective**: What worked? What didn't?
2. **Optimize**: Refine workspace boundaries if needed
3. **Scale**: Add more instances for new features
4. **Automate**: Add more CI/CD for coordination
5. **Iterate**: Apply learnings to next sprint

---

**Use this template to plan each parallel development session!** 📋
