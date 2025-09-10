import FlexSearch from 'flexsearch';
import { SearchableDocument, SearchOptions } from './types';
import { FileMetadata } from '../file-storage/types';

export interface IndexResult {
  success: boolean;
  indexed: boolean;
  error?: string;
}

export class FlexSearchService {
  private index: any;

  constructor() {
    // Configure FlexSearch with the specified parameters
    this.index = new FlexSearch.Index<string>();
  }

  /**
   * Add a document to the search index
   */
  addDocument(doc: SearchableDocument, content: string): void {
    try {
      // Add to FlexSearch index with content for searching
      this.index.add(doc.id, content);

      console.log(`🔍 Indexed document: ${doc.fileName} (${doc.id})`);
      console.log(`🔍 Total documents in index: ${this.index.length || 0}`);
    } catch (error) {
      console.error(`❌ Failed to index document ${doc.id}:`, error);
    }
  }

  /**
   * Update a document in the search index
   */
  updateDocument(doc: SearchableDocument, content: string): void {
    try {
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
      // Remove from FlexSearch index
      this.index.remove(id);

      console.log(`🗑️ Removed indexed document: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to remove document ${id}:`, error);
    }
  }

  /**
   * Search for documents and return document IDs
   */
  search(query: string, _options: SearchOptions = {}): string[] {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      // Perform the search and return document IDs
      const searchResults = this.index.search(query, {
        suggest: false,
      }) as string[];

      console.log(`🔍 FlexSearch: Found ${searchResults.length} document IDs for query "${query}"`);

      return searchResults;
    } catch (error) {
      console.error(`❌ FlexSearch failed for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Clear all documents from the index
   */
  clear(): void {
    this.index.clear();
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
   * Close the service (no-op for in-memory service)
   */
  close(): void {
    // No-op for in-memory service
  }
}
