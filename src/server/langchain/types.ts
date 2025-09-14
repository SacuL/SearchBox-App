import { Document } from '@langchain/core/documents';

/**
 * Configuration options for the DocumentLoader
 */
export interface DocumentLoaderConfig {
  /** The directory path to load documents from */
  directoryPath: string;
  /** Whether to load files recursively from subdirectories (default: false) */
  recursive?: boolean;
}

/**
 * Result of document loading operation
 */
export interface DocumentLoadResult {
  /** Array of successfully loaded documents */
  documents: Document[];
  /** Number of documents loaded */
  count: number;
  /** Any errors that occurred during loading */
  errors?: string[];
}

/**
 * File information extracted from a document
 */
export interface FileInfo {
  /** The file path */
  path: string;
  /** The file name */
  name: string;
  /** The file extension */
  extension: string;
  /** The file size in bytes */
  size: number;
  /** The last modified date */
  lastModified: Date;
}

/**
 * Configuration for the VectorStore
 */
export interface VectorStoreConfig {
  /** Configuration for the document loader */
  documentLoader: DocumentLoaderConfig;
  /** Chunk size for text splitting (default: 1000) */
  chunkSize?: number;
  /** Chunk overlap for text splitting (default: 200) */
  chunkOverlap?: number;
  /** Google API key for embeddings */
  googleApiKey: string;
}
