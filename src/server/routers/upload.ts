import { publicProcedure, router } from '../trpc';
import { FlexSearchFactory } from '../search';

export const uploadRouter = router({
  // List last 5 uploaded files from search service
  listFiles: publicProcedure.query(async () => {
    try {
      const searchService = FlexSearchFactory.getService();
      const files = searchService.getLastDocuments(5);

      return {
        success: true,
        data: files,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files',
      };
    }
  }),
});
