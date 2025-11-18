# 🚀 Claude Code Quick Start - Poll Dashboard

## For Parallel Development Instances

### Step 1: Identify Your Workstream

Ask yourself: "What am I working on?"

- **Frontend/UI?** → You're Instance 1 🎨
- **Backend/API?** → You're Instance 2 ⚙️
- **Data/ML?** → You're Instance 3 🔬
- **Infrastructure/DevOps?** → You're Instance 4 🏗️

### Step 2: Read Your Assignment

```bash
# Open the task assignments file
cat TASK_ASSIGNMENTS.md
```

Find your instance section and see what tasks are assigned.

### Step 3: Create/Checkout Branch

```bash
# Instance 1 (Frontend)
git checkout -b feature/ui-[your-feature]

# Instance 2 (Backend)
git checkout -b feature/api-[your-feature]

# Instance 3 (Data/ML)
git checkout -b feature/ml-[your-feature]

# Instance 4 (Infrastructure)
git checkout -b feature/infra-[your-feature]
```

### Step 4: Start Development

```bash
# Install dependencies (if needed)
npm install

# Start your service
npm run dev:web    # Instance 1
npm run dev:api    # Instance 2
cd apps/ml && uvicorn main:app --reload  # Instance 3
docker-compose up  # Instance 4
```

### Step 5: Code & Commit

```bash
# Make changes
# ...

# Commit with conventional format
git add .
git commit -m "feat(ui): add race detail page"

# Push regularly
git push -u origin [your-branch]
```

## 📚 Key Documentation

- **PARALLEL_DEV_GUIDE.md** - Full parallel development workflow
- **TASK_ASSIGNMENTS.md** - Detailed task breakdown by instance
- **ROADMAP.md** - Feature roadmap and priorities
- **INFRASTRUCTURE_PLAN.md** - Architecture details

## 🆘 Quick Help

**Q: What should I work on?**
→ Check `TASK_ASSIGNMENTS.md` for your instance

**Q: Where are the API docs?**
→ See `docs/API.md` (or create it if you're Instance 2!)

**Q: How do I avoid conflicts?**
→ Follow branch naming in `PARALLEL_DEV_GUIDE.md`

**Q: Database not working?**
→ Run `docker-compose up -d` then `npm run db:migrate`

**Q: Need to sync with another instance?**
→ Coordinate via shared types in `packages/types/`

## 🎯 Today's Focus

Check your current sprint in `TASK_ASSIGNMENTS.md` and start with Week 1 tasks!

**Happy coding! 🚀**
