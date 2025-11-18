# 📄 Track 5: Frontend Pages - Starter Guide

**Status**: 🟡 Available
**Duration**: 3-4 weeks
**Priority**: P0 (Critical for MVP)
**Dependencies**: Track 2 (API) & Track 3 (Components) - should be partially complete

---

## 🎯 Objectives

Build all customer-facing pages for the polling dashboard:
- Homepage with featured content
- Race listing and detail pages
- Pollster listing and detail pages
- About and methodology pages
- SEO optimization
- Data fetching with React Query
- Loading and error states

---

## 📋 Task Breakdown

### Week 1: Homepage & Race Pages
- [ ] Create homepage (`app/page.tsx`)
  - [ ] Hero section
  - [ ] Featured races
  - [ ] Recent polls
  - [ ] Trending races
  - [ ] Stats dashboard
- [ ] Create race listing page (`app/races/page.tsx`)
- [ ] Create race detail page (`app/races/[slug]/page.tsx`)
- [ ] Add data fetching with React Query
- [ ] Add loading states
- [ ] Add error handling

### Week 2: Pollster Pages
- [ ] Create pollster listing page (`app/pollsters/page.tsx`)
- [ ] Create pollster detail page (`app/pollsters/[slug]/page.tsx`)
- [ ] Add accuracy visualizations
- [ ] Add historical polls
- [ ] Add rating display
- [ ] Add filtering and sorting

### Week 3: Static Pages & SEO
- [ ] Create about page (`app/about/page.tsx`)
- [ ] Create methodology page (`app/methodology/page.tsx`)
- [ ] Add SEO metadata for all pages
- [ ] Add Open Graph tags
- [ ] Add JSON-LD structured data
- [ ] Create sitemap
- [ ] Add robots.txt

### Week 4: Polish & Performance
- [ ] Add page transitions
- [ ] Optimize images (Next.js Image)
- [ ] Add prefetching for common routes
- [ ] Implement infinite scroll for lists
- [ ] Add breadcrumbs navigation
- [ ] Add share buttons
- [ ] Test all pages
- [ ] Performance optimization

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 5 - Frontend Pages"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-frontend-pages-[YOUR-SESSION-ID]
```

### 3. Verify Dependencies

Check that Track 2 (API) and Track 3 (Components) have made progress:

```bash
# Check if API endpoints exist
ls apps/api/src/routes/

# Check if components exist
ls apps/web/components/features/
ls apps/web/components/ui/
```

If components aren't ready yet, you can build pages with placeholder components and swap them in later.

### 4. Set Up Data Fetching

```bash
cd apps/web
npm install @tanstack/react-query
```

---

## 💡 Implementation Guide

### Project Structure

```
apps/web/app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout (already exists)
├── providers.tsx               # React Query provider
├── races/
│   ├── page.tsx               # Race listing
│   └── [slug]/
│       └── page.tsx           # Race detail
├── pollsters/
│   ├── page.tsx               # Pollster listing
│   └── [slug]/
│       └── page.tsx           # Pollster detail
├── about/
│   └── page.tsx               # About page
└── methodology/
    └── page.tsx               # Methodology page
```

### React Query Setup

**File**: `apps/web/app/providers.tsx`

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Update**: `apps/web/app/layout.tsx`

```typescript
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### API Client

**File**: `apps/web/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`)

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.statusText}`)
  }

  return response.json()
}

// Race API
export async function getRaces(params?: {
  type?: string
  state?: string
  limit?: number
  offset?: number
}) {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.state) query.set('state', params.state)
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.offset) query.set('offset', params.offset.toString())

  return fetchApi<RacesResponse>(`/api/races?${query}`)
}

export async function getRace(slug: string) {
  return fetchApi<Race>(`/api/races/${slug}`)
}

// Poll API
export async function getPolls(params?: {
  raceId?: string
  limit?: number
  offset?: number
}) {
  const query = new URLSearchParams()
  if (params?.raceId) query.set('raceId', params.raceId)
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.offset) query.set('offset', params.offset.toString())

  return fetchApi<PollsResponse>(`/api/polls?${query}`)
}

// Pollster API
export async function getPollsters(params?: { limit?: number; offset?: number }) {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.offset) query.set('offset', params.offset.toString())

  return fetchApi<PollstersResponse>(`/api/pollsters?${query}`)
}

export async function getPollster(slug: string) {
  return fetchApi<Pollster>(`/api/pollsters/${slug}`)
}

// Types
export interface Race {
  id: string
  slug: string
  name: string
  raceType: string
  state: string
  electionDate: string
  status: string
}

export interface RacesResponse {
  data: Race[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Add more types as needed...
```

### Custom Hooks

**File**: `apps/web/hooks/useRaces.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getRaces, getRace, type Race, type RacesResponse } from '@/lib/api'

export function useRaces(
  params?: Parameters<typeof getRaces>[0],
  options?: UseQueryOptions<RacesResponse>
) {
  return useQuery({
    queryKey: ['races', params],
    queryFn: () => getRaces(params),
    ...options,
  })
}

export function useRace(slug: string, options?: UseQueryOptions<Race>) {
  return useQuery({
    queryKey: ['race', slug],
    queryFn: () => getRace(slug),
    ...options,
  })
}
```

### Homepage Example

**File**: `apps/web/app/page.tsx`

```typescript
import { Hero } from '@/components/features/home/Hero'
import { FeaturedRaces } from '@/components/features/home/FeaturedRaces'
import { RecentPolls } from '@/components/features/home/RecentPolls'
import { Stats } from '@/components/features/home/Stats'

export const metadata = {
  title: 'Polling Dashboard - Election Polling & Forecasts',
  description:
    'Track the latest election polls, forecasts, and polling averages for presidential, senate, and house races.',
  openGraph: {
    title: 'Polling Dashboard',
    description: 'Track the latest election polls and forecasts',
    type: 'website',
    url: 'https://pollingdashboard.com',
  },
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <FeaturedRaces />
      <RecentPolls />
    </main>
  )
}
```

### Race Listing Page

**File**: `apps/web/app/races/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRaces } from '@/hooks/useRaces'
import { RaceCard } from '@/components/features/races/RaceCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function RacesPage() {
  const [filter, setFilter] = useState<string>()
  const { data, isLoading, error } = useRaces({ type: filter, limit: 20 })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Races</h1>
        <p className="mt-2 text-gray-600">
          Track {data?.meta.total} races across the country
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter(undefined)}
          className={`rounded px-4 py-2 ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('president')}
          className={`rounded px-4 py-2 ${filter === 'president' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Presidential
        </button>
        <button
          onClick={() => setFilter('senate')}
          className={`rounded px-4 py-2 ${filter === 'senate' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Senate
        </button>
        <button
          onClick={() => setFilter('house')}
          className={`rounded px-4 py-2 ${filter === 'house' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          House
        </button>
      </div>

      {/* Race Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </div>

      {/* Load More */}
      {data?.meta.hasMore && (
        <div className="mt-8 text-center">
          <button className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
```

### Race Detail Page

**File**: `apps/web/app/races/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { getRace } from '@/lib/api'
import { RaceHeader } from '@/components/features/races/RaceHeader'
import { PollTable } from '@/components/features/polls/PollTable'
import { TrendChart } from '@/components/features/polls/TrendChart'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const race = await getRace(params.slug)

  return {
    title: `${race.name} - Polling Dashboard`,
    description: `Latest polls and forecasts for the ${race.name}`,
  }
}

export default async function RaceDetailPage({ params }: { params: { slug: string } }) {
  const race = await getRace(params.slug).catch(() => null)

  if (!race) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RaceHeader race={race} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Polling Trend</h2>
            <TrendChart data={race.trendData} />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Recent Polls</h2>
            <PollTable polls={race.polls} />
          </section>
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 text-lg font-semibold">Race Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Type</dt>
                <dd className="text-gray-900">{race.raceType}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">State</dt>
                <dd className="text-gray-900">{race.state}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Election Date</dt>
                <dd className="text-gray-900">
                  {new Date(race.electionDate).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### SEO & Metadata

**File**: `apps/web/app/layout.tsx` - Add metadata

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://pollingdashboard.com'),
  title: {
    default: 'Polling Dashboard',
    template: '%s | Polling Dashboard',
  },
  description: 'Track the latest election polls, forecasts, and polling averages',
  keywords: ['polls', 'elections', 'forecasts', 'polling averages', 'politics'],
  authors: [{ name: 'Polling Dashboard Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pollingdashboard.com',
    siteName: 'Polling Dashboard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Polling Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pollingdashboard',
    creator: '@pollingdashboard',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

**Sitemap**: `apps/web/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'
import { getRaces, getPollsters } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const races = await getRaces({ limit: 1000 })
  const pollsters = await getPollsters({ limit: 1000 })

  const raceUrls = races.data.map((race) => ({
    url: `https://pollingdashboard.com/races/${race.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const pollsterUrls = pollsters.data.map((pollster) => ({
    url: `https://pollingdashboard.com/pollsters/${pollster.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [
    {
      url: 'https://pollingdashboard.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://pollingdashboard.com/races',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://pollingdashboard.com/pollsters',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...raceUrls,
    ...pollsterUrls,
  ]
}
```

---

## 🧪 Testing Pages

### E2E Tests with Playwright

**File**: `apps/web/tests/e2e/homepage.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /polling dashboard/i })).toBeVisible()
    await expect(page.getByText(/track the latest/i)).toBeVisible()
  })

  test('should display featured races', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /featured races/i })).toBeVisible()

    // Should have at least one race card
    const raceCards = page.locator('[data-testid="race-card"]')
    await expect(raceCards).toHaveCount(3)
  })

  test('should navigate to race detail page', async ({ page }) => {
    await page.goto('/')

    // Click on first race card
    await page.locator('[data-testid="race-card"]').first().click()

    // Should navigate to race detail page
    await expect(page).toHaveURL(/\/races\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
```

---

## ✅ Definition of Done

Track 5 is complete when:

- [ ] Homepage fully implemented with all sections
- [ ] Race listing page with filtering
- [ ] Race detail page with polls and trends
- [ ] Pollster listing page with rankings
- [ ] Pollster detail page with accuracy metrics
- [ ] About and methodology pages
- [ ] SEO metadata on all pages
- [ ] Sitemap generated
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Loading states on all pages
- [ ] Error handling on all pages
- [ ] E2E tests for critical user flows
- [ ] Performance optimized (Core Web Vitals)
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 📚 Resources

- Next.js App Router: https://nextjs.org/docs/app
- React Query: https://tanstack.com/query/latest
- Next.js SEO: https://nextjs.org/learn/seo/introduction-to-seo
- Playwright: https://playwright.dev/

---

**Build amazing pages! 📄**
