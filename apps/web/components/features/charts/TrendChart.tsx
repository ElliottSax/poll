'use client'

import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface TrendChartProps {
  raceId: string
}

// Placeholder component - will be enhanced in Phase 2 with Recharts/D3
export function TrendChart({ raceId }: TrendChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['trend', raceId],
    queryFn: async () => {
      // TODO: Implement trend data fetching
      return null
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center">
        <p className="text-gray-500 font-medium">Trend Chart</p>
        <p className="text-sm text-gray-400 mt-1">
          Coming in Phase 2 - Recharts integration
        </p>
      </div>
    </div>
  )
}
