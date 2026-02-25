/**
 * SEO utilities and metadata generators
 */

import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  canonical?: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image'
  noindex?: boolean
}

const SITE_CONFIG = {
  name: 'Polling Dashboard',
  title: 'Polling Dashboard - Election Polling Data & Forecasts',
  description:
    'Real-time election polling data, analysis, and forecasts. Track presidential, Senate, House, and gubernatorial races with comprehensive polling averages and expert analysis.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  twitterHandle: '@pollingdash',
}

/**
 * Generate Next.js metadata for a page
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    canonical,
    keywords = [],
    ogImage = SITE_CONFIG.ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noindex = false,
  } = config

  const fullTitle = title.includes(SITE_CONFIG.name) ? title : `${title} | ${SITE_CONFIG.name}`

  const url = canonical ? `${SITE_CONFIG.url}${canonical}` : SITE_CONFIG.url

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: noindex ? 'noindex,nofollow' : 'index,follow',

    openGraph: {
      type: ogType,
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: `${SITE_CONFIG.url}${ogImage}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },

    twitter: {
      card: twitterCard,
      title: fullTitle,
      description,
      images: [`${SITE_CONFIG.url}${ogImage}`],
      creator: SITE_CONFIG.twitterHandle,
    },

    alternates: {
      canonical: url,
    },

    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
  }
}

/**
 * Generate JSON-LD structured data
 */
export function generateStructuredData(type: 'website' | 'article' | 'race', data?: any) {
  const baseStructure = {
    '@context': 'https://schema.org',
  }

  switch (type) {
    case 'website':
      return {
        ...baseStructure,
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }

    case 'article':
      return {
        ...baseStructure,
        '@type': 'NewsArticle',
        headline: data?.title || '',
        description: data?.description || '',
        datePublished: data?.publishedAt || new Date().toISOString(),
        dateModified: data?.updatedAt || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_CONFIG.url}/logo.png`,
          },
        },
      }

    case 'race':
      return {
        ...baseStructure,
        '@type': 'Event',
        name: data?.name || '',
        description: data?.description || '',
        startDate: data?.electionDate || '2024-11-05',
        location: {
          '@type': 'Place',
          name: data?.location || 'United States',
        },
      }

    default:
      return baseStructure
  }
}

/**
 * Common keyword sets for different page types
 */
export const KEYWORDS = {
  homepage: [
    'election polls',
    'polling data',
    '2024 election',
    'presidential polls',
    'senate polls',
    'poll aggregator',
    'election forecasts',
    'political polling',
  ],
  presidential: [
    'presidential election polls',
    '2024 presidential race',
    'Trump vs Biden polls',
    'presidential polling average',
    'electoral college forecast',
  ],
  senate: [
    'senate polls',
    'senate races 2024',
    'senate election forecasts',
    'senate polling averages',
    'competitive senate races',
  ],
  pollster: [
    'pollster ratings',
    'polling methodology',
    'pollster accuracy',
    'poll quality',
    'pollster rankings',
  ],
  forecast: [
    'election forecast',
    'poll forecast model',
    'election prediction',
    'win probability',
    'electoral college projection',
  ],
}
