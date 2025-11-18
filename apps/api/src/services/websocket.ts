import { FastifyInstance } from 'fastify'
import WebSocket from 'ws'
import { prisma } from '../utils/prisma'

interface Client {
  ws: WebSocket
  subscribedRaces: Set<string>
  userId?: string
}

export class WebSocketService {
  private clients: Map<string, Client> = new Map()
  private pollInterval?: NodeJS.Timeout

  constructor(private fastify: FastifyInstance) {}

  /**
   * Initialize WebSocket server
   */
  async initialize() {
    this.fastify.get('/ws', { websocket: true }, (connection, req) => {
      const clientId = this.generateClientId()
      const client: Client = {
        ws: connection.socket,
        subscribedRaces: new Set(),
      }

      this.clients.set(clientId, client)
      this.fastify.log.info(`WebSocket client connected: ${clientId}`)

      // Handle messages from client
      connection.socket.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString())
          this.handleMessage(clientId, data)
        } catch (error) {
          this.fastify.log.error('Error parsing WebSocket message:', error)
        }
      })

      // Handle client disconnect
      connection.socket.on('close', () => {
        this.clients.delete(clientId)
        this.fastify.log.info(`WebSocket client disconnected: ${clientId}`)
      })

      // Send welcome message
      this.send(clientId, {
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      })
    })

    // Start polling for updates
    this.startPolling()

    this.fastify.log.info('WebSocket service initialized')
  }

  /**
   * Handle incoming messages from clients
   */
  private handleMessage(clientId: string, data: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (data.type) {
      case 'subscribe':
        if (data.raceId) {
          client.subscribedRaces.add(data.raceId)
          this.send(clientId, {
            type: 'subscribed',
            raceId: data.raceId,
          })
        }
        break

      case 'unsubscribe':
        if (data.raceId) {
          client.subscribedRaces.delete(data.raceId)
          this.send(clientId, {
            type: 'unsubscribed',
            raceId: data.raceId,
          })
        }
        break

      case 'ping':
        this.send(clientId, { type: 'pong' })
        break

      default:
        this.fastify.log.warn(`Unknown message type: ${data.type}`)
    }
  }

  /**
   * Send message to specific client
   */
  private send(clientId: string, data: any) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data))
    }
  }

  /**
   * Broadcast to all clients subscribed to a race
   */
  public broadcastToRace(raceId: string, data: any) {
    let count = 0
    this.clients.forEach((client, clientId) => {
      if (client.subscribedRaces.has(raceId)) {
        this.send(clientId, {
          ...data,
          raceId,
          timestamp: new Date().toISOString(),
        })
        count++
      }
    })
    this.fastify.log.info(`Broadcast to ${count} clients for race ${raceId}`)
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcastToAll(data: any) {
    this.clients.forEach((client, clientId) => {
      this.send(clientId, {
        ...data,
        timestamp: new Date().toISOString(),
      })
    })
    this.fastify.log.info(`Broadcast to ${this.clients.size} clients`)
  }

  /**
   * Poll for updates and broadcast
   */
  private startPolling() {
    // Poll every 30 seconds for new data
    this.pollInterval = setInterval(async () => {
      await this.checkForUpdates()
    }, 30000)
  }

  /**
   * Check for new polls and forecasts
   */
  private async checkForUpdates() {
    try {
      // Check for new polls in the last minute
      const newPolls = await prisma.poll.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60000), // Last minute
          },
        },
        include: {
          race: { select: { slug: true, raceName: true } },
          pollster: { select: { name: true } },
        },
        take: 10,
      })

      // Broadcast new polls
      for (const poll of newPolls) {
        this.broadcastToRace(poll.raceId, {
          type: 'poll:new',
          poll: {
            id: poll.id,
            pollster: poll.pollster.name,
            pollDate: poll.pollDate,
            results: poll.results,
            race: poll.race,
          },
        })
      }

      // Check for forecast updates
      const updatedForecasts = await prisma.forecast.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60000),
          },
        },
        include: {
          race: { select: { slug: true, raceName: true } },
        },
        take: 10,
      })

      // Broadcast forecast updates
      for (const forecast of updatedForecasts) {
        this.broadcastToRace(forecast.raceId, {
          type: 'forecast:updated',
          forecast: {
            id: forecast.id,
            probabilities: forecast.probabilities,
            predictedMargins: forecast.predictedMargins,
            forecastDate: forecast.forecastDate,
            race: forecast.race,
          },
        })
      }
    } catch (error) {
      this.fastify.log.error('Error checking for updates:', error)
    }
  }

  /**
   * Cleanup
   */
  public async shutdown() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    // Close all WebSocket connections
    this.clients.forEach((client) => {
      client.ws.close()
    })

    this.clients.clear()
    this.fastify.log.info('WebSocket service shut down')
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get stats
   */
  public getStats() {
    const raceSubscriptions: Record<string, number> = {}

    this.clients.forEach((client) => {
      client.subscribedRaces.forEach((raceId) => {
        raceSubscriptions[raceId] = (raceSubscriptions[raceId] || 0) + 1
      })
    })

    return {
      totalClients: this.clients.size,
      raceSubscriptions,
    }
  }
}

// Export singleton - will be initialized in main app
let wsService: WebSocketService | null = null

export function initializeWebSocketService(fastify: FastifyInstance) {
  if (!wsService) {
    wsService = new WebSocketService(fastify)
  }
  return wsService
}

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    throw new Error('WebSocket service not initialized')
  }
  return wsService
}
