/**
 * Scraper orchestrator
 * Coordinates all polling data scrapers
 */

import { RealClearPoliticsScraper } from './realclearpolitics'
import { FiveThirtyEightScraper } from './fivethirtyeight'
import { ScraperResult } from './types'
import { prisma } from '../utils/prisma'

export class ScraperService {
  private scrapers = {
    rcp: new RealClearPoliticsScraper(),
    fte: new FiveThirtyEightScraper(),
  }

  /**
   * Run all scrapers and update database
   */
  async runAll(): Promise<{ results: ScraperResult[]; summary: any }> {
    console.log('Starting scraper orchestration...')

    const results: ScraperResult[] = []

    // Run RealClearPolitics scraper
    try {
      const rcpResult = await this.scrapers.rcp.scrape()
      results.push(rcpResult)

      if (rcpResult.success) {
        await this.saveScrapedData(rcpResult)
      }
    } catch (error) {
      console.error('Error running RCP scraper:', error)
    }

    // Run FiveThirtyEight scraper
    try {
      const fteResult = await this.scrapers.fte.scrape()
      results.push(fteResult)

      if (fteResult.success) {
        await this.saveScrapedData(fteResult)
      }
    } catch (error) {
      console.error('Error running FiveThirtyEight scraper:', error)
    }

    const summary = {
      totalScrapers: Object.keys(this.scrapers).length,
      successfulScrapers: results.filter((r) => r.success).length,
      totalRaces: results.reduce((sum, r) => sum + r.races.length, 0),
      totalPolls: results.reduce(
        (sum, r) => sum + r.races.reduce((s, race) => s + race.polls.length, 0),
        0
      ),
      errors: results.reduce((sum, r) => sum + r.errors.length, 0),
    }

    console.log('Scraper orchestration completed:', summary)

    return { results, summary }
  }

  /**
   * Save scraped data to database
   */
  private async saveScrapedData(result: ScraperResult): Promise<void> {
    console.log(`Saving data from ${result.source}...`)

    for (const race of result.races) {
      try {
        // Find or create race
        let dbRace = await prisma.race.findUnique({
          where: { slug: race.slug },
        })

        if (!dbRace) {
          dbRace = await prisma.race.create({
            data: {
              slug: race.slug,
              raceName: race.name,
              raceType: race.type,
              country: 'USA',
              state: race.state || null,
              district: race.district || null,
              electionDate: new Date('2024-11-05'),
              status: 'active',
              importanceScore: race.type === 'president' ? 10 : 8,
            },
          })
        }

        // Create candidates if they don't exist
        for (const candidateName of race.candidates) {
          const existing = await prisma.candidate.findFirst({
            where: {
              raceId: dbRace.id,
              name: candidateName,
            },
          })

          if (!existing) {
            // Guess party from common patterns
            const party = this.guessParty(candidateName)

            await prisma.candidate.create({
              data: {
                raceId: dbRace.id,
                name: candidateName,
                party,
                incumbent: false,
              },
            })
          }
        }

        // Save polls
        for (const poll of race.polls) {
          // Find or create pollster
          let pollster = await prisma.pollster.findUnique({
            where: { slug: poll.pollsterSlug },
          })

          if (!pollster) {
            pollster = await prisma.pollster.create({
              data: {
                name: poll.pollster,
                slug: poll.pollsterSlug,
                pollCount: 0,
              },
            })
          }

          // Check if poll already exists (avoid duplicates)
          const existingPoll = await prisma.poll.findFirst({
            where: {
              raceId: dbRace.id,
              pollsterId: pollster.id,
              pollDate: poll.pollDate,
            },
          })

          if (!existingPoll) {
            await prisma.poll.create({
              data: {
                raceId: dbRace.id,
                pollsterId: pollster.id,
                pollDate: poll.pollDate,
                fieldDateStart: poll.fieldDateStart,
                fieldDateEnd: poll.fieldDateEnd,
                sampleSize: poll.sampleSize,
                methodology: poll.methodology,
                populationType: poll.populationType,
                results: poll.results,
                marginOfError: poll.marginOfError,
                sourceUrl: poll.sourceUrl,
                rawData: poll.rawData,
                isVerified: true,
              },
            })
          }
        }

        console.log(`Saved ${race.polls.length} polls for ${race.name}`)
      } catch (error) {
        console.error(`Error saving race ${race.slug}:`, error)
      }
    }

    console.log('Data save completed')
  }

  /**
   * Guess party affiliation from candidate name
   * This is a naive implementation - ideally would use a lookup table
   */
  private guessParty(name: string): string {
    const democratKeywords = [
      'Biden',
      'Harris',
      'Casey',
      'Rosen',
      'Gallego',
      'Slotkin',
      'Baldwin',
      'Brown',
      'Tester',
    ]
    const republicanKeywords = [
      'Trump',
      'McCormick',
      'Lake',
      'Rogers',
      'Hovde',
      'Moreno',
      'Sheehy',
    ]

    const nameLower = name.toLowerCase()

    if (democratKeywords.some((k) => nameLower.includes(k.toLowerCase()))) {
      return 'D'
    }
    if (republicanKeywords.some((k) => nameLower.includes(k.toLowerCase()))) {
      return 'R'
    }

    return 'I' // Independent/Unknown
  }
}

export * from './types'
