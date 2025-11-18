/**
 * Environment Configuration
 *
 * Validates and exports environment variables
 */

import { config as loadEnv } from 'dotenv'

// Load .env file
loadEnv()

interface Config {
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: number
  HOST: string
  LOG_LEVEL: string

  // CORS
  ALLOWED_ORIGINS: string[]

  // Rate Limiting
  RATE_LIMIT_MAX: number
  RATE_LIMIT_WINDOW: number

  // Redis (optional)
  REDIS_URL?: string

  // Database (from @poll/database package)
  DATABASE_URL: string
}

function validateEnv(): Config {
  const NODE_ENV = (process.env.NODE_ENV || 'development') as Config['NODE_ENV']
  const PORT = parseInt(process.env.API_PORT || process.env.PORT || '3001', 10)
  const HOST = process.env.API_HOST || 'localhost'
  const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'development' ? 'debug' : 'info')

  // CORS
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001']

  // Rate Limiting
  const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)

  // Redis (optional)
  const REDIS_URL = process.env.REDIS_URL

  // Database
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  return {
    NODE_ENV,
    PORT,
    HOST,
    LOG_LEVEL,
    ALLOWED_ORIGINS,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW,
    REDIS_URL,
    DATABASE_URL,
  }
}

export const config = validateEnv()
