# Vector Store Service

This service manages a singleton FAISS vector store instance that integrates with the existing upload system.

## Overview

The VectorStoreService provides:

- **Singleton Management**: Ensures a single vector store instance across the application
- **In-Memory Integration**: Works with the existing memory storage system
- **Automatic Updates**: Rebuilds the vector store when documents are uploaded
- **Semantic Search**: Provides similarity search using Gemini embeddings

## How It Works

1. **File Upload**: When a user uploads a document, the UploadService processes it
2. **Text Extraction**: The file content is extracted using the existing text extraction system
3. **Vector Store Update**: The VectorStoreService rebuilds the entire vector store with all uploaded documents
4. **Semantic Search**: Users can perform similarity searches using natural language queries

## Integration Points

### Upload Process

- **UploadService**: Automatically calls `VectorStoreService.buildVectorStore()` after each upload
- **Upload Result**: Includes `vectorStoreUpdated` field indicating if the vector store was updated

### Search API

- **Search Router**: Provides `vectorSearch` endpoint for semantic search
- **Availability Check**: `isVectorStoreAvailable` endpoint to check if vector store is ready

## Configuration

The service requires a Google API key for Gemini embeddings:

```bash
GOOGLE_API_KEY=your_google_api_key_here
```

## API Endpoints

### Vector Search

```typescript
// POST /api/trpc/search.vectorSearch
{
  query: "your search query",
  limit: 4 // optional, default 4
}
```

### Check Availability

```typescript
// GET /api/trpc/search.isVectorStoreAvailable
// Returns: { success: true, data: { available: boolean } }
```

## Performance Considerations

- **Full Rebuild**: Currently rebuilds the entire vector store on each upload
- **Memory Usage**: Stores all documents and embeddings in memory
- **API Limits**: Respects Google Gemini API rate limits

## Future Improvements

- **Incremental Updates**: Add documents to existing vector store instead of full rebuild
- **Persistence**: Save vector store to disk for faster startup
- **Batch Processing**: Process multiple uploads before rebuilding
- **Caching**: Cache embeddings to avoid re-computation
