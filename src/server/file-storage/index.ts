import { LocalStorage } from './localStorage';
import { MemoryStorage } from './memoryStorage';
import { StorageInterface, FileMetadata } from './types';

// Use global variable to ensure singleton across all Next.js contexts
// This is necessary because Next.js API routes and tRPC endpoints run in separate contexts
declare global {
  var __storageInstance: StorageInterface | undefined;
}

// Storage factory to create storage instances
export class StorageFactory {
  /**
   * Get or create a storage instance
   * @param type - Type of storage ('local' or 'memory')
   * @param options - Storage-specific options
   */
  static async getStorage(
    type: 'local' | 'memory' = 'memory',
    options: { uploadsDir?: string } = {},
  ): Promise<StorageInterface> {
    // Create a new instance if none exists
    if (!global.__storageInstance) {
      switch (type) {
        case 'local':
          global.__storageInstance = new LocalStorage(options.uploadsDir);
          await global.__storageInstance.initialize();
          console.log('🗄️ Local storage initialized - new global instance created');
          break;
        case 'memory':
          global.__storageInstance = new MemoryStorage();
          await global.__storageInstance.initialize();
          console.log('🧠 Memory storage initialized - new global instance created');
          break;
        default:
          throw new Error(`Unsupported storage type: ${String(type)}`);
      }
    } else {
      console.log('🗄️ Storage - returning existing global instance');
    }
    return global.__storageInstance;
  }

  /**
   * Reset the storage instance (useful for testing)
   */
  static reset(): void {
    if (global.__storageInstance) {
      global.__storageInstance = undefined;
    }
  }
}

// Export types and classes
export * from './types';
export { LocalStorage } from './localStorage';
export { MemoryStorage } from './memoryStorage';

// Export the storeFile function
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
