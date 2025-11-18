import { Badge } from '@/components/ui/Badge'

interface RaceHeaderProps {
  race: {
    raceName: string
    raceType: string
    state?: string
    electionDate: string
    competitiveRating: string
    description?: string
  }
}

export function RaceHeader({ race }: RaceHeaderProps) {
  const getRatingColor = (rating: string) => {
    if (rating?.includes('Solid D') || rating?.includes('Safe D')) return 'success'
    if (rating?.includes('Likely D') || rating?.includes('Lean D')) return 'info'
    if (rating?.includes('Toss')) return 'warning'
    if (rating?.includes('Lean R') || rating?.includes('Likely R')) return 'error'
    if (rating?.includes('Solid R') || rating?.includes('Safe R')) return 'error'
    return 'secondary'
  }

  const daysUntilElection = Math.ceil(
    (new Date(race.electionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold">{race.raceName}</h1>
            {race.competitiveRating && (
              <Badge variant={getRatingColor(race.competitiveRating) as any} size="lg">
                {race.competitiveRating}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-muted-foreground mb-3">
            <span className="capitalize font-medium">{race.raceType}</span>
            {race.state && (
              <>
                <span>•</span>
                <span>{race.state}</span>
              </>
            )}
          </div>

          {race.description && (
            <p className="text-base text-muted-foreground">{race.description}</p>
          )}
        </div>

        <div className="text-center md:text-right bg-muted p-4 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Election Day</div>
          <div className="text-xl font-bold">
            {new Date(race.electionDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          {daysUntilElection > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              in {daysUntilElection} days
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
