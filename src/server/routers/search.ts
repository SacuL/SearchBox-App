import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { getSearchService } from '../search';
import { SearchableDocument } from '../search/types';

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

  // Add document to search index
  addToIndex: publicProcedure
    .input(
      z.object({
        id: z.string(),
        fileName: z.string(),
        originalName: z.string(),
        fileExtension: z.string(),
        mimeType: z.string(),
        content: z.string(), // Content for indexing, not stored in metadata
        uploadDate: z.date(),
        fileSize: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const searchService = getSearchService();
        const document: SearchableDocument = {
          id: input.id,
          fileName: input.fileName,
          originalName: input.originalName,
          fileExtension: input.fileExtension,
          mimeType: input.mimeType,
          uploadDate: input.uploadDate,
          fileSize: input.fileSize,
        };

        searchService.addDocument(document, input.content);

        return {
          success: true,
          message: 'Document added to search index',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add document to index',
        };
      }
    }),

  // Remove document from search index
  removeFromIndex: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const searchService = getSearchService();
        searchService.removeDocument(input.id);

        return {
          success: true,
          message: 'Document removed from search index',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to remove document from index',
        };
      }
    }),

  // Update document in search index
  updateInIndex: publicProcedure
    .input(
      z.object({
        id: z.string(),
        fileName: z.string(),
        originalName: z.string(),
        fileExtension: z.string(),
        mimeType: z.string(),
        content: z.string(), // Content for indexing, not stored in metadata
        uploadDate: z.date(),
        fileSize: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const searchService = getSearchService();
        const document: SearchableDocument = {
          id: input.id,
          fileName: input.fileName,
          originalName: input.originalName,
          fileExtension: input.fileExtension,
          mimeType: input.mimeType,
          uploadDate: input.uploadDate,
          fileSize: input.fileSize,
        };

        searchService.updateDocument(document, input.content);

        return {
          success: true,
          message: 'Document updated in search index',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update document in index',
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

  // Clear search index
  clearIndex: publicProcedure.mutation(async () => {
    try {
      const searchService = getSearchService();
      searchService.clear();

      return {
        success: true,
        message: 'Search index cleared',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear search index',
      };
    }
  }),
});
