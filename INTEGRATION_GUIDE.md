# Complete Integration Guide

> Step-by-step guide to running the complete polling dashboard

---

## Overview

This guide shows how to run all 4 instances together to create a fully functional polling dashboard with data collection, storage, API, and web interface.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          COMPLETE STACK                          │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Instance 3 │         │  Instance 4 │         │  Instance 2 │
│   SCRAPER   │────────▶│  DATABASE   │◀────────│     API     │
│   (Python)  │  writes │ (PostgreSQL)│  reads  │  (Fastify)  │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                        │
                                                        │ HTTP
                                                        ▼
                                                ┌─────────────┐
                                                │  Instance 1 │
                                                │   FRONTEND  │
                                                │  (Next.js)  │
                                                └─────────────┘
```

---

## Prerequisites

### Software Requirements

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **Python**: 3.11 or higher
- **PostgreSQL**: 14.0 or higher
- **Git**: For cloning the repository

### Check Your Installation

```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
python --version  # Should show 3.11.x or higher
psql --version    # Should show 14.x or higher
```

---

## Step-by-Step Setup

### 1. Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/ElliottSax/poll.git
cd poll

# Install root dependencies (if using monorepo tools)
npm install
```

### 2. Database Setup (Instance 4)

**Terminal 1: Database**

```bash
# Navigate to database package
cd packages/database

# Install dependencies
npm install

# Create PostgreSQL database
createdb poll_db

# Set up environment variables
cat > .env << EOF
DATABASE_URL="postgresql://$(whoami)@localhost:5432/poll_db"
EOF

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Verify setup (optional)
npm run db:studio
# This opens Prisma Studio at http://localhost:5555
```

**Expected Output**:
```
✅ Database connected successfully
✅ Migrations applied
✅ Seed data inserted:
   - 5 pollsters
   - 4 races
   - 5 polls
   - 1 demo user
```

---

### 3. Backend API Setup (Instance 2)

**Terminal 2: API Server**

```bash
# Navigate to API app
cd apps/api

# Install dependencies
npm install

# Set up environment variables
cat > .env << EOF
DATABASE_URL="postgresql://$(whoami)@localhost:5432/poll_db"
API_PORT=3001
API_HOST=localhost
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
LOG_LEVEL=debug
EOF

# Start the API server
npm run dev
```

**Expected Output**:
```
🚀 Polling Dashboard API Server
================================
📍 Server:  http://localhost:3001
📚 Docs:    http://localhost:3001/docs
💚 Health:  http://localhost:3001/health
🌍 Env:     development
================================
```

**Verify API is Running**:
```bash
# In a new terminal
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2024-...","uptime":...}
```

---

### 4. Frontend Setup (Instance 1)

**Terminal 3: Web Application**

```bash
# Navigate to web app
cd apps/web

# Install dependencies
npm install

# Set up environment variables
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Start the development server
npm run dev
```

**Expected Output**:
```
✓ Ready in 2.5s
✓ Local: http://localhost:3000
✓ Network: http://192.168.x.x:3000
```

**Verify Frontend**:
1. Open http://localhost:3000 in your browser
2. You should see the homepage with featured races
3. Click on a race to see details

---

### 5. Scraper Setup (Instance 3)

**Terminal 4: Data Collection**

```bash
# Navigate to scraper app
cd apps/scraper

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Mac/Linux
# Or: venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cat > .env << EOF
DATABASE_URL="postgresql://$(whoami)@localhost:5432/poll_db"
LOG_LEVEL=INFO
USER_AGENT="PollingDashboard Bot/1.0 (+https://pollingdashboard.com/bot)"
EOF

# Run scrapers
python src/main.py

# Or run individual scrapers
python src/scrapers/rcp.py
python src/scrapers/fivethirtyeight.py
```

**Expected Output**:
```
Starting all scrapers
Initialized RealClearPolitics scraper
Initialized FiveThirtyEight scraper
✅ Scraped 15 polls from RealClearPolitics
✅ Scraped 23 polls from FiveThirtyEight
✅ Scraping complete: 2 successful, 0 failed
Total polls scraped: 38
```

---

## Verification Checklist

### ✅ Database (Instance 4)

```bash
# Check database connection
npm run db:studio

# Or via psql
psql poll_db -c "SELECT COUNT(*) FROM races;"
psql poll_db -c "SELECT COUNT(*) FROM polls;"
```

Expected: At least 4 races and 5 polls

### ✅ API (Instance 2)

```bash
# Test races endpoint
curl http://localhost:3001/api/races | jq '.'

# Test polls endpoint
curl http://localhost:3001/api/polls | jq '.'

# Test pollsters endpoint
curl http://localhost:3001/api/pollsters | jq '.'

# View API documentation
open http://localhost:3001/docs
```

### ✅ Frontend (Instance 1)

1. **Homepage**: http://localhost:3000
   - Should show race cards
   - Should display poll counts
   - Should have working navigation

2. **Race Detail**: http://localhost:3000/races/2024-presidential
   - Should show race information
   - Should display poll trend chart
   - Should list recent polls

### ✅ Scraper (Instance 3)

```bash
# Run scraper and check output
python src/main.py

# Check database for new polls
psql poll_db -c "SELECT COUNT(*) FROM polls WHERE created_at > NOW() - INTERVAL '1 minute';"
```

---

## Complete Data Flow Test

### End-to-End Test

1. **Run Scraper** (Terminal 4):
   ```bash
   python src/scrapers/rcp.py
   ```

2. **Verify in Database** (Terminal 1):
   ```bash
   psql poll_db -c "SELECT * FROM polls ORDER BY created_at DESC LIMIT 5;"
   ```

3. **Check API** (New Terminal):
   ```bash
   curl http://localhost:3001/api/polls?limit=5 | jq '.polls[0]'
   ```

4. **View in Frontend** (Browser):
   - Visit http://localhost:3000
   - Click on a race
   - See the newly scraped polls appear

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# If not, start it (macOS with Homebrew)
brew services start postgresql@14

# Or on Linux
sudo systemctl start postgresql

# Verify connection string in .env files
cat packages/database/.env
cat apps/api/.env
```

### Issue: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9

# Or use different ports
# In apps/web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:3002

# In apps/api/.env:
API_PORT=3002
```

### Issue: API Not Accessible from Frontend

**Error**: `Failed to fetch`

**Solution**:
1. Check CORS settings in `apps/api/src/config/env.ts`
2. Verify `ALLOWED_ORIGINS` includes `http://localhost:3000`
3. Restart API server after changes

### Issue: Scraper Can't Connect to Database

**Error**: `Prisma Client initialization failed`

**Solution**:
```bash
# Regenerate Prisma client in scraper context
cd apps/scraper
pip install --upgrade prisma

# Or use direct connection
# Update DATABASE_URL in apps/scraper/.env
```

---

## Development Workflow

### Daily Development

**Morning Setup** (4 terminals):

```bash
# Terminal 1: Database (only if needed)
cd packages/database && npm run db:studio

# Terminal 2: API
cd apps/api && npm run dev

# Terminal 3: Frontend
cd apps/web && npm run dev

# Terminal 4: Scraper (as needed)
cd apps/scraper && source venv/bin/activate
```

### Making Changes

**Frontend Changes**:
```bash
cd apps/web
# Edit files in src/
# Hot reload automatically updates browser
```

**API Changes**:
```bash
cd apps/api
# Edit files in src/
# tsx watch automatically restarts server
```

**Database Schema Changes**:
```bash
cd packages/database
# Edit prisma/schema.prisma
npm run db:migrate -- --name your_change_name
npm run db:generate
# Restart API and scraper
```

**Scraper Changes**:
```bash
cd apps/scraper
# Edit files in src/scrapers/
python src/main.py  # Test changes
```

---

## Production Deployment

### Environment Variables

**Production .env files**:

```env
# packages/database/.env
DATABASE_URL="postgresql://user:password@prod-host:5432/poll_db?sslmode=require"

# apps/api/.env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@prod-host:5432/poll_db?sslmode=require"
API_PORT=3001
ALLOWED_ORIGINS="https://yourdomain.com"
REDIS_URL="redis://redis-host:6379"

# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Build Commands

```bash
# Database migrations
cd packages/database
npm run db:migrate:deploy

# API
cd apps/api
npm run build
npm run start

# Frontend
cd apps/web
npm run build
npm run start

# Scraper
cd apps/scraper
# Set up cron job or scheduler
```

---

## Monitoring

### Logs

**API Logs**:
```bash
# In development
tail -f apps/api/logs/app.log

# Check error logs
grep ERROR apps/api/logs/app.log
```

**Scraper Logs**:
```bash
tail -f apps/scraper/logs/scraper.log
```

### Health Checks

```bash
# API health
curl http://localhost:3001/health

# Database health
psql poll_db -c "SELECT 1;"

# Frontend health
curl http://localhost:3000
```

---

## Automated Testing

### API Tests

```bash
cd apps/api
npm run test
```

### Database Tests

```bash
cd packages/database
# Reset to clean state
npm run db:reset
# Run seed again
npm run db:seed
```

---

## Quick Reference

### All Services Running

| Service | URL | Port | Terminal |
|---------|-----|------|----------|
| Frontend | http://localhost:3000 | 3000 | Terminal 3 |
| API | http://localhost:3001 | 3001 | Terminal 2 |
| API Docs | http://localhost:3001/docs | 3001 | Terminal 2 |
| Database Studio | http://localhost:5555 | 5555 | Terminal 1 |
| PostgreSQL | localhost | 5432 | Background |

### Key Commands

```bash
# Start everything
npm run dev              # In root (if configured)

# Individual services
npm run dev:web          # Frontend
npm run dev:api          # Backend
npm run db:studio        # Database GUI
python src/main.py       # Scraper (from apps/scraper)

# Restart all
# Ctrl+C in each terminal, then re-run dev commands

# Stop all
# Ctrl+C in each terminal
```

---

## Next Steps

### Extend Functionality

1. **Add More Scrapers**: Create new scrapers in `apps/scraper/src/scrapers/`
2. **Add More Pages**: Create pages in `apps/web/src/app/`
3. **Add More API Endpoints**: Create routes in `apps/api/src/routes/`
4. **Extend Database**: Modify `packages/database/prisma/schema.prisma`

### Phase 2 Features

- Forecasting service (Instance 5)
- User authentication
- Real-time WebSocket updates
- Advanced visualizations
- Email alerts
- API key management

---

## Support

### Documentation

- Database: `packages/database/README.md`
- API: `apps/api/README.md`
- Frontend: `apps/web/package.json`
- Scraper: `apps/scraper/README.md`

### Troubleshooting

1. Check all `.env` files are configured
2. Verify PostgreSQL is running
3. Ensure ports 3000, 3001, 5432 are available
4. Check logs in each service
5. Try restarting services

---

**You now have a complete, working polling dashboard!** 🎉

All instances are integrated and working together to collect, store, serve, and display election polling data.
