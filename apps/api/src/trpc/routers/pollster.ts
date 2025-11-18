import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const pollsterRouter = router({
  // List pollsters
  list: publicProcedure
    .input(
      z.object({
        min_rating: z.string().optional(),
        methodology: z.enum(['Phone', 'Online', 'IVR', 'Mixed']).optional(),
        partisan: z.enum(['Nonpartisan', 'Democratic', 'Republican']).optional(),
        active_only: z.boolean().default(true),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const pollsters = await ctx.db.pollster.findMany({
        where: {
          ...(input.methodology && { primary_methodology: input.methodology }),
          ...(input.partisan && { partisan: input.partisan }),
        },
        take: input.limit,
        include: {
          _count: {
            select: { polls: true },
          },
        },
        orderBy: {
          methodology_score: 'desc',
        },
      });

      return pollsters;
    }),

  // Get pollster by slug
  bySlug: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const pollster = await ctx.db.pollster.findUnique({
        where: { slug: input },
        include: {
          polls: {
            take: 20,
            orderBy: { field_date: 'desc' },
            include: {
              race: {
                select: {
                  name: true,
                  state_code: true,
                },
              },
            },
          },
        },
      });

      if (!pollster) {
        throw new Error('Pollster not found');
      }

      return pollster;
    }),
});
