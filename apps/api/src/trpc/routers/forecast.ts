import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

export const forecastRouter = router({
  // Get forecast by race ID
  byRace: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const forecast = await ctx.db.forecast.findUnique({
        where: { race_id: input },
        include: {
          race: true,
        },
      });

      return forecast;
    }),

  // Run scenario simulation
  simulate: publicProcedure
    .input(
      z.object({
        race_id: z.string().uuid(),
        adjustments: z.array(
          z.object({
            candidate_id: z.string().uuid(),
            adjustment: z.number().min(-20).max(20),
          })
        ),
        simulations: z.number().min(1000).max(100000).default(10000),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Implement Monte Carlo simulation
      // For now, return placeholder
      return {
        win_probability: { D: 0.5, R: 0.5 },
        simulations_run: input.simulations,
      };
    }),
});
