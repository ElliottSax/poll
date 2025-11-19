import { Metadata } from 'next'
import { Suspense } from 'react'
import { Container, Section } from '@/components/layout/Container'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { RaceFilters } from '@/components/features/race/RaceFilters'
import { RaceList } from '@/components/features/race/RaceList'

export const metadata: Metadata = {
  title: 'All Races - Poll Tracker',
  description: 'Browse all tracked election races including Presidential, Senate, House, Governor, and local races with real-time polling data.',
  keywords: ['election races', '2024 races', 'senate races', 'house races', 'gubernatorial races'],
  openGraph: {
    title: 'All Races - Poll Tracker',
    description: 'Browse all tracked election races with real-time polling data',
    type: 'website',
  },
}

export default function RacesPage({
  searchParams,
}: {
  searchParams: { type?: string; state?: string; status?: string }
}) {
  return (
    <>
      {/* Page Header */}
      <Section variant="default">
        <Container>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">All Races</h1>
            <p className="text-lg text-gray-600">
              Browse all tracked election races with real-time polling data and forecasts.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <RaceFilters />
          </div>
        </Container>
      </Section>

      {/* Race List */}
      <Section variant="muted">
        <Container>
          <Suspense fallback={<PageLoader message="Loading races..." />}>
            <RaceList
              type={searchParams.type}
              state={searchParams.state}
              status={searchParams.status}
            />
          </Suspense>
        </Container>
      </Section>
    </>
  )
}
