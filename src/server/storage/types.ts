export interface FileMetadata {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  uploadDate: Date;
  filePath: string;
  checksum?: string;
  content?: string; // Extracted file content for search indexing
}

export interface StorageResult {
  success: boolean;
  fileId?: string;
  filePath?: string;
  error?: string;
}

export interface FileUploadOptions {
  generateUniqueName?: boolean;
  preserveOriginalName?: boolean;
  createSubdirectories?: boolean;
}

export interface StorageInterface {
  /**
   * Initialize the storage system
   * @returns Promise<void>
   */
  initialize(): Promise<void>;

  /**
   * Save a file to storage
   * @param fileBuffer - The file content as a buffer
   * @param fileName - The original file name
   * @param mimeType - The MIME type of the file
   * @param options - Additional options for file storage
   * @returns Promise<StorageResult>
   */
  saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    options?: FileUploadOptions,
  ): Promise<StorageResult>;

  /**
   * Retrieve a file from storage
   * @param fileId - The unique identifier of the file
   * @returns Promise<Buffer | null> - File content as buffer, or null if not found
   */
  getFile(fileId: string): Promise<Buffer | null>;

  /**
   * Delete a file from storage
   * @param fileId - The unique identifier of the file
   * @returns Promise<boolean> - True if deletion was successful
   */
  deleteFile(fileId: string): Promise<boolean>;

  /**
   * Check if a file exists in storage
   * @param fileId - The unique identifier of the file
   * @returns Promise<boolean>
   */
  fileExists(fileId: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param fileId - The unique identifier of the file
   * @returns Promise<FileMetadata | null>
   */
  getFileMetadata(fileId: string): Promise<FileMetadata | null>;

  /**
   * List all files in storage
   * @returns Promise<FileMetadata[]>
   */
  listFiles(): Promise<FileMetadata[]>;
}
