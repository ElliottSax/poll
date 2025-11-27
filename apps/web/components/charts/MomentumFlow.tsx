'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MomentumDataPoint {
  date: string
  candidate1: number
  candidate2: number
  spread: number
}

interface MomentumFlowProps {
  data: MomentumDataPoint[]
  candidate1Name: string
  candidate2Name: string
  candidate1Color: string
  candidate2Color: string
  height?: number
}

const CustomTooltip = ({ active, payload, label, candidate1Name, candidate2Name }: any) => {
  if (!active || !payload || !payload.length) return null

  const c1 = payload.find((p: any) => p.dataKey === 'candidate1')
  const c2 = payload.find((p: any) => p.dataKey === 'candidate2')
  const spread = c1?.value - c2?.value

  return (
    <div className="glass border border-border/50 rounded-xl p-5 shadow-premium-lg backdrop-blur-premium animate-scale-in">
      <p className="text-sm font-bold mb-3 text-foreground flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
        {new Date(label).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}
      </p>

      <div className="space-y-3">
        {c1 && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shadow-md"
                style={{
                  backgroundColor: c1.color,
                  boxShadow: `0 0 8px ${c1.color}60`
                }}
              />
              <span className="text-sm font-medium text-foreground">{candidate1Name}</span>
            </div>
            <span className="text-lg font-bold tabular-nums" style={{ color: c1.color }}>
              {c1.value.toFixed(1)}%
            </span>
          </div>
        )}

        {c2 && (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shadow-md"
                style={{
                  backgroundColor: c2.color,
                  boxShadow: `0 0 8px ${c2.color}60`
                }}
              />
              <span className="text-sm font-medium text-foreground">{candidate2Name}</span>
            </div>
            <span className="text-lg font-bold tabular-nums" style={{ color: c2.color }}>
              {c2.value.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Spread indicator */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Spread</span>
            <div className={`flex items-center gap-1 font-bold ${
              spread > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {spread > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-sm">{Math.abs(spread).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  )
}

export function MomentumFlow({
  data,
  candidate1Name,
  candidate2Name,
  candidate1Color,
  candidate2Color,
  height = 400
}: MomentumFlowProps) {
  // Calculate momentum indicators
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]

  const momentum1 = latestData && previousData ? latestData.candidate1 - previousData.candidate1 : 0
  const momentum2 = latestData && previousData ? latestData.candidate2 - previousData.candidate2 : 0

  return (
    <div className="space-y-6">
      {/* Momentum indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full shadow-md"
                style={{
                  backgroundColor: candidate1Color,
                  boxShadow: `0 0 12px ${candidate1Color}60`
                }}
              />
              <span className="font-semibold text-sm">{candidate1Name}</span>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                momentum1 > 0 ? 'text-green-500' : momentum1 < 0 ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              {momentum1 > 0 && <TrendingUp className="w-4 h-4" />}
              {momentum1 < 0 && <TrendingDown className="w-4 h-4" />}
              {momentum1 !== 0 && <span>{momentum1 > 0 ? '+' : ''}{momentum1.toFixed(1)}%</span>}
              {momentum1 === 0 && <span>—</span>}
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: candidate1Color }}>
            {latestData?.candidate1.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Current polling average</div>
        </div>

        <div className="glass border border-border/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full shadow-md"
                style={{
                  backgroundColor: candidate2Color,
                  boxShadow: `0 0 12px ${candidate2Color}60`
                }}
              />
              <span className="font-semibold text-sm">{candidate2Name}</span>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                momentum2 > 0 ? 'text-green-500' : momentum2 < 0 ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              {momentum2 > 0 && <TrendingUp className="w-4 h-4" />}
              {momentum2 < 0 && <TrendingDown className="w-4 h-4" />}
              {momentum2 !== 0 && <span>{momentum2 > 0 ? '+' : ''}{momentum2.toFixed(1)}%</span>}
              {momentum2 === 0 && <span>—</span>}
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: candidate2Color }}>
            {latestData?.candidate2.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Current polling average</div>
        </div>
      </div>

      {/* Flow chart */}
      <div className="relative glass border border-border/50 rounded-xl p-6 shadow-premium-lg">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none" />

        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1">Polling Momentum</h3>
          <p className="text-sm text-muted-foreground">Historical trend showing movement over time</p>
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <defs>
              {/* Enhanced gradient for candidate 1 area */}
              <linearGradient id={`momentum-area-1`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={candidate1Color} stopOpacity={0.6} />
                <stop offset="50%" stopColor={candidate1Color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={candidate1Color} stopOpacity={0.05} />
              </linearGradient>

              {/* Enhanced gradient for candidate 2 area */}
              <linearGradient id={`momentum-area-2`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={candidate2Color} stopOpacity={0.6} />
                <stop offset="50%" stopColor={candidate2Color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={candidate2Color} stopOpacity={0.05} />
              </linearGradient>

              {/* Glow filters */}
              <filter id="line-glow-1" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="line-glow-2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              className="stroke-border/20"
              vertical={false}
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
              dy={10}
            />

            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              dx={-5}
            />

            <Tooltip
              content={(props) => (
                <CustomTooltip
                  {...props}
                  candidate1Name={candidate1Name}
                  candidate2Name={candidate2Name}
                />
              )}
              cursor={{
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                strokeDasharray: '5 5',
                strokeOpacity: 0.3
              }}
            />

            {/* 50% reference line */}
            <ReferenceLine
              y={50}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{
                value: '50%',
                position: 'right',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 11,
                fontWeight: 600
              }}
            />

            {/* Candidate 1 area and line */}
            <Area
              type="monotone"
              dataKey="candidate1"
              fill={`url(#momentum-area-1)`}
              stroke={candidate1Color}
              strokeWidth={4}
              animationDuration={2000}
              animationEasing="ease-out"
              filter="url(#line-glow-1)"
              dot={{
                fill: candidate1Color,
                stroke: 'white',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{
                fill: candidate1Color,
                stroke: 'white',
                strokeWidth: 3,
                r: 6,
                filter: `drop-shadow(0 0 6px ${candidate1Color})`
              }}
            />

            {/* Candidate 2 area and line */}
            <Area
              type="monotone"
              dataKey="candidate2"
              fill={`url(#momentum-area-2)`}
              stroke={candidate2Color}
              strokeWidth={4}
              animationDuration={2000}
              animationEasing="ease-out"
              filter="url(#line-glow-2)"
              dot={{
                fill: candidate2Color,
                stroke: 'white',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{
                fill: candidate2Color,
                stroke: 'white',
                strokeWidth: 3,
                r: 6,
                filter: `drop-shadow(0 0 6px ${candidate2Color})`
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-bl-xl pointer-events-none" />
      </div>
    </div>
  )
}
