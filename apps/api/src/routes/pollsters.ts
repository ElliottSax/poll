import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export async function pollstersRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get('/', async (_request, reply) => {
    return reply.send({ message: 'Pollsters endpoint - Coming soon' })
  })
}
