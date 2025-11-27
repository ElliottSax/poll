import { z } from 'zod'

/**
 * Centralized validation schemas for API endpoints
 * Using Zod for runtime validation and type inference
 */

// Common schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const dateSchema = z.string().datetime('Invalid datetime format')
export const paginationSchema = {
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
}

// Poll schemas
export const pollMethodology = z.enum(['phone', 'online', 'ivr', 'sms', 'mixed'])
export const populationType = z.enum(['rv', 'lv', 'a'])

export const getPollsQuerySchema = z.object({
  raceId: uuidSchema.optional(),
  pollsterId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  methodology: pollMethodology.optional(),
  limit: paginationSchema.limit,
  offset: paginationSchema.offset,
})

export const pollIdParamSchema = z.object({
  id: uuidSchema,
})

export const createPollSchema = z.object({
  raceId: uuidSchema,
  pollsterId: uuidSchema,
  pollDate: dateSchema,
  fieldDateStart: dateSchema.optional(),
  fieldDateEnd: dateSchema.optional(),
  sampleSize: z.number().int().positive().optional(),
  methodology: pollMethodology.optional(),
  populationType: populationType.optional(),
  results: z.record(z.string(), z.number()),
  marginOfError: z.number().positive().optional(),
  confidenceLevel: z.number().min(0).max(100).optional(),
  sourceUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  isPartisan: z.boolean().default(false),
  isOutlier: z.boolean().default(false),
  isVerified: z.boolean().default(false),
})

export const updatePollSchema = createPollSchema.partial()

// Race schemas
export const raceType = z.enum(['president', 'senate', 'house', 'governor', 'mayor'])
export const raceStatus = z.enum(['upcoming', 'active', 'completed'])
export const competitiveRating = z.enum([
  'safe_d',
  'likely_d',
  'lean_d',
  'tossup',
  'lean_r',
  'likely_r',
  'safe_r',
])

export const getRacesQuerySchema = z.object({
  type: raceType.optional(),
  state: z.string().length(2).optional(), // State code
  status: raceStatus.optional(),
  limit: paginationSchema.limit,
  offset: paginationSchema.offset,
})

export const raceSlugParamSchema = z.object({
  slug: z.string().min(1).max(200),
})

export const createRaceSchema = z.object({
  slug: z.string().min(1).max(200),
  raceType,
  raceName: z.string().min(1).max(500),
  country: z.string().length(3), // Country code
  state: z.string().length(2).optional(),
  district: z.string().max(50).optional(),
  county: z.string().max(100).optional(),
  electionDate: dateSchema,
  isSpecialElection: z.boolean().default(false),
  status: raceStatus,
  competitiveRating: competitiveRating.optional(),
  importanceScore: z.number().min(0).max(100).optional(),
  electoralVotes: z.number().int().positive().optional(),
  description: z.string().max(2000).optional(),
})

export const updateRaceSchema = createRaceSchema.partial()

// Pollster schemas
export const getPollstersQuerySchema = z.object({
  orderBy: z.enum(['accuracy', 'pollCount', 'grade', 'name']).optional(),
  limit: paginationSchema.limit,
  offset: paginationSchema.offset,
})

export const pollsterSlugParamSchema = z.object({
  slug: z.string().min(1).max(200),
})

export const createPollsterSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  organization: z.string().max(200).optional(),
  website: z.string().url().optional(),
  overallAccuracy: z.number().min(0).max(100).optional(),
  methodologyGrade: z.string().max(10).optional(),
  transparencyScore: z.number().min(0).max(100).optional(),
  sampleSizeAvg: z.number().int().positive().optional(),
  partisanLean: z.string().max(50).optional(),
})

export const updatePollsterSchema = createPollsterSchema.partial()

// Forecast schemas
export const getForecastQuerySchema = z.object({
  raceId: uuidSchema.optional(),
  modelVersion: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  limit: paginationSchema.limit,
  offset: paginationSchema.offset,
})

export const createForecastSchema = z.object({
  raceId: uuidSchema,
  forecastDate: dateSchema,
  modelVersion: z.string().min(1).max(50),
  probabilities: z.record(z.string(), z.number().min(0).max(100)),
  predictedMargins: z.record(z.string(), z.string()),
  predictedVoteShare: z.record(z.string(), z.number().min(0).max(100)),
  confidenceIntervals: z.record(z.string(), z.any()).optional(),
  simulationsRun: z.number().int().positive(),
  volatilityIndex: z.number().min(0).optional(),
  contributingPolls: z.number().int().positive().optional(),
  pollQualityScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
})

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
})

export const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notificationPreferences: z.record(z.string(), z.any()).optional(),
})

// Export TypeScript types inferred from schemas
export type GetPollsQuery = z.infer<typeof getPollsQuerySchema>
export type CreatePollInput = z.infer<typeof createPollSchema>
export type UpdatePollInput = z.infer<typeof updatePollSchema>
export type GetRacesQuery = z.infer<typeof getRacesQuerySchema>
export type CreateRaceInput = z.infer<typeof createRaceSchema>
export type UpdateRaceInput = z.infer<typeof updateRaceSchema>
export type GetPollstersQuery = z.infer<typeof getPollstersQuerySchema>
export type CreatePollsterInput = z.infer<typeof createPollsterSchema>
export type UpdatePollsterInput = z.infer<typeof updatePollsterSchema>
export type GetForecastQuery = z.infer<typeof getForecastQuerySchema>
export type CreateForecastInput = z.infer<typeof createForecastSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
