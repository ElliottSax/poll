# 🗳️ Polling Dashboard (MVP)

> A clean, fast, beautiful RealClearPolitics-style polling aggregator focused on core features.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

## 📋 Overview

A focused MVP polling dashboard that aggregates election polling data with clean visualizations and real-time updates. Built to ship fast and iterate based on real user feedback.

### ✨ Current Features

- **📊 Poll Aggregation**: Multi-source polling data with weighted averages
- **🗺️ Interactive Charts**: Trend charts with Recharts and D3
- **🏛️ Race Coverage**: Presidential, Senate, House, Governor races
- **📈 Pollster Ratings**: Quality scores and methodology transparency
- **🔮 Simple Forecasts**: Win probabilities and polling averages
- **⚡ Fast Performance**: Optimized for sub-2s page loads
- **🎨 Beautiful UI**: Premium design with dark/light themes

### 🚫 What's NOT in MVP

This is intentionally simple - no feature creep:
- ❌ User accounts / authentication
- ❌ Real-time WebSocket updates
- ❌ Email notifications
- ❌ What-if scenarios
- ❌ Prediction games
- ❌ Background job queues
- ❌ Admin panels

**Ship the MVP first. Add features based on real usage data.**

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- Recharts + D3 + Mapbox

**Backend:**
- Fastify API
- Prisma ORM
- PostgreSQL (Supabase for hosting)
- Cheerio (web scraping)

**Infrastructure:**
- Vercel (frontend)
- Supabase (database)
- Simple and cost-effective

**Not Using (Yet):**
- ~~Redis~~ (stubbed out - no caching for MVP)
- ~~Python ML service~~ (future feature)
- ~~BullMQ~~ (no background jobs yet)
- ~~TimescaleDB~~ (standard PostgreSQL is fine)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase recommended - free tier is perfect)

### Installation

```bash
# Clone the repository
git clone https://github.com/ElliottSax/poll.git
cd poll/repo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL from Supabase

# Run database migrations
npm run db:migrate:dev --workspace=@poll/database

# Seed with 2024 election data
npm run db:seed --workspace=@poll/database

# Start development servers
npm run dev
```

The app will be available at:
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs

## 📦 Project Structure

```
poll/repo/
├── apps/
│   ├── api/              # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── scrapers/ # Poll data scrapers
│   │   │   └── utils/    # Helpers
│   │   └── package.json
│   │
│   └── web/              # Next.js frontend
│       ├── app/          # App router pages
│       ├── components/   # React components
│       ├── lib/          # Utilities
│       └── package.json
│
├── packages/
│   ├── database/         # Prisma schema & migrations
│   └── types/            # Shared TypeScript types
│
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── package.json          # Workspace root
├── turbo.json           # Turborepo config
└── README.md            # This file
```

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project `poll-mvp`
3. Get DATABASE_URL from Settings → Database → Connection String
4. Add to `.env` and `packages/database/.env`
5. Run migrations: `npm run db:migrate:dev --workspace=@poll/database`
6. Seed data: `npm run db:seed --workspace=@poll/database`

### Option 2: Local PostgreSQL

```bash
# Using Docker
docker run --name poll-postgres \
  -e POSTGRES_PASSWORD=poll \
  -e POSTGRES_USER=poll \
  -e POSTGRES_DB=poll \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://poll:poll@localhost:5432/poll"

# Run migrations
npm run db:migrate:dev --workspace=@poll/database
```

## 🔧 Development Commands

```bash
# Start all services
npm run dev

# Start specific services
npm run dev:web      # Frontend only (port 3000)
npm run dev:api      # Backend only (port 3001)

# Build for production
npm run build
npm run build:web
npm run build:api

# Type checking
npm run type-check

# Database commands
npm run db:migrate:dev    # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/races` | List all races |
| `GET /api/races/:slug` | Race details |
| `GET /api/races/featured` | Featured races (homepage) |
| `GET /api/races/trending` | Trending races |
| `GET /api/polls` | List polls |
| `GET /api/pollsters` | List pollsters |
| `GET /api/forecasts/presidential` | Presidential forecast |
| `POST /api/scraper/run` | Trigger poll scraper |

Full API documentation: http://localhost:3001/docs (when running)

## 🚢 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

1. **Frontend (Vercel)**:
   - Connect GitHub repo to Vercel
   - Set root directory to `apps/web`
   - Add environment variables
   - Deploy

2. **Database (Supabase)**:
   - Already set up in development
   - Update production DATABASE_URL in Vercel

3. **Backend (Optional)**:
   - Deploy API to Vercel Serverless
   - Or use existing API routes in Next.js

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Database Setup](./DATABASE_SETUP.md)

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Database schema
- [x] API endpoints
- [x] Frontend pages
- [x] Poll scraping
- [x] Basic charts
- [x] Responsive design
- [ ] Initial deployment

### Phase 2: Growth
- [ ] More data sources (FiveThirtyEight, etc.)
- [ ] Advanced forecasting model
- [ ] Email alerts
- [ ] Embeddable widgets
- [ ] API v1 public launch

### Phase 3: Scale
- [ ] User accounts (if needed)
- [ ] Premium features (if monetization makes sense)
- [ ] Mobile app (if users request it)

**Philosophy**: Build what users actually want, not what we think they might want.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by RealClearPolitics and FiveThirtyEight
- Built with amazing open-source tools

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/ElliottSax/poll/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ElliottSax/poll/discussions)

---

**Built with ❤️ for better election data transparency**

Current Status: **MVP Development** | Version: 0.1.0 | Last Updated: February 2026
