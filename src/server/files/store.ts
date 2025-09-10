import { StorageFactory } from '../storage';
import { FileMetadata } from '../storage/types';

export interface StoreResult {
  success: boolean;
  fileId?: string;
  metadata?: FileMetadata;
  error?: string;
}

/**
 * Store a file to the storage system
 * @param fileBuffer - The file buffer to store
 * @param fileName - The original file name
 * @param mimeType - The MIME type of the file
 * @returns Promise<StoreResult> - The result of the storage operation
 */
export async function storeFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<StoreResult> {
  try {
    console.log('💾 Getting storage instance...');
    const storage = await StorageFactory.getStorage('memory');

    console.log('💾 Saving file to storage...');
    const result = await storage.saveFile(fileBuffer, fileName, mimeType, {
      generateUniqueName: true,
      preserveOriginalName: true,
      createSubdirectories: true,
    });

    console.log('💾 Storage result:', {
      success: result.success,
      fileId: result.fileId,
      error: result.error,
    });

    if (!result.success) {
      console.log('❌ Storage save failed:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to save file',
      };
    }

    // Get file metadata
    console.log('📋 Getting file metadata...');
    const metadata = await storage.getFileMetadata(result.fileId!);
    console.log(
      '📋 Metadata retrieved:',
      metadata
        ? {
            id: metadata.id,
            fileName: metadata.fileName,
            fileSize: metadata.fileSize,
          }
        : 'No metadata',
    );

    return {
      success: true,
      fileId: result.fileId,
      metadata: metadata || undefined,
    };
  } catch (error) {
    console.error('❌ Store operation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}
