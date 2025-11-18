import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const pollRouter = router({
  // List polls
  list: publicProcedure
    .input(
      z.object({
        race_id: z.string().uuid().optional(),
        state: z.string().optional(),
        pollster: z.string().optional(),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional(),
        population: z.enum(['LV', 'RV', 'A']).optional(),
        min_sample: z.number().min(0).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const polls = await ctx.db.poll.findMany({
        where: {
          ...(input.race_id && { race_id: input.race_id }),
          ...(input.pollster && { pollster: { slug: input.pollster } }),
          ...(input.population && { population: input.population }),
          ...(input.min_sample && { sample_size: { gte: input.min_sample } }),
          ...(input.start_date && {
            field_date: { gte: new Date(input.start_date) },
          }),
          ...(input.end_date && {
            field_date: { lte: new Date(input.end_date) },
          }),
        },
        take: input.limit,
        skip: input.offset,
        include: {
          pollster: true,
          race: {
            select: {
              id: true,
              name: true,
              state_code: true,
            },
          },
        },
        orderBy: {
          field_date: 'desc',
        },
      });

      return polls;
    }),
});
