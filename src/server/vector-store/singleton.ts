import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { StorageFactory } from '../file-storage';
import { env } from '../env';
import { extractFileContent } from '../text-extraction';

/**
 * VectorStoreService singleton instance
 * This ensures a single instance across all Next.js contexts
 */
export class VectorStoreService {
  private faissStore: FaissStore | null = null;
  private embeddings: GoogleGenerativeAIEmbeddings | null = null;
  private textSplitter: RecursiveCharacterTextSplitter | null = null;
  private processedFiles: Set<string> = new Set<string>();

  /**
   * Initialize the vector store components
   */
  private async initializeComponents(): Promise<boolean> {
    // Check if Google API key is available
    if (!env.GOOGLE_API_KEY) {
      console.warn(
        '⚠️ GOOGLE_API_KEY not found in environment variables. Vector store will not be available.',
      );
      return false;
    }

    try {
      // Initialize embeddings
      if (!this.embeddings) {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: env.GOOGLE_API_KEY,
          model: 'models/gemini-embedding-001',
        });
      }

      // Initialize text splitter
      if (!this.textSplitter) {
        this.textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 100,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize vector store components:', error);
      return false;
    }
  }

  /**
   * Add a single document to the vector store incrementally
   */
  async addDocumentToVectorStore(
    fileId: string,
    fileName: string,
    originalName: string,
    fileSize: number,
    mimeType: string,
    uploadDate: Date,
    content: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if file was already processed
      if (this.processedFiles.has(fileId)) {
        console.log(`📄 File ${fileName} already processed, skipping...`);
        return { success: true };
      }

      // Initialize components
      const initialized = await this.initializeComponents();
      if (!initialized) {
        console.log('⚠️ Vector store initialization skipped');
        return {
          success: false,
          error: 'VectorStore not available.',
        };
      }

      console.log(`🔍 Adding document ${fileName} to vector store...`);

      // Create document
      const document = new Document({
        pageContent: content,
        metadata: {
          fileId,
          fileName,
          originalName,
          fileSize,
          mimeType,
          uploadDate: uploadDate.toISOString(),
        },
      });

      // Split document into chunks
      const splitDocuments = await this.textSplitter!.splitDocuments([document]);
      console.log(`📄 Split into ${splitDocuments.length} chunks`);

      if (this.faissStore === null) {
        // Create new vector store if none exists
        console.log('🏗️ Creating new FAISS vector store...');
        this.faissStore = await FaissStore.fromDocuments(splitDocuments, this.embeddings!);
        console.log('✅ New vector store created successfully');
      } else {
        // Add to existing vector store
        console.log('➕ Adding to existing FAISS vector store...');
        await this.faissStore.addDocuments(splitDocuments);
        console.log('✅ Document added to existing vector store');
      }

      // Mark file as processed
      this.processedFiles.add(fileId);
      console.log(`✅ Document ${fileName} added to vector store successfully`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to add document to vector store:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Build vector store from all uploaded documents
   */
  async buildVectorStore(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Building vector store from uploaded documents...');

      // Initialize components
      const initialized = await this.initializeComponents();
      if (!initialized) {
        return { success: false, error: 'VectorStore not available.' };
      }

      // Get all files from storage
      const storage = await StorageFactory.getStorage('memory');
      const files = await storage.listFiles();

      if (files.length === 0) {
        console.log('📁 No files found in storage');
        this.faissStore = null;
        return { success: true };
      }

      console.log(`📁 Found ${files.length} files to process`);

      // Process each file and create documents
      const documents: Document[] = [];
      for (const fileMetadata of files) {
        try {
          // Skip if already processed
          if (this.processedFiles.has(fileMetadata.id)) {
            console.log(`📄 File ${fileMetadata.fileName} already processed, skipping...`);
            continue;
          }

          // Get file content
          const fileBuffer = await storage.getFile(fileMetadata.id);
          if (fileBuffer) {
            const extractResult = await extractFileContent(fileBuffer, fileMetadata.fileName);

            if (
              extractResult.success &&
              extractResult.content &&
              extractResult.content.trim().length > 0
            ) {
              const document = new Document({
                pageContent: extractResult.content,
                metadata: {
                  fileId: fileMetadata.id,
                  fileName: fileMetadata.fileName,
                  fileSize: fileMetadata.fileSize,
                  uploadDate: fileMetadata.uploadDate.toISOString(),
                },
              });
              documents.push(document);
              // Mark as processed
              this.processedFiles.add(fileMetadata.id);
              console.log(`✅ Processed file: ${fileMetadata.fileName}`);
            } else {
              console.warn(`⚠️ Could not extract content from: ${fileMetadata.fileName}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing file ${fileMetadata.fileName}:`, error);
        }
      }

      if (documents.length === 0) {
        console.log('📄 No documents with extractable content found');
        this.faissStore = null;
        return { success: true };
      }

      // Split documents into chunks
      const splitDocuments = await this.textSplitter!.splitDocuments(documents);
      console.log(`📄 Created ${documents.length} documents`);
      console.log(`📄 Split into ${splitDocuments.length} chunks`);

      // Build FAISS vector store
      try {
        console.log('🏗️ Creating FAISS vector store...');
        this.faissStore = await FaissStore.fromDocuments(splitDocuments, this.embeddings!);
        console.log('✅ Vector store built successfully');
      } catch (faissError) {
        console.error('❌ FAISS vector store creation failed:', faissError);
        this.faissStore = null;
        return {
          success: false,
          error: `FAISS vector store creation failed: ${faissError instanceof Error ? faissError.message : String(faissError)}`,
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to build vector store:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Perform similarity search on the vector store
   */
  async similaritySearch(
    query: string,
    k = 4,
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // If no vector store exists, try to build it from existing files
      if (!this.faissStore) {
        console.log(
          '🔍 No vector store found for search, attempting to build from existing files...',
        );
        const buildResult = await this.buildVectorStore();
        if (!buildResult.success) {
          return {
            success: false,
            error: 'Vector store not available and could not be built from existing files.',
          };
        }
      }

      if (!this.faissStore) {
        return {
          success: false,
          error: 'Vector store not built. Call buildVectorStore() first.',
        };
      }

      const results = await this.faissStore.similaritySearch(query, k);
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Similarity search failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if vector store is available and built
   */
  async isAvailable(): Promise<boolean> {
    try {
      // If no vector store exists, try to build it from existing files
      if (this.faissStore === null) {
        console.log('🔍 No vector store found, attempting to build from existing files...');
        const buildResult = await this.buildVectorStore();
        if (buildResult.success) {
          console.log('✅ Vector store built successfully from existing files');
        } else {
          console.log('⚠️ Could not build vector store from existing files:', buildResult.error);
        }
      }

      const isAvailable = this.faissStore !== null;
      console.log('🔍 Vector store availability check:', {
        faissStore: !!this.faissStore,
        isAvailable,
        processedFilesCount: this.processedFiles.size,
      });
      return isAvailable;
    } catch (error) {
      console.error('❌ Error checking vector store availability:', error);
      return false;
    }
  }

  /**
   * Reset the vector store instance (useful for testing)
   */
  reset(): void {
    this.faissStore = null;
    this.embeddings = null;
    this.textSplitter = null;
    this.processedFiles.clear();
  }

  /**
   * Get the number of processed files
   */
  getProcessedFilesCount(): number {
    return this.processedFiles.size;
  }

  /**
   * Check if a file has been processed
   */
  isFileProcessed(fileId: string): boolean {
    return this.processedFiles.has(fileId);
  }

  /**
   * Force rebuild the vector store from scratch
   * This clears the processed files tracking and rebuilds everything
   */
  async forceRebuildVectorStore(): Promise<{ success: boolean; error?: string }> {
    console.log('🔄 Force rebuilding vector store from scratch...');
    this.processedFiles.clear();
    this.faissStore = null;
    return await this.buildVectorStore();
  }
}

// Singleton instance
let instance: VectorStoreService | null = null;

/**
 * Get the singleton VectorStoreService instance
 */
export function getVectorStoreService(): VectorStoreService {
  console.log('🔍 Getting vector store service instance');
  if (!instance) {
    console.log('🔍 Vector store service instance not found, creating new instance');
    instance = new VectorStoreService();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetVectorStoreService(): void {
  if (instance) {
    instance.reset();
    instance = null;
  }
}
