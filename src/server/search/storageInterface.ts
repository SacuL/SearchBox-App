import { SearchableDocument } from './types';

/**
 * Interface for search storage implementations
 * This allows FlexSearchService to work with any storage backend
 */
export interface SearchStorageInterface {
  /**
   * Add a document to the storage
   */
  addDocument(doc: SearchableDocument, content: string): void;

  /**
   * Update a document in the storage
   */
  updateDocument(doc: SearchableDocument, content: string): void;

  /**
   * Remove a document from the storage
   */
  removeDocument(id: string): void;

  /**
   * Get a document by ID
   */
  getDocument(id: string): SearchableDocument | null;

  /**
   * Get all documents
   */
  getAllDocuments(): SearchableDocument[];

  /**
   * Get document count
   */
  getDocumentCount(): number;

  /**
   * Clear all documents
   */
  clear(): void;

  /**
   * Get storage statistics
   */
  getStats(): { documentCount: number; [key: string]: any };

  /**
   * Close the storage connection (if applicable)
   */
  close?(): void;
}
