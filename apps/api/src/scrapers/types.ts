/**
 * Shared types for polling data scrapers
 */

export interface ScrapedPoll {
  pollster: string
  pollsterSlug: string
  pollDate: Date
  fieldDateStart?: Date
  fieldDateEnd?: Date
  sampleSize?: number
  methodology?: 'phone' | 'online' | 'ivr' | 'sms' | 'mixed'
  populationType?: 'rv' | 'lv' | 'a' // registered voters, likely voters, adults
  results: Record<string, number> // candidate name -> percentage
  marginOfError?: number
  sourceUrl: string
  rawData?: any
}

export interface ScrapedRace {
  slug: string
  name: string
  type: 'president' | 'senate' | 'house' | 'governor'
  state?: string
  district?: string
  candidates: string[]
  polls: ScrapedPoll[]
}

export interface ScraperResult {
  success: boolean
  races: ScrapedRace[]
  errors: string[]
  scrapedAt: Date
  source: string
}

export interface ScraperConfig {
  timeout?: number
  maxRetries?: number
  userAgent?: string
  respectRobotsTxt?: boolean
  rateLimit?: number // ms between requests
}
