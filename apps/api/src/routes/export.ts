/**
 * Export Routes
 *
 * GET /api/export/races - Export races as CSV/JSON
 * GET /api/export/polls - Export polls as CSV/JSON
 * GET /api/export/pollsters - Export pollsters as CSV/JSON
 */

import { FastifyInstance } from 'fastify'
import { prisma, RaceType, RaceStatus } from '@poll/database'
import { z } from 'zod'

const exportRacesSchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  type: z.nativeEnum(RaceType).optional(),
  status: z.nativeEnum(RaceStatus).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
})

const exportPollsSchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(5000).default(500),
})

const exportPollustersSchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
})

function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ''

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create CSV header row
  const headerRow = csvHeaders.join(',')

  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header]
      // Handle special cases
      if (value === null || value === undefined) return ''

      // For objects, stringify and properly escape
      if (typeof value === 'object') {
        const stringified = JSON.stringify(value)
        return `"${stringified.replace(/"/g, '""')}"`
      }

      // For strings, check if escaping is needed (comma, quote, or newline)
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      return value
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export async function exportRoutes(server: FastifyInstance) {
  // ============================================
  // GET /api/export/races - Export races
  // ============================================
  server.get('/races', {
    schema: {
      tags: ['export'],
      description: 'Export election races as CSV or JSON',
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['csv', 'json'], default: 'json' },
          type: { type: 'string', enum: Object.values(RaceType) },
          status: { type: 'string', enum: Object.values(RaceStatus) },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const query = exportRacesSchema.parse(request.query)

    const where: any = {}
    if (query.type) where.raceType = query.type
    if (query.status) where.status = query.status

    const races = await prisma.race.findMany({
      where,
      take: query.limit,
      orderBy: [
        { electionDate: 'desc' },
        { importanceScore: 'desc' },
      ],
      select: {
        id: true,
        raceType: true,
        raceName: true,
        slug: true,
        state: true,
        electionDate: true,
        status: true,
        currentLeader: true,
        competitiveRating: true,
        importanceScore: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (query.format === 'csv') {
      const csv = convertToCSV(races.map(r => ({
        id: r.id,
        raceType: r.raceType,
        raceName: r.raceName,
        slug: r.slug,
        state: r.state,
        electionDate: r.electionDate,
        status: r.status,
        currentLeader: r.currentLeader,
        competitiveRating: r.competitiveRating,
        importanceScore: r.importanceScore,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })))

      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', `attachment; filename="races-${new Date().toISOString().split('T')[0]}.csv"`)
      return csv
    }

    reply.header('Content-Type', 'application/json')
    reply.header('Content-Disposition', `attachment; filename="races-${new Date().toISOString().split('T')[0]}.json"`)
    return { races, total: races.length, exportedAt: new Date().toISOString() }
  })

  // ============================================
  // GET /api/export/polls - Export polls
  // ============================================
  server.get('/polls', {
    schema: {
      tags: ['export'],
      description: 'Export polls as CSV or JSON',
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['csv', 'json'], default: 'json' },
          fromDate: { type: 'string' },
          toDate: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 5000, default: 500 },
        },
      },
    },
  }, async (request, reply) => {
    const query = exportPollsSchema.parse(request.query)

    const where: any = {}
    if (query.fromDate || query.toDate) {
      where.pollDate = {}
      if (query.fromDate) where.pollDate.gte = new Date(query.fromDate)
      if (query.toDate) where.pollDate.lte = new Date(query.toDate)
    }

    const polls = await prisma.poll.findMany({
      where,
      take: query.limit,
      orderBy: { pollDate: 'desc' },
      include: {
        pollster: {
          select: {
            name: true,
            slug: true,
            methodologyGrade: true,
          },
        },
        race: {
          select: {
            raceName: true,
            slug: true,
            raceType: true,
          },
        },
      },
    })

    if (query.format === 'csv') {
      const csv = convertToCSV(polls.map(p => ({
        id: p.id,
        raceName: p.race.raceName,
        raceType: p.race.raceType,
        pollster: p.pollster.name,
        pollDate: p.pollDate,
        sampleSize: p.sampleSize,
        methodology: p.methodology,
        populationType: p.populationType,
        marginOfError: p.marginOfError,
        results: JSON.stringify(p.results),
        createdAt: p.createdAt,
      })))

      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', `attachment; filename="polls-${new Date().toISOString().split('T')[0]}.csv"`)
      return csv
    }

    reply.header('Content-Type', 'application/json')
    reply.header('Content-Disposition', `attachment; filename="polls-${new Date().toISOString().split('T')[0]}.json"`)
    return { polls, total: polls.length, exportedAt: new Date().toISOString() }
  })

  // ============================================
  // GET /api/export/pollsters - Export pollsters
  // ============================================
  server.get('/pollsters', {
    schema: {
      tags: ['export'],
      description: 'Export pollsters as CSV or JSON',
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['csv', 'json'], default: 'json' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const query = exportPollustersSchema.parse(request.query)

    const pollsters = await prisma.pollster.findMany({
      take: query.limit,
      orderBy: { overallAccuracy: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        organization: true,
        website: true,
        overallAccuracy: true,
        methodologyGrade: true,
        transparencyScore: true,
        partisanLean: true,
        pollCount: true,
        lastPollDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (query.format === 'csv') {
      const csv = convertToCSV(pollsters)

      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', `attachment; filename="pollsters-${new Date().toISOString().split('T')[0]}.csv"`)
      return csv
    }

    reply.header('Content-Type', 'application/json')
    reply.header('Content-Disposition', `attachment; filename="pollsters-${new Date().toISOString().split('T')[0]}.json"`)
    return { pollsters, total: pollsters.length, exportedAt: new Date().toISOString() }
  })
}
