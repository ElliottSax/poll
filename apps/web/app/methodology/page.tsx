import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology - Polling Dashboard',
  description: 'Learn how our forecasting model works, how we aggregate polls, and our approach to election forecasting.',
}

export default function MethodologyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Forecasting Methodology</h1>

      {/* Introduction */}
      <section className="prose prose-lg dark:prose-invert mb-12">
        <p className="text-xl text-muted-foreground">
          Our forecasting model combines polling data, fundamentals, and statistical simulations
          to predict election outcomes. Here's how it works.
        </p>
      </section>

      {/* Poll Aggregation */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">1. Poll Aggregation</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            We aggregate polls using intelligent weighting based on multiple factors:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Recency Weight</h3>
              <p className="text-muted-foreground">
                Recent polls are weighted more heavily using exponential decay with a 30-day half-life.
                A poll from today has twice the weight of a poll from 30 days ago.
              </p>
              <code className="block mt-2 p-2 bg-muted rounded text-sm">
                weight_recency = 0.5 ^ (days_old / 30)
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Sample Size Adjustment</h3>
              <p className="text-muted-foreground">
                Larger samples are more reliable. We use square root scaling for diminishing returns.
              </p>
              <code className="block mt-2 p-2 bg-muted rounded text-sm">
                weight_sample = sqrt(sample_size) / sqrt(1000)
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Pollster Quality</h3>
              <p className="text-muted-foreground">
                Pollsters with better historical accuracy receive higher weights (0.5x to 1.5x).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Methodology Bonus</h3>
              <p className="text-muted-foreground">
                Phone polls (1.2x) {'>'}  Mixed (1.1x) {'>'} Online (1.0x) {'>'} IVR (0.8x)
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded">
            <p className="font-mono text-sm">
              <strong>Final Weight =</strong> recency × sample_size × quality × methodology
            </p>
          </div>
        </div>
      </section>

      {/* Fundamentals */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">2. Fundamentals Adjustment</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            Polls are adjusted for non-polling factors that historically predict outcomes:
          </p>

          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Incumbency advantage:</strong> +2-3 points for sitting officeholders</li>
            <li><strong>Economic indicators:</strong> GDP growth, unemployment rate</li>
            <li><strong>Approval ratings:</strong> Presidential/gubernatorial approval</li>
            <li><strong>Fundraising advantage:</strong> Campaign finance data</li>
            <li><strong>Partisan lean:</strong> Historical voting patterns of district/state</li>
          </ul>
        </div>
      </section>

      {/* Uncertainty */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">3. Uncertainty Quantification</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            Forecasts include uncertainty based on:
          </p>

          <div className="space-y-3">
            <div>
              <span className="font-semibold">Poll Variance:</span>
              <span className="text-muted-foreground ml-2">
                How much polls disagree with each other
              </span>
            </div>

            <div>
              <span className="font-semibold">Time Until Election:</span>
              <span className="text-muted-foreground ml-2">
                More time = more uncertainty (things can change)
              </span>
            </div>

            <div>
              <span className="font-semibold">Number of Polls:</span>
              <span className="text-muted-foreground ml-2">
                More polls = less uncertainty
              </span>
            </div>

            <div>
              <span className="font-semibold">Historical Error:</span>
              <span className="text-muted-foreground ml-2">
                Polls have averaged ~4 points off in recent cycles
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Monte Carlo */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">4. Monte Carlo Simulation</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            We run 10,000 simulations of the election to calculate win probabilities:
          </p>

          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>
              <strong>Sample from distribution:</strong> For each race, randomly sample a result
              from the predicted probability distribution
            </li>
            <li>
              <strong>Add correlated error:</strong> Apply a national/regional systematic bias
              (polls can be wrong in the same direction)
            </li>
            <li>
              <strong>Assign winners:</strong> Determine which candidate wins each race
            </li>
            <li>
              <strong>Calculate electoral votes:</strong> Sum up electoral college votes
            </li>
            <li>
              <strong>Repeat 10,000 times:</strong> Build distribution of possible outcomes
            </li>
          </ol>

          <div className="mt-4 p-4 bg-primary/10 rounded">
            <p className="text-sm">
              <strong>Win Probability =</strong> (Simulations where candidate wins) / 10,000
            </p>
          </div>
        </div>
      </section>

      {/* Model Validation */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">5. Model Validation</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            We validate our model by backtesting on historical elections:
          </p>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold mb-1">Calibration</h3>
              <p className="text-muted-foreground text-sm">
                When we say a candidate has a 70% chance of winning, they should actually win
                about 70% of the time across many races.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Accuracy Tracking</h3>
              <p className="text-muted-foreground text-sm">
                We compare our final forecast to actual results and publish accuracy metrics.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Continuous Improvement</h3>
              <p className="text-muted-foreground text-sm">
                Model parameters are updated after each election cycle based on performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Limitations & Disclaimers</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Forecasts are probabilistic, not deterministic. Unlikely events can happen.</li>
            <li>Polls can have systematic errors (e.g., 2020 underestimated Republicans)</li>
            <li>Late-breaking events may not be captured in polling data</li>
            <li>Turnout models may not accurately predict who actually votes</li>
            <li>Our model is only as good as the underlying polling data</li>
            <li>This is for informational purposes only, not betting or investment advice</li>
          </ul>
        </div>
      </section>

      {/* Data Sources */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Data Sources</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <ul className="space-y-2">
            <li>• RealClearPolitics (poll aggregation)</li>
            <li>• FiveThirtyEight (historical data)</li>
            <li>• Individual pollster websites (direct data)</li>
            <li>• FEC (campaign finance data)</li>
            <li>• State election boards (early vote data)</li>
            <li>• Census Bureau (demographic data)</li>
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-3xl font-bold mb-4">Questions?</h2>
        <p className="text-muted-foreground">
          Have questions about our methodology? Email us at{' '}
          <a href="mailto:methodology@pollingdashboard.com" className="text-primary hover:underline">
            methodology@pollingdashboard.com
          </a>
        </p>
      </section>
    </div>
  )
}
