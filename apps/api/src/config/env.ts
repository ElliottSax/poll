import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  HOST: z.string().default('localhost'),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  API_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32).optional(),
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',')),

  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
  RATE_LIMIT_WINDOW: z.string().default('60000').transform(Number),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

// Validate and export config
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  host: parsed.data.HOST,
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  apiSecret: parsed.data.API_SECRET,
  jwtSecret: parsed.data.JWT_SECRET || parsed.data.API_SECRET, // Fallback to API_SECRET
  allowedOrigins: parsed.data.ALLOWED_ORIGINS,
  rateLimitMax: parsed.data.RATE_LIMIT_MAX,
  rateLimitWindow: parsed.data.RATE_LIMIT_WINDOW,
  logLevel: parsed.data.LOG_LEVEL,
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
}
