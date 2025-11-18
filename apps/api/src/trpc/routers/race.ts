import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';

export const raceRouter = router({
  // List races with filters
  list: publicProcedure
    .input(
      z.object({
        state: z.string().optional(),
        type: z.enum(['president', 'senate', 'house', 'governor']).optional(),
        status: z.enum(['active', 'completed', 'upcoming']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const races = await ctx.db.race.findMany({
        where: {
          ...(input.state && { state_code: input.state }),
          ...(input.type && { race_type: input.type }),
          ...(input.status && { is_active: input.status === 'active' }),
        },
        take: input.limit,
        skip: input.offset,
        include: {
          forecast: true,
          _count: {
            select: { polls: true },
          },
        },
        orderBy: {
          election_date: 'asc',
        },
      });

      return races.map((race) => ({
        ...race,
        poll_count: race._count.polls,
      }));
    }),

  // Get race by ID
  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const race = await ctx.db.race.findUnique({
        where: { id: input },
        include: {
          polls: {
            take: 50,
            orderBy: { field_date: 'desc' },
            include: {
              pollster: true,
            },
          },
          forecast: true,
          candidates: true,
        },
      });

      if (!race) {
        throw new Error('Race not found');
      }

      return race;
    }),

  // Get trending races
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Implement actual trending logic
      // For now, return placeholder data
      return [];
    }),
});
