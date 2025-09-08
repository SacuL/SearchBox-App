import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { StorageFactory } from '../storage';

// Define allowed file types
export const ALLOWED_FILE_TYPES = ['txt', 'md', 'docx', 'pdf'] as const;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const uploadRouter = router({
  // Get file metadata
  getFileMetadata: publicProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input }) => {
      try {
        const storage = await StorageFactory.getStorage();
        const metadata = await storage.getFileMetadata(input.fileId);

        if (!metadata) {
          return {
            success: false,
            error: 'File not found',
          };
        }

        return {
          success: true,
          data: metadata,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get file metadata',
        };
      }
    }),

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

  // Delete a file
  deleteFile: publicProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const storage = await StorageFactory.getStorage();
        const success = await storage.deleteFile(input.fileId);

        if (!success) {
          return {
            success: false,
            error: 'File not found or could not be deleted',
          };
        }

        return {
          success: true,
          message: 'File deleted successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete file',
        };
      }
    }),

  // Check if file exists
  fileExists: publicProcedure.input(z.object({ fileId: z.string() })).query(async ({ input }) => {
    try {
      const storage = await StorageFactory.getStorage();
      const exists = await storage.fileExists(input.fileId);

      return {
        success: true,
        data: { exists },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check file existence',
      };
    }
  }),

  // Get upload status
  getUploadStatus: publicProcedure
    .input(z.object({ uploadId: z.string() }))
    .query(async ({ input }) => {
      // TODO: Implement actual upload status checking
      // For now, return a mock status
      return {
        uploadId: input.uploadId,
        status: 'completed',
        progress: 100,
        message: 'Upload completed successfully',
      };
    }),
});
