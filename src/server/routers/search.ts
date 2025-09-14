import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { FlexSearchFactory } from '../search';
import { VectorStoreService } from '../vector-store';

export const searchRouter = router({
  // Search for files
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, 'Search query is required'),
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
        fileTypes: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const searchService = FlexSearchFactory.getService();
        const results = searchService.search(input.query, {
          limit: input.limit,
          offset: input.offset,
          fileTypes: input.fileTypes,
        });

        return {
          success: true,
          data: results,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Search failed',
        };
      }
    }),

  // Vector similarity search
  vectorSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, 'Search query is required'),
        limit: z.number().min(1).max(20).optional().default(4),
      }),
    )
    .query(async ({ input }) => {
      try {
        const result = await VectorStoreService.similaritySearch(input.query, input.limit);
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Vector search failed',
        };
      }
    }),

  // Check if vector store is available
  isVectorStoreAvailable: publicProcedure.query(async () => {
    try {
      const isAvailable = await VectorStoreService.isAvailable();
      return {
        success: true,
        data: { available: isAvailable },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check vector store availability',
      };
    }
  }),

  // Get search index statistics
  getIndexStats: publicProcedure.query(async () => {
    try {
      const searchService = FlexSearchFactory.getService();
      const stats = searchService.getStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get index statistics',
      };
    }
  }),
});
