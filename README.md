# 🗳️ Polling Dashboard

> The next-generation election polling aggregator with advanced forecasting, stunning visualizations, and real-time analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

## 📋 Overview

A comprehensive polling dashboard that combines real-time data aggregation, advanced statistical modeling, and interactive visualizations to become the definitive source for election polling analysis.

### ✨ Key Features

- **📊 Poll Aggregation**: Multi-source polling data with intelligent weighting
- **🔮 Forecasting Engine**: Proprietary statistical models with Monte Carlo simulations
- **🗺️ Interactive Maps**: 3D electoral maps with drill-down capability
- **🎮 What-If Scenarios**: User-created scenarios with real-time impact analysis
- **🚨 Real-time Alerts**: Notifications when races shift categories
- **📈 Demographic Analysis**: Deep dive into voter demographics and trends
- **🎯 Prediction Game**: Gamified prediction platform with leaderboards
- **🔌 Developer API**: RESTful and GraphQL APIs for third-party integration
- **⚡ Election Night Dashboard**: Live results with outstanding vote estimates

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Charts**: D3.js, Recharts, Victory
- **Maps**: Mapbox GL JS
- **Animations**: Framer Motion

#### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 16 (TimescaleDB extension)
- **ORM**: Prisma
- **Cache**: Redis 7
- **Queue**: BullMQ

#### Data Processing
- **Language**: Python 3.11+
- **Framework**: FastAPI (ML model serving)
- **Libraries**: scikit-learn, pandas, NumPy, SciPy

#### Infrastructure
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + AWS (Backend)
- **CDN**: Cloudflare
- **Monitoring**: Sentry, Datadog

## 📁 Project Structure

```
poll/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and helpers
│   │   └── public/            # Static assets
│   │
│   ├── api/                    # Backend API (Fastify)
│   │   ├── src/
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic
│   │   │   ├── models/        # Data models
│   │   │   └── utils/         # Helpers
│   │   └── tests/
│   │
│   └── ml/                     # Python ML service
│       ├── models/            # Statistical models
│       ├── scrapers/          # Data scrapers
│       └── api/               # FastAPI endpoints
│
├── packages/
│   ├── database/              # Prisma schema & migrations
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Shared UI components
│   └── utils/                 # Shared utilities
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── FORECASTING.md
│   └── DEPLOYMENT.md
│
├── infrastructure/             # IaC and DevOps
│   ├── docker/
│   ├── terraform/
│   └── k8s/
│
├── scripts/                    # Build and utility scripts
│
├── .github/                    # GitHub Actions workflows
│
├── INFRASTRUCTURE_PLAN.md      # Comprehensive plan (this doc)
├── schema.sql                  # Raw SQL schema
├── prisma-schema.prisma        # Prisma ORM schema
├── package.json
├── turbo.json                  # Turborepo config
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 16
- Redis 7
- Python 3.11+ (for ML pipeline)
- Docker & Docker Compose (optional, recommended)

### Installation

#### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/poll.git
cd poll

# Start all services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Access the application
open http://localhost:3000
```

#### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis
# (using your preferred method)

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev

# In another terminal, start the ML service
cd apps/ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/poll_db"

# Redis
REDIS_URL="redis://localhost:6379"

# API
API_PORT=3001
API_SECRET="your-secret-key-here"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (for payments)
STRIPE_SECRET_KEY="your-stripe-secret"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="your-stripe-public"

# Python ML Service
ML_SERVICE_URL="http://localhost:8000"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@pollingdashboard.com"

# Sentry (Error Tracking)
SENTRY_DSN="your-sentry-dsn"

# Analytics
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
```

## 📊 Database Setup

### Using Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed the database
npm run db:seed
```

### Using Raw SQL

```bash
# Create database
createdb poll_db

# Run schema
psql poll_db < schema.sql

# Install TimescaleDB extension
psql poll_db -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build:web
npm run build:api

# Start production server
npm run start
```

## 🔧 Development Commands

```bash
# Start development servers (all apps)
npm run dev

# Start specific app
npm run dev:web      # Frontend only
npm run dev:api      # Backend only
npm run dev:ml       # ML service only

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format

# Database commands
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset database
npm run db:studio    # Open Prisma Studio
```

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Forecasting Methodology](./docs/FORECASTING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Infrastructure Plan](./INFRASTRUCTURE_PLAN.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add scenario sharing feature
fix: correct poll weight calculation
docs: update API documentation
style: format code with prettier
refactor: simplify forecast calculation
test: add tests for poll aggregation
chore: update dependencies
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by FiveThirtyEight, The Economist, and RealClearPolitics
- Polling data sources: [List your data sources]
- Built with amazing open-source tools

## 📞 Contact

- **Website**: https://pollingdashboard.com
- **Twitter**: @pollingdash
- **Email**: contact@pollingdashboard.com
- **Discord**: [Join our community](https://discord.gg/polling)

## 🗺️ Roadmap

### Phase 1: MVP (Months 1-3) ✅
- [x] Database schema design
- [x] Basic poll scraping
- [x] Simple poll aggregation
- [x] Race pages with poll tables
- [x] Basic charts
- [ ] Responsive design
- [ ] Initial deployment

### Phase 2: Growth (Months 4-6)
- [ ] Advanced forecasting model
- [ ] "What-If" scenario builder
- [ ] Pollster rankings
- [ ] Email alerts
- [ ] User accounts
- [ ] Embeddable widgets
- [ ] Advanced visualizations

### Phase 3: Monetization (Months 7-9)
- [ ] API v1 public launch
- [ ] API documentation site
- [ ] Paid API tiers
- [ ] Premium user features
- [ ] Stripe integration

### Phase 4: Scale (Months 10-12)
- [ ] Full race coverage (500+)
- [ ] Demographic deep dive tool
- [ ] Early vote tracker
- [ ] Prediction game
- [ ] Election night dashboard
- [ ] Mobile app

## 📈 Current Status

**Status**: Planning & Architecture Phase
**Version**: 0.1.0-alpha
**Last Updated**: 2024

---

**Built with ❤️ for democracy and data transparency**
