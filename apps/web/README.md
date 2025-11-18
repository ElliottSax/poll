# Poll Dashboard - Web App

Next.js 14 frontend application with React, TypeScript, and TailwindCSS.

## 🎯 Workstream 1: Frontend/UI

This is the workspace for **Instance 1** in parallel development.

## 📁 Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── providers.tsx      # React context providers
├── components/            # React components
│   ├── layout/           # Header, Footer
│   ├── features/         # Feature-specific components
│   │   └── home/        # Homepage components
│   └── ui/              # Reusable UI components
├── lib/                  # Utilities and helpers
└── public/              # Static assets
```

## 🚀 Quick Start

### 1. Install dependencies (from project root)

```bash
cd /home/user/poll
npm install
```

### 2. Set up environment variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your configuration
# Key variables for frontend:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_MAPBOX_TOKEN=your-token
```

### 3. Run development server

```bash
# From project root
npm run dev:web

# Or from this directory
npm run dev
```

### 4. Open in browser

```
http://localhost:3000
```

## 📋 Current Tasks (Week 1-2)

See `TASK_ASSIGNMENTS.md` for full task list.

**Priority tasks**:
- [ ] Set up shadcn/ui components
- [ ] Create base layout (header, footer, nav)
- [ ] Build homepage with featured races
- [ ] Create race listing page
- [ ] Implement responsive design

## 🔨 Development Workflow

### Creating a new page

```bash
# Create new route
mkdir app/races
touch app/races/page.tsx

# Add page content
# app/races/page.tsx
export default function RacesPage() {
  return <div>Races</div>
}
```

### Creating a new component

```bash
# Create component file
mkdir -p components/features/races
touch components/features/races/RaceCard.tsx
```

Example component:
```typescript
interface RaceCardProps {
  race: {
    id: string
    title: string
    // ...more fields
  }
}

export function RaceCard({ race }: RaceCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{race.title}</h3>
    </div>
  )
}
```

### Using shadcn/ui components

```bash
# Install a component (from project root)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table

# Use in your code
import { Button } from '@/components/ui/button'
```

## 🎨 Styling

### TailwindCSS

```typescript
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Dark mode (optional)

```typescript
// Use dark: prefix for dark mode styles
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## 📊 Data Fetching

### Using React Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function RaceList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['races'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3001/api/races')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading races</div>

  return (
    <div>
      {data.map(race => (
        <div key={race.id}>{race.title}</div>
      ))}
    </div>
  )
}
```

### Server Components (recommended for static data)

```typescript
// app/races/page.tsx
async function getRaces() {
  const res = await fetch('http://localhost:3001/api/races', {
    cache: 'no-store' // or revalidate: 60 for ISR
  })
  return res.json()
}

export default async function RacesPage() {
  const races = await getRaces()

  return (
    <div>
      {races.map(race => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  )
}
```

## 🧪 Testing

```bash
# Run tests (when set up)
npm test

# Run with coverage
npm run test:coverage
```

## 🔗 Integration Points

### With Backend API (Instance 2)

- Consumes REST API endpoints
- Uses shared types from `packages/types/`
- Coordinate API contract early!

**Key endpoints to consume**:
- `GET /api/races` - List all races
- `GET /api/races/:slug` - Single race
- `GET /api/races/:slug/polls` - Race polls
- `GET /api/pollsters` - Pollster list

### With Infrastructure (Instance 4)

- Deployment via Vercel (handled by Instance 4)
- Environment variables coordination
- Build optimization

## 🎯 Component Checklist

### Week 1-2: Layout & Pages
- [ ] Header component (navigation, logo)
- [ ] Footer component (links, copyright)
- [ ] Homepage hero section
- [ ] Featured races grid
- [ ] Race listing page
- [ ] Loading states & skeletons

### Week 3-4: Race Details
- [ ] Race detail layout
- [ ] Poll table component (sortable)
- [ ] Trend chart (Recharts)
- [ ] Candidate cards
- [ ] Pollster info display

### Week 5-6: Advanced Features
- [ ] Search/filter functionality
- [ ] Responsive design polish
- [ ] Error boundaries
- [ ] SEO optimization
- [ ] Performance optimization

## 🐛 Debugging

```bash
# Check for TypeScript errors
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **State**: Zustand (for global state)
- **Data Fetching**: React Query
- **Charts**: Recharts, D3.js (Phase 2)
- **Maps**: Mapbox GL (Phase 2)

## 🎯 Phase Roadmap

### Phase 1 (Current)
- ✅ Next.js setup complete
- ✅ Basic components scaffolded
- [ ] Homepage with featured races
- [ ] Race listing page
- [ ] Race detail page
- [ ] Poll table component
- [ ] Basic charts

### Phase 2 (Future)
- [ ] Interactive electoral maps
- [ ] Advanced visualizations
- [ ] What-If scenario builder
- [ ] User accounts & profiles
- [ ] Prediction game interface

---

**Instance 1 starts here! 🎨**

See `PARALLEL_DEV_GUIDE.md` for coordination with other workstreams.

## 🚀 Your First Task

1. Review existing code in `app/` and `components/`
2. Create branch: `git checkout -b feature/ui-race-listing-page`
3. Start building the race listing page!
4. Update `WORKSTREAM_STATUS.md` when you start
