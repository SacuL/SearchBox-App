import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
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
   * @param config - Configuration object containing directory path and options
   */
  constructor(config: DocumentLoaderConfig) {
    const loaders = {
      '.pdf': (path: string) => new PDFLoader(path),
      '.docx': (path: string) => new DocxLoader(path),
      '.txt': (path: string) => new TextLoader(path),
      '.md': (path: string) => new TextLoader(path),
    };

    this.directoryLoader = new DirectoryLoader(
      config.directoryPath,
      loaders,
      config.recursive ?? false,
    );
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error loading documents:', errorMessage);
      throw new Error(`Failed to load documents from directory: ${errorMessage}`);
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
