import { storeFile } from '../file-storage';
import { extractFileContent } from '../text-extraction';
import { FlexSearchFactory } from '../search';
import { getVectorStoreService } from '../vector-store/vectorStoreService';
import { UploadRequest, UploadResult, UploadConfig } from './types';
import { UPLOAD_CONFIG } from './config';

export class UploadService {
  private config: UploadConfig;

  constructor(config: UploadConfig = UPLOAD_CONFIG) {
    this.config = config;
  }

  /**
   * Process a file upload request
   */
  async processUpload(request: UploadRequest): Promise<UploadResult> {
    try {
      const { file } = request;

      console.log('📄 Processing file upload:', {
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      // Step 1: Store the file
      console.log('📁 Step 1: Storing file...');
      const storeResult = await storeFile(file.buffer, file.originalname, file.mimetype);

      if (!storeResult.success) {
        console.log('❌ File storage failed:', storeResult.error);
        return {
          success: false,
          error: storeResult.error || 'Failed to store file',
        };
      }

      // Step 2: Extract text content
      console.log('📄 Step 2: Extracting text content...');
      const extractResult = await extractFileContent(file.buffer, file.originalname);

      if (!extractResult.success) {
        console.log('⚠️ Text extraction failed:', extractResult.error);
        // Continue with upload even if extraction fails
      }

      // Step 3: Index the content (if extraction was successful and content exists)
      let indexed = false;
      if (extractResult.success && extractResult.content && storeResult.metadata) {
        console.log('🔍 Step 3: Indexing content for search...');
        const searchService = FlexSearchFactory.getService();
        const indexResult = await searchService.indexFileContent(
          storeResult.metadata,
          extractResult.content,
        );

        if (indexResult.success) {
          indexed = indexResult.indexed;
        } else {
          console.log('⚠️ Search indexing failed:', indexResult.error);
          // Continue with upload even if indexing fails
        }
      }

      // Step 4: Update vector store (if extraction was successful)
      let vectorStoreUpdated = false;
      if (extractResult.success && extractResult.content && storeResult.metadata) {
        console.log('🔍 Step 4: Adding document to vector store...');
        const vectorStoreService = getVectorStoreService();
        const vectorStoreResult = await vectorStoreService.addDocumentToVectorStore(
          storeResult.metadata.id,
          storeResult.metadata.fileName,
          storeResult.metadata.originalName,
          storeResult.metadata.fileSize,
          storeResult.metadata.mimeType,
          storeResult.metadata.uploadDate,
          extractResult.content,
        );

        if (vectorStoreResult.success) {
          vectorStoreUpdated = true;
          console.log('✅ Document added to vector store successfully');
        } else {
          console.log('⚠️ Vector store update failed:', vectorStoreResult.error);
          // Continue with upload even if vector store update fails
        }
      }

      console.log('✅ Upload processed successfully!');
      return {
        success: true,
        data: {
          fileId: storeResult.fileId!,
          fileName: storeResult.metadata!.fileName,
          originalName: storeResult.metadata!.originalName,
          fileSize: storeResult.metadata!.fileSize,
          mimeType: storeResult.metadata!.mimeType,
          uploadDate: storeResult.metadata!.uploadDate,
          indexed,
          vectorStoreUpdated,
          message: 'File uploaded successfully',
        },
      };
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload processing failed',
      };
    }
  }

  /**
   * Validate file before processing
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.config.maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.config.supportedExtensions.includes(fileExtension as any)) {
      return {
        valid: false,
        error: `File type not supported. Allowed types: ${this.config.supportedExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }
}
