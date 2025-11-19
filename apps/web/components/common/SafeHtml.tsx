'use client'

import { sanitizeHtml, sanitizeUserContent, sanitizeText } from '@/lib/sanitize'

interface SafeHtmlProps {
  /**
   * HTML content to sanitize and render
   */
  html: string

  /**
   * Sanitization mode:
   * - 'html': Allows safe HTML tags (p, strong, em, links, etc.)
   * - 'user': Allows only basic formatting (p, strong, em, u)
   * - 'text': Strips all HTML, plain text only
   */
  mode?: 'html' | 'user' | 'text'

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * HTML tag to use for wrapper
   */
  as?: keyof JSX.IntrinsicElements
}

/**
 * SafeHtml component - Renders HTML content after sanitizing it to prevent XSS attacks
 *
 * @example
 * ```tsx
 * <SafeHtml html={pollster.methodology} mode="html" />
 * <SafeHtml html={userComment} mode="user" />
 * <SafeHtml html={userInput} mode="text" />
 * ```
 */
export function SafeHtml({
  html,
  mode = 'html',
  className,
  as: Component = 'div',
}: SafeHtmlProps) {
  let sanitized: string

  switch (mode) {
    case 'user':
      sanitized = sanitizeUserContent(html)
      break
    case 'text':
      sanitized = sanitizeText(html)
      break
    case 'html':
    default:
      sanitized = sanitizeHtml(html)
      break
  }

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

/**
 * SafeLink component - Renders a link after sanitizing the URL
 */
interface SafeLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
}

export function SafeLink({
  href,
  children,
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
}: SafeLinkProps) {
  const { sanitizeUrl } = require('@/lib/sanitize')
  const safeHref = sanitizeUrl(href)

  // If URL was deemed unsafe, render as plain text
  if (!safeHref) {
    return <span className={className}>{children}</span>
  }

  return (
    <a
      href={safeHref}
      className={className}
      target={target}
      rel={target === '_blank' ? rel : undefined}
    >
      {children}
    </a>
  )
}
