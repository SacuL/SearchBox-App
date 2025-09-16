import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { StorageFactory } from '../file-storage';
import { env } from '../env';
import { extractFileContent } from '../text-extraction';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * VectorStoreService singleton instance
 * This ensures a single instance across all Next.js contexts
 */
export class VectorStoreService {
  private faissStore: FaissStore | null = null;
  private embeddings: GoogleGenerativeAIEmbeddings | null = null;
  private textSplitter: RecursiveCharacterTextSplitter | null = null;
  private indexDirectory: string;
  private indexTimestamp: number | null = null;

  constructor() {
    // Create index directory in the project root
    this.indexDirectory = path.join(process.cwd(), 'faiss-indexes');
    this.ensureIndexDirectory();
  }

  /**
   * Ensure the index directory exists
   */
  private ensureIndexDirectory(): void {
    if (!fs.existsSync(this.indexDirectory)) {
      fs.mkdirSync(this.indexDirectory, { recursive: true });
      console.log(`📁 Created FAISS index directory: ${this.indexDirectory}`);
    }
  }

  /**
   * Check if an error is a rate limit error
   */
  private isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('quota exceeded') ||
      message.includes('too many requests') ||
      message.includes('resource exhausted')
    );
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private getUserFriendlyErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'An unexpected error occurred while processing your documents.';
    }

    const message = error.message.toLowerCase();

    if (this.isRateLimitError(error)) {
      return 'The search service is temporarily busy due to high demand. Please try again in a few minutes. Your documents are still being processed in the background.';
    }

    if (message.includes('api key') || message.includes('authentication')) {
      return 'Search service configuration issue. Please contact support.';
    }

    if (message.includes('network') || message.includes('timeout')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }

    if (message.includes('quota') || message.includes('billing')) {
      return 'Search service quota exceeded. Please try again later or contact support.';
    }

    // Generic fallback
    return 'Unable to process your documents for search. Please try again or contact support if the issue persists.';
  }

  /**
   * Get the most recent FAISS index file
   */
  private getLatestIndexFile(): string | null {
    try {
      const files = fs.readdirSync(this.indexDirectory);
      const indexFiles = files
        .filter((file) => file.startsWith('faiss-index-') && file.endsWith('.faiss'))
        .map((file) => {
          const regex = /faiss-index-(\d+)\.faiss/;
          const timestampMatch = regex.exec(file);
          return {
            file,
            timestamp: timestampMatch ? parseInt(timestampMatch[1]) : 0,
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      return indexFiles.length > 0 ? indexFiles[0].file : null;
    } catch (error) {
      console.error('❌ Error reading index directory:', error);
      return null;
    }
  }

  /**
   * Save FAISS index to file with timestamp
   */
  private async saveIndexToFile(): Promise<boolean> {
    if (!this.faissStore) {
      console.log('⚠️ No FAISS store to save');
      return false;
    }

    try {
      const timestamp = Date.now();
      const guid = randomUUID();
      const tempFileName = `faiss-index-${guid}.faiss.tmp`;
      const finalFileName = `faiss-index-${timestamp}.faiss`;

      const tempPath = path.join(this.indexDirectory, tempFileName);
      const finalPath = path.join(this.indexDirectory, finalFileName);

      // Save to temporary file first
      await this.faissStore.save(tempPath);

      // Rename to final file (atomic operation)
      fs.renameSync(tempPath, finalPath);

      // Update timestamp
      this.indexTimestamp = timestamp;

      console.log(`💾 FAISS index saved to: ${finalFileName}`);

      // Clean up old index files (keep only the latest 3)
      this.cleanupOldIndexFiles();

      return true;
    } catch (error) {
      console.error('❌ Failed to save FAISS index:', error);
      return false;
    }
  }

  /**
   * Load FAISS index from file
   */
  private async loadIndexFromFile(): Promise<boolean> {
    try {
      const latestFile = this.getLatestIndexFile();
      if (!latestFile) {
        console.log('📁 No FAISS index file found');
        return false;
      }

      const filePath = path.join(this.indexDirectory, latestFile);

      // Extract timestamp from filename
      const regex = /faiss-index-(\d+)\.faiss/;
      const timestampMatch = regex.exec(latestFile);
      if (timestampMatch) {
        this.indexTimestamp = parseInt(timestampMatch[1]);
      }

      // Initialize embeddings if not already done
      if (!this.embeddings) {
        if (!env.GOOGLE_API_KEY) {
          console.warn('⚠️ GOOGLE_API_KEY not found, cannot load FAISS index');
          return false;
        }
        this.embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: env.GOOGLE_API_KEY,
          model: 'models/gemini-embedding-001',
        });
      }

      // Load the FAISS store
      this.faissStore = await FaissStore.load(filePath, this.embeddings);

      console.log(`📂 FAISS index loaded from: ${latestFile} (timestamp: ${this.indexTimestamp})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to load FAISS index:', error);
      return false;
    }
  }

  /**
   * Clean up old index files, keeping only the latest 3
   */
  private cleanupOldIndexFiles(): void {
    try {
      const files = fs.readdirSync(this.indexDirectory);
      const indexFiles = files
        .filter((file) => file.startsWith('faiss-index-') && file.endsWith('.faiss'))
        .map((file) => {
          const regex = /faiss-index-(\d+)\.faiss/;
          const timestampMatch = regex.exec(file);
          return {
            file,
            timestamp: timestampMatch ? parseInt(timestampMatch[1]) : 0,
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      // Keep only the latest 3 files
      const filesToDelete = indexFiles.slice(3);
      filesToDelete.forEach(({ file }) => {
        const filePath = path.join(this.indexDirectory, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old index file: ${file}`);
      });
    } catch (error) {
      console.error('❌ Error cleaning up old index files:', error);
    }
  }

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

      // Try to load existing FAISS index from file first
      if (!this.faissStore) {
        console.log('🔍 Attempting to load FAISS index from file...');
        const loaded = await this.loadIndexFromFile();
        if (loaded) {
          console.log('✅ FAISS index loaded successfully from file');
        } else {
          console.log('📁 No existing FAISS index found, will create new one when needed');
        }
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
        try {
          this.faissStore = await FaissStore.fromDocuments(splitDocuments, this.embeddings!);
          console.log('✅ New vector store created successfully');
        } catch (error) {
          console.error('❌ Failed to create vector store:', error);
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(error),
          };
        }
      } else {
        // Add to existing vector store
        console.log('➕ Adding to existing FAISS vector store...');
        try {
          await this.faissStore.addDocuments(splitDocuments);
          console.log('✅ Document added to existing vector store');
        } catch (error) {
          console.error('❌ Failed to add document to vector store:', error);
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(error),
          };
        }
      }

      console.log(`✅ Document ${fileName} added to vector store successfully`);

      // Save the updated index to file
      await this.saveIndexToFile();

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

        // Save the built index to file
        await this.saveIndexToFile();
      } catch (faissError) {
        console.error('❌ FAISS vector store creation failed:', faissError);
        this.faissStore = null;
        return {
          success: false,
          error: this.getUserFriendlyErrorMessage(faissError),
        };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to build vector store:', error);
      return {
        success: false,
        error: this.getUserFriendlyErrorMessage(error),
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
      // Check if vector store is available (this will try to load from file or build if needed)
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Vector store not available and could not be built from existing files.',
        };
      }

      const results = await this.faissStore!.similaritySearch(query, k);
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('❌ Similarity search failed:', error);
      return {
        success: false,
        error: this.getUserFriendlyErrorMessage(error),
      };
    }
  }

  /**
   * Check if the current index is up-to-date with the latest file
   */
  private isIndexUpToDate(): boolean {
    if (!this.indexTimestamp) {
      return false;
    }

    const latestFile = this.getLatestIndexFile();
    if (!latestFile) {
      return false;
    }

    const regex = /faiss-index-(\d+)\.faiss/;
    const timestampMatch = regex.exec(latestFile);
    if (!timestampMatch) {
      return false;
    }

    const fileTimestamp = parseInt(timestampMatch[1]);
    return this.indexTimestamp >= fileTimestamp;
  }

  /**
   * Check if vector store is available and built
   */
  async isAvailable(): Promise<boolean> {
    try {
      // If no vector store exists, try to load from file first
      if (this.faissStore === null) {
        console.log('🔍 No vector store in memory, attempting to load from file...');
        const loaded = await this.loadIndexFromFile();
        if (loaded) {
          console.log('✅ Vector store loaded from file');
        } else {
          console.log('📁 No index file found, attempting to build from existing files...');
          const buildResult = await this.buildVectorStore();
          if (buildResult.success) {
            console.log('✅ Vector store built successfully from existing files');
          } else {
            console.log('⚠️ Could not build vector store from existing files:', buildResult.error);
          }
        }
      } else {
        // Check if the in-memory index is up-to-date with the file
        if (!this.isIndexUpToDate()) {
          console.log('🔄 Index file is newer than in-memory index, reloading...');
          const loaded = await this.loadIndexFromFile();
          if (loaded) {
            console.log('✅ Vector store reloaded from newer file');
          }
        }
      }

      const isAvailable = this.faissStore !== null;
      console.log('🔍 Vector store availability check:', {
        faissStore: !!this.faissStore,
        isAvailable,
        indexTimestamp: this.indexTimestamp,
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
    this.indexTimestamp = null;
  }

  /**
   * Force rebuild the vector store from scratch
   * This rebuilds everything from the beginning
   */
  async forceRebuildVectorStore(): Promise<{ success: boolean; error?: string }> {
    console.log('🔄 Force rebuilding vector store from scratch...');
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
