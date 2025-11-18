'use client'

import { TrendChart } from '@/components/charts/TrendChart'

interface PollsterAccuracyChartProps {
  pollsterId: string
}

export function PollsterAccuracyChart({ pollsterId }: PollsterAccuracyChartProps) {
  // TODO: Fetch accuracy history from API
  const accuracyData = getMockAccuracyData()

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Accuracy Over Time</h3>
        <p className="text-sm text-muted-foreground">
          Historical accuracy rate by election cycle. Measured as percentage of polls within
          margin of error.
        </p>
      </div>

      <div className="h-80">
        <TrendChart
          data={accuracyData}
          lines={[
            { dataKey: 'accuracy', color: '#3b82f6', name: 'Accuracy Rate' },
          ]}
          xAxisKey="year"
          yAxisDomain={[75, 100]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded">
          <div className="text-2xl font-bold text-primary">
            {accuracyData[accuracyData.length - 1].accuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Latest Cycle</div>
        </div>

        <div className="p-4 bg-muted rounded">
          <div className="text-2xl font-bold">
            {(accuracyData.reduce((sum, d) => sum + d.accuracy, 0) / accuracyData.length).toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">All-Time Average</div>
        </div>

        <div className="p-4 bg-muted rounded">
          <div className="text-2xl font-bold">
            {Math.max(...accuracyData.map((d) => d.accuracy)).toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Best Performance</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded">
        <p className="text-sm">
          <strong>Note:</strong> Accuracy is calculated by comparing final pre-election polls to
          actual results. A poll is considered "accurate" if the result falls within the stated
          margin of error.
        </p>
      </div>
    </div>
  )
}

function getMockAccuracyData() {
  return [
    { year: '2012', accuracy: 88.5 },
    { year: '2014', accuracy: 86.2 },
    { year: '2016', accuracy: 82.1 },
    { year: '2018', accuracy: 91.3 },
    { year: '2020', accuracy: 87.9 },
    { year: '2022', accuracy: 93.2 },
    { year: '2024', accuracy: 94.2 },
  ]
}
