import FlexSearch from 'flexsearch';
import { SearchableDocument, SearchOptions, SearchResult, SearchResponse } from './types';
import { FileMetadata } from '../file-storage/types';

export interface IndexResult {
  success: boolean;
  indexed: boolean;
  error?: string;
}

export class FlexSearchService {
  private index: any;
  private documents = new Map<string, SearchableDocument>();

  constructor() {
    // Configure FlexSearch with optimized parameters
    this.index = new FlexSearch.Index<string>({
      preset: 'performance', // Optimized for speed
      tokenize: 'full', // Matches any part of words
      cache: 100, // Cache up to 100 results
      resolution: 9, // High scoring resolution
      context: false, // Contextual indexing
    });
  }

  /**
   * Add a document to the search index
   */
  addDocument(doc: SearchableDocument, content: string): void {
    try {
      // Store document metadata
      this.documents.set(doc.id, doc);

      // Add to FlexSearch index with content for searching
      this.index.add(doc.id, content);

      console.log(`🔍 Indexed document: ${doc.fileName} (${doc.id})`);
      console.log(`🔍 Total documents in index: ${this.documents.size}`);
    } catch (error) {
      console.error(`❌ Failed to index document ${doc.id}:`, error);
    }
  }

  /**
   * Update a document in the search index
   */
  updateDocument(doc: SearchableDocument, content: string): void {
    try {
      // Update document metadata
      this.documents.set(doc.id, doc);

      // Update in FlexSearch index
      this.index.update(doc.id, content);

      console.log(`🔄 Updated indexed document: ${doc.fileName} (${doc.id})`);
    } catch (error) {
      console.error(`❌ Failed to update document ${doc.id}:`, error);
    }
  }

  /**
   * Remove a document from the search index
   */
  removeDocument(id: string): void {
    try {
      // Remove document metadata
      this.documents.delete(id);

      // Remove from FlexSearch index
      this.index.remove(id);

      console.log(`🗑️ Removed indexed document: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to remove document ${id}:`, error);
    }
  }

  /**
   * Search for documents and return full search results
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

      // Perform the search and get document IDs
      const documentIds = this.index.search(query, {
        suggest: false,
      }) as string[];

      // Convert document IDs to full search results
      const results: SearchResult[] = [];

      for (const documentId of documentIds) {
        const doc = this.documents.get(documentId);
        if (doc) {
          // Apply file type filter if specified
          if (options.fileTypes && options.fileTypes.length > 0) {
            if (!options.fileTypes.includes(doc.fileExtension.toLowerCase())) {
              continue;
            }
          }

          const result: SearchResult = {
            id: doc.id,
            fileName: doc.fileName,
            originalName: doc.originalName,
            fileExtension: doc.fileExtension,
            mimeType: doc.mimeType,
            uploadDate: doc.uploadDate,
            fileSize: doc.fileSize,
          };

          results.push(result);
        }
      }

      // Apply pagination
      const offset = options.offset || 0;
      const paginatedResults = results.slice(offset, offset + (options.limit || 50));

      const response: SearchResponse = {
        results: paginatedResults,
        total: results.length,
        query,
        took: Date.now() - startTime,
      };

      console.log(
        `🔍 FlexSearch: Found ${results.length} results for query "${query}" in ${response.took}ms`,
      );

      return response;
    } catch (error) {
      console.error(`❌ FlexSearch failed for query "${query}":`, error);
      return {
        results: [],
        total: 0,
        query,
        took: Date.now() - startTime,
      };
    }
  }

  /**
   * Clear all documents from the index
   */
  clear(): void {
    this.index.clear();
    this.documents.clear();
    console.log('🧹 Cleared all documents from search index');
  }

  /**
   * Index file content for search (high-level method)
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

      console.log('🔍 Starting search indexing process...');

      const searchableDocument: SearchableDocument = {
        id: metadata.id,
        fileName: metadata.fileName,
        originalName: metadata.originalName,
        fileExtension: metadata.fileExtension,
        mimeType: metadata.mimeType,
        uploadDate: metadata.uploadDate,
        fileSize: metadata.fileSize,
      };

      console.log(`🔍 Adding document to search index (${content.length} characters)...`);
      this.addDocument(searchableDocument, content);
      console.log('✅ File indexed successfully');

      return {
        success: true,
        indexed: true,
      };
    } catch (error) {
      console.error('❌ Search indexing failed:', error);
      return {
        success: false,
        indexed: false,
        error: error instanceof Error ? error.message : 'Unknown indexing error',
      };
    }
  }

  /**
   * Get all documents
   */
  getAllDocuments(): SearchableDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    return this.documents.size;
  }

  /**
   * Get a document by ID
   */
  getDocument(id: string): SearchableDocument | null {
    return this.documents.get(id) || null;
  }

  /**
   * Get statistics
   */
  getStats(): { documentCount: number; indexSize: number } {
    return {
      documentCount: this.documents.size,
      indexSize: 0, // FlexSearch doesn't expose index size
    };
  }

  /**
   * Close the service (no-op for in-memory service)
   */
  close(): void {
    // No-op for in-memory service
  }
}
