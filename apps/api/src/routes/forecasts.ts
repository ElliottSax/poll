import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export async function forecastsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get('/', async (_request, reply) => {
    return reply.send({ message: 'Forecasts endpoint - Coming soon' })
  })
}
