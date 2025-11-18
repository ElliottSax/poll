// Template for creating new API routes (Track 2: API Development)
// Copy this file and modify for your specific endpoint

import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
// import { prisma } from '../utils/prisma'

// Define request/response schemas with Zod
const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  // Add your query parameters here
})

const ParamsSchema = z.object({
  id: z.string(),
  // Add your path parameters here
})

const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Replace with specific schema
  meta: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
    })
    .optional(),
})

// Define TypeScript types from schemas
type QueryType = z.infer<typeof QuerySchema>
type ParamsType = z.infer<typeof ParamsSchema>
type ResponseType = z.infer<typeof ResponseSchema>

// Export the route plugin
export const exampleRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/examples - List all examples
  fastify.get<{
    Querystring: QueryType
    Reply: ResponseType
  }>(
    '/',
    {
      schema: {
        description: 'Get all examples',
        tags: ['examples'],
        querystring: QuerySchema,
        response: {
          200: ResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, limit } = request.query

        // TODO: Implement database query
        // const examples = await prisma.example.findMany({
        //   skip: (page - 1) * limit,
        //   take: limit,
        // })

        // const total = await prisma.example.count()

        return reply.status(200).send({
          success: true,
          data: [], // Replace with actual data
          meta: {
            page,
            limit,
            total: 0, // Replace with actual total
          },
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        })
      }
    }
  )

  // GET /api/examples/:id - Get single example
  fastify.get<{
    Params: ParamsType
    Reply: ResponseType
  }>(
    '/:id',
    {
      schema: {
        description: 'Get example by ID',
        tags: ['examples'],
        params: ParamsSchema,
        response: {
          200: ResponseSchema,
          404: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params

        // TODO: Implement database query
        // const example = await prisma.example.findUnique({
        //   where: { id },
        // })

        // if (!example) {
        //   return reply.status(404).send({
        //     success: false,
        //     error: 'Example not found',
        //   })
        // }

        return reply.status(200).send({
          success: true,
          data: null, // Replace with actual data
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        })
      }
    }
  )

  // POST /api/examples - Create new example
  // PUT /api/examples/:id - Update example
  // DELETE /api/examples/:id - Delete example
  // Add more routes as needed...
}
