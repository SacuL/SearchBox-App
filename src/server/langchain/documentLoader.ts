import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Document } from '@langchain/core/documents';
import { DocumentLoaderConfig } from './types';

/**
 * DocumentLoader class that handles loading files from a directory using langchain.
 * This class provides a simple interface to load all documents from a specified directory.
 */
export class DocumentLoader {
  private directoryLoader: DirectoryLoader;

  /**
   * Creates a new DocumentLoader instance.
   * @param directoryPath - The path to the directory containing the files to load
   */
  constructor(config: DocumentLoaderConfig) {
    this.directoryLoader = new DirectoryLoader(config.directoryPath, {}, config.recursive ?? false);
  }

  /**
   * Loads all documents from the configured directory.
   * @returns Promise<Document[]> - Array of loaded documents
   */
  async loadDocuments(): Promise<Document[]> {
    try {
      const documents = await this.directoryLoader.load();
      return documents;
    } catch (error) {
      console.error('Error loading documents:', error);
      throw new Error(`Failed to load documents from directory: ${error as string}`);
    }
  }

  /**
   * Gets the directory path being used by this loader.
   * @returns string - The directory path
   */
  getDirectoryPath(): string {
    return this.directoryLoader.directoryPath;
  }
}
