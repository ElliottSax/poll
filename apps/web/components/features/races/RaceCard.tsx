import Link from 'next/link'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

interface RaceCardProps {
  race: {
    id: string
    slug: string
    title: string
    state: string
    office: string
    year: number
    description: string | null
    featured: boolean
    leader?: {
      candidate: string
      margin: number
    }
  }
}

export function RaceCard({ race }: RaceCardProps) {
  const { slug, title, state, office, year, leader, featured } = race

  return (
    <Link href={`/races/${slug}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              {featured && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {year} • {state} • {office}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>

            {/* Leader Info */}
            {leader && (
              <div className="flex items-center gap-2 mt-3">
                {leader.margin > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {leader.candidate} {Math.abs(leader.margin) > 0 && (
                    <span className={leader.margin > 0 ? 'text-green-600' : 'text-red-600'}>
                      {leader.margin > 0 ? '+' : ''}{leader.margin.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Arrow Icon */}
          <div className="ml-4">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  )
}
