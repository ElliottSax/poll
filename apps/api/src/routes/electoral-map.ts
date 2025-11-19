import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { prisma } from '../utils/prisma'
import { cache } from '../utils/redis'

// Electoral votes by state (2024)
const ELECTORAL_VOTES: Record<string, number> = {
  AL: 9, AK: 3, AZ: 11, AR: 6, CA: 54, CO: 10, CT: 7, DE: 3, FL: 30, GA: 16,
  HI: 4, ID: 4, IL: 19, IN: 11, IA: 6, KS: 6, KY: 8, LA: 8, ME: 4, MD: 10,
  MA: 11, MI: 15, MN: 10, MS: 6, MO: 10, MT: 4, NE: 5, NV: 6, NH: 4, NJ: 14,
  NM: 5, NY: 28, NC: 16, ND: 3, OH: 17, OK: 7, OR: 8, PA: 19, RI: 4, SC: 9,
  SD: 3, TN: 11, TX: 40, UT: 6, VT: 3, VA: 13, WA: 12, WV: 4, WI: 10, WY: 3,
}

// State full names
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

// Battleground states (frequently competitive)
const BATTLEGROUND_STATES = ['PA', 'MI', 'WI', 'AZ', 'GA', 'NV', 'NC']

interface StateResult {
  state: string
  stateCode: string
  electoralVotes: number
  leader: {
    name: string
    party: string
    winProbability: number
  }
  margin: number
  category: 'safe-d' | 'likely-d' | 'lean-d' | 'toss-up' | 'lean-r' | 'likely-r' | 'safe-r'
}

/**
 * Determine category based on win probability
 */
function determineCategory(winProbability: number, party: string): StateResult['category'] {
  const prob = winProbability

  if (party === 'D' || party === 'Democratic') {
    if (prob >= 95) return 'safe-d'
    if (prob >= 80) return 'likely-d'
    if (prob >= 60) return 'lean-d'
    return 'toss-up'
  } else if (party === 'R' || party === 'Republican') {
    if (prob >= 95) return 'safe-r'
    if (prob >= 80) return 'likely-r'
    if (prob >= 60) return 'lean-r'
    return 'toss-up'
  }

  return 'toss-up'
}

export async function electoralMapRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  /**
   * Get electoral map data for presidential race
   */
  fastify.get('/presidential', {
    schema: {
      description: 'Get electoral map data for presidential race',
      tags: ['electoral-map'],
      response: {
        200: {
          type: 'object',
          properties: {
            states: { type: 'array' },
            democraticTotal: { type: 'number' },
            republicanTotal: { type: 'number' },
            lastUpdated: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const cacheKey = 'electoral-map:presidential'
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get all presidential races
        const races = await prisma.race.findMany({
          where: {
            raceType: 'president',
            status: { in: ['active', 'upcoming'] },
          },
          include: {
            forecasts: {
              take: 1,
              orderBy: { forecastDate: 'desc' },
              include: {
                results: {
                  include: {
                    candidate: true,
                  },
                },
              },
            },
          },
        })

        const stateResults: StateResult[] = []
        let lastUpdated = new Date(0)

        // Process each race
        for (const race of races) {
          const stateCode = race.state
          const forecast = race.forecasts[0]

          if (!forecast || !forecast.results.length) {
            continue
          }

          // Update last updated timestamp
          if (forecast.forecastDate > lastUpdated) {
            lastUpdated = forecast.forecastDate
          }

          // Find the leading candidate
          const sortedResults = forecast.results.sort(
            (a, b) => b.winProbability - a.winProbability
          )
          const leader = sortedResults[0]
          const runnerUp = sortedResults[1]

          if (!leader || !leader.candidate) {
            continue
          }

          const margin = runnerUp
            ? Math.abs(leader.voteShare - runnerUp.voteShare)
            : leader.voteShare

          const category = determineCategory(leader.winProbability, leader.candidate.party)

          stateResults.push({
            state: STATE_NAMES[stateCode] || stateCode,
            stateCode,
            electoralVotes: ELECTORAL_VOTES[stateCode] || 0,
            leader: {
              name: leader.candidate.name,
              party: leader.candidate.party,
              winProbability: leader.winProbability,
            },
            margin,
            category,
          })
        }

        // Calculate totals
        const democraticTotal = stateResults
          .filter(s => s.leader.party === 'D' || s.leader.party === 'Democratic')
          .reduce((sum, s) => sum + s.electoralVotes, 0)

        const republicanTotal = stateResults
          .filter(s => s.leader.party === 'R' || s.leader.party === 'Republican')
          .reduce((sum, s) => sum + s.electoralVotes, 0)

        const response = {
          states: stateResults,
          democraticTotal,
          republicanTotal,
          lastUpdated: lastUpdated.toISOString(),
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, response, 600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })

  /**
   * Get battleground states only
   */
  fastify.get('/battleground', {
    schema: {
      description: 'Get electoral map data for battleground states',
      tags: ['electoral-map'],
    },
    handler: async (request, reply) => {
      try {
        const cacheKey = 'electoral-map:battleground'
        const cached = await cache.get(cacheKey)
        if (cached) {
          return reply.send(cached)
        }

        // Get battleground presidential races
        const races = await prisma.race.findMany({
          where: {
            raceType: 'president',
            state: { in: BATTLEGROUND_STATES },
            status: { in: ['active', 'upcoming'] },
          },
          include: {
            forecasts: {
              take: 1,
              orderBy: { forecastDate: 'desc' },
              include: {
                results: {
                  include: {
                    candidate: true,
                  },
                },
              },
            },
          },
        })

        const stateResults: StateResult[] = []
        let lastUpdated = new Date(0)

        // Process each race
        for (const race of races) {
          const stateCode = race.state
          const forecast = race.forecasts[0]

          if (!forecast || !forecast.results.length) {
            continue
          }

          if (forecast.forecastDate > lastUpdated) {
            lastUpdated = forecast.forecastDate
          }

          const sortedResults = forecast.results.sort(
            (a, b) => b.winProbability - a.winProbability
          )
          const leader = sortedResults[0]
          const runnerUp = sortedResults[1]

          if (!leader || !leader.candidate) {
            continue
          }

          const margin = runnerUp
            ? Math.abs(leader.voteShare - runnerUp.voteShare)
            : leader.voteShare

          const category = determineCategory(leader.winProbability, leader.candidate.party)

          stateResults.push({
            state: STATE_NAMES[stateCode] || stateCode,
            stateCode,
            electoralVotes: ELECTORAL_VOTES[stateCode] || 0,
            leader: {
              name: leader.candidate.name,
              party: leader.candidate.party,
              winProbability: leader.winProbability,
            },
            margin,
            category,
          })
        }

        const response = {
          states: stateResults,
          lastUpdated: lastUpdated.toISOString(),
        }

        // Cache for 10 minutes
        await cache.set(cacheKey, response, 600)

        return reply.send(response)
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({ error: 'Internal server error' })
      }
    },
  })
}
