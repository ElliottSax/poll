/**
 * FiveThirtyEight scraper
 * Scrapes polling data from projects.fivethirtyeight.com
 */

import * as cheerio from 'cheerio'
import { BaseScraper } from './base-scraper'
import { ScraperResult, ScrapedRace, ScrapedPoll } from './types'

export class FiveThirtyEightScraper extends BaseScraper {
  private readonly baseUrl = 'https://projects.fivethirtyeight.com'

  constructor() {
    super('FiveThirtyEight', {
      rateLimit: 3000, // Be extra respectful - 3 seconds between requests
    })
  }

  async scrape(): Promise<ScraperResult> {
    const result: ScraperResult = {
      success: false,
      races: [],
      errors: [],
      scrapedAt: new Date(),
      source: 'FiveThirtyEight',
    }

    try {
      this.log('Starting FiveThirtyEight scrape...')

      // FiveThirtyEight provides CSV/JSON data which is easier to parse
      // We'll fetch their polls data via their public API/CSV endpoints

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
      this.log('Scraping presidential race from FiveThirtyEight...')

      // FiveThirtyEight provides structured JSON/CSV data
      // We'll use their polls API endpoint
      const url = `${this.baseUrl}/polls-page/data/president_polls.csv`

      const response = await this.client.get(url)
      const csvData = response.data

      // Parse CSV data
      const polls = this.parseCSVPolls(csvData, 'president')

      this.log(`Found ${polls.length} presidential polls from 538`)

      if (polls.length === 0) {
        return null
      }

      return {
        slug: 'president-2024',
        name: '2024 Presidential Election',
        type: 'president',
        candidates: this.extractCandidates(polls),
        polls,
      }
    } catch (error) {
      this.logError('Error scraping 538 presidential race', error)
      return null
    }
  }

  private async scrapeSenateRaces(): Promise<ScrapedRace[]> {
    const races: ScrapedRace[] = []

    try {
      this.log('Scraping Senate races from FiveThirtyEight...')

      await this.sleep(this.config.rateLimit)

      const url = `${this.baseUrl}/polls-page/data/senate_polls.csv`
      const response = await this.client.get(url)
      const csvData = response.data

      // Parse and group by state
      const pollsByState = this.groupPollsByState(csvData)

      for (const [state, polls] of Object.entries(pollsByState)) {
        if (polls.length > 0) {
          const race: ScrapedRace = {
            slug: `senate-${state.toLowerCase()}-2024`,
            name: `${state} Senate 2024`,
            type: 'senate',
            state,
            candidates: this.extractCandidates(polls),
            polls,
          }
          races.push(race)
        }
      }

      this.log(`Found ${races.length} Senate races from 538`)
    } catch (error) {
      this.logError('Error scraping 538 Senate races', error)
    }

    return races
  }

  /**
   * Parse CSV polls data
   * FiveThirtyEight CSV format has columns like:
   * poll_id, pollster, sponsor, display_name, pollster_rating_id, start_date, end_date,
   * sample_size, population, methodology, office_type, seat_number, seat_name,
   * answer, candidate_name, pct
   */
  private parseCSVPolls(csvData: string, raceType: string): ScrapedPoll[] {
    const polls: ScrapedPoll[] = []
    const lines = csvData.split('\n')

    if (lines.length < 2) {
      return polls
    }

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

    // Group rows by poll_id
    const pollsMap = new Map<string, any>()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const values = this.parseCSVLine(line)
        if (values.length < headers.length) continue

        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ''
        })

        const pollId = row.poll_id || row.question_id || `poll_${i}`

        if (!pollsMap.has(pollId)) {
          pollsMap.set(pollId, {
            pollId,
            pollster: row.pollster || row.display_name || 'Unknown',
            startDate: row.start_date || row.field_start,
            endDate: row.end_date || row.field_end,
            sampleSize: row.sample_size,
            methodology: row.methodology,
            population: row.population,
            results: {},
          })
        }

        const poll = pollsMap.get(pollId)
        const candidateName = row.candidate_name || row.answer
        const percentage = parseFloat(row.pct || row.percentage || '0')

        if (candidateName && !isNaN(percentage)) {
          poll.results[candidateName] = percentage
        }
      } catch (error) {
        // Skip malformed lines
        continue
      }
    }

    // Convert map to array of ScrapedPoll objects
    for (const pollData of pollsMap.values()) {
      if (Object.keys(pollData.results).length >= 2) {
        // Only include polls with at least 2 candidates
        const poll: ScrapedPoll = {
          pollster: pollData.pollster,
          pollsterSlug: this.normalizePollsterSlug(pollData.pollster),
          pollDate: this.parseDate(pollData.endDate) || new Date(),
          fieldDateStart: this.parseDate(pollData.startDate),
          fieldDateEnd: this.parseDate(pollData.endDate),
          sampleSize: this.parseNumber(pollData.sampleSize),
          methodology: this.mapMethodology(pollData.methodology),
          populationType: this.mapPopulation(pollData.population),
          results: pollData.results,
          sourceUrl: `${this.baseUrl}/polls/`,
        }

        polls.push(poll)
      }
    }

    return polls
  }

  /**
   * Parse CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  /**
   * Group polls by state
   */
  private groupPollsByState(csvData: string): Record<string, ScrapedPoll[]> {
    const lines = csvData.split('\n')
    if (lines.length < 2) return {}

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
    const statePolls: Record<string, ScrapedPoll[]> = {}

    const pollsMap = new Map<string, any>()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const values = this.parseCSVLine(line)
        if (values.length < headers.length) continue

        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ''
        })

        const state = row.state || row.seat_name
        if (!state || state.length !== 2) continue

        const pollId = `${state}_${row.poll_id || row.question_id || i}`

        if (!pollsMap.has(pollId)) {
          pollsMap.set(pollId, {
            pollId,
            state,
            pollster: row.pollster || row.display_name || 'Unknown',
            startDate: row.start_date || row.field_start,
            endDate: row.end_date || row.field_end,
            sampleSize: row.sample_size,
            methodology: row.methodology,
            population: row.population,
            results: {},
          })
        }

        const poll = pollsMap.get(pollId)
        const candidateName = row.candidate_name || row.answer
        const percentage = parseFloat(row.pct || row.percentage || '0')

        if (candidateName && !isNaN(percentage)) {
          poll.results[candidateName] = percentage
        }
      } catch (error) {
        continue
      }
    }

    // Group by state
    for (const pollData of pollsMap.values()) {
      if (Object.keys(pollData.results).length >= 2) {
        const state = pollData.state

        if (!statePolls[state]) {
          statePolls[state] = []
        }

        const poll: ScrapedPoll = {
          pollster: pollData.pollster,
          pollsterSlug: this.normalizePollsterSlug(pollData.pollster),
          pollDate: this.parseDate(pollData.endDate) || new Date(),
          fieldDateStart: this.parseDate(pollData.startDate),
          fieldDateEnd: this.parseDate(pollData.endDate),
          sampleSize: this.parseNumber(pollData.sampleSize),
          methodology: this.mapMethodology(pollData.methodology),
          populationType: this.mapPopulation(pollData.population),
          results: pollData.results,
          sourceUrl: `${this.baseUrl}/polls/`,
        }

        statePolls[state].push(poll)
      }
    }

    return statePolls
  }

  /**
   * Map methodology strings to standard format
   */
  private mapMethodology(method: string): 'phone' | 'online' | 'ivr' | 'sms' | 'mixed' | undefined {
    if (!method) return undefined

    const lower = method.toLowerCase()

    if (lower.includes('phone') || lower.includes('live')) return 'phone'
    if (lower.includes('online') || lower.includes('web')) return 'online'
    if (lower.includes('ivr') || lower.includes('automated')) return 'ivr'
    if (lower.includes('sms') || lower.includes('text')) return 'sms'
    if (lower.includes('mixed') || lower.includes('multi')) return 'mixed'

    return undefined
  }

  /**
   * Map population type to standard format
   */
  private mapPopulation(pop: string): 'rv' | 'lv' | 'a' | undefined {
    if (!pop) return undefined

    const lower = pop.toLowerCase()

    if (lower.includes('lv') || lower.includes('likely')) return 'lv'
    if (lower.includes('rv') || lower.includes('registered')) return 'rv'
    if (lower.includes('a') || lower.includes('adult')) return 'a'

    return undefined
  }

  /**
   * Extract unique candidates from polls
   */
  private extractCandidates(polls: ScrapedPoll[]): string[] {
    const candidateSet = new Set<string>()

    polls.forEach((poll) => {
      Object.keys(poll.results).forEach((candidate) => {
        // Filter out non-candidate answers
        if (
          !candidate.toLowerCase().includes('undecided') &&
          !candidate.toLowerCase().includes('other') &&
          !candidate.toLowerCase().includes('neither')
        ) {
          candidateSet.add(candidate)
        }
      })
    })

    return Array.from(candidateSet)
  }
}
