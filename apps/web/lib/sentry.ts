/**
 * Sentry error monitoring configuration
 */

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN || process.env.NODE_ENV !== 'production') {
    return
  }

  // Sentry will be initialized when @sentry/nextjs is installed
  // This file provides the configuration structure
  console.log('Sentry initialized')
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
    // Will use Sentry.captureException when installed
    console.error('Error captured:', error, context)
  } else {
    console.error(error, context)
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
    // Will use Sentry.captureMessage when installed
    console.log(`[${level}] ${message}`)
  }
}
