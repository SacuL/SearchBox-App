import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { createHash } from 'crypto';
// Using crypto.randomUUID() instead of uuid package
import { StorageInterface, FileMetadata, StorageResult, FileUploadOptions } from './types';

export class LocalStorage implements StorageInterface {
  private uploadsDir: string;
  private metadataFile: string;

  constructor(uploadsDir = 'uploads') {
    this.uploadsDir = uploadsDir;
    this.metadataFile = join(uploadsDir, 'metadata.json');
  }

  /**
   * Initialize the storage by creating necessary directories
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });

      // Create metadata file if it doesn't exist
      try {
        await fs.access(this.metadataFile);
      } catch {
        await fs.writeFile(this.metadataFile, JSON.stringify({}, null, 2));
      }
    } catch (error) {
      throw new Error(`Failed to initialize local storage: ${String(error)}`);
    }
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
   * Load metadata from file
   */
  private async loadMetadata(): Promise<Record<string, FileMetadata>> {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  /**
   * Save metadata to file
   */
  private async saveMetadata(metadata: Record<string, FileMetadata>): Promise<void> {
    await fs.writeFile(this.metadataFile, JSON.stringify(metadata, null, 2));
  }

  /**
   * Save a file to local storage
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
        createSubdirectories = true,
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

      // Create file path
      let filePath: string;
      if (createSubdirectories) {
        // Create subdirectory based on file type
        const subDir = fileExtension.substring(1).toLowerCase() || 'other';
        const subDirPath = join(this.uploadsDir, subDir);
        await fs.mkdir(subDirPath, { recursive: true });
        filePath = join(subDirPath, finalFileName);
      } else {
        filePath = join(this.uploadsDir, finalFileName);
      }

      // Save file to disk
      await fs.writeFile(filePath, fileBuffer);

      // Create metadata
      const metadata: FileMetadata = {
        id: fileId,
        fileName: finalFileName,
        originalName: preserveOriginalName ? fileName : finalFileName,
        fileSize: fileBuffer.length,
        mimeType,
        fileExtension,
        uploadDate: new Date(),
        filePath,
        checksum,
      };

      // Save metadata
      const allMetadata = await this.loadMetadata();
      allMetadata[fileId] = metadata;
      await this.saveMetadata(allMetadata);

      return {
        success: true,
        fileId,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Retrieve a file from local storage
   */
  async getFile(fileId: string): Promise<Buffer | null> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        return null;
      }

      const fileBuffer = await fs.readFile(metadata.filePath);
      return fileBuffer;
    } catch {
      return null;
    }
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        return false;
      }

      // Delete the physical file
      await fs.unlink(metadata.filePath);

      // Remove from metadata
      const allMetadata = await this.loadMetadata();
      delete allMetadata[fileId];
      await this.saveMetadata(allMetadata);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a file exists in local storage
   */
  async fileExists(fileId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        return false;
      }

      // Check if the physical file exists
      await fs.access(metadata.filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const allMetadata = await this.loadMetadata();
      return allMetadata[fileId] || null;
    } catch {
      return null;
    }
  }

  /**
   * List all files in local storage
   */
  async listFiles(): Promise<FileMetadata[]> {
    try {
      const allMetadata = await this.loadMetadata();
      return Object.values(allMetadata);
    } catch {
      return [];
    }
  }
}
