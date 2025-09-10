import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { getSearchService } from '../search';

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
        const searchService = getSearchService();
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

  // Get search index statistics
  getIndexStats: publicProcedure.query(async () => {
    try {
      const searchService = getSearchService();
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
