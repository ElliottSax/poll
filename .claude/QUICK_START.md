# 🚀 Quick Start - Parallel Development

## For New Claude Code Instances

When you start a new Claude Code web session, follow these steps:

### 1. Check Your Environment ✅

The `SessionStart.sh` hook should have automatically:
- ✅ Installed dependencies (`npm install`)
- ✅ Created `.env` file from `.env.example`
- ✅ Displayed available commands

### 2. Choose Your Work Track 📋

Open `.claude/WORK_ASSIGNMENTS.md` and:
1. Find an **🟡 AVAILABLE** track
2. Update it to **🔵 IN PROGRESS**
3. Add your session ID to the branch name
4. Commit the change

```bash
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: [Track Name]"
```

### 3. Create Your Feature Branch 🌿

```bash
# Branch name MUST start with 'claude/' and end with your session ID
git checkout -b claude/poll-[feature-name]-[YOUR-SESSION-ID]
```

Examples:
- `claude/poll-api-endpoints-ABC123`
- `claude/poll-frontend-components-XYZ789`

### 4. Start Developing 💻

```bash
# Run all apps in development mode
npm run dev

# Or run specific apps
npm run dev:web    # Frontend only
npm run dev:api    # Backend only
```

### 5. Commit & Push Regularly 📤

```bash
# Stage your changes
git add .

# Commit with clear message
git commit -m "feat: add [feature description]"

# Push to your branch (use -u first time)
git push -u origin claude/poll-[feature-name]-[session-id]
```

### 6. Update Your Progress 📊

Update `.claude/WORK_ASSIGNMENTS.md` as you complete tasks:
- Check off completed items `- [x]`
- Push the updated file
- Mark track as **🟢 REVIEW** when done

---

## Useful Commands

```bash
# Build everything
npm run build

# Type check
npm run type-check

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Database operations (when ready)
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio

# Clean install
npm run clean
npm install
```

---

## File Structure

```
poll/
├── .claude/
│   ├── hooks/
│   │   └── SessionStart.sh       # Auto-runs on session start
│   ├── WORK_ASSIGNMENTS.md       # Track assignment system
│   ├── PARALLEL_DEV_GUIDE.md     # Detailed guide
│   └── QUICK_START.md            # This file
├── apps/
│   ├── api/                      # Backend API
│   └── web/                      # Frontend
├── packages/
│   ├── database/                 # Prisma schema
│   └── types/                    # Shared TypeScript types
└── docs/                         # Documentation
```

---

## Getting Help

- **Parallel Dev Guide**: `.claude/PARALLEL_DEV_GUIDE.md`
- **Work Assignments**: `.claude/WORK_ASSIGNMENTS.md`
- **Project Roadmap**: `ROADMAP.md`
- **Technical Plan**: `INFRASTRUCTURE_PLAN.md`
- **Project README**: `README.md`

---

## Troubleshooting

### "Cannot push to branch"
- Ensure branch name starts with `claude/`
- Ensure branch name ends with session ID
- Branch format: `claude/poll-[feature]-[session-id]`

### "Dependencies missing"
```bash
npm install
```

### "Type errors"
```bash
npm run type-check
```

### "Environment variables missing"
- Check `.env` file exists
- Copy from `.env.example` if needed
- Fill in actual values for your services

---

## Tips for Success

1. ✅ **Claim your track early** - Avoid conflicts
2. ✅ **Commit frequently** - Small, focused commits
3. ✅ **Update assignments** - Keep others informed
4. ✅ **Pull regularly** - Stay in sync with main
5. ✅ **Test before pushing** - Run type-check and lint
6. ✅ **Write clear commits** - Follow conventional commits format

---

**Happy coding! 🎉**
