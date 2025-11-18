import Link from 'next/link'
import { ExternalLink, Award } from 'lucide-react'

interface PollsterCardProps {
  pollster: {
    slug: string
    name: string
    grade?: string | null
    accuracyScore?: number | null
    methodologyScore?: number | null
    partisanLean?: string | null
    website?: string | null
  }
}

const gradeColors: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800 border-green-300',
  'A': 'bg-green-100 text-green-700 border-green-200',
  'A-': 'bg-green-50 text-green-700 border-green-200',
  'B+': 'bg-blue-100 text-blue-700 border-blue-200',
  'B': 'bg-blue-50 text-blue-700 border-blue-200',
  'B-': 'bg-blue-50 text-blue-600 border-blue-200',
  'C+': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'C': 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export function PollsterCard({ pollster }: PollsterCardProps) {
  const gradeColor = pollster.grade ? gradeColors[pollster.grade] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {pollster.name}
          </h3>
          {pollster.partisanLean && (
            <span className="text-xs text-gray-500">
              Lean: {pollster.partisanLean === 'D' ? 'Democratic' : pollster.partisanLean === 'R' ? 'Republican' : 'Independent'}
            </span>
          )}
        </div>

        {pollster.grade && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded border font-bold text-sm ${gradeColor}`}>
            <Award className="w-4 h-4" />
            {pollster.grade}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {pollster.accuracyScore !== null && pollster.accuracyScore !== undefined && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Accuracy</div>
            <div className="text-lg font-semibold text-gray-900">
              {(pollster.accuracyScore * 100).toFixed(0)}%
            </div>
          </div>
        )}
        {pollster.methodologyScore !== null && pollster.methodologyScore !== undefined && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Methodology</div>
            <div className="text-lg font-semibold text-gray-900">
              {(pollster.methodologyScore * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <Link
          href={`/pollsters/${pollster.slug}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View Details
        </Link>
        {pollster.website && (
          <a
            href={pollster.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            Website
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}
