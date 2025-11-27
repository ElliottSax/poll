import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import { logger } from '../utils/logger'
import { DateParser } from '../utils/dateParser'

export interface ScrapedPoll {
  pollster: string
  pollDate: string
  sampleSize: number
  methodology?: string
  results: Record<string, number>
  marginOfError?: number
  sourceUrl: string
}

interface RateLimitConfig {
  maxRequests: number
  timeWindow: number // in milliseconds
}

export class PollScraper {
  private userAgent = 'PollingDashboard Bot/1.0 (+https://pollingdashboard.com/bot)'
  private axiosInstance: AxiosInstance
  private requestTimestamps: Map<string, number[]> = new Map()
  private rateLimitConfig: RateLimitConfig = {
    maxRequests: 10,
    timeWindow: 60000, // 10 requests per minute
  }

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': this.userAgent,
      },
      maxRedirects: 5,
    })

    // Response interceptor for handling rate limits
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '60')
          logger.warn({ retryAfter }, 'Rate limited by external service')

          // Wait and retry once
          await this.sleep(retryAfter * 1000)
          return this.axiosInstance.request(error.config)
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check and enforce rate limiting
   */
  private async enforceRateLimit(domain: string): Promise<void> {
    const now = Date.now()
    const timestamps = this.requestTimestamps.get(domain) || []

    // Remove old timestamps outside the time window
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < this.rateLimitConfig.timeWindow
    )

    // Check if we've exceeded the rate limit
    if (validTimestamps.length >= this.rateLimitConfig.maxRequests) {
      const oldestTimestamp = validTimestamps[0]
      const waitTime = this.rateLimitConfig.timeWindow - (now - oldestTimestamp)

      logger.info({ domain, waitTime }, 'Rate limit reached, waiting')
      await this.sleep(waitTime)
    }

    // Add current request timestamp
    validTimestamps.push(now)
    this.requestTimestamps.set(domain, validTimestamps)
  }

  /**
   * Safe HTTP request with rate limiting and retries
   */
  private async safeRequest(url: string, retries = 3): Promise<any> {
    const domain = new URL(url).hostname

    await this.enforceRateLimit(domain)

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.axiosInstance.get(url)
        return response
      } catch (error: any) {
        logger.error({ error, url, attempt }, 'Request failed')

        if (attempt === retries) {
          throw error
        }

        // Exponential backoff
        const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await this.sleep(backoff)
      }
    }
  }

  /**
   * Scrape RealClearPolitics
   */
  async scrapeRCP(raceUrl: string): Promise<ScrapedPoll[]> {
    try {
      const response = await this.safeRequest(raceUrl)

      const $ = cheerio.load(response.data)
      const polls: ScrapedPoll[] = []

      // Parse RCP polling table
      $('table.polling-data-full tr').each((i, row) => {
        if (i === 0) return // Skip header

        const cells = $(row).find('td')
        if (cells.length < 5) return

        try {
          const poll: ScrapedPoll = {
            pollster: $(cells[0]).text().trim(),
            pollDate: $(cells[1]).text().trim(),
            sampleSize: parseInt($(cells[2]).text().replace(/\D/g, '')) || 0,
            results: {},
            sourceUrl: raceUrl,
          }

          // Extract candidate results (varies by race)
          const resultCells = cells.slice(3, -1)
          resultCells.each((j, cell) => {
            const text = $(cell).text().trim()
            const value = parseFloat(text)
            if (!isNaN(value)) {
              poll.results[`candidate_${j}`] = value
            }
          })

          // Extract margin of error
          const moeText = $(cells[cells.length - 1]).text()
          const moe = parseFloat(moeText.replace(/[^\d.]/g, ''))
          if (!isNaN(moe)) {
            poll.marginOfError = moe
          }

          polls.push(poll)
        } catch (err) {
          logger.error({ err, row: i }, 'Error parsing RCP row')
        }
      })

      logger.info({ url: raceUrl, pollsFound: polls.length }, 'RCP scrape completed')
      return polls
    } catch (error) {
      logger.error({ error, url: raceUrl }, 'Error scraping RCP')
      throw error
    }
  }

  /**
   * Scrape FiveThirtyEight
   */
  async scrape538(raceSlug: string): Promise<ScrapedPoll[]> {
    // FiveThirtyEight uses a JSON API
    try {
      const apiUrl = `https://projects.fivethirtyeight.com/polls/data/${raceSlug}.json`
      const response = await this.safeRequest(apiUrl)

      const polls: ScrapedPoll[] = response.data.map((item: any) => ({
        pollster: item.pollster,
        pollDate: item.end_date,
        sampleSize: item.sample_size || 0,
        methodology: item.methodology,
        results: item.answers?.reduce((acc: any, answer: any) => {
          acc[answer.candidate] = answer.pct
          return acc
        }, {}),
        marginOfError: item.margin_of_error,
        sourceUrl: `https://projects.fivethirtyeight.com/polls/${raceSlug}`,
      }))

      logger.info({ raceSlug, pollsFound: polls.length }, '538 scrape completed')
      return polls
    } catch (error) {
      logger.error({ error, raceSlug }, 'Error scraping 538')
      throw error
    }
  }

  /**
   * Normalize pollster names
   */
  normalizePollster(name: string): string {
    const normalizations: Record<string, string> = {
      'Monmouth Univ.': 'Monmouth University',
      'Quinnipiac Univ.': 'Quinnipiac University',
      'Marist Coll.': 'Marist College',
      'Emerson Coll.': 'Emerson College',
    }

    return normalizations[name] || name
  }

  /**
   * Parse date string to ISO format
   */
  parseDate(dateStr: string): string {
    const parsed = DateParser.parsePollDate(dateStr)
    return parsed || new Date().toISOString().split('T')[0]
  }

  /**
   * Determine methodology from pollster name or description
   */
  guessMethodology(pollster: string, description?: string): string {
    const text = `${pollster} ${description || ''}`.toLowerCase()

    if (text.includes('online') || text.includes('web')) return 'online'
    if (text.includes('phone') || text.includes('telephone')) return 'phone'
    if (text.includes('ivr') || text.includes('automated')) return 'ivr'
    if (text.includes('sms') || text.includes('text')) return 'sms'

    return 'mixed'
  }
}

// Export singleton
export const pollScraper = new PollScraper()
