'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { defaultFetcher } from './fetch-with-retry'

/**
 * Create a QueryClient with default configuration
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic refetching in development
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,

        // Retry configuration (works with our fetch-with-retry)
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }

          // Retry up to 3 times for other errors
          return failureCount < 3
        },

        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
      mutations: {
        // Don't retry mutations by default (can be overridden per mutation)
        retry: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

/**
 * Get the QueryClient instance
 * In browser: reuse the same instance
 * In server: create a new instance for each request
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

/**
 * React Query Provider component
 * Wraps the app with QueryClientProvider
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Only create the query client once per browser session
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

/**
 * Hook to get the QueryClient instance
 */
export { useQueryClient } from '@tanstack/react-query'

/**
 * Default query function that uses fetch-with-retry
 */
export const defaultQueryFn = async ({ queryKey }: { queryKey: unknown[] }) => {
  const url = Array.isArray(queryKey) ? queryKey[0] as string : String(queryKey)
  return defaultFetcher(url)
}
