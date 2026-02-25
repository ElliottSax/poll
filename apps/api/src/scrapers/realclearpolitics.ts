/**
 * RealClearPolitics scraper
 * Scrapes polling data from realclearpolitics.com
 */

import * as cheerio from 'cheerio'
import { BaseScraper } from './base-scraper'
import { ScraperResult, ScrapedRace, ScrapedPoll } from './types'

export class RealClearPoliticsScraper extends BaseScraper {
  private readonly baseUrl = 'https://www.realclearpolitics.com'

  constructor() {
    super('RealClearPolitics', {
      rateLimit: 2000, // Be respectful - 2 seconds between requests
    })
  }

  async scrape(): Promise<ScraperResult> {
    const result: ScraperResult = {
      success: false,
      races: [],
      errors: [],
      scrapedAt: new Date(),
      source: 'RealClearPolitics',
    }

    try {
      this.log('Starting RealClearPolitics scrape...')

      // Scrape presidential race
      const presidentialRace = await this.scrapePresidentialRace()
      if (presidentialRace) {
        result.races.push(presidentialRace)
      }

      // Scrape Senate races
      const senateRaces = await this.scrapeSenateRaces()
      result.races.push(...senateRaces)

      result.success = result.races.length > 0
      this.log(`Scrape completed: ${result.races.length} races, ${result.errors.length} errors`)

      return result
    } catch (error) {
      this.logError('Fatal error during scrape', error)
      result.errors.push((error as Error).message)
      return result
    }
  }

  private async scrapePresidentialRace(): Promise<ScrapedRace | null> {
    try {
      this.log('Scraping presidential race...')

      const url = `${this.baseUrl}/epolls/latest_polls/president/`
      const html = await this.fetchHtml(url)
      const $ = cheerio.load(html)

      const polls: ScrapedPoll[] = []

      // RCP uses table structure for polls
      $('.data-table tr').each((_, row) => {
        try {
          const $row = $(row)
          const cells = $row.find('td')

          if (cells.length < 4) return // Skip header rows

          const pollster = $(cells[0]).text().trim()
          if (!pollster || pollster === 'Poll') return // Skip header

          const dateRange = $(cells[1]).text().trim()
          const sampleText = $(cells[2]).text().trim()

          // Extract candidate results
          const results: Record<string, number> = {}
          cells.slice(3).each((i, cell) => {
            const $cell = $(cell)
            const value = this.parseNumber($cell.text().trim())
            const header = $($('.data-table th')[i + 3]).text().trim()

            if (value !== undefined && header && header !== 'Spread') {
              results[header] = value
            }
          })

          if (Object.keys(results).length > 0) {
            const poll: ScrapedPoll = {
              pollster,
              pollsterSlug: this.normalizePollsterSlug(pollster),
              pollDate: this.parseDateRange(dateRange).end,
              fieldDateStart: this.parseDateRange(dateRange).start,
              fieldDateEnd: this.parseDateRange(dateRange).end,
              sampleSize: this.parseSampleSize(sampleText),
              results,
              sourceUrl: url,
            }

            polls.push(poll)
          }
        } catch (error) {
          this.logError('Error parsing poll row', error)
        }
      })

      this.log(`Found ${polls.length} presidential polls`)

      return {
        slug: 'president-2024',
        name: '2024 Presidential Election',
        type: 'president',
        candidates: this.extractCandidates(polls),
        polls,
      }
    } catch (error) {
      this.logError('Error scraping presidential race', error)
      return null
    }
  }

  private async scrapeSenateRaces(): Promise<ScrapedRace[]> {
    const races: ScrapedRace[] = []

    try {
      this.log('Scraping Senate races...')

      // Key Senate races to scrape
      const senateRaceUrls = [
        { state: 'AZ', url: `${this.baseUrl}/epolls/2024/senate/az/arizona-senate-lake-vs-gallego.html` },
        { state: 'NV', url: `${this.baseUrl}/epolls/2024/senate/nv/nevada-senate-brown-vs-rosen.html` },
        { state: 'PA', url: `${this.baseUrl}/epolls/2024/senate/pa/pennsylvania-senate-mccormick-vs-casey.html` },
        { state: 'MI', url: `${this.baseUrl}/epolls/2024/senate/mi/michigan-senate-rogers-vs-slotkin.html` },
        { state: 'WI', url: `${this.baseUrl}/epolls/2024/senate/wi/wisconsin-senate-hovde-vs-baldwin.html` },
        { state: 'OH', url: `${this.baseUrl}/epolls/2024/senate/oh/ohio-senate-moreno-vs-brown.html` },
        { state: 'MT', url: `${this.baseUrl}/epolls/2024/senate/mt/montana-senate-sheehy-vs-tester.html` },
      ]

      for (const { state, url } of senateRaceUrls) {
        try {
          await this.sleep(this.config.rateLimit) // Rate limiting

          const race = await this.scrapeSenateRace(state, url)
          if (race) {
            races.push(race)
          }
        } catch (error) {
          this.logError(`Error scraping ${state} Senate race`, error)
        }
      }

      this.log(`Found ${races.length} Senate races`)
    } catch (error) {
      this.logError('Error scraping Senate races', error)
    }

    return races
  }

  private async scrapeSenateRace(state: string, url: string): Promise<ScrapedRace | null> {
    try {
      this.log(`Scraping ${state} Senate race...`)

      const html = await this.fetchHtml(url)
      const $ = cheerio.load(html)

      const polls: ScrapedPoll[] = []

      $('.data-table tr').each((_, row) => {
        try {
          const $row = $(row)
          const cells = $row.find('td')

          if (cells.length < 4) return

          const pollster = $(cells[0]).text().trim()
          if (!pollster || pollster === 'Poll') return

          const dateRange = $(cells[1]).text().trim()
          const sampleText = $(cells[2]).text().trim()

          const results: Record<string, number> = {}
          cells.slice(3).each((i, cell) => {
            const $cell = $(cell)
            const value = this.parseNumber($cell.text().trim())
            const header = $($('.data-table th')[i + 3]).text().trim()

            if (value !== undefined && header && header !== 'Spread') {
              results[header] = value
            }
          })

          if (Object.keys(results).length > 0) {
            const poll: ScrapedPoll = {
              pollster,
              pollsterSlug: this.normalizePollsterSlug(pollster),
              pollDate: this.parseDateRange(dateRange).end,
              fieldDateStart: this.parseDateRange(dateRange).start,
              fieldDateEnd: this.parseDateRange(dateRange).end,
              sampleSize: this.parseSampleSize(sampleText),
              results,
              sourceUrl: url,
            }

            polls.push(poll)
          }
        } catch (error) {
          this.logError('Error parsing poll row', error)
        }
      })

      this.log(`Found ${polls.length} polls for ${state} Senate`)

      return {
        slug: `senate-${state.toLowerCase()}-2024`,
        name: `${state} Senate 2024`,
        type: 'senate',
        state,
        candidates: this.extractCandidates(polls),
        polls,
      }
    } catch (error) {
      this.logError(`Error scraping ${state} Senate race`, error)
      return null
    }
  }

  private parseDateRange(dateStr: string): { start: Date; end: Date } {
    const today = new Date()
    const currentYear = today.getFullYear()

    try {
      // Format: "10/15 - 10/18" or "10/15"
      if (dateStr.includes('-')) {
        const [startStr, endStr] = dateStr.split('-').map((s) => s.trim())

        const start = this.parseDate(`${startStr}/${currentYear}`) || today
        const end = this.parseDate(`${endStr}/${currentYear}`) || today

        return { start, end }
      } else {
        const date = this.parseDate(`${dateStr}/${currentYear}`) || today
        return { start: date, end: date }
      }
    } catch {
      return { start: today, end: today }
    }
  }

  private parseSampleSize(sampleText: string): number | undefined {
    // Format: "1234 LV" or "RV 567"
    const match = sampleText.match(/(\d+)\s*(RV|LV|A)?/)
    return match ? this.parseNumber(match[1]) : undefined
  }

  private extractCandidates(polls: ScrapedPoll[]): string[] {
    const candidateSet = new Set<string>()

    polls.forEach((poll) => {
      Object.keys(poll.results).forEach((candidate) => {
        candidateSet.add(candidate)
      })
    })

    return Array.from(candidateSet)
  }
}
