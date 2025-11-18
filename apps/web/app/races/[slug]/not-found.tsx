export default function RaceNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Race Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The race you're looking for doesn't exist or has been removed.
      </p>
      <a
        href="/races"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors inline-block"
      >
        View All Races
      </a>
    </div>
  )
}
