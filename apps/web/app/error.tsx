'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem
          persists.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 dark:text-red-400">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="default" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          If this issue continues, please{' '}
          <a href="/about" className="text-primary hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  )
}
