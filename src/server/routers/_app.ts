/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { uploadRouter } from './upload';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  upload: uploadRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
