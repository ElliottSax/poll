import { Badge } from '@/components/ui/Badge'

interface PollsterHeaderProps {
  pollster: {
    name: string
    slug: string
    overallAccuracy: number
    methodologyGrade: string
    pollCount: number
    description?: string
    website?: string
  }
}

export function PollsterHeader({ pollster }: PollsterHeaderProps) {
  const getGradeColor = (grade: string) => {
    const letter = grade.charAt(0)
    if (letter === 'A') return 'success'
    if (letter === 'B') return 'info'
    if (letter === 'C') return 'warning'
    return 'error'
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{pollster.name}</h1>
          {pollster.description && (
            <p className="text-lg text-muted-foreground mb-4">{pollster.description}</p>
          )}
          {pollster.website && (
            <a
              href={pollster.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Visit Website →
            </a>
          )}
        </div>

        <Badge variant={getGradeColor(pollster.methodologyGrade) as any} size="lg">
          <span className="text-2xl font-bold">{pollster.methodologyGrade}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Historical Accuracy</div>
          <div className="text-3xl font-bold text-primary">
            {pollster.overallAccuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Based on final polls vs. results
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Methodology Grade</div>
          <div className="text-3xl font-bold">{pollster.methodologyGrade}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Transparency & methodology quality
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Total Polls</div>
          <div className="text-3xl font-bold">{pollster.pollCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Across all races and years
          </div>
        </div>
      </div>
    </div>
  )
}
