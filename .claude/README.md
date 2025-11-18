# 🎯 Claude Code - Parallel Development Setup

This directory contains configuration and guides for developing the polling dashboard with multiple Claude Code web instances in parallel.

## 📁 Files in This Directory

### 🔧 Configuration
- **`hooks/SessionStart.sh`** - Automatically runs when a Claude Code session starts
  - Installs dependencies
  - Creates `.env` file
  - Displays helpful information

### 📚 Documentation
- **`QUICK_START.md`** - Quick reference for new instances (start here!)
- **`PARALLEL_DEV_GUIDE.md`** - Comprehensive parallel development guide
- **`WORK_ASSIGNMENTS.md`** - Central tracking system for who's working on what
- **`README.md`** - This file

## 🚀 Getting Started

### For Your First Instance

1. **Read the Quick Start**: Open `.claude/QUICK_START.md`
2. **Review Available Tracks**: Check `.claude/WORK_ASSIGNMENTS.md`
3. **Choose Your Work**: Pick an available track and claim it
4. **Start Coding**: Follow the branch naming convention

### For Additional Instances

1. **Check Assignments**: See what's already being worked on
2. **Claim a Different Track**: Choose something independent
3. **Coordinate**: Update the assignments file
4. **Develop in Parallel**: Push to your feature branch

## 🌿 Branch Naming Convention

All branches MUST follow this pattern:

```
claude/poll-[feature-name]-[session-id]
```

Examples:
- ✅ `claude/poll-api-routes-ABC123`
- ✅ `claude/poll-frontend-components-XYZ789`
- ❌ `feature/api-routes` (wrong - won't be able to push)
- ❌ `poll-api-ABC123` (wrong - missing 'claude/' prefix)

## 📋 8 Parallel Work Tracks

1. **API Development** - REST endpoints and middleware
2. **Frontend Components** - React components and UI
3. **Data Scrapers** - Web scrapers for poll data
4. **Frontend Pages** - Next.js pages and routes
5. **Database** - Prisma schema and migrations
6. **Testing** - Test infrastructure and suites
7. **DevOps** - Docker, CI/CD, deployment
8. **Infrastructure Setup** - ✅ Complete (this branch!)

## 🎯 Best Practices

### ✅ Do
- Commit frequently with clear messages
- Update work assignments regularly
- Test before pushing
- Keep changes focused and small
- Document as you go

### ❌ Don't
- Work on the same files as another instance
- Make large, sweeping changes
- Edit shared config files without coordination
- Push directly to `main`
- Leave work uncommitted

## 🔄 Typical Workflow

```bash
# 1. Check what's available
cat .claude/WORK_ASSIGNMENTS.md

# 2. Claim your track (edit the file)
# Update status from 🟡 AVAILABLE to 🔵 IN PROGRESS

# 3. Commit the claim
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: API Development track"
git push

# 4. Create your feature branch
git checkout -b claude/poll-api-ABC123

# 5. Do your work
# ... code, code, code ...

# 6. Commit your changes
git add .
git commit -m "feat: add races API endpoint"
git push -u origin claude/poll-api-ABC123

# 7. Update progress
# Edit WORK_ASSIGNMENTS.md, check off completed tasks
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "update: completed races endpoint"
git push
```

## 🚦 Work Track Status

- 🔵 **In Progress** - Currently being worked on
- 🟡 **Available** - Ready to be claimed
- 🟢 **Review** - Complete, awaiting review
- ✅ **Complete** - Merged and done
- 🔴 **Blocked** - Waiting on dependencies

## 📞 Need Help?

Check these resources in order:

1. **Quick Start** - `.claude/QUICK_START.md`
2. **Parallel Dev Guide** - `.claude/PARALLEL_DEV_GUIDE.md`
3. **Work Assignments** - `.claude/WORK_ASSIGNMENTS.md`
4. **Project Roadmap** - `../ROADMAP.md`
5. **Infrastructure Plan** - `../INFRASTRUCTURE_PLAN.md`

## 🎉 Success Tips

1. **Start small** - Choose one track and master it
2. **Communicate** - Use the assignments file actively
3. **Stay synchronized** - Pull from main regularly
4. **Test thoroughly** - Run type-check and lint before pushing
5. **Document changes** - Help the next developer (or yourself!)

## 📊 Project Structure

```
poll/
├── .claude/                   # ← You are here
│   ├── hooks/
│   │   └── SessionStart.sh
│   ├── PARALLEL_DEV_GUIDE.md
│   ├── QUICK_START.md
│   ├── WORK_ASSIGNMENTS.md
│   └── README.md
├── apps/
│   ├── api/                   # Backend API (Track 2)
│   └── web/                   # Frontend (Tracks 3, 5)
├── packages/
│   ├── database/              # Prisma (Track 6)
│   └── types/
├── docs/
└── [root config files]
```

---

**Built for parallel development by Claude Code 🚀**
