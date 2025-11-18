import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RaceHeaderProps {
  race: {
    title: string
    state: string
    office: string
    year: number
    description?: string | null
    featured: boolean
  }
}

export function RaceHeader({ race }: RaceHeaderProps) {
  return (
    <div>
      {/* Back Button */}
      <Link
        href="/races"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all races
      </Link>

      {/* Title Section */}
      <div className="flex items-start justify-between">
        <div>
          {/* Meta Info */}
          <div className="flex items-center gap-2 mb-2">
            {race.featured && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            )}
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {race.year} • {race.state} • {race.office}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {race.title}
          </h1>

          {/* Description */}
          {race.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {race.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
