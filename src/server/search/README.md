# Search System

This directory contains the FlexSearch-based search system for the SearchBox application.

## Architecture

The search system uses FlexSearch with the following configuration:

- **Tokenizer**: `bidirectional` - Provides better search results by matching from both directions
- **Encoding**: `Normalize` - Normalizes text for better matching
- **Suggest**: `false` - Disabled for now (can be enabled later for autocomplete)

## Components

- **`types.ts`** - TypeScript interfaces for search functionality
- **`flexSearchService.ts`** - Main FlexSearch service implementation
- **`index.ts`** - Service factory and exports
- **`__tests__/`** - Test suite for the search service

## FlexSearch Configuration

```typescript
{
  tokenizer: 'bidirectional',  // Better search matching
  encoding: 'Normalize',       // Text normalization
  suggest: false,              // No autocomplete for now
  cache: true,                 // Performance optimization
  async: false,                // Synchronous operations
  worker: false,               // No web workers
  threshold: 0,                // Exact matching
  resolution: 3,               // Search precision
  depth: 2,                    // Search depth
}
```

## Usage

### Basic Search

```typescript
import { getSearchService } from './search';

const searchService = getSearchService();

// Add a document (metadata only, content for indexing)
const document = {
  id: 'file-123',
  fileName: 'document.txt',
  originalName: 'document.txt',
  fileExtension: 'txt',
  mimeType: 'text/plain',
  uploadDate: new Date(),
  fileSize: 1024,
};

// Content is used for indexing but not stored in metadata
const content = 'This is the file content...';
searchService.addDocument(document, content);

// Search for documents
const results = searchService.search('document content', {
  limit: 20,
  offset: 0,
  fileTypes: ['txt', 'pdf'],
});
```

### tRPC Endpoints

- `search.search()` - Search for files
- `search.addToIndex()` - Add document to index
- `search.removeFromIndex()` - Remove document from index
- `search.updateInIndex()` - Update document in index
- `search.getIndexStats()` - Get index statistics
- `search.clearIndex()` - Clear entire index

## Integration with Storage

The search system integrates with the file storage system:

1. **File Upload**: When files are uploaded, content is extracted and indexed
2. **File Deletion**: When files are deleted, they're removed from the search index
3. **File Updates**: When files are updated, the search index is updated

## Performance

- **Search Speed**: Sub-second response times for most queries
- **Memory Usage**: Efficient indexing with FlexSearch
- **Scalability**: Can handle thousands of documents

## Future Enhancements

- **Fuzzy Search**: Enable fuzzy matching for typos
- **Autocomplete**: Enable suggestions for search queries
- **Highlighting**: Add search result highlighting
- **Faceted Search**: Add filters for file types, dates, etc.
- **Ranking**: Implement relevance scoring
