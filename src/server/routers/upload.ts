import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

// Define allowed file types
const ALLOWED_FILE_TYPES = ['txt', 'md', 'docx', 'pdf'] as const;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// File upload input schema
const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z
    .number()
    .max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
  fileType: z.string().refine(
    (type) => {
      // Check if the file type matches our allowed types
      return ALLOWED_FILE_TYPES.some(
        (allowedType) =>
          type.toLowerCase().includes(allowedType) ||
          type.toLowerCase().includes('text/plain') || // for .txt files
          type.toLowerCase().includes('txt') || // for .txt files
          type.toLowerCase().includes('text/markdown') || // for .md files
          type.toLowerCase().includes('md') || // for .md files
          type.toLowerCase().includes('application/pdf') || // for .pdf files
          type.toLowerCase().includes('pdf') || // for .pdf files
          type
            .toLowerCase()
            .includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), // for .docx files
        type.toLowerCase().includes('docx'), // for .docx files
      );
    },
    `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
  ),
  fileContent: z.string().optional(), // For text-based files
});

export const uploadRouter = router({
  // Validate file before upload
  validateFile: publicProcedure.input(fileUploadSchema).mutation(async ({ input }) => {
    try {
      // Additional validation logic can go here
      const fileInfo = {
        fileName: input.fileName,
        fileSize: input.fileSize,
        fileType: input.fileType,
        isValid: true,
        message: 'File validation successful',
      };

      return {
        success: true,
        data: fileInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }),

  // Upload file (simulated for now - will be implemented with actual file storage)
  uploadFile: publicProcedure.input(fileUploadSchema).mutation(async ({ input }) => {
    try {
      // Generate a unique upload ID
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simulate file processing
      const uploadResult = {
        fileName: input.fileName,
        fileSize: input.fileSize,
        fileType: input.fileType,
        uploadId,
        message: 'File uploaded successfully',
      };

      // TODO: Implement actual file storage logic here
      // - Save file to disk or cloud storage
      // - Store metadata in database
      // - Process file content for indexing

      return {
        success: true,
        data: uploadResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed',
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
