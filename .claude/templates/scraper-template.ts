// Template for creating data scrapers (Track 4: Data Scrapers)
// Copy this file and modify for your specific data source

import axios from 'axios'
import * as cheerio from 'cheerio'
// import { prisma } from '../utils/prisma'

/**
 * Base interface for scraped poll data
 */
interface ScrapedPoll {
  pollster: string
  sponsor?: string
  date: Date
  sampleSize: number
  marginOfError?: number
  population: 'LV' | 'RV' | 'A' // Likely Voters, Registered Voters, Adults
  methodology: 'Live Phone' | 'Online' | 'IVR' | 'Mixed'
  candidates: {
    name: string
    party: 'D' | 'R' | 'I' | 'Other'
    percentage: number
  }[]
  race: {
    state: string
    type: 'Presidential' | 'Senate' | 'House' | 'Governor' | 'Other'
    year: number
  }
  sourceUrl: string
  scrapedAt: Date
}

/**
 * Scraper configuration
 */
interface ScraperConfig {
  baseUrl: string
  userAgent: string
  rateLimit: number // milliseconds between requests
  retryAttempts: number
  timeout: number
}

/**
 * Base Scraper Class
 * Extend this for specific data sources
 */
export class BaseScraper {
  protected config: ScraperConfig

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      userAgent: config.userAgent || 'PollingScraper/1.0',
      rateLimit: config.rateLimit || 1000,
      retryAttempts: config.retryAttempts || 3,
      timeout: config.timeout || 10000,
    }
  }

  /**
   * Fetch HTML from a URL with retry logic
   */
  protected async fetchHtml(url: string, attempt = 1): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.config.userAgent,
        },
        timeout: this.config.timeout,
      })

      return response.data
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.warn(`Fetch failed (attempt ${attempt}), retrying...`)
        await this.sleep(this.config.rateLimit * attempt)
        return this.fetchHtml(url, attempt + 1)
      }

      throw new Error(`Failed to fetch ${url}: ${error}`)
    }
  }

  /**
   * Parse HTML using cheerio
   */
  protected parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html)
  }

  /**
   * Sleep/delay utility for rate limiting
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Validate scraped poll data
   */
  protected validatePoll(poll: ScrapedPoll): boolean {
    // Basic validation
    if (!poll.pollster || poll.pollster.length === 0) {
      console.error('Invalid poll: missing pollster')
      return false
    }

    if (!poll.date || isNaN(poll.date.getTime())) {
      console.error('Invalid poll: invalid date')
      return false
    }

    if (poll.sampleSize <= 0) {
      console.error('Invalid poll: invalid sample size')
      return false
    }

    if (!poll.candidates || poll.candidates.length === 0) {
      console.error('Invalid poll: no candidates')
      return false
    }

    // Validate percentages sum to ~100% (allow for rounding and undecided)
    const total = poll.candidates.reduce((sum, c) => sum + c.percentage, 0)
    if (total < 50 || total > 100) {
      console.error(`Invalid poll: percentages sum to ${total}%`)
      return false
    }

    return true
  }

  /**
   * Check for duplicate polls in database
   */
  protected async isDuplicate(poll: ScrapedPoll): Promise<boolean> {
    // TODO: Implement database check
    // const existing = await prisma.poll.findFirst({
    //   where: {
    //     pollster: poll.pollster,
    //     date: poll.date,
    //     // Add more fields for uniqueness check
    //   },
    // })
    // return existing !== null

    return false // Placeholder
  }

  /**
   * Save poll to database
   */
  protected async savePoll(poll: ScrapedPoll): Promise<void> {
    // Validate before saving
    if (!this.validatePoll(poll)) {
      throw new Error('Invalid poll data')
    }

    // Check for duplicates
    if (await this.isDuplicate(poll)) {
      console.log('Duplicate poll detected, skipping...')
      return
    }

    // TODO: Implement database save
    // await prisma.poll.create({
    //   data: {
    //     ...poll,
    //   },
    // })

    console.log(`Saved poll: ${poll.pollster} - ${poll.date}`)
  }

  /**
   * Main scraping method - override in subclasses
   */
  public async scrape(): Promise<ScrapedPoll[]> {
    throw new Error('scrape() must be implemented in subclass')
  }
}

/**
 * Example Scraper Implementation
 */
export class ExampleScraper extends BaseScraper {
  constructor() {
    super({
      baseUrl: 'https://example.com/polls',
      rateLimit: 2000,
    })
  }

  /**
   * Scrape polls from the data source
   */
  public async scrape(): Promise<ScrapedPoll[]> {
    const polls: ScrapedPoll[] = []

    try {
      console.log('Fetching polls from Example.com...')

      // Fetch the page
      const html = await this.fetchHtml(this.config.baseUrl)
      const $ = this.parseHtml(html)

      // Parse poll data (customize for your source)
      $('.poll-item').each((_, element) => {
        const pollster = $(element).find('.pollster-name').text().trim()
        const dateStr = $(element).find('.poll-date').text().trim()
        const sampleSize = parseInt($(element).find('.sample-size').text().trim())

        // Parse candidates and percentages
        const candidates: ScrapedPoll['candidates'] = []
        $(element)
          .find('.candidate')
          .each((_, candElement) => {
            candidates.push({
              name: $(candElement).find('.name').text().trim(),
              party: $(candElement).find('.party').text().trim() as any,
              percentage: parseFloat($(candElement).find('.percentage').text().trim()),
            })
          })

        const poll: ScrapedPoll = {
          pollster,
          date: new Date(dateStr),
          sampleSize,
          population: 'LV',
          methodology: 'Online',
          candidates,
          race: {
            state: 'National',
            type: 'Presidential',
            year: 2024,
          },
          sourceUrl: this.config.baseUrl,
          scrapedAt: new Date(),
        }

        if (this.validatePoll(poll)) {
          polls.push(poll)
        }
      })

      console.log(`Scraped ${polls.length} polls`)

      // Save to database
      for (const poll of polls) {
        await this.savePoll(poll)
        await this.sleep(this.config.rateLimit)
      }
    } catch (error) {
      console.error('Scraping failed:', error)
      throw error
    }

    return polls
  }
}

/**
 * Usage example:
 *
 * const scraper = new ExampleScraper()
 * const polls = await scraper.scrape()
 * console.log(`Scraped ${polls.length} polls`)
 */
