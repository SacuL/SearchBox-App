# Langchain Document Loader

This module provides document loading functionality using LangChain's DirectoryLoader with specific loaders for different file types.

## Overview

The `DocumentLoader` class is designed to load documents from a directory using LangChain's built-in directory loader with specific file type support. This is the foundation for building a vector search system that can process uploaded documents.

## Current Implementation

- **DocumentLoader**: A wrapper around LangChain's DirectoryLoader that loads files from a specified directory using appropriate loaders for each file type
- **Types**: TypeScript interfaces for configuration and results

## Supported File Types

- **PDF files** (.pdf) - Uses PDFLoader from @langchain/community
- **DOCX files** (.docx) - Uses DocxLoader from @langchain/community
- **Text files** (.txt) - Uses TextLoader from langchain
- **Markdown files** (.md) - Uses TextLoader from langchain

## Usage

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

## Implementation Details

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

## Configuration

The DocumentLoader accepts a configuration object with the following options:

```typescript
interface DocumentLoaderConfig {
  /** The directory path to load documents from */
  directoryPath: string;
  /** Whether to load files recursively from subdirectories (default: false) */
  recursive?: boolean;
}
```

## Error Handling

The DocumentLoader includes proper error handling and will throw descriptive errors if document loading fails. All errors are logged to the console for debugging purposes.
