import { createHash } from 'crypto';
import { extname, basename } from 'path';
import { StorageInterface, FileMetadata, StorageResult, FileUploadOptions } from './types';

/**
 * In-memory storage implementation
 * Stores file metadata and content in memory using Map data structures
 * This is a simple implementation that can be easily replaced with a database later
 */
export class MemoryStorage implements StorageInterface {
  private files: Map<string, Buffer> = new Map();
  private metadata: Map<string, FileMetadata> = new Map();

  /**
   * Initialize the storage (no-op for in-memory storage)
   */
  async initialize(): Promise<void> {
    // No initialization needed for in-memory storage
    console.log('🧠 Memory storage initialized');
  }

  /**
   * Generate a unique file ID
   */
  private generateFileId(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate a unique file name to avoid conflicts
   */
  private generateUniqueFileName(originalName: string): string {
    const extension = extname(originalName);
    const baseName = basename(originalName, extension);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${randomSuffix}${extension}`;
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Save a file to memory storage
   */
  async saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    options: FileUploadOptions = {},
  ): Promise<StorageResult> {
    try {
      const {
        generateUniqueName = true,
        preserveOriginalName = false,
        createSubdirectories = true, // Note: Not applicable for in-memory storage
      } = options;

      const fileId = this.generateFileId();
      const fileExtension = extname(fileName);
      const checksum = this.calculateChecksum(fileBuffer);

      // Generate file name
      let finalFileName: string;
      if (generateUniqueName) {
        finalFileName = this.generateUniqueFileName(fileName);
      } else {
        finalFileName = fileName;
      }

      // Create metadata
      const metadata: FileMetadata = {
        id: fileId,
        fileName: finalFileName,
        originalName: preserveOriginalName ? fileName : finalFileName,
        fileSize: fileBuffer.length,
        mimeType,
        fileExtension,
        uploadDate: new Date(),
        filePath: `memory://${fileId}`, // Virtual path for in-memory storage
        checksum,
      };

      // Store file content and metadata in memory
      this.files.set(fileId, fileBuffer);
      this.metadata.set(fileId, metadata);

      console.log(`💾 File stored in memory: ${finalFileName} (${fileBuffer.length} bytes)`);

      return {
        success: true,
        fileId,
        filePath: metadata.filePath,
      };
    } catch (error) {
      console.error('❌ Memory storage save failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Retrieve a file from memory storage
   */
  async getFile(fileId: string): Promise<Buffer | null> {
    try {
      const fileBuffer = this.files.get(fileId);
      if (!fileBuffer) {
        console.log(`📁 File not found in memory: ${fileId}`);
        return null;
      }

      console.log(`📁 File retrieved from memory: ${fileId} (${fileBuffer.length} bytes)`);
      return fileBuffer;
    } catch (error) {
      console.error('❌ Memory storage get failed:', error);
      return null;
    }
  }

  /**
   * Delete a file from memory storage
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const metadata = this.metadata.get(fileId);
      if (!metadata) {
        console.log(`🗑️ File not found for deletion: ${fileId}`);
        return false;
      }

      // Remove from both maps
      this.files.delete(fileId);
      this.metadata.delete(fileId);

      console.log(`🗑️ File deleted from memory: ${metadata.fileName}`);
      return true;
    } catch (error) {
      console.error('❌ Memory storage delete failed:', error);
      return false;
    }
  }

  /**
   * Check if a file exists in memory storage
   */
  async fileExists(fileId: string): Promise<boolean> {
    const exists = this.files.has(fileId) && this.metadata.has(fileId);
    console.log(`🔍 File exists check: ${fileId} -> ${exists}`);
    return exists;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const metadata = this.metadata.get(fileId);
      if (!metadata) {
        console.log(`📋 Metadata not found: ${fileId}`);
        return null;
      }

      console.log(`📋 Metadata retrieved: ${metadata.fileName}`);
      return metadata;
    } catch (error) {
      console.error('❌ Memory storage metadata get failed:', error);
      return null;
    }
  }

  /**
   * List all files in memory storage
   */
  async listFiles(): Promise<FileMetadata[]> {
    try {
      const files = Array.from(this.metadata.values());
      console.log(`📋 Listed ${files.length} files from memory storage`);
      return files;
    } catch (error) {
      console.error('❌ Memory storage list failed:', error);
      return [];
    }
  }

  /**
   * Get storage statistics (useful for debugging)
   */
  getStorageStats(): {
    fileCount: number;
    totalSize: number;
    memoryUsage: string;
  } {
    const fileCount = this.files.size;
    const totalSize = Array.from(this.files.values()).reduce(
      (sum, buffer) => sum + buffer.length,
      0,
    );
    const memoryUsage = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;

    return {
      fileCount,
      totalSize,
      memoryUsage,
    };
  }

  /**
   * Clear all files from memory (useful for testing)
   */
  clearAll(): void {
    this.files.clear();
    this.metadata.clear();
    console.log('🧹 Memory storage cleared');
  }
}
