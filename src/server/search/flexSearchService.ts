import FlexSearch from 'flexsearch';
import { SearchableDocument, SearchResult, SearchOptions, SearchResponse } from './types';

export class FlexSearchService {
  private index: any;
  private documents: Map<string, SearchableDocument> = new Map<string, SearchableDocument>();

  constructor() {
    // Configure FlexSearch with the specified parameters
    this.index = new FlexSearch.Index<string>();
  }

  /**
   * Add a document to the search index
   */
  addDocument(doc: SearchableDocument, content: string): void {
    try {
      // Store the document metadata (without content)
      this.documents.set(doc.id, doc);

      // Add to search index with content for searching
      this.index.add(doc.id, content);

      console.log(`🔍 Indexed document: ${doc.fileName} (${doc.id})`);
      console.log(`🔍 Total documents in index: ${this.documents.size}`);
      console.log(`🔍 Document IDs: ${Array.from(this.documents.keys()).join(', ')}`);
    } catch (error) {
      console.error(`❌ Failed to index document ${doc.id}:`, error);
    }
  }

  /**
   * Update a document in the search index
   */
  updateDocument(doc: SearchableDocument, content: string): void {
    try {
      // Remove old version
      this.removeDocument(doc.id);

      // Add new version
      this.addDocument(doc, content);

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
      this.documents.delete(id);
      this.index.remove(id);

      console.log(`🗑️ Removed indexed document: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to remove document ${id}:`, error);
    }
  }

  /**
   * Search for documents
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

      // Perform the search (get all results first, then apply pagination)#
      //TODO: Handle pagination correctly
      const searchResults = this.index.search(query, {
        suggest: false,
      }) as string[];

      // Get document details
      const results: SearchResult[] = [];

      for (const id of searchResults) {
        const doc = this.documents.get(id);
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
        `🔍 Search completed: "${query}" -> ${results.length} results in ${response.took}ms`,
      );

      return response;
    } catch (error) {
      console.error(`❌ Search failed for query "${query}":`, error);
      return {
        results: [],
        total: 0,
        query,
        took: Date.now() - startTime,
      };
    }
  }

  /**
   * Get all indexed documents (for debugging)
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
   * Clear all documents from the index
   */
  clear(): void {
    this.documents.clear();
    this.index.clear();
    console.log('🧹 Cleared all documents from search index');
  }

  /**
   * Get index statistics
   */
  getStats(): { documentCount: number; indexSize: number } {
    const stats = {
      documentCount: this.documents.size,
      indexSize: this.index.length || 0,
    };
    console.log('🔍 FlexSearchService.getStats() called:', stats);
    console.log('🔍 Documents in memory:', Array.from(this.documents.keys()));
    return stats;
  }
}
