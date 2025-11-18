import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug({ duration: e.duration, query: e.query }, 'Database query')
  })
}

prisma.$on('error', (e) => {
  logger.error(e, 'Database error')
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
