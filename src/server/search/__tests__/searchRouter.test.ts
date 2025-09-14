import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCallerFactory } from '../../trpc';
import { appRouter } from '../../routers/_app';
import { FlexSearchFactory } from '../index';
import { SearchableDocument } from '../types';

// Mock pdf-parse to prevent file system access during tests
vi.mock('pdf-parse', () => ({
  default: vi.fn().mockResolvedValue({
    text: 'Mock PDF content',
    numpages: 1,
  }),
}));

describe('Search Router', () => {
  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({});

  beforeEach(() => {
    // Reset the search service to start with a clean state
    FlexSearchFactory.reset();
  });

  it('should search for documents with basic query', async () => {
    // First, add a document to the search index using the search service directly
    const document: SearchableDocument = {
      id: 'test-doc-1',
      fileName: 'test-document.txt',
      originalName: 'test-document.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    // Add document to index using search service directly
    const searchService = FlexSearchFactory.getService();
    searchService.addDocument(
      document,
      'This is a test document about programming and JavaScript development.',
    );

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

    // Add both documents using search service directly
    const searchService = FlexSearchFactory.getService();
    searchService.addDocument(txtDoc, 'Text document about programming');
    searchService.addDocument(pdfDoc, 'PDF document about programming');

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
    // Add a document using search service directly
    const document: SearchableDocument = {
      id: 'stats-doc',
      fileName: 'stats.txt',
      originalName: 'stats.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const searchService = FlexSearchFactory.getService();
    searchService.addDocument(document, 'Document for statistics test');

    // Get statistics
    const result = await caller.search.getIndexStats();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.documentCount).toBe(1); // Storage tracks document count
    expect(result.data?.indexSize).toBe(0); // FlexSearch doesn't expose index size
  });

  it('should handle pagination correctly', async () => {
    // Add multiple documents using search service directly
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

    // Add all documents using search service directly
    const searchService = FlexSearchFactory.getService();
    for (const doc of documents) {
      searchService.addDocument(doc, doc.content);
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
});
