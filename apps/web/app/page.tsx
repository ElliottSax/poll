import { Suspense } from 'react'
import Link from 'next/link'
import { FeaturedRaces } from '@/components/features/home/FeaturedRaces'
import { TrendingRaces } from '@/components/features/home/TrendingRaces'
import { RecentPolls } from '@/components/features/home/RecentPolls'
import { Hero } from '@/components/features/home/Hero'
import { Stats } from '@/components/features/home/Stats'
import { PremiumSpinner } from '@/components/ui/PremiumSpinner'
import { Bell, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <Suspense fallback={<div className="flex justify-center py-12"><PremiumSpinner size="lg" /></div>}>
          <Stats />
        </Suspense>

        {/* Featured Races */}
        <section className="my-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-gradient-subtle">Featured Races</h2>
              <p className="text-muted-foreground">Most competitive and closely watched races</p>
            </div>
            <div className="glass px-4 py-2 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                Live Updates
              </span>
            </div>
          </div>
          <Suspense fallback={<div className="flex justify-center py-12"><PremiumSpinner size="lg" variant="dots" /></div>}>
            <FeaturedRaces />
          </Suspense>
        </section>

        {/* Trending Races */}
        <section className="my-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2 text-gradient-subtle">Trending Races</h2>
            <p className="text-muted-foreground">Races with the most recent polling activity</p>
          </div>
          <Suspense fallback={<div className="flex justify-center py-12"><PremiumSpinner size="lg" variant="pulse" /></div>}>
            <TrendingRaces />
          </Suspense>
        </section>

        {/* Recent Polls */}
        <section className="my-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2 text-gradient-subtle">Recent Polls</h2>
            <p className="text-muted-foreground">Latest polling data across all races</p>
          </div>
          <Suspense fallback={<div className="flex justify-center py-12"><PremiumSpinner size="lg" /></div>}>
            <RecentPolls />
          </Suspense>
        </section>

        {/* Enhanced CTA Section */}
        <section className="my-20">
          <div className="relative overflow-hidden glass border-2 border-primary/20 rounded-3xl p-12 md:p-16">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-primary/20 rounded-full blur-3xl -z-10" />

            <div className="text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Premium Feature</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gradient">Stay Updated</span>
                <br />
                on Election Polling
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get real-time alerts when races shift, new polls are published, and
                forecasts change. Never miss an important update.
              </p>

              <Link
                href="/dashboard"
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-500 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 inline-flex items-center justify-center gap-3"
              >
                <Bell className="h-5 w-5 group-hover:animate-pulse-glow" />
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-purple-500/90 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <p className="text-sm text-muted-foreground mt-6">
                Join 10,000+ political enthusiasts tracking elections
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
