/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { uploadRouter } from './upload';
import { searchRouter } from './search';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  upload: uploadRouter,
  search: searchRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
