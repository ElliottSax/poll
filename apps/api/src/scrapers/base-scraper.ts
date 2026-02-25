/**
 * Base scraper class with common functionality
 */

import axios, { AxiosInstance } from 'axios'
import { ScraperConfig, ScraperResult } from './types'

export abstract class BaseScraper {
  protected client: AxiosInstance
  protected config: Required<ScraperConfig>
  protected name: string

  constructor(name: string, config: ScraperConfig = {}) {
    this.name = name
    this.config = {
      timeout: config.timeout ?? 30000,
      maxRetries: config.maxRetries ?? 3,
      userAgent:
        config.userAgent ??
        'Mozilla/5.0 (compatible; PollingDashboard/1.0; +https://pollingdashboard.com)',
      respectRobotsTxt: config.respectRobotsTxt ?? true,
      rateLimit: config.rateLimit ?? 1000,
    }

    this.client = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
      },
    })
  }

  /**
   * Implement this method to scrape data from the source
   */
  abstract scrape(): Promise<ScraperResult>

  /**
   * Fetch HTML from a URL with retry logic
   */
  protected async fetchHtml(url: string): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.client.get(url)
        return response.data
      } catch (error) {
        lastError = error as Error
        console.error(`[${this.name}] Attempt ${attempt}/${this.config.maxRetries} failed:`, error)

        if (attempt < this.config.maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          await this.sleep(delay)
        }
      }
    }

    throw new Error(`Failed to fetch ${url} after ${this.config.maxRetries} attempts: ${lastError?.message}`)
  }

  /**
   * Sleep for a given number of milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Parse date string to Date object
   */
  protected parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined

    try {
      // Try various date formats
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date
      }

      // Try MM/DD/YYYY
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts.map(Number)
        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          return new Date(year, month - 1, day)
        }
      }

      return undefined
    } catch {
      return undefined
    }
  }

  /**
   * Extract number from string (e.g., "1,234" -> 1234)
   */
  protected parseNumber(str: string): number | undefined {
    if (!str) return undefined

    const cleaned = str.replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : num
  }

  /**
   * Normalize pollster name to slug
   */
  protected normalizePollsterSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Log scraper activity
   */
  protected log(message: string, data?: any) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${this.name}] ${message}`, data || '')
  }

  /**
   * Log scraper errors
   */
  protected logError(message: string, error?: any) {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [${this.name}] ERROR: ${message}`, error || '')
  }
}
