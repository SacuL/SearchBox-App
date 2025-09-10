import { SearchableDocument, SearchResult, SearchOptions, SearchResponse } from './types';
import { SearchStorageInterface } from './storageInterface';
import { FlexSearchService, IndexResult } from './flexSearchService';
import { FileMetadata } from '../file-storage/types';

/**
 * SearchOrchestrator coordinates between FlexSearchService and storage
 * This service handles the complete search workflow:
 * 1. Receives search queries
 * 2. Queries FlexSearchService for document IDs
 * 3. Fetches full document details from storage
 * 4. Returns formatted search results
 */
export class SearchOrchestrator {
  private flexSearchService: FlexSearchService;
  private storage: SearchStorageInterface;

  constructor(flexSearchService: FlexSearchService, storage: SearchStorageInterface) {
    this.flexSearchService = flexSearchService;
    this.storage = storage;
  }

  /**
   * Add a document to both FlexSearch index and storage
   */
  addDocument(doc: SearchableDocument, content: string): void {
    // Add to storage first
    this.storage.addDocument(doc, content);

    // Then add to FlexSearch index
    this.flexSearchService.addDocument(doc, content);

    console.log(`🔍 Orchestrator: Added document ${doc.fileName} to both storage and search index`);
  }

  /**
   * Update a document in both FlexSearch index and storage
   */
  updateDocument(doc: SearchableDocument, content: string): void {
    // Update in storage
    this.storage.updateDocument(doc, content);

    // Update in FlexSearch index
    this.flexSearchService.updateDocument(doc, content);

    console.log(
      `🔄 Orchestrator: Updated document ${doc.fileName} in both storage and search index`,
    );
  }

  /**
   * Remove a document from both FlexSearch index and storage
   */
  removeDocument(id: string): void {
    // Remove from storage
    this.storage.removeDocument(id);

    // Remove from FlexSearch index
    this.flexSearchService.removeDocument(id);

    console.log(`🗑️ Orchestrator: Removed document ${id} from both storage and search index`);
  }

  /**
   * Search for documents using FlexSearch and return full document details
   */
  search(query: string, options: SearchOptions = {}): SearchResponse {
    const startTime = Date.now();

    try {
      if (!query || query.trim().length === 0) {
        return {
          results: [],
          total: 0,
          query,
          took: Date.now() - startTime,
        };
      }

      // Step 1: Query FlexSearchService to get document IDs
      const documentIds = this.flexSearchService.search(query, options);

      // Step 2: Fetch full document details from storage
      const results: SearchResult[] = [];

      for (const documentId of documentIds) {
        const fullDoc = this.storage.getDocument(documentId);
        if (fullDoc) {
          // Apply file type filter if specified
          if (options.fileTypes && options.fileTypes.length > 0) {
            if (!options.fileTypes.includes(fullDoc.fileExtension.toLowerCase())) {
              continue;
            }
          }

          const result: SearchResult = {
            id: fullDoc.id,
            fileName: fullDoc.fileName,
            originalName: fullDoc.originalName,
            fileExtension: fullDoc.fileExtension,
            mimeType: fullDoc.mimeType,
            uploadDate: fullDoc.uploadDate,
            fileSize: fullDoc.fileSize,
          };

          results.push(result);
        }
      }

      // Step 3: Apply pagination
      const offset = options.offset || 0;
      const paginatedResults = results.slice(offset, offset + (options.limit || 50));

      const response: SearchResponse = {
        results: paginatedResults,
        total: results.length,
        query,
        took: Date.now() - startTime,
      };

      console.log(
        `🔍 Orchestrator: Search completed "${query}" -> ${results.length} results in ${response.took}ms`,
      );

      return response;
    } catch (error) {
      console.error(`❌ Orchestrator: Search failed for query "${query}":`, error);
      return {
        results: [],
        total: 0,
        query,
        took: Date.now() - startTime,
      };
    }
  }

  /**
   * Get all documents from storage
   */
  getAllDocuments(): SearchableDocument[] {
    return this.storage.getAllDocuments();
  }

  /**
   * Get document count from storage
   */
  getDocumentCount(): number {
    return this.storage.getDocumentCount();
  }

  /**
   * Clear all documents from both storage and search index
   */
  clear(): void {
    this.storage.clear();
    this.flexSearchService.clear();
    console.log('🧹 Orchestrator: Cleared all documents from both storage and search index');
  }

  /**
   * Index file content for search (high-level method that coordinates storage and FlexSearch)
   * @param metadata - The file metadata
   * @param content - The extracted text content
   * @returns Promise<IndexResult> - The result of the indexing operation
   */
  async indexFileContent(metadata: FileMetadata, content: string): Promise<IndexResult> {
    try {
      if (!content || content.trim().length === 0) {
        console.log('⚠️ No content to index, skipping');
        return {
          success: true,
          indexed: false,
        };
      }

      console.log('🔍 Orchestrator: Starting search indexing process...');

      const searchableDocument: SearchableDocument = {
        id: metadata.id,
        fileName: metadata.fileName,
        originalName: metadata.originalName,
        fileExtension: metadata.fileExtension,
        mimeType: metadata.mimeType,
        uploadDate: metadata.uploadDate,
        fileSize: metadata.fileSize,
      };

      // Add to storage first
      this.storage.addDocument(searchableDocument, content);

      // Then add to FlexSearch index
      this.flexSearchService.addDocument(searchableDocument, content);

      console.log(
        `🔍 Orchestrator: Added document ${metadata.fileName} to both storage and search index`,
      );
      console.log('✅ Orchestrator: File indexed successfully');

      return {
        success: true,
        indexed: true,
      };
    } catch (error) {
      console.error('❌ Orchestrator: Search indexing failed:', error);
      return {
        success: false,
        indexed: false,
        error: error instanceof Error ? error.message : 'Unknown indexing error',
      };
    }
  }

  /**
   * Get statistics from storage (FlexSearchService no longer provides stats)
   */
  getStats(): { documentCount: number; indexSize: number; storageStats: any } {
    const storageStats = this.storage.getStats();

    return {
      documentCount: storageStats.documentCount,
      indexSize: 0, // FlexSearch doesn't expose index size
      storageStats,
    };
  }

  /**
   * Close connections
   */
  close(): void {
    this.flexSearchService.close();
    if (this.storage.close) {
      this.storage.close();
    }
  }
}
