import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export async function pollsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get('/', async (_request, reply) => {
    return reply.send({ message: 'Polls endpoint - Coming soon' })
  })
}
