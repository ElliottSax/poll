# 🚀 Deployment Guide

Complete guide for deploying the Polling Dashboard to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [API Deployment](#api-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- [x] GitHub account
- [x] Vercel account (free tier is fine)
- [x] Supabase account (free tier is fine)
- [x] Domain name (optional but recommended)
- [x] All code committed to GitHub

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: `poll-production`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait ~2 minutes for provisioning

### 2. Get Database Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to "Connection String"
3. Copy the **URI** format (PostgreSQL connection string)
4. Replace `[YOUR-PASSWORD]` with your actual password
5. Save this - you'll need it for Vercel

Example:
```
postgresql://postgres:YOUR_PASSWORD@db.abc123xyz.supabase.co:5432/postgres
```

### 3. Run Migrations

On your local machine:

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.abc123xyz.supabase.co:5432/postgres"

# Run migrations
npm run db:migrate:deploy --workspace=@poll/database

# Seed with initial data
npm run db:seed --workspace=@poll/database
```

**Note**: Only run seed once in production!

### 4. Enable Row Level Security (Optional but Recommended)

In Supabase dashboard:
1. Go to **Authentication** → **Policies**
2. Enable RLS on tables (for future when adding auth)
3. For MVP, you can skip this since we don't have user auth yet

## Frontend Deployment (Vercel)

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository

### 2. Configure Build Settings

**Important**: Since this is a monorepo, configure carefully:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build` (default is fine)
- **Output Directory**: `.next` (default is fine)
- **Install Command**: `npm install`

### 3. Add Environment Variables

Click "Environment Variables" and add:

**Required:**
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xyz.supabase.co:5432/postgres
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**Optional:**
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

**For API functionality (if deploying API separately):**
```env
API_SECRET=generate_random_32_char_string
JWT_SECRET=generate_random_32_char_string
ALLOWED_ORIGINS=https://your-domain.com
```

### 4. Deploy

1. Click "Deploy"
2. Wait ~2-3 minutes for build
3. Vercel will provide you with a deployment URL

### 5. Add Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## API Deployment

### Option 1: Deploy API to Vercel (Recommended for MVP)

The API can run as Vercel Serverless Functions:

1. Create a new Vercel project for the API
2. **Root Directory**: `apps/api`
3. Add environment variables:
   ```env
   DATABASE_URL=your_supabase_url
   API_SECRET=random_32_chars
   JWT_SECRET=random_32_chars
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
4. Deploy

### Option 2: Use Next.js API Routes

For simplicity, you can proxy API calls through Next.js:

1. All API calls go through Next.js `/api/*` routes
2. No separate API deployment needed
3. Simpler for MVP, but less scalable

### Option 3: Separate Server (Railway, Render, Fly.io)

For dedicated API server:

**Railway Example:**
1. Connect GitHub repo
2. Select `apps/api` directory
3. Add environment variables
4. Deploy

## Environment Variables

### Complete List

#### Production Frontend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:pass@db.xyz.supabase.co:5432/postgres

# Site Config
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production

# Optional Services
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_GA_ID=G-XXXXX

# Monitoring (Optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### Production API (.env)
```env
# Node
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://postgres:pass@db.xyz.supabase.co:5432/postgres

# Security (Generate random strings)
API_SECRET=min_32_character_random_string_here
JWT_SECRET=min_32_character_random_string_here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info
```

### Generating Secrets

```bash
# Generate random secrets (Mac/Linux)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Post-Deployment

### 1. Verify Deployment

Check these URLs work:

- `https://your-domain.com` - Homepage loads
- `https://your-domain.com/races` - Races page loads
- `https://your-domain.com/sitemap.xml` - Sitemap generates
- `https://api.your-domain.com/health` - API health check (if separate)

### 2. Run Initial Poll Scrape

```bash
# Trigger scraper via API
curl -X POST https://api.your-domain.com/api/scraper/run

# Or via Next.js API route
curl -X POST https://your-domain.com/api/scraper/run
```

### 3. Set Up Cron Jobs (Optional)

For automatic poll updates, use Vercel Cron or GitHub Actions:

**Vercel Cron** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/scraper/run",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**GitHub Actions** (.github/workflows/scrape.yml):
```yaml
name: Poll Scraper
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraper
        run: |
          curl -X POST https://api.your-domain.com/api/scraper/run
```

### 4. Enable Analytics

**Google Analytics:**
1. Create GA4 property
2. Add `NEXT_PUBLIC_GA_ID` to Vercel
3. Redeploy

**Vercel Analytics:**
1. Enable in Vercel dashboard
2. Automatic - no code changes needed

## Monitoring

### 1. Vercel Monitoring

Built-in monitoring shows:
- Function execution logs
- Performance metrics
- Error rates

Access: Vercel Dashboard → Your Project → Monitoring

### 2. Supabase Monitoring

Database metrics available in:
Supabase Dashboard → Database → Monitoring

Watch for:
- Connection count
- Query performance
- Disk usage

### 3. Error Tracking (Optional)

**Sentry Setup:**
1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Install `@sentry/nextjs`
4. Configure `sentry.client.config.ts` and `sentry.server.config.ts`

## Troubleshooting

### Build Fails

**Issue**: `Cannot find module '@poll/database'`

**Fix**: Ensure `packages/database` is built:
```bash
npm run db:generate --workspace=@poll/database
```

Add to build command:
```bash
npm run db:generate --workspace=@poll/database && npm run build
```

### Database Connection Errors

**Issue**: `P1001: Can't reach database server`

**Fix**:
1. Verify `DATABASE_URL` is correct
2. Check Supabase project is running
3. Verify IP whitelist (Supabase allows all by default)

### Pages Load Slowly

**Issue**: Initial page load >3s

**Fix**:
1. Enable Vercel Edge Network
2. Optimize images with `next/image`
3. Enable caching in API routes
4. Consider enabling ISR (Incremental Static Regeneration)

### API Rate Limiting

**Issue**: Too many requests blocked

**Fix**: Adjust rate limits in environment variables:
```env
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=60000
```

## Security Checklist

Before going live:

- [ ] Strong database password
- [ ] Random API_SECRET and JWT_SECRET (32+ chars)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] No secrets in code (all in env vars)
- [ ] Supabase RLS enabled (when adding auth)
- [ ] Database backups enabled (automatic in Supabase)

## Performance Optimization

### Enable ISR (Incremental Static Regeneration)

In page files:
```typescript
export const revalidate = 3600 // Revalidate every hour
```

### Edge Functions

For frequently accessed data, use Vercel Edge Functions:
```typescript
export const runtime = 'edge'
```

### CDN Caching

Configure cache headers in `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/races',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=300, stale-while-revalidate=600',
        },
      ],
    },
  ]
}
```

## Rollback

If deployment has issues:

1. **Vercel**: Click "Rollback to this deployment" in dashboard
2. **Database**: Use Supabase point-in-time recovery
3. **Code**: Revert commit and redeploy

## Support

If you encounter issues:

1. Check [GitHub Issues](https://github.com/ElliottSax/poll/issues)
2. Review Vercel deployment logs
3. Check Supabase logs
4. Open a new issue with:
   - Error message
   - Environment (production/staging)
   - Steps to reproduce

---

**Deployment completed?** ✅ Update `CLAUDE.md` success criteria!
