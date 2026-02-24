'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ProgressRing } from '@/components/ui/ProgressRing'

interface SeatDistributionProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  height?: number
  total?: number
  showRings?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]

  return (
    <div className="glass border border-border/50 rounded-xl p-5 shadow-premium-lg backdrop-blur-premium animate-scale-in">
      <p className="text-sm font-bold mb-3 text-foreground flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
        {data.name}
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full relative shadow-md"
          style={{
            backgroundColor: data.payload.color,
            boxShadow: `0 0 12px ${data.payload.color}60`
          }}
        >
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{ backgroundColor: data.payload.color, opacity: 0.4 }}
          />
        </div>
        <span className="text-2xl font-bold tabular-nums" style={{ color: data.payload.color }}>
          {data.value}
        </span>
        <span className="text-sm text-muted-foreground">seats</span>
      </div>
      {/* Decorative gradient line */}
      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  )
}

const Custom3DPieCell = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props

  return (
    <g>
      <defs>
        {/* 3D gradient effect */}
        <radialGradient id={`3d-gradient-${index}`}>
          <stop offset="0%" stopColor={fill} stopOpacity={1} />
          <stop offset="70%" stopColor={fill} stopOpacity={0.9} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.7} />
        </radialGradient>

        {/* Glow filter */}
        <filter id={`pie-glow-${index}`}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shadow layer for 3D depth */}
      <path
        d={generatePath(cx, cy + 4, innerRadius, outerRadius, startAngle, endAngle)}
        fill={fill}
        opacity={0.2}
      />

      {/* Main segment with 3D gradient */}
      <path
        d={generatePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle)}
        fill={`url(#3d-gradient-${index})`}
        filter={`url(#pie-glow-${index})`}
        className="transition-all duration-300"
      />

      {/* Highlight on top edge */}
      <path
        d={generatePath(cx, cy, outerRadius - 10, outerRadius, startAngle, endAngle)}
        fill="url(#top-highlight)"
        opacity={0.3}
      />
    </g>
  )
}

// Helper function to generate pie path
function generatePath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const startAngleRad = (startAngle * Math.PI) / 180
  const endAngleRad = (endAngle * Math.PI) / 180

  const x1 = cx + outerRadius * Math.cos(startAngleRad)
  const y1 = cy + outerRadius * Math.sin(startAngleRad)
  const x2 = cx + outerRadius * Math.cos(endAngleRad)
  const y2 = cy + outerRadius * Math.sin(endAngleRad)

  const x3 = cx + innerRadius * Math.cos(endAngleRad)
  const y3 = cy + innerRadius * Math.sin(endAngleRad)
  const x4 = cx + innerRadius * Math.cos(startAngleRad)
  const y4 = cy + innerRadius * Math.sin(startAngleRad)

  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
}

export function SeatDistribution({
  data,
  height = 300,
  total = 100,
  showRings = false
}: SeatDistributionProps) {
  const majority = Math.ceil(total / 2)

  return (
    <div className="space-y-8">
      {showRings ? (
        // Alternative ring visualization
        <div className="flex justify-center items-center gap-12">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const hasMajority = item.value >= majority

            return (
              <div key={item.name} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="relative mb-4">
                  <ProgressRing
                    progress={percentage}
                    size={160}
                    strokeWidth={12}
                    color={item.color}
                    showPercentage={false}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-bold" style={{ color: item.color }}>
                        <AnimatedCounter value={item.value} duration={2000} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">seats</div>
                    </div>
                  </ProgressRing>
                  {hasMajority && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      Majority
                    </div>
                  )}
                </div>
                <div className="font-semibold text-foreground">{item.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Enhanced 3D donut chart with depth effects
        <div className="relative">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <defs>
                {/* Global top highlight gradient for 3D effect */}
                <linearGradient id="top-highlight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
                {...({ shape: (props: any) => (
                  <Custom3DPieCell
                    {...props}
                    fill={props.payload?.color || props.fill}
                    index={props.index}
                  />
                )} as any)}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-4xl font-bold text-foreground">
              <AnimatedCounter value={total} duration={2000} />
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Seats</div>
          </div>
        </div>
      )}

      {/* Seat breakdown cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const hasMajority = item.value >= majority

          return (
            <div
              key={item.name}
              className="glass p-5 rounded-xl hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-md"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {hasMajority && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    ✓
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold" style={{ color: item.color }}>
                  <AnimatedCounter value={item.value} duration={2000} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% of {total}
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Majority indicator */}
      <div className="glass p-4 rounded-xl border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{majority}</span>
            </div>
            <div>
              <div className="font-semibold text-sm">Majority Threshold</div>
              <div className="text-xs text-muted-foreground">
                {majority} seats needed to control
              </div>
            </div>
          </div>
          <div className="text-right">
            {data.map((item) => {
              if (item.value >= majority) {
                return (
                  <div key={item.name} className="text-sm">
                    <span style={{ color: item.color }} className="font-bold">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      +{item.value - majority}
                    </span>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
