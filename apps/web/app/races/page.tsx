import { Metadata } from 'next'
import { Suspense } from 'react'
import { RaceList } from '@/components/features/race/RaceList'
import { RaceFilters } from '@/components/features/race/RaceFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">All Races</h1>
        <p className="text-lg text-muted-foreground">
          Browse all tracked election races with real-time polling data and forecasts.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <RaceFilters />
      </div>

      {/* Race List */}
      <Suspense fallback={<LoadingSpinner />}>
        <RaceList
          type={searchParams.type}
          state={searchParams.state}
          status={searchParams.status}
        />
      </Suspense>
    </div>
  )
}
