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
