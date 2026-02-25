import { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, TrendingUp, Users, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About | Polling Dashboard',
  description: 'Learn about our mission to provide accurate, transparent political polling aggregation and analysis.',
  openGraph: {
    title: 'About | Polling Dashboard',
    description: 'Learn about our mission to provide accurate, transparent political polling aggregation and analysis.',
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About Polling Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Transparent, accurate polling data for informed voters
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Polling Dashboard provides comprehensive polling aggregation and analysis
          for U.S. elections. We believe that access to accurate, transparent polling
          data is essential for an informed electorate.
        </p>
        <p className="text-lg text-muted-foreground">
          Our platform aggregates polls from dozens of pollsters, applies rigorous
          quality standards, and presents the data in clear, interactive visualizations
          that anyone can understand.
        </p>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">What We Provide</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-lg border">
            <BarChart3 className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Poll Aggregation</h3>
            <p className="text-muted-foreground">
              We collect and standardize polling data from major pollsters,
              ensuring consistency and comparability across sources.
            </p>
          </div>

          <div className="glass p-6 rounded-lg border">
            <TrendingUp className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
            <p className="text-muted-foreground">
              Interactive charts show how public opinion changes over time,
              helping you understand momentum and shifts in races.
            </p>
          </div>

          <div className="glass p-6 rounded-lg border">
            <Users className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pollster Ratings</h3>
            <p className="text-muted-foreground">
              We evaluate pollster quality based on historical accuracy,
              methodology, and transparency to weight our averages appropriately.
            </p>
          </div>

          <div className="glass p-6 rounded-lg border">
            <Shield className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Full Transparency</h3>
            <p className="text-muted-foreground">
              All our data sources and methodologies are publicly documented.
              See exactly how we calculate every average and forecast.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Data Sources</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We aggregate polling data from trusted sources including:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>RealClearPolitics polling database</li>
          <li>FiveThirtyEight polling data</li>
          <li>Direct pollster websites and press releases</li>
          <li>Academic and university-based polling centers</li>
        </ul>
        <p className="text-lg text-muted-foreground mt-4">
          All data is updated multiple times daily to ensure you have the
          most current information available.
        </p>
      </section>

      {/* Methodology Link */}
      <section className="mb-16">
        <div className="glass p-8 rounded-lg border text-center">
          <h2 className="text-2xl font-bold mb-4">
            Want to understand our methods?
          </h2>
          <p className="text-muted-foreground mb-6">
            Learn exactly how we aggregate polls, calculate averages, and
            generate forecasts.
          </p>
          <Link
            href="/methodology"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Read Our Methodology
          </Link>
        </div>
      </section>

      {/* Open Source */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Open Source</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Polling Dashboard is built with transparency in mind. Our codebase
          is open source, and we welcome contributions from the community.
        </p>
        <a
          href="https://github.com/ElliottSax/poll"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-lg"
        >
          View on GitHub →
        </a>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Have questions, feedback, or found an error in our data?
        </p>
        <p className="text-lg text-muted-foreground">
          Open an issue on{' '}
          <a
            href="https://github.com/ElliottSax/poll/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>{' '}
          or reach out via our repository.
        </p>
      </section>
    </div>
  )
}
