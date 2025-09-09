import { describe, it, expect, beforeEach } from 'vitest';
import { createCallerFactory } from '../../trpc';
import { appRouter } from '../../routers/_app';
import { resetSearchService } from '../index';
import { SearchableDocument } from '../types';

describe('Search Router', () => {
  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({});

  beforeEach(() => {
    // Reset the search service to start with a clean state
    resetSearchService();
  });

  it('should search for documents with basic query', async () => {
    // First, add a document to the search index
    const document: SearchableDocument = {
      id: 'test-doc-1',
      fileName: 'test-document.txt',
      originalName: 'test-document.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    // Add document to index
    await caller.search.addToIndex({
      ...document,
      content: 'This is a test document about programming and JavaScript development.',
    });

    // Search for the document
    const result = await caller.search.search({
      query: 'programming',
      limit: 10,
      offset: 0,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.results).toHaveLength(1);
    expect(result.data?.results[0].id).toBe('test-doc-1');
    expect(result.data?.results[0].fileName).toBe('test-document.txt');
    expect(result.data?.query).toBe('programming');
    expect(result.data?.took).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty search query with validation error', async () => {
    try {
      await caller.search.search({
        query: '',
        limit: 10,
        offset: 0,
      });
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error: any) {
      // Expect validation error for empty query
      expect(error.message).toContain('Search query is required');
    }
  });

  it('should filter by file types', async () => {
    // Add multiple documents with different file types
    const txtDoc: SearchableDocument = {
      id: 'txt-doc',
      fileName: 'notes.txt',
      originalName: 'notes.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const pdfDoc: SearchableDocument = {
      id: 'pdf-doc',
      fileName: 'manual.pdf',
      originalName: 'manual.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      uploadDate: new Date(),
      fileSize: 200,
    };

    // Add both documents
    await caller.search.addToIndex({
      ...txtDoc,
      content: 'Text document about programming',
    });

    await caller.search.addToIndex({
      ...pdfDoc,
      content: 'PDF document about programming',
    });

    // Search with file type filter
    const result = await caller.search.search({
      query: 'programming',
      limit: 10,
      offset: 0,
      fileTypes: ['txt'],
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.results).toHaveLength(1);
    expect(result.data?.results[0].fileExtension).toBe('txt');
  });

  it('should get index statistics', async () => {
    // Add a document
    const document: SearchableDocument = {
      id: 'stats-doc',
      fileName: 'stats.txt',
      originalName: 'stats.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    await caller.search.addToIndex({
      ...document,
      content: 'Document for statistics test',
    });

    // Get statistics
    const result = await caller.search.getIndexStats();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.documentCount).toBe(1);
    expect(result.data?.indexSize).toBeGreaterThanOrEqual(0);
  });

  it('should clear the search index', async () => {
    // Add a document first
    const document: SearchableDocument = {
      id: 'clear-doc',
      fileName: 'clear.txt',
      originalName: 'clear.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    await caller.search.addToIndex({
      ...document,
      content: 'Document to be cleared',
    });

    // Verify document exists
    const statsBefore = await caller.search.getIndexStats();
    expect(statsBefore.data?.documentCount).toBe(1);

    // Clear the index
    const clearResult = await caller.search.clearIndex();
    expect(clearResult.success).toBe(true);

    // Verify index is cleared
    const statsAfter = await caller.search.getIndexStats();
    expect(statsAfter.data?.documentCount).toBe(0);
  });

  it('should handle pagination correctly', async () => {
    // Add multiple documents
    const documents = [
      {
        id: 'doc-1',
        fileName: 'doc1.txt',
        originalName: 'doc1.txt',
        fileExtension: 'txt',
        mimeType: 'text/plain',
        uploadDate: new Date(),
        fileSize: 100,
        content: 'First document about programming',
      },
      {
        id: 'doc-2',
        fileName: 'doc2.txt',
        originalName: 'doc2.txt',
        fileExtension: 'txt',
        mimeType: 'text/plain',
        uploadDate: new Date(),
        fileSize: 100,
        content: 'Second document about programming',
      },
      {
        id: 'doc-3',
        fileName: 'doc3.txt',
        originalName: 'doc3.txt',
        fileExtension: 'txt',
        mimeType: 'text/plain',
        uploadDate: new Date(),
        fileSize: 100,
        content: 'Third document about programming',
      },
    ];

    // Add all documents
    for (const doc of documents) {
      await caller.search.addToIndex(doc);
    }

    // Test pagination - first page
    const firstPage = await caller.search.search({
      query: 'programming',
      limit: 2,
      offset: 0,
    });

    expect(firstPage.success).toBe(true);
    expect(firstPage.data?.results).toHaveLength(2);
    expect(firstPage.data?.total).toBe(3);

    // Test pagination - second page
    const secondPage = await caller.search.search({
      query: 'programming',
      limit: 2,
      offset: 2,
    });

    expect(secondPage.success).toBe(true);
    expect(secondPage.data?.results).toHaveLength(1);
    expect(secondPage.data?.total).toBe(3);
  });

  it('should remove documents from index', async () => {
    // Add a document
    const document: SearchableDocument = {
      id: 'remove-doc',
      fileName: 'remove.txt',
      originalName: 'remove.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    await caller.search.addToIndex({
      ...document,
      content: 'Document to be removed',
    });

    // Verify document exists
    const searchBefore = await caller.search.search({
      query: 'removed',
      limit: 10,
      offset: 0,
    });
    expect(searchBefore.data?.results).toHaveLength(1);

    // Remove document
    const removeResult = await caller.search.removeFromIndex({
      id: 'remove-doc',
    });
    expect(removeResult.success).toBe(true);

    // Verify document is removed
    const searchAfter = await caller.search.search({
      query: 'removed',
      limit: 10,
      offset: 0,
    });
    expect(searchAfter.data?.results).toHaveLength(0);
  });

  it('should return correct document count for conditional display', async () => {
    // Start with empty index
    const statsEmpty = await caller.search.getIndexStats();
    expect(statsEmpty.success).toBe(true);
    expect(statsEmpty.data?.documentCount).toBe(0);

    // Add a document
    const document: SearchableDocument = {
      id: 'conditional-test-doc',
      fileName: 'conditional-test.txt',
      originalName: 'conditional-test.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    await caller.search.addToIndex({
      ...document,
      content: 'Document for conditional display test',
    });

    // Verify document count increased
    const statsWithDoc = await caller.search.getIndexStats();
    expect(statsWithDoc.success).toBe(true);
    expect(statsWithDoc.data?.documentCount).toBe(1);

    // Remove document
    await caller.search.removeFromIndex({
      id: 'conditional-test-doc',
    });

    // Verify document count is back to 0
    const statsAfterRemoval = await caller.search.getIndexStats();
    expect(statsAfterRemoval.success).toBe(true);
    expect(statsAfterRemoval.data?.documentCount).toBe(0);
  });
});
