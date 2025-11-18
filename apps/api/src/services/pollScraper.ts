import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedPoll {
  pollster: string
  pollDate: string
  sampleSize: number
  methodology?: string
  results: Record<string, number>
  marginOfError?: number
  sourceUrl: string
}

export class PollScraper {
  private userAgent = 'PollingDashboard Bot/1.0 (+https://pollingdashboard.com/bot)'

  /**
   * Scrape RealClearPolitics
   */
  async scrapeRCP(raceUrl: string): Promise<ScrapedPoll[]> {
    try {
      const response = await axios.get(raceUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000,
      })

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
          console.error('Error parsing RCP row:', err)
        }
      })

      return polls
    } catch (error) {
      console.error('Error scraping RCP:', error)
      return []
    }
  }

  /**
   * Scrape FiveThirtyEight
   */
  async scrape538(raceSlug: string): Promise<ScrapedPoll[]> {
    // FiveThirtyEight uses a JSON API
    try {
      const apiUrl = `https://projects.fivethirtyeight.com/polls/data/${raceSlug}.json`
      const response = await axios.get(apiUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000,
      })

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

      return polls
    } catch (error) {
      console.error('Error scraping 538:', error)
      return []
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
    // Handle various date formats
    // "1/14 - 1/17" -> take end date
    // "Jan 14-17" -> take end date
    // etc.

    try {
      const parts = dateStr.split('-')
      const endDate = parts[parts.length - 1].trim()

      // Basic parsing - would need more robust implementation
      const date = new Date(endDate)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    } catch (err) {
      console.error('Error parsing date:', dateStr)
    }

    return new Date().toISOString().split('T')[0]
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
