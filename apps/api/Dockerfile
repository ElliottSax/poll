# UltraThink API Server Docker Image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NODE_ENV=production
ENV ULTRATHINK_MODE=production

RUN npm run build:api

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV ULTRATHINK_MODE=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./

# Prisma files for database operations
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

WORKDIR /app

# Set correct permissions
RUN chown -R apiuser:nodejs /app

USER apiuser

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# UltraThink startup message
RUN echo "🚀 UltraThink API Server Ready"

CMD ["node", "apps/api/dist/index.js"]