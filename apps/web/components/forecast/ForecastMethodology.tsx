import Link from 'next/link'

export function ForecastMethodology() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">About Our Forecast</h3>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-4">
          Our forecasting model combines polling data, fundamentals, and statistical simulations to
          predict election outcomes. Here's a quick overview:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted/50 rounded">
            <h4 className="font-semibold mb-2">📊 Poll Aggregation</h4>
            <p className="text-sm text-muted-foreground">
              We aggregate polls using intelligent weighting based on recency, sample size, pollster
              quality, and methodology.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded">
            <h4 className="font-semibold mb-2">🎲 Monte Carlo Simulation</h4>
            <p className="text-sm text-muted-foreground">
              We run 10,000 simulations of the election, accounting for uncertainty and correlated
              errors across states.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded">
            <h4 className="font-semibold mb-2">📈 Fundamentals</h4>
            <p className="text-sm text-muted-foreground">
              Polls are adjusted for non-polling factors like incumbency, economic indicators, and
              historical voting patterns.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded">
            <h4 className="font-semibold mb-2">🎯 Uncertainty</h4>
            <p className="text-sm text-muted-foreground">
              Forecasts include uncertainty based on poll variance, time until election, and
              historical polling error (~4 points).
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Important Disclaimer
          </h4>
          <p className="text-sm mb-2">
            Forecasts are probabilistic, not deterministic. A candidate with a 70% win probability
            should win about 70% of the time — but they can still lose 30% of the time.
          </p>
          <p className="text-sm">
            Our model is only as good as the underlying polling data. Late-breaking events,
            systematic polling errors, and turnout variations can all affect outcomes.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Key Factors in Our Model:</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Recency Weight:</strong> Recent polls weighted more heavily (30-day half-life)
            </li>
            <li>
              <strong>Sample Size:</strong> Larger samples get more weight (square root scaling)
            </li>
            <li>
              <strong>Pollster Quality:</strong> Historical accuracy affects weight (0.5x to 1.5x)
            </li>
            <li>
              <strong>Methodology:</strong> Phone polls (1.2x) weighted higher than online (1.0x) or
              IVR (0.8x)
            </li>
            <li>
              <strong>Correlated Error:</strong> Polls can be systematically wrong in the same
              direction
            </li>
            <li>
              <strong>Time Decay:</strong> More time until election = more uncertainty
            </li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-primary/10 rounded">
          <p className="text-sm">
            <strong>Win Probability Formula:</strong> Based on 10,000 Monte Carlo simulations, where
            each simulation samples from the predicted probability distribution and accounts for
            systematic bias.
          </p>
          <code className="block mt-2 text-xs">
            P(win) = (Simulations where candidate wins) / 10,000
          </code>
        </div>

        <div className="mt-6">
          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Read our complete methodology →
          </Link>
        </div>
      </div>
    </div>
  )
}
