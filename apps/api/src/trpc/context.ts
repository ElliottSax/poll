import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { db } from '@poll/database';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  // Get user from session/JWT if authenticated
  const user = null; // TODO: Implement authentication

  return {
    req,
    res,
    db,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
