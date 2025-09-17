import { publicProcedure, router } from '../trpc';
import { StorageFactory } from '../file-storage';

export const uploadRouter = router({
  // List uploaded files from storage
  listFiles: publicProcedure.query(async () => {
    try {
      const storage = await StorageFactory.getStorage('memory');
      // Can be optimized later to fetch only the last 5 directly from the storage
      const allFiles = await storage.listFiles();

      // Return the last 5 files, sorted by upload date (newest first)
      const sortedFiles = allFiles
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
        .slice(0, 5);

      return {
        success: true,
        data: sortedFiles,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files',
      };
    }
  }),
});
