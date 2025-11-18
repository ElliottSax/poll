# 🔧 Troubleshooting Guide

Common issues and solutions for the polling dashboard project.

---

## 🚨 Common Issues

### Git & Branching

#### Issue: Cannot push to branch (403 Forbidden)

**Symptom**:
```bash
git push
# error: failed to push some refs (403)
```

**Cause**: Branch name doesn't follow required pattern

**Solution**:
```bash
# Branch names MUST follow this pattern:
# claude/poll-[feature]-[session-id]

# Check your current branch
git branch --show-current

# If wrong format, create new branch with correct name
git checkout -b claude/poll-[feature]-[YOUR-SESSION-ID]

# Examples:
# ✅ claude/poll-api-endpoints-ABC123
# ✅ claude/poll-frontend-components-XYZ789
# ❌ feature/api-endpoints (wrong!)
```

---

### TypeScript Errors

#### Issue: Module not found errors

**Symptom**:
```
Cannot find module '@/components/...'
```

**Solution**:
```bash
# 1. Check tsconfig.json paths are configured
# 2. Restart TypeScript server in VSCode (Cmd/Ctrl + Shift + P -> "Restart TS Server")
# 3. Clear and reinstall dependencies
npm run clean
npm install
```

#### Issue: Type errors in apps/api/src/index.ts

**Symptom**:
```
Type 'Logger<never>' is not assignable to type 'FastifyBaseLogger'
```

**Solution**: See `.claude/KNOWN_ISSUES.md` for complete fix

```typescript
// In apps/api/src/index.ts
// Replace:
const fastify = Fastify({
  logger: logger,  // ❌ Error
})

// With:
const fastify = Fastify({
  logger: true,  // ✅ Fixed
  // or
  logger: {
    level: 'info',
  },
})
```

---

### Database Issues

#### Issue: Cannot connect to database

**Symptom**:
```
Error: P1001: Can't reach database server
```

**Solutions**:

**Check Docker**:
```bash
# Is Docker running?
docker ps

# Start database
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

**Check DATABASE_URL**:
```bash
# In .env file, should be:
DATABASE_URL=postgresql://poll_user:poll_password@localhost:5432/poll_db

# Not postgres (Docker internal network)
```

**Reset database**:
```bash
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
npm run db:seed
```

#### Issue: Prisma Client not generated

**Symptom**:
```
Cannot find module '@prisma/client'
```

**Solution**:
```bash
npm run db:generate
```

#### Issue: Migration errors

**Symptom**:
```
Migration failed: relation already exists
```

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Or manually fix migrations
cd packages/database
npx prisma migrate reset
npx prisma migrate deploy
```

---

### Node/NPM Issues

#### Issue: Package not found after installing

**Symptom**:
```
Cannot find module 'some-package'
```

**Solution**:
```bash
# Make sure you're in the right workspace
cd apps/api  # or apps/web
npm install some-package

# Or use workspace flag from root
npm install some-package --workspace=api
```

#### Issue: Dependency conflicts

**Symptom**:
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution**:
```bash
# Try legacy peer deps
npm install --legacy-peer-deps

# Or clean install
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Turbo cache issues

**Symptom**:
Build seems stuck or using old code

**Solution**:
```bash
# Clear Turbo cache
npx turbo run build --force

# Or delete cache directory
rm -rf .turbo
npm run build
```

---

### React/Next.js Issues

#### Issue: React hooks error

**Symptom**:
```
Error: Invalid hook call
```

**Common causes**:
1. Multiple React versions
2. Using hooks outside component
3. Conditional hooks

**Solution**:
```bash
# Check for multiple React versions
npm ls react

# If duplicates, clean install
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Next.js hydration mismatch

**Symptom**:
```
Error: Hydration failed because the initial UI does not match
```

**Common causes**:
- Using `Date.now()` or `Math.random()` in render
- Browser extensions injecting code
- Mismatched HTML structure

**Solution**:
```typescript
// ❌ Bad - different on server and client
<div>{new Date().toString()}</div>

// ✅ Good - use useEffect for client-only code
const [time, setTime] = useState<string>()

useEffect(() => {
  setTime(new Date().toString())
}, [])

return <div>{time || 'Loading...'}</div>
```

#### Issue: API calls failing with CORS

**Symptom**:
```
Access to fetch has been blocked by CORS policy
```

**Solution**:
```typescript
// In apps/api/src/index.ts
await fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.ALLOWED_ORIGINS,
  ],
  credentials: true,
})
```

---

### Docker Issues

#### Issue: Container won't start

**Symptom**:
```
Error: Container exited with code 1
```

**Solution**:
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild images
docker-compose build --no-cache

# Start with verbose output
docker-compose up
```

#### Issue: Port already in use

**Symptom**:
```
Error: port is already allocated
```

**Solution**:
```bash
# Find process using port
lsof -i :3000  # or :3001, :5432, etc.

# Kill process
kill -9 [PID]

# Or change port in docker-compose.yml
```

#### Issue: Volume permission errors

**Symptom**:
```
Error: EACCES: permission denied
```

**Solution**:
```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run with --user flag
docker-compose up --user $(id -u):$(id -g)
```

---

### Testing Issues

#### Issue: Tests failing with "Cannot find module"

**Solution**:
```bash
# Make sure Jest is configured correctly
# Check jest.config.js moduleNameMapper

# Regenerate if needed
npm run db:generate
```

#### Issue: E2E tests timing out

**Solution**:
```typescript
// Increase timeout in playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
  // ...
})
```

#### Issue: Tests pass locally but fail in CI

**Common causes**:
- Environment variables not set
- Database not initialized
- Race conditions

**Solution**:
```yaml
# In GitHub Actions, ensure services are healthy
services:
  postgres:
    # ...
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

---

### Performance Issues

#### Issue: Slow page loads

**Check**:
1. Network tab in DevTools
2. React DevTools Profiler
3. Next.js build analysis

**Solutions**:
```bash
# Analyze bundle size
npm run build --workspace=web
npx @next/bundle-analyzer

# Use dynamic imports
const Component = dynamic(() => import('./Component'))

# Optimize images
<Image src="..." width={} height={} />
```

#### Issue: Slow database queries

**Solutions**:
```bash
# Check for missing indexes
# Add indexes in Prisma schema
@@index([field1, field2])

# Use EXPLAIN ANALYZE
npx prisma studio
# Run query and check execution plan
```

---

## 🔍 Debugging Tips

### Enable Debug Logging

```bash
# API
LOG_LEVEL=debug npm run dev:api

# Database queries
DATABASE_LOG=true npm run dev:api

# Next.js
DEBUG=* npm run dev:web
```

### Use Debugger

**VSCode launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:api"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Check Application Health

```bash
# API health
curl http://localhost:3001/health

# Database connection
npm run db:studio

# Redis connection
redis-cli ping
```

---

## 📞 Getting Help

### Before Asking

1. **Check documentation**:
   - `.claude/QUICK_START.md`
   - `.claude/PARALLEL_DEV_GUIDE.md`
   - Track-specific guides in `.claude/guides/`

2. **Check known issues**:
   - `.claude/KNOWN_ISSUES.md`

3. **Search codebase**:
   ```bash
   # Find how something is used
   grep -r "pattern" apps/
   ```

4. **Check existing tests**:
   - Look at test files for examples

### Reporting Issues

When reporting an issue, include:

1. **What you were trying to do**
2. **What you expected to happen**
3. **What actually happened**
4. **Error messages** (full stack trace)
5. **Environment**:
   ```bash
   node --version
   npm --version
   docker --version
   ```
6. **Steps to reproduce**

### Emergency Contacts

- **Project Issues**: Create issue in GitHub repo
- **Track Coordinator**: Check `.claude/WORK_ASSIGNMENTS.md`

---

## 🔧 Maintenance Commands

### Clean Everything

```bash
# Stop all Docker containers
docker-compose down -v

# Clean Node modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm package-lock.json

# Clean build artifacts
rm -rf apps/*/.next apps/*/dist
rm -rf .turbo

# Fresh start
npm install
npm run db:generate
docker-compose up -d
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all (carefully!)
npm update

# Update specific package
npm update package-name --workspace=api
```

### Reset to Clean State

```bash
# Reset git changes
git reset --hard HEAD
git clean -fd

# Reset database
npm run db:reset

# Restart Docker
docker-compose restart
```

---

## ✅ Prevention Tips

### Before Committing

```bash
# Run these checks
npm run type-check
npm run lint
npm test

# Or use the helper script
./scripts/pre-push-check.sh
```

### Before Pushing

```bash
# Make sure branch name is correct
git branch --show-current
# Should start with "claude/" and end with session ID

# Pull latest changes
git pull origin main

# Run tests one more time
npm test
```

### Regular Maintenance

```bash
# Weekly: Update dependencies
npm outdated
npm update

# Weekly: Clean up Docker
docker system prune

# Daily: Pull latest changes
git fetch origin
git status
```

---

**When in doubt, check the documentation first! 📚**
