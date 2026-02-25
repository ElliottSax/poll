'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from 'recharts'

export interface BarChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface BarChartProps {
  data: BarChartDataPoint[]
  title?: string
  height?: number
  showLegend?: boolean
  yAxisLabel?: string
  xAxisLabel?: string
  valueFormatter?: (value: number) => string
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    payload: BarChartDataPoint
  }>
  valueFormatter?: (value: number) => string
}

function CustomTooltip({ active, payload, valueFormatter }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0]
  const formatValue = valueFormatter || ((v) => v.toFixed(1))

  return (
    <div className="glass p-3 rounded-lg border shadow-lg">
      <p className="font-semibold mb-1">{data.payload.name}</p>
      <p className="text-sm">
        <span className="text-muted-foreground">Value: </span>
        <span className="font-semibold">{formatValue(data.value)}</span>
      </p>
    </div>
  )
}

export function BarChart({
  data,
  title,
  height = 400,
  showLegend = false,
  yAxisLabel,
  xAxisLabel,
  valueFormatter,
}: BarChartProps) {
  const defaultColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
  ]

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="name"
            style={{ fontSize: '12px' }}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          <YAxis
            style={{ fontSize: '12px' }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            tickFormatter={valueFormatter}
          />
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend />}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart
