import Link from 'next/link'
import { SearchX, Home, TrendingUp, BarChart3 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Icon */}
        <div className="mb-8">
          <SearchX className="w-24 h-24 mx-auto text-muted-foreground/50" />
        </div>

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. The race might
          have ended, or this page may have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/races"
            className="inline-flex items-center gap-2 px-6 py-3 glass border rounded-md hover:bg-muted/50 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Browse Races
          </Link>
        </div>

        {/* Popular Links */}
        <div className="glass p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Popular Pages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/races/presidential"
              className="flex items-center gap-2 text-left p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Presidential Race</span>
            </Link>
            <Link
              href="/races/senate"
              className="flex items-center gap-2 text-left p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Senate Races</span>
            </Link>
            <Link
              href="/polls"
              className="flex items-center gap-2 text-left p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>All Polls</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 text-left p-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>About Us</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
