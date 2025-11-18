# 🐛 Known Issues - Starter Code

This file tracks known issues in the starter code that need to be addressed by parallel development tracks.

## TypeScript Type Errors

### API Type Errors (Track 2: API Development)

**Status**: 🔴 Needs Fix
**Priority**: P0 (Must fix before deployment)
**Assigned Track**: Track 2 - API Development

#### Issue 1: Logger Type Incompatibility
**File**: `apps/api/src/index.ts:22`
**Error**:
```
Type 'Logger<never>' is not assignable to type 'boolean | FastifyBaseLogger | ...'
Property 'msgPrefix' is missing in type 'BaseLogger & LoggerExtras<never> & CustomLevelLogger<never>' but required in type 'FastifyBaseLogger'.
```

**Fix**: Update logger configuration to be compatible with Fastify's expected type. Options:
1. Use Fastify's built-in logger: `logger: true`
2. Properly type the pino logger with FastifyBaseLogger
3. Use a logger adapter

**Example Fix**:
```typescript
const fastify = Fastify({
  logger: true, // Use Fastify's built-in logger for now
  // Or properly configure pino:
  // logger: {
  //   level: 'info',
  //   ...
  // }
})
```

#### Issue 2: Implicit 'any' Type in Error Handlers
**Files**:
- `apps/api/src/utils/prisma.ts:35`
- `apps/api/src/utils/prisma.ts:40`

**Error**:
```
Parameter 'e' implicitly has an 'any' type
```

**Fix**: Add explicit error types to catch blocks:
```typescript
// Before:
.catch((e) => { ... })

// After:
.catch((e: Error) => { ... })
// Or for more flexibility:
.catch((e: unknown) => { ... })
```

---

## Missing Dependencies / Setup

### Database Setup (Track 6: Database)

**Status**: 🟡 Not Critical for Initial Development
**Priority**: P1 (Required for full functionality)

The project requires:
- PostgreSQL with TimescaleDB extension
- Redis server
- Prisma migrations to be run

**Setup Steps** (documented in QUICKSTART.md):
1. Start Docker services: `docker-compose up -d`
2. Run migrations: `npm run db:migrate`
3. (Optional) Seed data: `npm run db:seed`

---

## Build Warnings

### Dependency Vulnerabilities

**Status**: 🟡 Low Priority
**Found During**: `npm install`

```
11 vulnerabilities (2 low, 5 moderate, 3 high, 1 critical)
```

**Action Items**:
- Review vulnerabilities: `npm audit`
- Fix non-breaking issues: `npm audit fix`
- Document any that require manual intervention
- Assign to Track 8 (DevOps) for resolution

**Note**: Some vulnerabilities may be in dev dependencies and not affect production.

---

## Deprecated Packages

**Status**: 🟡 Low Priority
**Priority**: P2 (Technical debt)

Several deprecated packages found during installation:
- `eslint@8.57.1` - EOL, upgrade to v9
- `glob@7.1.7` and `glob@8.1.0` - Upgrade to v9
- Various other transitive dependencies

**Action**: Create a separate track or issue for dependency updates after initial development is complete.

---

## Testing Infrastructure

### Test Scripts Not Yet Implemented

**Status**: 🔴 Needs Implementation
**Priority**: P0 for Track 7 (Testing)
**Assigned Track**: Track 7 - Testing Infrastructure

The following test scripts are defined but not implemented:
- `npm test` - No tests configured yet
- `npm run test:unit` - No unit tests
- `npm run test:integration` - No integration tests
- `npm run test:e2e` - No E2E tests

**Required**: Track 7 must set up Jest, React Testing Library, and Playwright before these commands will work.

---

## Environment Configuration

### Missing Environment Variables

**Status**: 🟡 Documented
**Priority**: P0 (Required for running app)

`.env.example` exists but several values need to be filled in:
- Database connection strings
- Redis connection string
- API keys for data sources
- JWT secrets for authentication (future)

**Action**: Each developer should copy `.env.example` to `.env` and fill in their local values.

---

## Documentation Gaps

### API Documentation Incomplete

**Status**: 🟡 Expected
**Priority**: P1

Several route files exist but have placeholder implementations:
- `/api/races`
- `/api/polls`
- `/api/pollsters`
- `/api/forecasts`

**Action**: Track 2 (API Development) should implement these routes and update Swagger documentation.

---

## How to Use This File

### For Developers
- Check this file when starting a new track
- Update status when you fix an issue
- Add new issues you discover
- Mark issues as resolved and note the PR number

### When Claiming a Track
1. Review issues related to your track
2. Include fixes in your work plan
3. Update this file as you resolve issues
4. Cross-reference in your PR

### Format for New Issues
```markdown
### Issue Title
**File**: path/to/file.ts:line
**Status**: 🔴 Needs Fix / 🟡 Known / 🟢 In Progress / ✅ Fixed
**Priority**: P0/P1/P2/P3
**Assigned Track**: Track X

Description of the issue...

**Fix**: Description of how to fix...

**Fixed In**: PR #XXX (when resolved)
```

---

## Status Legend
- 🔴 **Needs Fix** - Blocking or important issue
- 🟡 **Known** - Documented but not blocking
- 🟢 **In Progress** - Being worked on
- ✅ **Fixed** - Resolved

## Priority Legend
- **P0**: Critical - must fix before deployment
- **P1**: High - should fix soon
- **P2**: Medium - nice to have
- **P3**: Low - technical debt, address later

---

**Last Updated**: 2025-11-18
**Next Review**: After each track completion
