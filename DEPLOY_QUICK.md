# ⚡ Quick Deployment Guide

Get the MVP live in ~10 minutes.

## 1️⃣ Database Setup (2 min)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `poll-production`, pick a region, generate password
3. Wait 2 minutes for provisioning
4. **Settings** → **Database** → Copy connection string (URI format)
5. Replace `[YOUR-PASSWORD]` with your actual password

## 2️⃣ Run Migrations (1 min)

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Run migrations
npm run db:migrate:deploy --workspace=@poll/database

# Optional: Seed sample data
npm run db:seed --workspace=@poll/database
```

## 3️⃣ Deploy to Vercel (5 min)

### Option A: Vercel CLI (fastest)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy web app
cd apps/web
vercel

# Follow prompts:
# - Link to existing project or create new
# - Add environment variables when prompted
```

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from GitHub
3. **Root Directory**: `apps/web`
4. **Framework Preset**: Next.js
5. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@...
   NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN.vercel.app
   NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.vercel.app
   ```
6. Click **Deploy**

## 4️⃣ Verify (1 min)

Visit your deployment URL and check:
- ✅ Homepage loads
- ✅ No console errors
- ✅ `/api/health` returns 200

## 5️⃣ Run Initial Scrape (1 min)

```bash
# Trigger scraper to populate data
curl -X POST https://YOUR_DOMAIN.vercel.app/api/cron/scrape
```

## 🎉 Done!

Your polling dashboard is live!

### Optional Next Steps

**Custom Domain:**
- Vercel → Settings → Domains → Add domain

**Analytics:**
- Add `NEXT_PUBLIC_GA_ID=G-XXXXX` to environment variables
- Redeploy

**Monitoring:**
- Add `NEXT_PUBLIC_SENTRY_DSN` to environment variables
- Redeploy

**Automated Scraping:**
- Already configured! Runs every 6 hours via Vercel Cron

---

**Having issues?** See full guide in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
