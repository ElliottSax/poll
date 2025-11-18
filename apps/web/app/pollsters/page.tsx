import { Suspense } from 'react'
import { PollsterList } from '@/components/features/pollsters/PollsterList'
import { PollsterFilters } from '@/components/features/pollsters/PollsterFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const metadata = {
  title: 'Pollsters - Polling Dashboard',
  description: 'Browse all polling organizations and their accuracy ratings',
}

export default function PolstersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Pollsters
        </h1>
        <p className="text-lg text-gray-600">
          Track polling organizations and their historical accuracy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <PollsterFilters />
        </aside>

        {/* Pollster List */}
        <main className="lg:col-span-3">
          <Suspense fallback={<LoadingSpinner />}>
            <PollsterList />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
