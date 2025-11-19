# 🔍 Code Review Findings

## Critical Issues Found

### 1. **Missing Prisma Schema Location**
**Severity**: 🔴 CRITICAL  
**File**: `packages/database/`  
**Issue**: Prisma schema file (`schema.prisma`) is not in the database package location. It's in the root as `prisma-schema.prisma`.  
**Impact**: `npx prisma generate` will fail  
**Fix**: Move or copy schema to proper location

### 2. **Missing Database Client in Context**
**Severity**: 🔴 CRITICAL  
**File**: `apps/api/src/trpc/context.ts`  
**Issue**: Imports `db` from `@poll/database` but this package may not be built yet  
**Impact**: Runtime error when starting API  
**Fix**: Ensure package build order and proper imports

### 3. **TypeScript Module Resolution**
**Severity**: 🟡 MEDIUM  
**File**: `apps/api/src/trpc/**/*.ts`  
**Issue**: Using `.js` extensions in imports for TypeScript files  
**Impact**: May cause import errors depending on tsconfig  
**Fix**: Use `.ts` extensions or remove extensions entirely

### 4. **Empty Trending Endpoint**
**Severity**: 🟡 MEDIUM  
**File**: `apps/api/src/trpc/routers/race.ts:78`  
**Issue**: Returns empty array instead of actual data  
**Impact**: TrendingRaces component will always show "No trending races"  
**Fix**: Implement actual trending logic or return mock data for testing

### 5. **Missing Error Handling Types**
**Severity**: 🟡 MEDIUM  
**File**: `apps/api/src/trpc/routers/race.ts:62`  
**Issue**: Throws generic Error instead of TRPCError  
**Impact**: Not following tRPC best practices  
**Fix**: Use `TRPCError` from `@trpc/server`

### 6. **Inconsistent Type Imports**
**Severity**: 🟢 LOW  
**File**: Various  
**Issue**: Some files use `import type`, others don't  
**Impact**: Slightly larger bundle size  
**Fix**: Use `import type` consistently for type-only imports

### 7. **Missing Test Files**
**Severity**: 🟡 MEDIUM  
**File**: Entire project  
**Issue**: No test files exist yet  
**Impact**: Can't verify code works  
**Fix**: Add unit and integration tests

### 8. **Missing AppRouter Type Export**
**Severity**: 🔴 CRITICAL  
**File**: `apps/api/src/trpc/root.ts`  
**Issue**: Exports `AppRouter` type but may have circular dependency issues  
**Impact**: Frontend tRPC client may not get types  
**Fix**: Ensure proper type export and no circular deps

### 9. **Tailwind Config Missing Dependencies**
**Severity**: 🟡 MEDIUM  
**File**: `apps/web/tailwind.config.ts`  
**Issue**: References `@tailwindcss/forms` and `@tailwindcss/typography` plugins  
**Impact**: Build will fail if packages not installed  
**Fix**: Add to package.json dependencies

### 10. **Missing tRPC API Route**
**Severity**: 🔴 CRITICAL  
**File**: `apps/web/src/app/api/trpc/[trpc]/route.ts`  
**Issue**: File doesn't exist but is referenced in documentation  
**Impact**: tRPC won't work from Next.js frontend  
**Fix**: Create the API route handler

## Additional Issues

### Package.json Issues
- Missing `@tailwindcss/forms` dependency
- Missing `@tailwindcss/typography` dependency
- Missing `vitest` for testing
- Missing `@testing-library/react` for component tests
- Missing `@types/jest` or test types

### Configuration Issues
- No `vitest.config.ts` for frontend tests
- No `jest.config.js` for API tests
- No `.prettierrc` for code formatting
- No `.editorconfig` for consistent formatting

### Type Safety Issues
- Race interface in types package may not match Prisma generated types
- Forecast `win_probability` typed as `Record<string, number>` but accessed as `.D` and `.R`
- Missing null checks on optional forecast field

### Performance Issues
- No React.memo() on expensive components
- No useCallback/useMemo in RaceList
- Missing key prop warning potential in loading skeletons

### Accessibility Issues
- Links missing aria-labels
- Loading states missing aria-live
- No skip-to-content link
- Footer links missing proper semantic structure

## Summary

**Critical**: 4 issues  
**Medium**: 5 issues  
**Low**: 1+ issues

**Recommendation**: Fix critical issues before testing, then add comprehensive test coverage.
