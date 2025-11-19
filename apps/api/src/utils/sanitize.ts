/**
 * Backend sanitization utilities for preventing XSS and injection attacks
 */

/**
 * Sanitize HTML by removing all tags
 * @param input - String that may contain HTML
 * @returns Plain text with HTML removed
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize user input by removing dangerous characters
 * @param input - User-provided string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .substring(0, 10000) // Limit length to prevent DoS
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * @param url - URL to sanitize
 * @returns Safe URL or null if dangerous
 */
export function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim().toLowerCase()

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.includes('<script')
  ) {
    return null
  }

  // Only allow http, https, and mailto
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('mailto:')
  ) {
    return null
  }

  return url.substring(0, 2048) // Limit URL length
}

/**
 * Sanitize email address
 * @param email - Email to validate and sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase()

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    return null
  }

  // Remove any potential XSS attempts
  if (trimmed.includes('<') || trimmed.includes('>') || trimmed.includes('javascript:')) {
    return null
  }

  return trimmed.substring(0, 255)
}

/**
 * Sanitize SQL input to prevent SQL injection
 * Note: This is a basic defense - always use parameterized queries with Prisma
 * @param input - User input that will be used in database queries
 * @returns Sanitized input
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .substring(0, 1000)
}

/**
 * Validate and sanitize pagination parameters
 * @param limit - Requested limit
 * @param offset - Requested offset
 * @returns Sanitized pagination parameters
 */
export function sanitizePagination(limit?: number, offset?: number): {
  limit: number
  offset: number
} {
  const sanitizedLimit = Math.min(Math.max(limit || 20, 1), 100) // Between 1-100
  const sanitizedOffset = Math.max(offset || 0, 0) // Non-negative

  return {
    limit: sanitizedLimit,
    offset: sanitizedOffset,
  }
}

/**
 * Sanitize object by removing null bytes and control characters
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // Remove null bytes and most control characters
      sanitized[key] = sanitized[key]
        .replace(/\0/g, '') // Null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }

  return sanitized
}
