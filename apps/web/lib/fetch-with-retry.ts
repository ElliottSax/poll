/**
 * Fetch with exponential backoff retry logic
 */

interface RetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxRetries?: number

  /**
   * Initial delay in milliseconds (default: 1000ms = 1s)
   */
  initialDelay?: number

  /**
   * Maximum delay in milliseconds (default: 10000ms = 10s)
   */
  maxDelay?: number

  /**
   * Backoff multiplier (default: 2 for exponential)
   */
  backoffMultiplier?: number

  /**
   * HTTP status codes that should trigger a retry (default: 408, 429, 500-599)
   */
  retryableStatusCodes?: number[]

  /**
   * Callback called before each retry attempt
   */
  onRetry?: (attempt: number, error: Error, delay: number) => void
}

interface FetchWithRetryOptions extends RequestInit {
  retry?: RetryOptions
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: any, retryableStatusCodes: number[]): boolean {
  // Network errors (no response)
  if (!error.response && error instanceof TypeError) {
    return true
  }

  // HTTP errors with retryable status codes
  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true
  }

  return false
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt)
  return Math.min(delay, maxDelay)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch with automatic retry and exponential backoff
 *
 * @example
 * ```ts
 * // Basic usage with default retry options
 * const response = await fetchWithRetry('/api/races')
 *
 * // Custom retry options
 * const response = await fetchWithRetry('/api/polls', {
 *   retry: {
 *     maxRetries: 5,
 *     initialDelay: 2000,
 *     onRetry: (attempt, error, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms`)
 *     }
 *   }
 * })
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retry = {},
    ...fetchOptions
  } = options

  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryableStatusCodes = [408, 429, 500, 502, 503, 504],
    onRetry,
  } = retry

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions)

      // Check if response status is retryable
      if (attempt < maxRetries && retryableStatusCodes.includes(response.status)) {
        const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier)

        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        ) as Error & { status: number; response: Response }
        error.status = response.status
        error.response = response

        if (onRetry) {
          onRetry(attempt + 1, error, delay)
        }

        await sleep(delay)
        continue
      }

      return response
    } catch (error) {
      lastError = error as Error

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }

      // Check if error is retryable
      if (!isRetryableError(lastError, retryableStatusCodes)) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier)

      if (onRetry) {
        onRetry(attempt + 1, lastError, delay)
      }

      // Wait before retrying
      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Fetch JSON with retry logic
 *
 * @example
 * ```ts
 * const data = await fetchJsonWithRetry<Race[]>('/api/races')
 * ```
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * React hook for fetching data with retry logic
 * Works well with React Query or SWR
 */
export function createFetcherWithRetry(retryOptions?: RetryOptions) {
  return async function fetcher<T = any>(url: string): Promise<T> {
    return fetchJsonWithRetry<T>(url, { retry: retryOptions })
  }
}

/**
 * Default fetcher with retry for React Query
 */
export const defaultFetcher = createFetcherWithRetry({
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 8000,
  onRetry: (attempt, error, delay) => {
    console.warn(
      `[Retry ${attempt}] Request failed: ${error.message}. Retrying in ${delay}ms...`
    )
  },
})
