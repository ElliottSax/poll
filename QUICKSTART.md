# 🚀 Quick Start Guide

Get the Polling Dashboard up and running in 5 minutes!

## Prerequisites

Make sure you have these installed:
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- [Git](https://git-scm.com/)

## Option 1: Docker (Recommended) 🐳

**Step 1: Clone and Setup**
```bash
git clone https://github.com/ElliottSax/poll.git
cd poll
cp .env.example .env
```

**Step 2: Start Everything**
```bash
docker-compose up -d
```

**Step 3: Set Up Database**
```bash
# Wait 10 seconds for PostgreSQL to start, then:
npm run db:migrate
npm run db:seed
```

**Step 4: Open the App**
```bash
open http://localhost:3000
```

That's it! 🎉

### Available Services

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **ML Service**: http://localhost:8000
- **Database GUI (Adminer)**: http://localhost:8080
- **Redis GUI**: http://localhost:8081

## Option 2: Local Development 💻

**Step 1: Clone**
```bash
git clone https://github.com/ElliottSax/poll.git
cd poll
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Start PostgreSQL and Redis**

Using Homebrew (Mac):
```bash
brew services start postgresql@16
brew services start redis
```

Using Docker (any OS):
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=poll_password --name poll-postgres timescale/timescaledb:latest-pg16
docker run -d -p 6379:6379 --name poll-redis redis:7-alpine
```

**Step 4: Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

**Step 5: Set Up Database**
```bash
npm run db:migrate
npm run db:seed
```

**Step 6: Start Development Servers**
```bash
# Terminal 1: Start all services
npm run dev

# Or start individually:
# Terminal 1: Frontend
npm run dev:web

# Terminal 2: Backend API
npm run dev:api

# Terminal 3: Python ML Service
cd apps/ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Step 7: Open the App**
```bash
open http://localhost:3000
```

## Common Commands

### Development
```bash
npm run dev              # Start all services
npm run dev:web          # Frontend only
npm run dev:api          # Backend only
```

### Database
```bash
npm run db:migrate       # Run migrations
npm run db:seed          # Seed sample data
npm run db:studio        # Open database GUI
npm run db:reset         # Reset database (careful!)
```

### Code Quality
```bash
npm run lint             # Check code
npm run format           # Format code
npm run type-check       # TypeScript check
npm test                 # Run tests
```

### Build
```bash
npm run build            # Build all apps
npm run start            # Start production build
```

## Troubleshooting

### "Port already in use"
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:3001 | xargs kill  # API
lsof -ti:8000 | xargs kill  # ML Service
```

### "Database connection failed"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart poll-postgres

# Check logs
docker logs poll-postgres
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Prisma Client errors"
```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database
npm run db:reset
```

### "Python dependencies failing"
```bash
cd apps/ml
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Next Steps

1. **Read the Documentation**
   - [Infrastructure Plan](./INFRASTRUCTURE_PLAN.md)
   - [Feature Roadmap](./ROADMAP.md)
   - [API Documentation](./docs/API.md)

2. **Explore the Codebase**
   - Check out `apps/web` for frontend
   - Check out `apps/api` for backend
   - Check out `apps/ml` for ML pipeline

3. **Make Your First Change**
   - Try editing a component in `apps/web/components`
   - See changes hot-reload instantly!

4. **Join the Community**
   - Discord: [Join here](https://discord.gg/polling)
   - Twitter: [@pollingdash](https://twitter.com/pollingdash)

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🐛 [Report a Bug](https://github.com/ElliottSax/poll/issues)
- 💬 [Discord Community](https://discord.gg/polling)
- 📧 [Email Support](mailto:support@pollingdashboard.com)

---

**Happy coding! 🚀**
