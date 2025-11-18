import { Suspense } from 'react'
import { FeaturedRaces } from '@/components/features/home/FeaturedRaces'
import { TrendingRaces } from '@/components/features/home/TrendingRaces'
import { RecentPolls } from '@/components/features/home/RecentPolls'
import { Hero } from '@/components/features/home/Hero'
import { Stats } from '@/components/features/home/Stats'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <Hero />

      {/* Stats Overview */}
      <Suspense fallback={<LoadingSpinner />}>
        <Stats />
      </Suspense>

      {/* Featured Races */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">Featured Races</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedRaces />
        </Suspense>
      </section>

      {/* Trending Races */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">Trending Races</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <TrendingRaces />
        </Suspense>
      </section>

      {/* Recent Polls */}
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">Recent Polls</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <RecentPolls />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="my-16 text-center">
        <div className="bg-primary/10 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated on Election Polling
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get real-time alerts when races shift, new polls are published, and
            forecasts change. Never miss an important update.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Sign Up for Alerts
          </button>
        </div>
      </section>
    </div>
  )
}
