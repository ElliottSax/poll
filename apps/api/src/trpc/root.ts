import { router } from './trpc.js';
import { raceRouter } from './routers/race.js';
import { pollRouter } from './routers/poll.js';
import { forecastRouter } from './routers/forecast.js';
import { pollsterRouter } from './routers/pollster.js';

export const appRouter = router({
  race: raceRouter,
  poll: pollRouter,
  forecast: forecastRouter,
  pollster: pollsterRouter,
});

export type AppRouter = typeof appRouter;
