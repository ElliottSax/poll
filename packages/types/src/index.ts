// Common types shared across frontend and backend

export type RaceType = 'president' | 'senate' | 'house' | 'governor' | 'mayor'
export type RaceStatus = 'upcoming' | 'active' | 'completed'
export type CompetitiveRating =
  | 'safe_d'
  | 'likely_d'
  | 'lean_d'
  | 'tossup'
  | 'lean_r'
  | 'likely_r'
  | 'safe_r'
export type Methodology = 'phone' | 'online' | 'ivr' | 'sms' | 'mixed'
export type PopulationType = 'rv' | 'lv' | 'a'
export type Party = 'D' | 'R' | 'I' | 'L' | 'G' | 'Other'

// Candidate
export interface Candidate {
  id: string
  name: string
  party: Party
  incumbent?: boolean
  imageUrl?: string
}

// Race
export interface Race {
  id: string
  slug: string
  raceType: RaceType
  raceName: string
  country: string
  state?: string
  district?: string
  county?: string
  electionDate: Date | string
  isSpecialElection: boolean
  candidates: Candidate[]
  status: RaceStatus
  currentLeader?: string
  currentMargin?: number
  competitiveRating?: CompetitiveRating
  importanceScore?: number
  electoralVotes?: number
  description?: string
  createdAt: Date | string
  updatedAt: Date | string
}

// Pollster
export interface Pollster {
  id: string
  name: string
  slug: string
  organization?: string
  website?: string
  overallAccuracy?: number
  methodologyGrade?: string
  transparencyScore?: number
  sampleSizeAvg?: number
  partisanLean?: string
  houseEffect?: Record<string, any>
  pollCount: number
  firstPollDate?: Date | string
  lastPollDate?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

// Poll Results (flexible JSONB structure)
export interface PollResults {
  [candidateName: string]: number
}

// Poll
export interface Poll {
  id: string
  raceId: string
  pollsterId: string
  pollDate: Date | string
  fieldDateStart?: Date | string
  fieldDateEnd?: Date | string
  sampleSize?: number
  methodology?: Methodology
  populationType?: PopulationType
  partisanAffiliation?: string
  transparencyScore?: number
  historicalAccuracy?: number
  results: PollResults
  crosstabs?: Record<string, any>
  marginOfError?: number
  confidenceLevel?: number
  calculatedWeight?: number
  sourceUrl?: string
  pdfUrl?: string
  rawData?: Record<string, any>
  isPartisan: boolean
  isOutlier: boolean
  isVerified: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// Forecast
export interface Forecast {
  id: string
  raceId: string
  forecastDate: Date | string
  modelVersion: string
  probabilities: Record<string, number>
  predictedMargins: Record<string, string>
  predictedVoteShare: Record<string, number>
  confidenceIntervals?: Record<string, any>
  simulationsRun: number
  volatilityIndex?: number
  winProbabilityChange?: number
  contributingPolls?: number
  pollQualityScore?: number
  oldestPollDays?: number
  newestPollDays?: number
  electoralVotesExpected?: Record<string, number>
  notes?: string
  createdAt: Date | string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    limit?: number
    offset?: number
    hasMore?: boolean
  }
}

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

// User
export interface User {
  id: string
  email: string
  emailVerified: boolean
  username?: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  trackedRaces: string[]
  notificationPreferences: Record<string, any>
  theme: string
  predictionScore: number
  correctPredictions: number
  totalPredictions: number
  rank?: number
  league: string
  subscriptionTier: string
  subscriptionStatus?: string
  role: string
  isVerified: boolean
  isBanned: boolean
  createdAt: Date | string
  updatedAt: Date | string
  lastLogin?: Date | string
}

// Scenario
export interface Scenario {
  id: string
  userId?: string
  title: string
  description?: string
  pollAdjustments: Record<string, any>
  electoralCollegeResult?: Record<string, number>
  senateResult?: Record<string, number>
  houseResult?: Record<string, number>
  views: number
  likes: number
  shares: number
  isPublic: boolean
  isFeatured: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// Prediction
export interface Prediction {
  id: string
  userId: string
  raceId: string
  predictedWinner: string
  predictedMargin?: number
  predictedVoteShare?: Record<string, number>
  confidenceLevel?: number
  pointsWagered: number
  isCorrect?: boolean
  pointsWon?: number
  predictedAt: Date | string
  lockedAt?: Date | string
  resolvedAt?: Date | string
}
