# Langchain Module

This module provides basic LangChain type exports for the SearchBox application.

## Overview

The module currently exports:

- **Document**: TypeScript type from @langchain/core/documents

## Current Implementation

The SearchBox application uses a custom `VectorStoreService` located in `src/server/vector-store/` that:

- Uses the text-extraction module to extract content from uploaded files
- Creates FAISS vector stores directly using Google Generative AI embeddings
- Manages document storage and retrieval through the file-storage module

## Usage

```typescript
import { Document } from './langchain';

// Use the Document type for type safety
const document: Document = {
  pageContent: 'Your content here',
  metadata: {
    /* metadata */
  },
};
```
