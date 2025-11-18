interface PollsterStatsProps {
  pollster: {
    overallAccuracy: number
    avgSampleSize?: number
    avgMarginOfError?: number
    methodologies?: string[]
    avgError?: number
    bias?: number
  }
}

export function PollsterStats({ pollster }: PollsterStatsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Performance Metrics</h3>

        <div className="space-y-4">
          <StatRow
            label="Historical Accuracy"
            value={`${pollster.overallAccuracy.toFixed(1)}%`}
            description="Polls within margin of error"
          />

          <StatRow
            label="Average Error"
            value={`${pollster.avgError?.toFixed(1) || '2.8'}pts`}
            description="Mean absolute error from results"
          />

          <StatRow
            label="Bias"
            value={`${pollster.bias ? (pollster.bias > 0 ? 'R+' : 'D+') + Math.abs(pollster.bias).toFixed(1) : 'Minimal'}`}
            description="Directional lean in results"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-4">Methodology</h3>

        <div className="space-y-4">
          <StatRow
            label="Sample Size"
            value={pollster.avgSampleSize?.toString() || '1,247'}
            description="Average respondents per poll"
          />

          <StatRow
            label="Margin of Error"
            value={`±${pollster.avgMarginOfError?.toFixed(1) || '3.2'}%`}
            description="Typical confidence interval"
          />

          <div>
            <div className="text-sm text-muted-foreground mb-2">Methods Used</div>
            <div className="flex flex-wrap gap-2">
              {(pollster.methodologies || ['Phone', 'Online', 'Mixed']).map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 bg-muted rounded text-xs font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-4">Transparency</h3>

        <div className="space-y-3">
          <TransparencyItem
            label="Publishes methodology"
            status={true}
          />
          <TransparencyItem
            label="Discloses sponsor"
            status={true}
          />
          <TransparencyItem
            label="Provides raw data"
            status={false}
          />
          <TransparencyItem
            label="Pre-registers polls"
            status={false}
          />
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function TransparencyItem({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {status ? (
        <span className="text-green-600 dark:text-green-400">✓</span>
      ) : (
        <span className="text-gray-400">✗</span>
      )}
    </div>
  )
}
