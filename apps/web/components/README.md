# Components

This directory contains all React components for the polling application, organized by category.

## Directory Structure

```
components/
├── ui/           # Base UI components (buttons, cards, badges, etc.)
├── layout/       # Layout components (header, footer, containers)
├── features/     # Poll-specific feature components
└── README.md     # This file
```

## UI Components (`/ui`)

Base reusable components built with Tailwind CSS and CVA (class-variance-authority).

### Button
Multi-variant button component with loading states.

```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="md">Click me</Button>
<Button variant="danger" loading>Processing...</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`

### Card
Composable card component with sub-components.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

<Card variant="default" hoverable>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Main content here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>
```

**Variants:** `default`, `outline`, `elevated`
**Padding:** `none`, `sm`, `md`, `lg`

### Badge
Small status/label indicators with political party color support.

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="default">New</Badge>
<Badge variant="democrat" size="sm">D</Badge>
<Badge variant="republican" withDot>R</Badge>
```

**Variants:** `default`, `secondary`, `success`, `danger`, `warning`, `info`, `outline`, `democrat`, `republican`, `independent`

### LoadingSpinner
Animated loading indicator with multiple variants and presets.

```tsx
import { LoadingSpinner, PageLoader, ButtonLoader } from '@/components/ui/LoadingSpinner'

<LoadingSpinner size="md" variant="primary" />
<PageLoader message="Loading data..." />
<ButtonLoader />
```

### ErrorBoundary
Class-based error boundary for catching React errors.

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <YourComponent />
</ErrorBoundary>
```

### Toast
Context-based notification system.

```tsx
import { ToastProvider, useToast } from '@/components/ui/Toast'

// In your app root:
<ToastProvider>{children}</ToastProvider>

// In components:
const { toast } = useToast()
toast.success('Poll data loaded!')
toast.error('Failed to fetch data')
```

### Modal
Full-featured modal dialog with presets.

```tsx
import { Modal, ConfirmDialog } from '@/components/ui/Modal'

<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
  Content here
</Modal>

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Poll?"
  message="Are you sure?"
/>
```

## Layout Components (`/layout`)

### Header
Main navigation header with theme toggle and authentication.

```tsx
import { Header } from '@/components/layout/Header'

<Header />
```

### Footer
Site footer with links and social media.

```tsx
import { Footer } from '@/components/layout/Footer'

<Footer />
```

### Container
Responsive container with max-width constraints.

```tsx
import { Container } from '@/components/layout/Container'

<Container size="lg" padding="lg">
  Content here
</Container>
```

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`
**Padding:** `none`, `sm`, `md`, `lg`

### Grid
Responsive grid system.

```tsx
import { Grid } from '@/components/layout/Container'

<Grid cols={3} gap="md">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</Grid>
```

**Columns:** `1`, `2`, `3`, `4`, `6`, `12`
**Gap:** `none`, `sm`, `md`, `lg`, `xl`

### Section
Semantic section wrapper with background variants.

```tsx
import { Section } from '@/components/layout/Container'

<Section variant="muted">
  <Container>Content</Container>
</Section>
```

### PageLayout & Main
Full page layout helpers.

```tsx
import { PageLayout, Main } from '@/components/layout/Container'

<PageLayout>
  <Header />
  <Main>
    <Container>Page content</Container>
  </Main>
  <Footer />
</PageLayout>
```

## Feature Components (`/features`)

Poll-specific components built with UI components.

### RaceCard
Displays race information with candidates and polling data.

```tsx
import { RaceCard } from '@/components/features/RaceCard'

<RaceCard
  id="senate-pa-2024"
  title="2024 Pennsylvania Senate Race"
  state="Pennsylvania"
  office="U.S. Senate"
  year={2024}
  candidates={[
    { id: '1', name: 'Jane Smith', party: 'democrat', percentage: 52.3, trend: 'up', trendValue: 2.1 },
    { id: '2', name: 'John Doe', party: 'republican', percentage: 45.7, trend: 'down', trendValue: -1.5 }
  ]}
  lastUpdated={new Date()}
  pollCount={15}
  href="/races/senate-pa-2024"
/>
```

### PollTable
Sortable table of polls with desktop and mobile views.

```tsx
import { PollTable } from '@/components/features/PollTable'

<PollTable
  polls={pollsData}
  showGrade
  compact={isMobile}
/>
```

### TrendChart
Line chart showing polling trends over time using Recharts.

```tsx
import { TrendChart, SimpleTrendChart } from '@/components/features/TrendChart'

<TrendChart
  title="Polling Trend - Pennsylvania Senate"
  data={trendData}
  candidates={candidatesInfo}
  referenceEvents={[
    { date: new Date('2024-09-15'), label: 'Debate #1' }
  ]}
/>

// Or use the simple preset for two-candidate races:
<SimpleTrendChart
  title="Head-to-Head Polling"
  candidate1={{ name: 'Jane Smith', party: 'democrat', data: candidate1Data }}
  candidate2={{ name: 'John Doe', party: 'republican', data: candidate2Data }}
/>
```

## Hooks (`/hooks`)

### useMediaQuery
Responsive design hooks for breakpoints.

```tsx
import { useIsMobile, useIsTablet, useIsDesktop, useBreakpoint } from '@/hooks'

const isMobile = useIsMobile()
const { md, lg } = useBreakpoint()

return (
  <div>
    {isMobile ? <MobileView /> : <DesktopView />}
  </div>
)
```

## Testing

Component tests are located in `__tests__/components/` and use React Testing Library.

```bash
# Run all tests (once testing infrastructure is set up)
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Development Guidelines

1. **Use existing components**: Always check if a component exists before creating a new one
2. **Composition over props**: Use sub-components (like Card) for flexibility
3. **TypeScript**: All components must have proper TypeScript interfaces
4. **Accessibility**: Include ARIA labels and semantic HTML
5. **Responsive**: Use Tailwind breakpoints and responsive hooks
6. **Testing**: Write tests for all new components

## Examples

See the `__tests__` directory for comprehensive usage examples of each component.

## Dependencies

- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority (CVA)**: For component variants
- **Recharts**: For data visualization
- **Lucide React**: Icon library
- **next-themes**: Theme management

## Future Improvements

- [ ] Add Storybook for component documentation
- [ ] Add more data visualization components (maps, bar charts)
- [ ] Add form components (input, select, checkbox, etc.)
- [ ] Add accessibility improvements (keyboard navigation, screen reader support)
- [ ] Add animation presets with Framer Motion
