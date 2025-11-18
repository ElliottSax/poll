# 🚀 Track 8: DevOps & Infrastructure - Starter Guide

**Status**: 🟡 Available
**Duration**: 2-3 weeks
**Priority**: P1 (High - Essential for deployment)
**Dependencies**: None (can start immediately)

---

## 🎯 Objectives

Set up production-ready DevOps infrastructure:
- Docker development environment
- Docker Compose for local services
- GitHub Actions CI/CD workflows
- Deployment configuration
- Environment variable management
- Monitoring and logging
- Backup strategies
- Security hardening

---

## 📋 Task Breakdown

### Week 1: Docker & Local Development
- [ ] Create Dockerfile for API
- [ ] Create Dockerfile for Web
- [ ] Set up Docker Compose
  - [ ] PostgreSQL with TimescaleDB
  - [ ] Redis
  - [ ] API service
  - [ ] Web service
- [ ] Configure volume mounts for development
- [ ] Add health checks
- [ ] Test full stack with Docker
- [ ] Document Docker setup

### Week 2: CI/CD & Deployment
- [ ] Enhance GitHub Actions workflows
  - [ ] Lint and type-check
  - [ ] Run tests
  - [ ] Build Docker images
  - [ ] Deploy to staging
  - [ ] Deploy to production
- [ ] Set up container registry (GitHub Container Registry)
- [ ] Configure deployment secrets
- [ ] Set up deployment environments
- [ ] Add deployment documentation

### Week 3: Monitoring, Security & Docs
- [ ] Set up application monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation
- [ ] Add security scanning
- [ ] Configure automated backups
- [ ] Set up SSL/TLS
- [ ] Add rate limiting
- [ ] Write runbook documentation
- [ ] Create disaster recovery plan

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 8 - DevOps & Infrastructure"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-devops-[YOUR-SESSION-ID]
```

### 3. Review Existing Files

```bash
# Check existing Docker/DevOps files
ls -la docker-compose.yml Dockerfile* .dockerignore .github/workflows/
```

---

## 💡 Implementation Guide

### Dockerfile for API

**File**: `apps/api/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Install dependencies
RUN npm ci --workspace=api --include-workspace-root

# Copy source code
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY turbo.json ./

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build
RUN npm run build --workspace=api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Install production dependencies only
RUN npm ci --workspace=api --include-workspace-root --omit=dev

# Copy built app and Prisma files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/api/dist/index.js"]
```

### Dockerfile for Web

**File**: `apps/web/Dockerfile`

```dockerfile
# Dependencies stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm ci --workspace=web --include-workspace-root

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY apps/web ./apps/web
COPY turbo.json package*.json ./

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build --workspace=web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["node", "apps/web/server.js"]
```

**Update** `apps/web/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... other config
}

module.exports = nextConfig
```

### Docker Compose

**File**: `docker-compose.yml` (enhanced)

```yaml
version: '3.8'

services:
  # PostgreSQL with TimescaleDB
  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: poll-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: poll_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-poll_password}
      POSTGRES_DB: poll_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U poll_user -d poll_db']
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: poll-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5

  # API
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: poll-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: postgresql://poll_user:${POSTGRES_PASSWORD:-poll_password}@postgres:5432/poll_db
      REDIS_URL: redis://redis:6379
      PORT: 3001
    ports:
      - '3001:3001'
    volumes:
      - ./apps/api:/app/apps/api
      - /app/apps/api/node_modules
    command: npm run dev --workspace=api

  # Web
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: deps
    container_name: poll-web
    restart: unless-stopped
    depends_on:
      - api
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - '3000:3000'
    volumes:
      - ./apps/web:/app/apps/web
      - /app/apps/web/node_modules
      - /app/apps/web/.next
    command: npm run dev --workspace=web

volumes:
  postgres_data:
  redis_data:
```

**File**: `.dockerignore`

```
node_modules
npm-debug.log
.next
.env*.local
.git
.gitignore
README.md
*.md
dist
build
coverage
.turbo
.vscode
.idea
```

### Environment Variables

**File**: `.env.example` (enhanced)

```bash
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://poll_user:poll_password@localhost:5432/poll_db
POSTGRES_PASSWORD=poll_password

# Redis
REDIS_URL=redis://localhost:6379

# API
API_PORT=3001
API_HOST=0.0.0.0

# Security
JWT_SECRET=your-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# External APIs (for scrapers)
RCP_API_KEY=
FIVETHIRTYEIGHT_API_KEY=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info

# Email (for alerts)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

### GitHub Actions CI/CD

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_API: ${{ github.repository }}/api
  IMAGE_NAME_WEB: ${{ github.repository }}/web

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (API)
        id: meta-api
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_API }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/api/Dockerfile
          push: true
          tags: ${{ steps.meta-api.outputs.tags }}
          labels: ${{ steps.meta-api.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Extract metadata (Web)
        id: meta-web
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_WEB }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ${{ steps.meta-web.outputs.tags }}
          labels: ${{ steps.meta-web.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # Add your deployment commands here
          # Examples:
          # - SSH to server and pull new images
          # - Use kubectl for Kubernetes
          # - Trigger deployment webhook
          # - Use cloud provider CLI

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # Add your production deployment commands
```

### Security Scanning

**File**: `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate

  docker-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build API image
        run: docker build -t poll-api:test -f apps/api/Dockerfile .

      - name: Scan API image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: poll-api:test
          format: 'sarif'
          output: 'trivy-api-results.sarif'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-api-results.sarif'

  code-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

### Monitoring Setup

**File**: `apps/api/src/utils/monitoring.ts`

```typescript
import * as Sentry from '@sentry/node'
import { FastifyInstance } from 'fastify'

export function setupMonitoring(app: FastifyInstance) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    })

    // Add Sentry error handler
    app.setErrorHandler((error, request, reply) => {
      Sentry.captureException(error)
      app.log.error(error)
      reply.code(500).send({ error: 'Internal server error' })
    })
  }
}
```

### Backup Script

**File**: `scripts/backup-database.sh`

```bash
#!/bin/bash

# Database backup script
set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/poll_db_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Perform backup
echo "Starting database backup..."
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"

echo "Backup completed: ${BACKUP_FILE}"

# Clean up old backups
find "${BACKUP_DIR}" -name "poll_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Old backups cleaned up (retention: ${RETENTION_DAYS} days)"

# Upload to S3 (optional)
if [ -n "${AWS_S3_BUCKET}" ]; then
    aws s3 cp "${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/backups/"
    echo "Backup uploaded to S3"
fi
```

Make it executable:
```bash
chmod +x scripts/backup-database.sh
```

### Deployment Documentation

**File**: `docs/DEPLOYMENT.md`

```markdown
# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Access to production servers
- GitHub Actions secrets configured
- SSL certificates obtained

## Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Staging Deployment

Staging deploys automatically on push to `develop` branch.

## Production Deployment

Production deploys automatically on push to `main` branch.

### Manual Deployment

```bash
# SSH to production server
ssh user@production-server

# Pull latest images
docker pull ghcr.io/org/poll-api:main
docker pull ghcr.io/org/poll-web:main

# Update services
docker-compose pull
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy
```

## Environment Variables

Set these secrets in GitHub:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SENTRY_DSN`

## Health Checks

- API: `https://api.example.com/health`
- Web: `https://example.com/api/health`

## Monitoring

- Logs: Check container logs
- Metrics: View in monitoring dashboard
- Errors: Check Sentry

## Rollback

```bash
# Rollback to previous version
docker-compose pull
docker tag ghcr.io/org/poll-api:previous ghcr.io/org/poll-api:main
docker-compose up -d
```
```

---

## ✅ Definition of Done

Track 8 is complete when:

- [ ] Dockerfiles created for API and Web
- [ ] Docker Compose working for local development
- [ ] GitHub Actions workflows enhanced
- [ ] Container registry configured
- [ ] Deployment automation working
- [ ] Environment variables documented
- [ ] Monitoring and error tracking set up
- [ ] Security scanning configured
- [ ] Backup scripts created
- [ ] SSL/TLS configured
- [ ] Deployment documentation complete
- [ ] Disaster recovery plan documented
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 📚 Resources

- Docker: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/en/actions
- Sentry: https://docs.sentry.io/
- Docker Compose: https://docs.docker.com/compose/

---

**Deploy with confidence! 🚀**
