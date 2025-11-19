import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';

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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Race not found',
        });
      }

      return race;
    }),

  // Get trending races (with mock data for now)
  trending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implement actual trending logic
      // For MVP, return mock data
      return [
        {
          race_id: 'mock-1',
          race_name: 'Pennsylvania Senate 2024',
          movement_7d: 3.2,
          movement_direction: 'D_GAINING' as const,
          current_margin: 1.1,
          previous_margin: -2.1,
          category_change: 'Toss-up → Lean D',
          polls_last_7d: 4,
        },
        {
          race_id: 'mock-2',
          race_name: 'Arizona Senate 2024',
          movement_7d: 2.8,
          movement_direction: 'R_GAINING' as const,
          current_margin: -1.5,
          previous_margin: -4.3,
          category_change: 'Lean R → Toss-up',
          polls_last_7d: 3,
        },
      ].slice(0, input.limit);
    }),
});
