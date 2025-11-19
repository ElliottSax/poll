import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  dirty: string,
  options?: DOMPurify.Config
): string {
  // Default configuration - only allow safe tags and attributes
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: true,
    // Force links to open in new tab with security attributes
    ADD_ATTR: ['target', 'rel'],
    RETURN_TRUSTED_TYPE: false,
  }

  const config = { ...defaultConfig, ...options }

  // If running in browser
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirty, config)
  }

  // If running on server (SSR), create a DOM implementation
  const createDOMPurify = require('dompurify')
  const { JSDOM } = require('jsdom')
  const window = new JSDOM('').window
  const purify = createDOMPurify(window)

  return purify.sanitize(dirty, config)
}

/**
 * Sanitize text content (strip all HTML tags)
 * @param dirty - The potentially unsafe string
 * @returns Plain text with all HTML removed
 */
export function sanitizeText(dirty: string): string {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
  }

  const createDOMPurify = require('dompurify')
  const { JSDOM } = require('jsdom')
  const window = new JSDOM('').window
  const purify = createDOMPurify(window)

  return purify.sanitize(dirty, { ALLOWED_TAGS: [] })
}

/**
 * Sanitize user input for safe display
 * Allows basic formatting but removes dangerous content
 * @param input - User-generated content
 * @returns Sanitized content
 */
export function sanitizeUserContent(input: string): string {
  return sanitizeHtml(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize URLs to prevent javascript: and data: URIs
 * @param url - The URL to sanitize
 * @returns Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase()

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return ''
  }

  // Only allow http, https, and mailto
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('mailto:') &&
    !trimmed.startsWith('/')
  ) {
    return ''
  }

  return url
}

/**
 * React hook for safely rendering HTML content
 * Returns an object suitable for dangerouslySetInnerHTML
 * @param html - HTML content to sanitize
 * @returns Object with __html property containing sanitized content
 */
export function useSafeHtml(html: string): { __html: string } {
  return {
    __html: sanitizeHtml(html),
  }
}
