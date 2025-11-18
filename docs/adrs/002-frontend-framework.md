# ADR 002: Frontend Framework Selection - Next.js 14

**Status**: Accepted
**Date**: 2025-11-18
**Deciders**: Technical Team
**Context**: Need to select frontend framework for polling dashboard

---

## Context and Problem Statement

The polling dashboard frontend must deliver:
- **Rich Visualizations**: Interactive maps, charts, graphs with smooth animations
- **Performance**: Sub-2 second Time to Interactive (TTI) on 3G networks
- **SEO**: Server-side rendering for organic search traffic
- **Real-time Updates**: Live poll updates during election nights
- **Developer Experience**: Fast iteration, type safety, hot module replacement
- **Mobile Responsive**: 50%+ of traffic will be mobile devices
- **Accessibility**: WCAG 2.1 AA compliance for screen readers

We need a framework that balances performance, developer productivity, and ecosystem richness.

---

## Decision Drivers

1. **Performance**: Bundle size <200KB, TTI <3s, smooth 60fps animations
2. **SEO**: Server-side rendering for search engine visibility
3. **Developer Experience**: TypeScript support, fast refresh, debugging tools
4. **Ecosystem**: Rich component libraries, chart libraries, map libraries
5. **Hiring**: Future ability to hire developers (if project grows)
6. **Learning Curve**: Reasonable ramp-up time for solo developer
7. **Community**: Active ecosystem, frequent updates, good documentation
8. **Real-time**: Support for WebSockets/SSE for election night updates

---

## Options Considered

### Option 1: Next.js 14 (React) ✅

**Pros:**
- Server-side rendering (SSR) + Static generation (SSG) built-in
- Excellent SEO with automatic meta tag handling
- App Router with React Server Components (optimal performance)
- TypeScript support out-of-the-box
- Image optimization with next/image (automatic WebP, lazy loading)
- API routes for backend-for-frontend patterns
- Incremental Static Regeneration (ISR) for poll data
- Massive ecosystem: 110,000+ React jobs, mature libraries
- All major chart libraries support React (Recharts, Victory, D3+React)
- Vercel deployment is seamless (free tier, edge functions)
- Concurrent rendering for smooth UIs with heavy data

**Cons:**
- Larger bundle size (42.2KB React + React DOM)
- More complex than simpler frameworks
- Framework overhead vs vanilla JS
- Can be overengineered for simple pages

**Bundle Size:**
- Minimal Next.js app: ~85KB gzipped
- With chart library (Recharts): ~145KB gzipped
- With map library (Mapbox): ~185KB gzipped
- **Total**: ~185KB initial bundle (within 200KB budget)

**Performance:**
- TTI: 1.8 seconds (on 3G with optimization)
- First Contentful Paint: 0.9 seconds
- Lighthouse score: 95+ (with proper optimization)

**Developer Experience:**
- Hot module replacement: <100ms refresh
- TypeScript: Full type safety with automatic inference
- Debugging: React DevTools, Next.js DevTools
- Learning curve: 2-3 weeks for proficiency

**Ecosystem Maturity:**
- Job market: 122:1 ratio vs Svelte (122K jobs vs 1K)
- Chart libraries: Recharts, Victory, Nivo, react-chartjs-2
- Map libraries: Mapbox GL JS, react-map-gl, React Leaflet
- Component libraries: shadcn/ui, Radix UI, HeadlessUI
- Animation: Framer Motion, React Spring
- State management: Zustand, Jotai, Redux Toolkit

---

### Option 2: Svelte/SvelteKit

**Pros:**
- Extremely small bundle size (1.7KB - 96% smaller than React)
- No virtual DOM (faster updates)
- Built-in animations and transitions
- Simpler syntax (less boilerplate)
- Great performance out-of-the-box
- SvelteKit provides SSR

**Cons:**
- ❌ **Ecosystem Gap**: Limited chart library support (fewer D3 wrappers)
- ❌ **Hiring Difficulty**: 122:1 job ratio disadvantage vs React
- ❌ **Map Libraries**: Fewer Mapbox/mapping integrations
- ❌ **Learning Curve**: Unfamiliar paradigm (compiler-based, not runtime)
- ❌ **Community Size**: Smaller ecosystem, fewer Stack Overflow answers
- ❌ **Future Uncertainty**: If project needs team, harder to hire Svelte devs

**Use Case Fit**: Better for simpler apps, not ideal for data-heavy dashboards with complex charts

---

### Option 3: Vue.js/Nuxt 3

**Pros:**
- Good balance of simplicity and power
- Smaller bundle than React (33KB)
- Excellent documentation
- TypeScript support
- Nuxt 3 provides SSR/SSG
- Progressive framework (start simple, scale up)

**Cons:**
- ❌ **Chart Library Gap**: Fewer options than React (no Recharts equivalent)
- ❌ **Smaller Ecosystem**: 3x fewer jobs than React
- ❌ **Map Integrations**: Less mature than React ecosystem
- ❌ **Composition API**: Different mental model than React hooks
- ❌ **Hiring**: Harder to find Vue devs than React devs

**Use Case Fit**: Great for general web apps, but React's data viz ecosystem is stronger

---

### Option 4: Solid.js/SolidStart

**Pros:**
- Extremely fast (no virtual DOM, fine-grained reactivity)
- React-like syntax (easy for React devs)
- Smaller bundle than React (7KB)
- TypeScript-first design
- Excellent performance benchmarks

**Cons:**
- ❌ **Too New**: Version 1.0 only in 2023 (immature)
- ❌ **Tiny Ecosystem**: Very few chart/map libraries
- ❌ **No Job Market**: <500 jobs globally
- ❌ **Risk**: Uncertain long-term viability
- ❌ **Community**: Small community, fewer resources

**Use Case Fit**: Too experimental for production project with 48-month timeline

---

### Option 5: Angular 17

**Pros:**
- Full-featured framework (batteries included)
- Strong TypeScript integration
- Standalone components (modern architecture)
- SSR with Angular Universal
- Enterprise backing (Google)

**Cons:**
- ❌ **Heavy Bundle**: ~150KB (before app code)
- ❌ **Complexity**: Steep learning curve (modules, dependency injection)
- ❌ **Verbose**: More boilerplate than React/Vue
- ❌ **Chart Libraries**: Fewer options than React
- ❌ **Overkill**: Too enterprise-focused for solo developer

**Use Case Fit**: Better for large enterprise apps, not agile solo projects

---

## Decision Outcome

**Chosen Option**: Next.js 14 with App Router (React 18+)

### Rationale

Next.js wins despite larger bundle size because:

1. **SEO Critical for Growth**: Organic traffic requires excellent SEO
   - Server-side rendering generates full HTML for crawlers
   - Automatic sitemap generation
   - Structured data (JSON-LD) for rich snippets
   - Meta tag management with next/seo

2. **Ecosystem Dominance**: Best chart/map library support
   - Recharts for standard charts (1M+ downloads/week)
   - D3.js with React wrappers for custom visualizations
   - Mapbox GL JS with react-map-gl
   - Framer Motion for animations (used by major sites)

3. **Future Hiring Flexibility**: If project grows to require team
   - 122,000 React jobs vs 1,000 Svelte jobs
   - Easier to find contractors for features
   - More Stack Overflow answers and tutorials

4. **Performance Acceptable with Optimization**:
   - App Router with React Server Components reduces client JS
   - Incremental Static Regeneration for poll data (5-minute revalidation)
   - Edge functions for fast global response times
   - Image optimization reduces largest contentful paint

5. **Battle-Tested at Scale**:
   - Used by Netflix, TikTok, Twitch, Hulu, Nike
   - Proven for data-heavy dashboards
   - Concurrent rendering handles complex UIs smoothly

### Implementation Strategy

**Architecture Pattern:**
```
apps/
  web/                    # Next.js 14 App (Frontend)
    app/
      (marketing)/        # Marketing pages (SSG)
        page.tsx          # Homepage
        about/page.tsx    # About page
      (dashboard)/        # Dashboard pages (SSR/ISR)
        races/
          [id]/page.tsx   # Dynamic race pages (ISR)
        polls/page.tsx    # Latest polls
        forecasts/page.tsx
      api/                # API routes (BFF pattern)
        trpc/[trpc]/route.ts
    components/
      ui/                 # shadcn/ui components
      charts/             # Recharts wrappers
      maps/               # Mapbox components
    lib/
      trpc.ts             # tRPC client
```

**Performance Optimizations:**
```typescript
// next.config.js
module.exports = {
  // React Server Components (reduce client JS)
  experimental: {
    serverActions: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },

  // Bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          recharts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'recharts',
            priority: 10,
          },
          mapbox: {
            test: /[\\/]node_modules[\\/](mapbox-gl)[\\/]/,
            name: 'mapbox',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

**Data Fetching Strategy:**
- **Static Generation (SSG)**: Marketing pages, about, methodology
- **Incremental Static Regeneration (ISR)**: Race pages (revalidate every 5 minutes)
- **Server-Side Rendering (SSR)**: Personalized dashboard, user predictions
- **Client-Side Fetching**: Real-time poll updates via tRPC subscriptions

**Code Splitting:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const ElectoralMap = dynamic(() => import('@/components/maps/ElectoralMap'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Don't render on server (Mapbox requires window)
});

const AdvancedChart = dynamic(() => import('@/components/charts/D3Chart'), {
  loading: () => <ChartSkeleton />,
});
```

**Caching Strategy:**
```typescript
// Race page with ISR
export const revalidate = 300; // Revalidate every 5 minutes

export async function generateStaticParams() {
  const races = await db.race.findMany({ where: { is_active: true } });
  return races.map((race) => ({ id: race.id }));
}

export default async function RacePage({ params }: { params: { id: string } }) {
  const race = await db.race.findUnique({
    where: { id: params.id },
    include: { polls: { take: 50, orderBy: { field_date: 'desc' } } },
  });

  return <RaceView race={race} />;
}
```

---

## Consequences

### Positive

✅ **SEO Optimized**: Server-rendered HTML for search engines
✅ **Rich Ecosystem**: Best chart/map library support in industry
✅ **Type Safety**: Full TypeScript integration with automatic inference
✅ **Future Hiring**: Easy to find React developers if team grows
✅ **Performance**: App Router + RSC reduces client-side JavaScript
✅ **Image Optimization**: Automatic WebP/AVIF conversion, lazy loading
✅ **Edge Functions**: Fast global response times via Vercel Edge
✅ **Developer Experience**: Fast Refresh, React DevTools, excellent debugging

### Negative

⚠️ **Bundle Size**: 42KB React overhead (acceptable with code splitting)
⚠️ **Complexity**: More moving parts than simpler frameworks
⚠️ **Learning Curve**: App Router patterns take time to master
⚠️ **Framework Lock-in**: Migration to another framework would be difficult

### Mitigation Strategies

1. **Bundle Size**:
   - Code split route chunks to <100KB each
   - Lazy load maps and heavy charts
   - Use React Server Components to reduce client JS
   - Tree-shake unused components

2. **Performance Budget**:
   - Monitor bundle size in CI (<200KB initial load)
   - Lighthouse CI checks (score >90)
   - Web Vitals tracking (Core Web Vitals targets)

3. **Learning Curve**:
   - Follow Next.js official docs religiously
   - Use App Router patterns consistently
   - Leverage shadcn/ui for pre-built components

4. **Framework Lock-in**:
   - Keep business logic in separate packages
   - Use tRPC for type-safe API (portable)
   - Design components to be framework-agnostic where possible

---

## Related Decisions

- **ADR 004**: State management (Zustand for client state)
- **ADR 006**: Visualization libraries (Recharts + D3.js)
- **ADR 008**: Build tooling (Turbo monorepo)
- **ADR 012**: Deployment strategy (Vercel for frontend)

---

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React vs Svelte Bundle Size Comparison](https://medium.com/@rajaraodv/react-vs-svelte-e8c8b4f0c5a3)
- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Job Market Analysis](https://www.linkedin.com/jobs/search/?keywords=react)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)

---

## Notes

The 42KB React overhead is justified by:
- **Chart Library Ecosystem**: Recharts (147KB) and D3.js require React DOM
- **Map Library Integration**: react-map-gl provides best Mapbox DX
- **Future Flexibility**: If project grows, React hiring pool is vast

**Alternative Considered**: Start with Svelte, migrate to React later
**Rejected Because**: Migration cost (rewriting all components) exceeds upfront React overhead

**Review Date**: Month 6 (reassess if bundle size impacts user metrics)
