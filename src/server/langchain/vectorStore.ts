import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { DocumentLoader } from './index';
import { VectorStoreConfig } from './types';

/**
 * VectorStore class that builds a FAISS vector store from documents
 */
export class VectorStore {
  private documentLoader: DocumentLoader;
  private textSplitter: RecursiveCharacterTextSplitter;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private vectorStore: FaissStore | null = null;

  constructor(config: VectorStoreConfig) {
    // Initialize document loader
    this.documentLoader = new DocumentLoader(config.documentLoader);

    // Initialize text splitter
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize ?? 1000,
      chunkOverlap: config.chunkOverlap ?? 200,
    });

    // Initialize Gemini embeddings
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.googleApiKey,
      modelName: 'embedding-001', // Default Gemini embedding model
    });
  }

  /**
   * Builds the vector store from documents in the configured directory
   * @returns Promise<FaissStore> - The built FAISS vector store
   */
  async buildVectorStore(): Promise<FaissStore> {
    try {
      console.log('Loading documents...');
      // Load documents using the document loader
      const documents = await this.documentLoader.loadDocuments();
      console.log(`Loaded ${documents.length} documents`);

      if (documents.length === 0) {
        throw new Error('No documents found in the specified directory');
      }

      console.log('Splitting documents into chunks...');
      // Split documents into chunks
      const splitDocuments = await this.textSplitter.splitDocuments(documents);
      console.log(`Split into ${splitDocuments.length} chunks`);

      console.log('Building FAISS vector store...');
      // Build FAISS vector store using LangChain's fromDocuments method
      // This will automatically create embeddings for the documents
      this.vectorStore = await FaissStore.fromDocuments(splitDocuments, this.embeddings);

      console.log('Vector store built successfully!');
      return this.vectorStore;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error building vector store:', errorMessage);
      throw new Error(`Failed to build vector store: ${errorMessage}`);
    }
  }

  /**
   * Gets the current vector store instance
   * @returns FaissStore | null - The vector store or null if not built
   */
  getVectorStore(): FaissStore | null {
    return this.vectorStore;
  }

  /**
   * Performs a similarity search on the vector store
   * @param query - The search query
   * @param k - Number of results to return (default: 4)
   * @returns Promise<Document[]> - Array of similar documents
   */
  async similaritySearch(query: string, k = 4): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not built. Call buildVectorStore() first.');
    }

    try {
      // Perform similarity search using LangChain's method
      const results = await this.vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error performing similarity search:', errorMessage);
      throw new Error(`Failed to perform similarity search: ${errorMessage}`);
    }
  }
}
