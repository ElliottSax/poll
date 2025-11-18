/**
 * @poll/database
 *
 * Prisma client and database utilities for the polling dashboard
 */

import { PrismaClient } from '@prisma/client'

// Global instance for development (prevents multiple instances during hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export types
export * from '@prisma/client'

// Re-export Prisma for convenience
export { PrismaClient }

// Database connection helper
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Database disconnection helper
export async function disconnectDatabase() {
  await prisma.$disconnect()
  console.log('👋 Database disconnected')
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

// Cleanup helper for graceful shutdown
export async function cleanup() {
  await disconnectDatabase()
}

// Handle shutdown signals
if (typeof process !== 'undefined') {
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}
