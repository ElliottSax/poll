import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <TrendingUp className="h-4 w-4" />
          <span>Real-time polling data updated daily</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Track Election Polls
          <br />
          <span className="text-gradient">With Precision</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Advanced forecasting, interactive visualizations, and comprehensive
          coverage of national and local races. Data-driven insights you can
          trust.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/races"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
          >
            Explore Races
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/forecast"
            className="border border-border px-8 py-3 rounded-md font-medium hover:bg-accent transition-colors inline-flex items-center justify-center"
          >
            View Forecast
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground mt-1">
              Races Tracked
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground mt-1">
              Polls Analyzed
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">94%</div>
            <div className="text-sm text-muted-foreground mt-1">
              Forecast Accuracy
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
