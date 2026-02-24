/**
 * Polling Service - Orchestrates poll scraping, normalization, and storage
 *
 * This service coordinates:
 * - Fetching polls from multiple sources (RCP, 538, etc.)
 * - Normalizing data to a consistent format
 * - Saving to database with proper relationships
 * - Triggering cache invalidation
 * - Generating forecasts after new data
 */

import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'
import { pollScraper, ScrapedPoll } from './pollScraper'

// Race configurations for scraping
export interface RaceConfig {
  slug: string
  name: string
  raceType: 'president' | 'senate' | 'house' | 'governor'
  state?: string
  rcpUrl?: string
  fteSlug?: string
  candidates: { name: string; party: string }[]
  electionDate: Date
}

// Predefined race configurations for 2024
export const RACE_CONFIGS: RaceConfig[] = [
  {
    slug: 'president-2024',
    name: '2024 Presidential Election',
    raceType: 'president',
    rcpUrl: 'https://www.realclearpolling.com/polls/president/general/2024/trump-vs-harris',
    fteSlug: 'president-general',
    candidates: [
      { name: 'Donald Trump', party: 'R' },
      { name: 'Kamala Harris', party: 'D' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-az-2024',
    name: 'Arizona Senate 2024',
    raceType: 'senate',
    state: 'AZ',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/arizona/gallego-vs-lake',
    candidates: [
      { name: 'Ruben Gallego', party: 'D' },
      { name: 'Kari Lake', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-pa-2024',
    name: 'Pennsylvania Senate 2024',
    raceType: 'senate',
    state: 'PA',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/pennsylvania/casey-vs-mccormick',
    candidates: [
      { name: 'Bob Casey', party: 'D' },
      { name: 'Dave McCormick', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-mi-2024',
    name: 'Michigan Senate 2024',
    raceType: 'senate',
    state: 'MI',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/michigan/slotkin-vs-rogers',
    candidates: [
      { name: 'Elissa Slotkin', party: 'D' },
      { name: 'Mike Rogers', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-wi-2024',
    name: 'Wisconsin Senate 2024',
    raceType: 'senate',
    state: 'WI',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/wisconsin/baldwin-vs-hovde',
    candidates: [
      { name: 'Tammy Baldwin', party: 'D' },
      { name: 'Eric Hovde', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-nv-2024',
    name: 'Nevada Senate 2024',
    raceType: 'senate',
    state: 'NV',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/nevada/rosen-vs-brown',
    candidates: [
      { name: 'Jacky Rosen', party: 'D' },
      { name: 'Sam Brown', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-oh-2024',
    name: 'Ohio Senate 2024',
    raceType: 'senate',
    state: 'OH',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/ohio/brown-vs-moreno',
    candidates: [
      { name: 'Sherrod Brown', party: 'D' },
      { name: 'Bernie Moreno', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
  {
    slug: 'senate-mt-2024',
    name: 'Montana Senate 2024',
    raceType: 'senate',
    state: 'MT',
    rcpUrl: 'https://www.realclearpolling.com/polls/senate/general/2024/montana/tester-vs-sheehy',
    candidates: [
      { name: 'Jon Tester', party: 'D' },
      { name: 'Tim Sheehy', party: 'R' },
    ],
    electionDate: new Date('2024-11-05'),
  },
]

// Pollster quality grades (from 538's pollster ratings)
const POLLSTER_GRADES: Record<string, string> = {
  'Monmouth University': 'A+',
  'Marquette University': 'A+',
  'Siena College': 'A+',
  'ABC News/Washington Post': 'A+',
  'Marist College': 'A',
  'Quinnipiac University': 'A',
  'CNN/SSRS': 'A',
  'Fox News': 'A',
  'CBS News/YouGov': 'A-',
  'NBC News/Marist': 'A',
  'New York Times/Siena': 'A+',
  'Emerson College': 'A-',
  'Morning Consult': 'B+',
  'YouGov': 'B+',
  'SurveyUSA': 'A-',
  'Ipsos': 'B+',
  'Rasmussen Reports': 'C+',
  'Trafalgar Group': 'C-',
  'InsiderAdvantage': 'C',
  'McLaughlin & Associates': 'C-',
  'AtlasIntel': 'B',
  'Data for Progress': 'B',
  'Redfield & Wilton': 'B-',
}

export class PollingService {
  /**
   * Ensure a race exists in the database, create if not
   */
  async ensureRace(config: RaceConfig): Promise<string> {
    let race = await prisma.race.findUnique({
      where: { slug: config.slug },
    })

    if (!race) {
      race = await prisma.race.create({
        data: {
          slug: config.slug,
          raceName: config.name,
          raceType: config.raceType,
          country: 'USA',
          state: config.state,
          electionDate: config.electionDate,
          status: 'active',
          candidates: {
            create: config.candidates.map((c) => ({
              name: c.name,
              party: c.party,
            })),
          },
        },
      })
      logger.info({ slug: config.slug }, 'Created new race')
    }

    return race.id
  }

  /**
   * Ensure a pollster exists in the database, create if not
   */
  async ensurePollster(name: string): Promise<string> {
    const normalizedName = pollScraper.normalizePollster(name)
    const slug = this.slugify(normalizedName)

    let pollster = await prisma.pollster.findUnique({
      where: { slug },
    })

    if (!pollster) {
      pollster = await prisma.pollster.create({
        data: {
          name: normalizedName,
          slug,
          methodologyGrade: POLLSTER_GRADES[normalizedName] || null,
        },
      })
      logger.info({ name: normalizedName, slug }, 'Created new pollster')
    }

    return pollster.id
  }

  /**
   * Convert a name to a URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Check if a poll already exists (deduplication)
   */
  async pollExists(
    raceId: string,
    pollsterId: string,
    pollDate: Date
  ): Promise<boolean> {
    const existing = await prisma.poll.findFirst({
      where: {
        raceId,
        pollsterId,
        pollDate: {
          gte: new Date(pollDate.getTime() - 86400000), // Within 1 day
          lte: new Date(pollDate.getTime() + 86400000),
        },
      },
    })
    return !!existing
  }

  /**
   * Save a scraped poll to the database
   */
  async savePoll(
    poll: ScrapedPoll,
    raceId: string,
    raceConfig: RaceConfig
  ): Promise<string | null> {
    try {
      const pollsterId = await this.ensurePollster(poll.pollster)
      const pollDate = new Date(pollScraper.parseDate(poll.pollDate))

      // Check for duplicates
      if (await this.pollExists(raceId, pollsterId, pollDate)) {
        logger.debug(
          { pollster: poll.pollster, date: poll.pollDate },
          'Poll already exists, skipping'
        )
        return null
      }

      // Map generic candidate keys to actual candidate names
      const results: Record<string, number> = {}
      const candidateKeys = Object.keys(poll.results)

      for (let i = 0; i < candidateKeys.length && i < raceConfig.candidates.length; i++) {
        const candidateName = raceConfig.candidates[i].name
        const value = poll.results[candidateKeys[i]]
        if (typeof value === 'number' && !isNaN(value)) {
          results[candidateName] = value
        }
      }

      // Only save if we have valid results
      if (Object.keys(results).length === 0) {
        logger.warn({ poll }, 'No valid results found in poll')
        return null
      }

      const savedPoll = await prisma.poll.create({
        data: {
          raceId,
          pollsterId,
          pollDate,
          sampleSize: poll.sampleSize || null,
          methodology: poll.methodology || pollScraper.guessMethodology(poll.pollster),
          marginOfError: poll.marginOfError || null,
          results,
          sourceUrl: poll.sourceUrl,
          populationType: 'lv', // Assume likely voters for general election polls
        },
      })

      logger.info(
        {
          pollId: savedPoll.id,
          pollster: poll.pollster,
          date: poll.pollDate,
          results,
        },
        'Saved poll to database'
      )

      return savedPoll.id
    } catch (error) {
      logger.error({ error, poll }, 'Error saving poll')
      return null
    }
  }

  /**
   * Scrape and save polls for a specific race
   */
  async scrapeRace(config: RaceConfig): Promise<number> {
    let savedCount = 0

    try {
      const raceId = await this.ensureRace(config)

      // Scrape from RealClearPolitics
      if (config.rcpUrl) {
        try {
          const rcpPolls = await pollScraper.scrapeRCP(config.rcpUrl)
          for (const poll of rcpPolls) {
            const saved = await this.savePoll(poll, raceId, config)
            if (saved) savedCount++
          }
        } catch (error) {
          logger.error({ error, source: 'RCP', race: config.slug }, 'RCP scrape failed')
        }
      }

      // Scrape from FiveThirtyEight
      if (config.fteSlug) {
        try {
          const ftePolls = await pollScraper.scrape538(config.fteSlug)
          for (const poll of ftePolls) {
            const saved = await this.savePoll(poll, raceId, config)
            if (saved) savedCount++
          }
        } catch (error) {
          logger.error({ error, source: '538', race: config.slug }, '538 scrape failed')
        }
      }

      // Update race with latest data
      await this.updateRaceAggregates(raceId)

      // Invalidate relevant caches
      // Cache invalidation removed (no-op cache in MVP)

      logger.info({ race: config.slug, savedCount }, 'Race scrape completed')
    } catch (error) {
      logger.error({ error, race: config.slug }, 'Error scraping race')
    }

    return savedCount
  }

  /**
   * Update race aggregates based on recent polls
   */
  async updateRaceAggregates(raceId: string): Promise<void> {
    // Get recent polls (last 30 days)
    const recentPolls = await prisma.poll.findMany({
      where: {
        raceId,
        pollDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { pollDate: 'desc' },
      take: 20,
    })

    if (recentPolls.length === 0) return

    // Calculate weighted averages
    const candidateTotals: Record<string, { sum: number; weight: number }> = {}

    for (const poll of recentPolls) {
      const results = poll.results as Record<string, number>
      const daysOld = (Date.now() - poll.pollDate.getTime()) / (24 * 60 * 60 * 1000)
      const recencyWeight = Math.exp(-0.693 * daysOld / 14) // 14-day half-life
      const sampleWeight = poll.sampleSize ? Math.sqrt(poll.sampleSize / 800) : 1

      const weight = recencyWeight * sampleWeight

      for (const [candidate, percentage] of Object.entries(results)) {
        if (!candidateTotals[candidate]) {
          candidateTotals[candidate] = { sum: 0, weight: 0 }
        }
        candidateTotals[candidate].sum += percentage * weight
        candidateTotals[candidate].weight += weight
      }
    }

    // Calculate averages and find leader
    const averages: Record<string, number> = {}
    for (const [candidate, data] of Object.entries(candidateTotals)) {
      averages[candidate] = data.sum / data.weight
    }

    const sortedCandidates = Object.entries(averages).sort((a, b) => b[1] - a[1])
    const leader = sortedCandidates[0]?.[0]
    const margin = sortedCandidates.length >= 2
      ? sortedCandidates[0][1] - sortedCandidates[1][1]
      : 0

    // Determine competitive rating
    let rating = 'tossup'
    if (margin > 10) rating = leader?.includes('D') ? 'safe_d' : 'safe_r'
    else if (margin > 6) rating = leader?.includes('D') ? 'likely_d' : 'likely_r'
    else if (margin > 3) rating = leader?.includes('D') ? 'lean_d' : 'lean_r'

    // Update race
    await prisma.race.update({
      where: { id: raceId },
      data: {
        currentLeader: leader,
        currentMargin: margin,
        competitiveRating: rating,
      },
    })

    logger.info({ raceId, leader, margin, rating }, 'Updated race aggregates')
  }

  /**
   * Scrape all configured races
   */
  async scrapeAllRaces(): Promise<{ total: number; byRace: Record<string, number> }> {
    const results: Record<string, number> = {}
    let total = 0

    for (const config of RACE_CONFIGS) {
      const count = await this.scrapeRace(config)
      results[config.slug] = count
      total += count
    }

    // Cache invalidation removed (no-op cache in MVP)

    logger.info({ total, results }, 'All races scraped')

    return { total, byRace: results }
  }

  /**
   * Get scraping status and statistics
   */
  async getScrapingStats(): Promise<{
    totalPolls: number
    totalRaces: number
    totalPollsters: number
    lastUpdate: Date | null
    pollsByRace: Record<string, number>
  }> {
    const [totalPolls, totalRaces, totalPollsters, lastPoll] = await Promise.all([
      prisma.poll.count(),
      prisma.race.count(),
      prisma.pollster.count(),
      prisma.poll.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ])

    const pollsByRace = await prisma.poll.groupBy({
      by: ['raceId'],
      _count: true,
    })

    const races = await prisma.race.findMany({
      select: { id: true, slug: true },
    })

    const raceIdToSlug = new Map(races.map((r) => [r.id, r.slug]))
    const pollsByRaceMap: Record<string, number> = {}
    for (const item of pollsByRace) {
      const slug = raceIdToSlug.get(item.raceId) || item.raceId
      pollsByRaceMap[slug] = item._count
    }

    return {
      totalPolls,
      totalRaces,
      totalPollsters,
      lastUpdate: lastPoll?.createdAt || null,
      pollsByRace: pollsByRaceMap,
    }
  }
}

// Export singleton
export const pollingService = new PollingService()
