# 🎨 Track 3: Frontend Components - Starter Guide

**Status**: 🟡 Available
**Duration**: 4-5 weeks
**Priority**: P0 (Critical for MVP)
**Dependencies**: None (can start immediately!)

---

## 🎯 Objectives

Build a comprehensive React component library with:
- Reusable, well-typed components
- Responsive design (mobile + desktop)
- Accessible UI (WCAG 2.1 AA)
- Beautiful visualizations
- Loading and error states
- Storybook documentation (optional)

---

## 📋 Task Breakdown

### Week 1: UI Foundation Components
- [ ] Button component with variants
- [ ] Card component
- [ ] Badge component
- [ ] Loading spinner component
- [ ] Error boundary component
- [ ] Toast/notification component
- [ ] Modal/dialog component
- [ ] Write component tests
- [ ] Add Tailwind styling

### Week 2: Layout Components
- [ ] Header/navigation component
- [ ] Footer component
- [ ] Sidebar component
- [ ] Container/grid layout
- [ ] Section dividers
- [ ] Responsive breakpoints
- [ ] Mobile menu
- [ ] Write tests

### Week 3: Poll-Specific Components
- [ ] Race card component
- [ ] Poll table component
- [ ] Pollster badge/rating component
- [ ] Candidate comparison component
- [ ] Poll methodology tooltip
- [ ] Sample size indicator
- [ ] Date formatter
- [ ] Write tests

### Week 4: Data Visualization Components
- [ ] Trend line chart (Recharts)
- [ ] Bar chart for comparisons
- [ ] Pie/donut chart for demographics
- [ ] Progress bars
- [ ] Win probability gauge
- [ ] Margin of error bands
- [ ] Interactive tooltips
- [ ] Write tests

### Week 5: Polish & Advanced Features
- [ ] Skeleton loading states
- [ ] Empty states
- [ ] Error states
- [ ] Animation transitions
- [ ] Dark mode support (optional)
- [ ] Print styles
- [ ] Component documentation
- [ ] Final testing and cleanup

---

## 🚀 Getting Started

### 1. Claim the Track

```bash
# Update .claude/WORK_ASSIGNMENTS.md
# Change Track 3 status to 🔵 IN PROGRESS

git add .claude/WORK_ASSIGNMENTS.md
git commit -m "claim: Track 3 - Frontend Components"
git push
```

### 2. Create Your Branch

```bash
git checkout -b claude/poll-frontend-components-[YOUR-SESSION-ID]
```

### 3. Review Existing Components

Check what's already there:

```bash
ls apps/web/components/
```

Existing structure:
```
apps/web/components/
├── features/         # Feature-specific components
│   └── home/        # Homepage components
├── layout/          # Layout components
│   ├── Header.tsx
│   └── Footer.tsx
└── ui/              # Reusable UI components
    └── LoadingSpinner.tsx
```

### 4. Start with the Template

```bash
# Copy the component template
cp .claude/templates/react-component-template.tsx apps/web/components/ui/Button.tsx

# Customize for Button component
```

---

## 💡 Implementation Guide

### Component Structure

Follow this organization:

```
components/
├── ui/                    # Generic, reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   └── ...
├── layout/               # Layout-specific components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Container.tsx
└── features/            # Feature/domain-specific components
    ├── polls/
    │   ├── PollCard.tsx
    │   ├── PollTable.tsx
    │   └── PollTrend.tsx
    ├── races/
    │   ├── RaceCard.tsx
    │   ├── RaceList.tsx
    │   └── RaceMap.tsx
    └── pollsters/
        ├── PollsterRating.tsx
        └── PollsterCard.tsx
```

### Example: Button Component

**File**: `apps/web/components/ui/Button.tsx`

```typescript
'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

**Usage**:
```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="outline" loading>
  Loading...
</Button>
```

### Example: Poll Card Component

**File**: `apps/web/components/features/polls/PollCard.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPercent } from '@/lib/utils'

interface Candidate {
  name: string
  party: 'D' | 'R' | 'I' | 'Other'
  percentage: number
}

interface PollCardProps {
  pollster: string
  date: Date
  sampleSize: number
  marginOfError?: number
  candidates: Candidate[]
  methodology?: string
  population?: string
  race?: string
}

export function PollCard({
  pollster,
  date,
  sampleSize,
  marginOfError,
  candidates,
  methodology,
  population,
  race,
}: PollCardProps) {
  // Sort candidates by percentage
  const sortedCandidates = [...candidates].sort((a, b) => b.percentage - a.percentage)
  const leader = sortedCandidates[0]

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{pollster}</h3>
          <p className="text-sm text-gray-500">{formatDate(date)}</p>
        </div>
        <Badge variant="secondary">
          {population || 'RV'}
        </Badge>
      </div>

      {/* Candidates */}
      <div className="space-y-2 mb-3">
        {sortedCandidates.map((candidate) => (
          <div key={candidate.name} className="flex items-center gap-2">
            <div
              className={`w-1 h-8 rounded ${getPartyColor(candidate.party)}`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{candidate.name}</span>
                <span className="font-bold text-lg">
                  {formatPercent(candidate.percentage)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${getPartyColor(candidate.party)}`}
                  style={{ width: `${candidate.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t">
        <span>n={sampleSize.toLocaleString()}</span>
        {marginOfError && <span>MoE ±{marginOfError}%</span>}
        {methodology && <span>{methodology}</span>}
      </div>
    </Card>
  )
}

function getPartyColor(party: string): string {
  switch (party) {
    case 'D':
      return 'bg-blue-600'
    case 'R':
      return 'bg-red-600'
    case 'I':
      return 'bg-purple-600'
    default:
      return 'bg-gray-600'
  }
}
```

### Example: Trend Chart Component

**File**: `apps/web/components/features/polls/TrendChart.tsx`

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate } from '@/lib/utils'

interface DataPoint {
  date: Date
  [key: string]: number | Date
}

interface TrendChartProps {
  data: DataPoint[]
  lines: {
    key: string
    name: string
    color: string
  }[]
  title?: string
  height?: number
}

export function TrendChart({ data, lines, title, height = 300 }: TrendChartProps) {
  // Transform data for Recharts
  const chartData = data.map((point) => ({
    ...point,
    date: formatDate(point.date, 'short'),
  }))

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />

          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />

          <Legend />

          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Conventions

```typescript
// ✅ Good - Use semantic color names
<div className="bg-blue-600 text-white">

// ❌ Avoid - Don't use arbitrary values unnecessarily
<div className="bg-[#3b82f6] text-[#ffffff]">

// ✅ Good - Use spacing scale
<div className="px-4 py-2 gap-3">

// ✅ Good - Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ Good - State variants
<button className="hover:bg-blue-700 focus:ring-2 disabled:opacity-50">
```

### Color Palette

Use these semantic colors:

```typescript
const colors = {
  // Political parties
  democrat: 'blue-600',
  republican: 'red-600',
  independent: 'purple-600',

  // UI states
  primary: 'blue-600',
  secondary: 'gray-600',
  success: 'green-600',
  warning: 'yellow-600',
  danger: 'red-600',

  // Neutrals
  background: 'white',
  surface: 'gray-50',
  border: 'gray-200',
  text: 'gray-900',
  textMuted: 'gray-500',
}
```

### Responsive Breakpoints

```typescript
// Mobile first approach
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Desktops
xl: '1280px'  // Large desktops
2xl: '1536px' // Extra large
```

---

## 🧪 Testing Components

### Unit Tests with React Testing Library

**File**: `apps/web/components/ui/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByText('Submit')).toBeInTheDocument()
    // Check for spinner SVG
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('disables button when loading', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })
})
```

---

## ✅ Definition of Done

Track 3 is complete when:

- [ ] All UI foundation components built (8+ components)
- [ ] All layout components built (4+ components)
- [ ] All poll-specific components built (6+ components)
- [ ] Data visualization components built (4+ charts)
- [ ] All components fully typed with TypeScript
- [ ] Responsive design working on mobile, tablet, desktop
- [ ] Loading and error states for all components
- [ ] Unit tests for all components (>80% coverage)
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] Components documented with examples
- [ ] `.claude/WORK_ASSIGNMENTS.md` updated to ✅ COMPLETE

---

## 📚 Resources

- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/
- React Testing Library: https://testing-library.com/react
- CVA (Class Variance Authority): https://cva.style/docs

---

**Happy component building! 🎨**
