export function RaceHeader({ race }: { race: any }) {
  return (
    <div className="border-b pb-6">
      <h1 className="text-4xl font-bold mb-2">{race.raceName}</h1>
      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="capitalize">{race.raceType}</span>
        {race.state && <span>•</span>}
        {race.state && <span>{race.state}</span>}
        {race.competitiveRating && <span>•</span>}
        {race.competitiveRating && (
          <span className="font-medium">{race.competitiveRating}</span>
        )}
      </div>
    </div>
  )
}
