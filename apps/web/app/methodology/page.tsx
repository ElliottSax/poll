import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology | Polling Dashboard',
  description: 'Detailed explanation of our polling aggregation methodology, weighting system, and forecasting models.',
  openGraph: {
    title: 'Methodology | Polling Dashboard',
    description: 'Detailed explanation of our polling aggregation methodology, weighting system, and forecasting models.',
  },
}

export default function MethodologyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-12">
        <Link
          href="/about"
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to About
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Methodology</h1>
        <p className="text-xl text-muted-foreground">
          How we aggregate polls and calculate averages
        </p>
      </div>

      {/* Table of Contents */}
      <nav className="glass p-6 rounded-lg border mb-12">
        <h2 className="text-lg font-semibold mb-3">On this page:</h2>
        <ul className="space-y-2">
          <li>
            <a href="#data-collection" className="text-primary hover:underline">
              1. Data Collection
            </a>
          </li>
          <li>
            <a href="#poll-inclusion" className="text-primary hover:underline">
              2. Poll Inclusion Criteria
            </a>
          </li>
          <li>
            <a href="#pollster-ratings" className="text-primary hover:underline">
              3. Pollster Ratings
            </a>
          </li>
          <li>
            <a href="#weighting" className="text-primary hover:underline">
              4. Weighting System
            </a>
          </li>
          <li>
            <a href="#averages" className="text-primary hover:underline">
              5. Calculating Averages
            </a>
          </li>
          <li>
            <a href="#forecasts" className="text-primary hover:underline">
              6. Forecasting Models
            </a>
          </li>
        </ul>
      </nav>

      {/* Data Collection */}
      <section id="data-collection" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">1. Data Collection</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We collect polling data from multiple sources:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
          <li>Automated scraping of RealClearPolitics polling database</li>
          <li>FiveThirtyEight CSV polling data</li>
          <li>Direct pollster press releases and websites</li>
          <li>News organization polling archives</li>
        </ul>
        <p className="text-lg text-muted-foreground">
          Data is updated multiple times per day via automated scrapers that run
          every 6 hours. Each poll is standardized to a common format with fields
          for pollster, date, sample size, methodology, and results.
        </p>
      </section>

      {/* Poll Inclusion */}
      <section id="poll-inclusion" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">2. Poll Inclusion Criteria</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Not all polls are included in our averages. To be included, a poll must:
        </p>
        <div className="space-y-4">
          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">✓ Be from a recognized pollster</h3>
            <p className="text-muted-foreground">
              Pollster must have a public track record or be affiliated with a
              reputable organization (news outlet, university, research center).
            </p>
          </div>
          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">✓ Disclose methodology</h3>
            <p className="text-muted-foreground">
              Poll must indicate whether it surveyed registered voters, likely
              voters, or all adults, and the basic methodology (phone, online, etc.).
            </p>
          </div>
          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">✓ Provide sample size</h3>
            <p className="text-muted-foreground">
              Minimum sample size of 200 respondents for state polls, 500 for
              national polls.
            </p>
          </div>
          <div className="glass p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">✓ Be recent</h3>
            <p className="text-muted-foreground">
              Polls older than 30 days are excluded from averages (45 days for
              races with limited polling).
            </p>
          </div>
        </div>
      </section>

      {/* Pollster Ratings */}
      <section id="pollster-ratings" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">3. Pollster Ratings</h2>
        <p className="text-lg text-muted-foreground mb-4">
          We rate pollsters on a scale from A+ to F based on:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
          <li><strong>Historical Accuracy:</strong> How close their polls were to actual election results</li>
          <li><strong>Transparency:</strong> Whether they disclose full methodology and sponsor</li>
          <li><strong>Methodology:</strong> Use of probability-based sampling vs. opt-in panels</li>
          <li><strong>House Effects:</strong> Whether polls show consistent bias toward one party</li>
        </ul>
        <div className="glass p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Rating Scale:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>A+ / A:</strong> Excellent - highly accurate, transparent methodology</li>
            <li><strong>A- / B+:</strong> Very Good - generally accurate with good methodology</li>
            <li><strong>B / B-:</strong> Good - acceptable accuracy and transparency</li>
            <li><strong>C+ / C / C-:</strong> Fair - limited track record or some concerns</li>
            <li><strong>D / F:</strong> Poor - significant accuracy issues or poor methodology</li>
          </ul>
        </div>
      </section>

      {/* Weighting System */}
      <section id="weighting" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">4. Weighting System</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Each poll receives a weight based on three factors:
        </p>

        <div className="space-y-6">
          <div className="glass p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Pollster Quality (50% of weight)</h3>
            <p className="text-muted-foreground mb-2">
              Polls from higher-rated pollsters receive more weight:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>A+ rated: 1.0x weight</li>
              <li>A rated: 0.95x weight</li>
              <li>B rated: 0.85x weight</li>
              <li>C rated: 0.70x weight</li>
              <li>D/F rated: 0.50x weight or excluded</li>
            </ul>
          </div>

          <div className="glass p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Recency (30% of weight)</h3>
            <p className="text-muted-foreground mb-2">
              More recent polls receive higher weight using exponential decay:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>0-7 days old: 1.0x weight</li>
              <li>8-14 days old: 0.85x weight</li>
              <li>15-21 days old: 0.70x weight</li>
              <li>22-30 days old: 0.50x weight</li>
            </ul>
          </div>

          <div className="glass p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Sample Size (20% of weight)</h3>
            <p className="text-muted-foreground mb-2">
              Larger samples are weighted more heavily:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Weight = √(sample size) / √(median sample size)</li>
              <li>Capped at 1.5x for very large samples</li>
              <li>Minimum 0.5x for small but acceptable samples</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Calculating Averages */}
      <section id="averages" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">5. Calculating Averages</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Our polling averages use a weighted mean formula:
        </p>
        <div className="glass p-6 rounded-lg border mb-4 font-mono text-center text-lg">
          Average = Σ(poll_result × poll_weight) / Σ(poll_weight)
        </div>
        <p className="text-lg text-muted-foreground mb-4">
          This produces a rolling average that emphasizes recent, high-quality polls
          while still incorporating the full picture of available data.
        </p>
        <p className="text-lg text-muted-foreground">
          We calculate separate averages for different voter populations (registered
          voters vs. likely voters) and display both where relevant.
        </p>
      </section>

      {/* Forecasting */}
      <section id="forecasts" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">6. Forecasting Models</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Our forecasts go beyond simple polling averages to estimate the probability
          of each outcome. The model incorporates:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
          <li>Current polling averages with appropriate weighting</li>
          <li>Historical polling accuracy and systematic errors</li>
          <li>Time until the election (more uncertainty further out)</li>
          <li>Fundamentals like economic indicators and incumbency</li>
          <li>Correlation between similar races and states</li>
        </ul>
        <p className="text-lg text-muted-foreground mb-4">
          We run 10,000 Monte Carlo simulations for each race, accounting for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6">
          <li>Polling error (both random and systematic)</li>
          <li>Undecided voters breaking unevenly</li>
          <li>Turnout variations</li>
          <li>Late-race momentum shifts</li>
        </ul>
        <div className="glass p-6 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground italic">
            <strong>Note:</strong> Forecasts are probabilities, not predictions.
            A 70% chance means the outcome happens 7 out of 10 times in similar
            situations - it does not mean a 70-point margin or a guaranteed win.
          </p>
        </div>
      </section>

      {/* Transparency */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Transparency & Updates</h2>
        <p className="text-lg text-muted-foreground mb-4">
          This methodology is subject to refinement as we gather more data and
          incorporate user feedback. All changes will be documented here with
          effective dates.
        </p>
        <p className="text-lg text-muted-foreground">
          Our complete source code, including all averaging and forecasting
          algorithms, is available on{' '}
          <a
            href="https://github.com/ElliottSax/poll"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </section>

      {/* Back to About */}
      <div className="text-center pt-8 border-t">
        <Link
          href="/about"
          className="text-primary hover:underline text-lg"
        >
          ← Back to About
        </Link>
      </div>
    </div>
  )
}
