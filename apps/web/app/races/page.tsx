import { Metadata } from 'next'
import { Suspense } from 'react'
import { RaceList } from '@/components/features/race/RaceList'
import { RaceFilters } from '@/components/features/race/RaceFilters'
import { PremiumSpinner } from '@/components/ui/PremiumSpinner'
import { BarChart3, TrendingUp, Map } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Races - Polling Dashboard',
  description:
    'Browse all tracked election races including Presidential, Senate, House, Governor, and local races.',
}

export default function RacesPage({
  searchParams,
}: {
  searchParams: { type?: string; state?: string; status?: string }
}) {
  return (
    <div className="min-h-screen">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/50 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <BarChart3 className="w-24 h-24 text-primary" />
          </div>
          <div className="absolute bottom-10 right-20 animate-float" style={{ animationDelay: '1s' }}>
            <TrendingUp className="w-20 h-20 text-purple-500" />
          </div>
          <div className="absolute top-1/2 right-10 animate-float" style={{ animationDelay: '0.5s' }}>
            <Map className="w-16 h-16 text-primary" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-slide-up">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-gradient-subtle">Live polling data</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-gradient">All Races</span>
            </h1>

            <p className="text-xl text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Browse all tracked election races with real-time polling data and forecasts.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Filters */}
        <div className="mb-8">
          <RaceFilters />
        </div>

        {/* Race List */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20">
              <PremiumSpinner size="lg" variant="gradient" />
              <p className="mt-4 text-muted-foreground">Loading races...</p>
            </div>
          }
        >
          <RaceList
            type={searchParams.type}
            state={searchParams.state}
            status={searchParams.status}
          />
        </Suspense>
      </div>
    </div>
  )
}
