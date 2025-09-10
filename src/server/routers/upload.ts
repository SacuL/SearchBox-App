import { publicProcedure, router } from '../trpc';
import { StorageFactory } from '../file-storage';

export const uploadRouter = router({
  // List all uploaded files
  listFiles: publicProcedure.query(async () => {
    try {
      const storage = await StorageFactory.getStorage();
      const files = await storage.listFiles();

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
