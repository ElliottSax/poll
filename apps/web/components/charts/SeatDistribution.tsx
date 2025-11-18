'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SeatDistributionProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  height?: number
  total?: number
}

export function SeatDistribution({ data, height = 300, total = 100 }: SeatDistributionProps) {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Seat breakdown */}
      <div className="flex justify-center gap-8">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: item.color }}
            >
              {item.value}
            </div>
            <div className="text-sm text-muted-foreground">{item.name}</div>
          </div>
        ))}
      </div>

      {/* Majority line */}
      {total && (
        <div className="text-center text-sm text-muted-foreground">
          Majority: {Math.ceil(total / 2)} seats
        </div>
      )}
    </div>
  )
}
