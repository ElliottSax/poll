import { Suspense } from 'react'
import { RaceList } from '@/components/features/races/RaceList'
import { RaceFilters } from '@/components/features/races/RaceFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const metadata = {
  title: 'All Races - Polling Dashboard',
  description: 'Browse all tracked election races and polling data',
}

export default function RacesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          All Races
        </h1>
        <p className="text-lg text-gray-600">
          Track polling data across all elections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <RaceFilters />
        </aside>

        {/* Race List */}
        <main className="lg:col-span-3">
          <Suspense fallback={<LoadingSpinner />}>
            <RaceList />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
