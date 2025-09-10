import { SearchableDocument } from './types';
import { SearchStorageInterface } from './storageInterface';

/**
 * In-memory storage implementation for search documents
 * This is useful for testing and development
 */
export class MemorySearchStorage implements SearchStorageInterface {
  private documents: Map<string, SearchableDocument> = new Map<string, SearchableDocument>();
  private content: Map<string, string> = new Map<string, string>();

  /**
   * Add a document to the storage
   */
  addDocument(doc: SearchableDocument, content: string): void {
    this.documents.set(doc.id, doc);
    this.content.set(doc.id, content);
    console.log(`💾 Stored document in memory: ${doc.fileName} (${doc.id})`);
  }

  /**
   * Update a document in the storage
   */
  updateDocument(doc: SearchableDocument, content: string): void {
    this.addDocument(doc, content); // Same as add for Map
    console.log(`🔄 Updated document in memory: ${doc.fileName} (${doc.id})`);
  }

  /**
   * Remove a document from the storage
   */
  removeDocument(id: string): void {
    const doc = this.documents.get(id);
    this.documents.delete(id);
    this.content.delete(id);

    if (doc) {
      console.log(`🗑️ Removed document from memory: ${id}`);
    } else {
      console.log(`⚠️ Document not found in memory: ${id}`);
    }
  }

  /**
   * Get a document by ID
   */
  getDocument(id: string): SearchableDocument | null {
    return this.documents.get(id) || null;
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
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
    this.content.clear();
    console.log('🧹 Cleared all documents from memory storage');
  }

  /**
   * Get storage statistics
   */
  getStats(): { documentCount: number; memoryUsage: number } {
    const documentCount = this.documents.size;

    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const [id, doc] of this.documents) {
      memoryUsage += JSON.stringify(doc).length;
      memoryUsage += (this.content.get(id) || '').length;
    }

    return { documentCount, memoryUsage };
  }

  /**
   * Get content for a document (useful for rebuilding FlexSearch index)
   */
  getContent(id: string): string | null {
    return this.content.get(id) || null;
  }

  /**
   * Get all content (useful for debugging)
   */
  getAllContent(): Map<string, string> {
    return new Map(this.content);
  }
}
