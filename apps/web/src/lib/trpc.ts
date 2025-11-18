import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@poll/api';

export const trpc = createTRPCReact<AppRouter>();
