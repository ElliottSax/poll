/**
 * Poll Aggregation Service
 *
 * Calculates weighted poll averages using:
 * - Recency weighting (exponential decay)
 * - Sample size weighting
 * - Pollster quality weighting
 */

import { prisma } from '../utils/prisma'

interface AggregatedPollResult {
  raceId: string
  candidateResults: {
    candidate: string
    average: number
    trend: number
    pollCount: number
  }[]
  lastUpdated: Date
  pollsIncluded: number
}

export class PollAggregationService {
  /**
   * Calculate weighted poll average for a race
   */
  async aggregateRacePolls(raceId: string): Promise<AggregatedPollResult> {
    // Fetch recent polls (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const polls = await prisma.poll.findMany({
      where: {
        raceId,
        pollDate: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        pollster: true,
      },
      orderBy: {
        pollDate: 'desc',
      },
    })

    if (polls.length === 0) {
      return {
        raceId,
        candidateResults: [],
        lastUpdated: new Date(),
        pollsIncluded: 0,
      }
    }

    // Calculate weighted averages
    const candidateData: Map<string, { weightedSum: number; totalWeight: number; count: number }> = new Map()

    for (const poll of polls) {
      const weight = this.calculatePollWeight(poll)
      const results = poll.results as Record<string, number>

      for (const [candidate, percentage] of Object.entries(results)) {
        if (!candidateData.has(candidate)) {
          candidateData.set(candidate, { weightedSum: 0, totalWeight: 0, count: 0 })
        }

        const data = candidateData.get(candidate)!
        data.weightedSum += percentage * weight
        data.totalWeight += weight
        data.count += 1
      }
    }

    // Calculate final averages
    const candidateResults = Array.from(candidateData.entries()).map(([candidate, data]) => ({
      candidate,
      average: data.totalWeight > 0 ? data.weightedSum / data.totalWeight : 0,
      trend: 0, // TODO: Calculate trend from previous period
      pollCount: data.count,
    }))

    // Sort by average descending
    candidateResults.sort((a, b) => b.average - a.average)

    return {
      raceId,
      candidateResults,
      lastUpdated: new Date(),
      pollsIncluded: polls.length,
    }
  }

  /**
   * Calculate weight for a single poll
   */
  private calculatePollWeight(poll: any): number {
    const recencyWeight = this.calculateRecencyWeight(new Date(poll.pollDate))
    const sampleWeight = this.calculateSampleWeight(poll.sampleSize || 1000)
    const pollsterWeight = this.getPollsterQualityWeight(poll.pollster)

    return recencyWeight * sampleWeight * pollsterWeight
  }

  /**
   * Calculate recency weight using exponential decay
   * Half-life of 30 days
   */
  private calculateRecencyWeight(pollDate: Date): number {
    const daysOld = (Date.now() - pollDate.getTime()) / (1000 * 60 * 60 * 24)

    // Exponential decay with half-life of 30 days
    const halfLife = 30
    const decayConstant = Math.log(2) / halfLife

    return Math.exp(-decayConstant * daysOld)
  }

  /**
   * Calculate sample size weight
   * Diminishing returns for larger samples
   */
  private calculateSampleWeight(sampleSize: number): number {
    // Square root weighting - larger samples get more weight, but with diminishing returns
    // Normalize to baseline of 1000 respondents
    return Math.sqrt(sampleSize / 1000)
  }

  /**
   * Get pollster quality weight based on grade and accuracy
   */
  private getPollsterQualityWeight(pollster: any): number {
    if (!pollster) return 1.0

    // Use accuracy score if available
    if (pollster.accuracyScore) {
      return pollster.accuracyScore
    }

    // Otherwise use grade
    const gradeWeights: Record<string, number> = {
      'A+': 1.0,
      'A': 0.95,
      'A-': 0.90,
      'B+': 0.85,
      'B': 0.80,
      'B-': 0.75,
      'C+': 0.70,
      'C': 0.65,
      'C-': 0.60,
      'D': 0.50,
      'F': 0.40,
    }

    return gradeWeights[pollster.grade] || 0.75
  }

  /**
   * Calculate trend (change from previous week)
   */
  async calculateTrend(raceId: string, candidate: string): Promise<number> {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    // Get current week average
    const currentWeekPolls = await prisma.poll.findMany({
      where: {
        raceId,
        pollDate: { gte: oneWeekAgo },
      },
    })

    // Get previous week average
    const previousWeekPolls = await prisma.poll.findMany({
      where: {
        raceId,
        pollDate: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo,
        },
      },
    })

    const currentAvg = this.simpleAverage(currentWeekPolls, candidate)
    const previousAvg = this.simpleAverage(previousWeekPolls, candidate)

    return currentAvg - previousAvg
  }

  /**
   * Simple average helper
   */
  private simpleAverage(polls: any[], candidate: string): number {
    if (polls.length === 0) return 0

    let sum = 0
    let count = 0

    for (const poll of polls) {
      const results = poll.results as Record<string, number>
      if (results[candidate] !== undefined) {
        sum += results[candidate]
        count += 1
      }
    }

    return count > 0 ? sum / count : 0
  }
}
