import { router } from './trpc';
import { raceRouter } from './routers/race';
import { pollRouter } from './routers/poll';
import { forecastRouter } from './routers/forecast';
import { pollsterRouter } from './routers/pollster';

export const appRouter = router({
  race: raceRouter,
  poll: pollRouter,
  forecast: forecastRouter,
  pollster: pollsterRouter,
});

export type AppRouter = typeof appRouter;
