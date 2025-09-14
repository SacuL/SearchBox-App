# Langchain Document Loader & Vector Store

This module provides document loading functionality and vector store building using LangChain with FAISS integration.

## Overview

The module includes two main classes:

- **DocumentLoader**: Loads documents from a directory using LangChain's DirectoryLoader with specific file type support
- **VectorStore**: Builds a FAISS vector store from documents using text splitting and Gemini embeddings

## Current Implementation

- **DocumentLoader**: A wrapper around LangChain's DirectoryLoader that loads files from a specified directory using appropriate loaders for each file type
- **VectorStore**: Builds and manages a FAISS vector store with text splitting and similarity search capabilities
- **Types**: TypeScript interfaces for configuration and results

## Supported File Types

- **PDF files** (.pdf) - Uses PDFLoader from @langchain/community
- **DOCX files** (.docx) - Uses DocxLoader from @langchain/community
- **Text files** (.txt) - Uses TextLoader from langchain
- **Markdown files** (.md) - Uses TextLoader from langchain

## Usage

### DocumentLoader

```typescript
import { DocumentLoader } from './langchain';

// Create a loader for a specific directory
const loader = new DocumentLoader({
  directoryPath: '/path/to/uploaded/files',
  recursive: false, // optional, defaults to false
});

// Load all documents
const documents = await loader.loadDocuments();
```

### VectorStore

```typescript
import { VectorStore } from './langchain';

// Create a vector store
const vectorStore = new VectorStore({
  documentLoader: {
    directoryPath: '/path/to/uploaded/files',
    recursive: false,
  },
  chunkSize: 1000, // optional, defaults to 1000
  chunkOverlap: 200, // optional, defaults to 200
  googleApiKey: process.env.GOOGLE_API_KEY!,
});

// Build the vector store
await vectorStore.buildVectorStore();

// Perform similarity search
const results = await vectorStore.similaritySearch('your search query', 5);
```

## Implementation Details

### DocumentLoader

The DocumentLoader uses LangChain's DirectoryLoader with a mapping of file extensions to their respective loaders:

```typescript
const loaders = {
  '.pdf': (path: string) => new PDFLoader(path),
  '.docx': (path: string) => new DocxLoader(path),
  '.txt': (path: string) => new TextLoader(path),
  '.md': (path: string) => new TextLoader(path),
};
```

This ensures that each file type is processed using the most appropriate loader for optimal text extraction. The DirectoryLoader automatically matches files by their extension and applies the corresponding loader, so each loader only processes files with the correct extension.

### VectorStore

The VectorStore class follows these steps:

1. **Document Loading**: Uses the DocumentLoader to load documents from the specified directory
2. **Text Splitting**: Uses RecursiveCharacterTextSplitter to split documents into manageable chunks
3. **Embedding Creation**: Uses Google Gemini embeddings to create vector representations
4. **FAISS Store**: Uses LangChain's FaissStore.fromDocuments to build the vector index
5. **Similarity Search**: Provides methods to search for similar documents

The process is optimized for performance and handles errors gracefully with detailed logging.

## Configuration

### DocumentLoaderConfig

```typescript
interface DocumentLoaderConfig {
  /** The directory path to load documents from */
  directoryPath: string;
  /** Whether to load files recursively from subdirectories (default: false) */
  recursive?: boolean;
}
```

### VectorStoreConfig

```typescript
interface VectorStoreConfig {
  /** Configuration for the document loader */
  documentLoader: DocumentLoaderConfig;
  /** Chunk size for text splitting (default: 1000) */
  chunkSize?: number;
  /** Chunk overlap for text splitting (default: 200) */
  chunkOverlap?: number;
  /** Google API key for embeddings */
  googleApiKey: string;
}
```

## Error Handling

Both classes include proper error handling and will throw descriptive errors if operations fail. All errors are logged to the console for debugging purposes.
