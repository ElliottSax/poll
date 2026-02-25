'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console (will be sent to Sentry when configured)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Error Icon */}
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 mx-auto text-destructive" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          We encountered an unexpected error while loading this page.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="glass p-4 rounded-lg border-destructive/50 mb-8 text-left">
            <p className="text-sm font-mono text-destructive">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 glass border rounded-md hover:bg-muted/50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="glass p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-3">
            If this error persists, please try:
          </p>
          <ul className="text-sm text-left text-muted-foreground space-y-2">
            <li>• Refreshing the page</li>
            <li>• Clearing your browser cache</li>
            <li>• Checking your internet connection</li>
            <li>
              • Reporting the issue on{' '}
              <a
                href="https://github.com/ElliottSax/poll/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
