# ⚡ Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in Polling Dashboard
to ensure fast page loads, excellent Core Web Vitals, and a smooth user experience.

## Implemented Optimizations

### 1. Next.js Image Optimization

**Configuration** (`next.config.js`):
```javascript
images: {
  domains: [...],
  formats: ['image/avif', 'image/webp'],
}
```

**Benefits**:
- Automatic image optimization and resizing
- Modern image formats (AVIF, WebP) for smaller file sizes
- Lazy loading by default
- Responsive images with srcset

**Usage**:
```tsx
import Image from 'next/image'

<Image 
  src="/images/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
  priority // For above-the-fold images
/>
```

### 2. Caching Strategy

**Static Assets** (Fonts, Images):
- Cache-Control: `public, max-age=31536000, immutable`
- Cached for 1 year, browser never revalidates

**API Responses**:
- Races: `s-maxage=300, stale-while-revalidate=600` (5 min cache, 10 min stale)
- Polls: `s-maxage=180, stale-while-revalidate=360` (3 min cache, 6 min stale)

**React Query Caching** (`lib/use-api.ts`):
- Homepage: 3 minutes
- Races: 5 minutes
- Polls: 5 minutes
- Pollsters: 30 minutes
- Forecasts: 10 minutes

### 3. Code Splitting & Lazy Loading

**Dynamic Imports**:
```tsx
import dynamic from 'next/dynamic'

const TrendChart = dynamic(() => import('@/components/charts/TrendChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Don't render on server if not needed
})
```

**Route-based Splitting**:
- Next.js automatically splits code by route
- Only loads JS needed for current page

### 4. Loading Skeletons

**Implemented Components**:
- `RaceCardSkeleton` - For race cards
- `PollCardSkeleton` - For poll lists
- `ChartSkeleton` - For data visualizations

**Benefits**:
- Improves perceived performance
- Reduces Cumulative Layout Shift (CLS)
- Better user experience during loading

### 5. React Suspense Boundaries

**Usage** (`app/page.tsx`):
```tsx
<Suspense fallback={<PremiumSpinner size="lg" />}>
  <FeaturedRaces />
</Suspense>
```

**Benefits**:
- Progressive page rendering
- Shows content as it loads
- Prevents blocking entire page

### 6. Server Components by Default

**Next.js App Router**:
- All components are Server Components by default
- Reduces client-side JavaScript
- Faster initial page loads

**Client Components Only When Needed**:
```tsx
'use client' // Only for interactive components
```

### 7. Security Headers

**Implemented Headers**:
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options (nosniff)
- X-Frame-Options (SAMEORIGIN)
- X-XSS-Protection
- Referrer-Policy

### 8. Bundle Optimization

**SWC Minification**:
```javascript
swcMinify: true
```

**Benefits**:
- Faster builds than Terser
- Smaller bundle sizes
- Better performance

### 9. React Strict Mode

**Configuration**:
```javascript
reactStrictMode: true
```

**Benefits**:
- Identifies potential problems
- Ensures components are pure
- Better performance in production

### 10. Font Optimization

**Next.js Font Loader**:
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

**Benefits**:
- Automatic font subsetting
- Prevents layout shift
- Faster font loading

## Performance Metrics

### Target Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Monitoring

**Tools**:
- Vercel Analytics (built-in)
- Google PageSpeed Insights
- Lighthouse CI (in GitHub Actions)

## Additional Optimizations

### ISR (Incremental Static Regeneration)

**For static pages with dynamic data**:
```tsx
export const revalidate = 3600 // Revalidate every hour
```

**Benefits**:
- Serve static HTML for speed
- Automatically update content
- No need for full rebuilds

### Edge Runtime

**For lightweight API routes**:
```tsx
export const runtime = 'edge'
```

**Benefits**:
- Faster cold starts
- Lower latency
- Better global distribution

### Preloading Critical Resources

**Implemented**:
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://api.mapbox.com" />
```

### Compression

**Automatic via Vercel**:
- Brotli compression for modern browsers
- Gzip fallback for older browsers

## Best Practices

### Images

✅ **Do**:
- Use Next.js `<Image>` component
- Provide width and height
- Use `priority` for above-the-fold images
- Optimize source images before upload

❌ **Don't**:
- Use `<img>` tags directly
- Serve unoptimized images
- Load large images without lazy loading

### JavaScript

✅ **Do**:
- Use dynamic imports for large components
- Keep client components small
- Use Server Components when possible
- Tree-shake unused code

❌ **Don't**:
- Import entire libraries when only using small parts
- Make everything a Client Component
- Load heavy analytics synchronously

### API Calls

✅ **Do**:
- Use React Query for caching
- Implement proper stale-while-revalidate
- Batch requests when possible
- Use Suspense for loading states

❌ **Don't**:
- Make duplicate API calls
- Fetch on every render
- Skip error boundaries

## Future Optimizations

### Potential Additions

1. **Service Worker** - Offline support and faster repeat visits
2. **Prefetching** - Preload likely next pages
3. **CDN** - Serve static assets from edge locations
4. **Database Indexing** - Optimize slow queries
5. **Redis Caching** - Cache expensive computations
6. **WebP/AVIF Images** - Convert all images to modern formats

### Performance Budget

Set budgets to prevent regression:
- Max bundle size: 300 KB (gzipped)
- Max initial page load: 2 seconds
- Max LCP: 2.5 seconds
- Max CLS: 0.1

## Monitoring & Testing

### Regular Checks

```bash
# Run Lighthouse
npm run lighthouse

# Check bundle size
npm run analyze

# Run performance tests
npm run test:perf
```

### CI/CD Integration

GitHub Actions automatically:
- Runs Lighthouse on PRs
- Checks bundle size
- Fails if performance degrades

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/analytics)

---

**Last Updated**: February 25, 2026
**Maintained By**: Polling Dashboard Team
