import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const searchRouter = router({
  // Vector similarity search
  vectorSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, 'Search query is required'),
        limit: z.number().min(1).max(20).optional().default(10),
        threshold: z.number().min(0).max(1).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const result = await ctx.vectorStoreService.similaritySearchWithThreshold(
          input.query,
          input.limit,
          input.threshold,
        );
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Vector search failed',
        };
      }
    }),

  // Check if vector store is available
  isVectorStoreAvailable: publicProcedure.query(async ({ ctx }) => {
    try {
      console.log('🔍 Search router: Checking vector store availability...');
      const isAvailable = await ctx.vectorStoreService.isAvailable();
      console.log('🔍 Search router: Vector store availability result:', isAvailable);
      return {
        success: true,
        data: { available: isAvailable },
      };
    } catch (error) {
      console.error('🔍 Search router: Error checking vector store availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check vector store availability',
      };
    }
  }),
});
