import { describe, it, expect, beforeEach } from 'vitest';
import { FlexSearchService } from '../flexSearchService';
import { SearchableDocument } from '../types';

describe('FlexSearchService', () => {
  let searchService: FlexSearchService;

  beforeEach(() => {
    searchService = new FlexSearchService();
  });

  it('should initialize with correct configuration', () => {
    expect(searchService).toBeDefined();
  });

  it('should add and search documents', () => {
    const doc1: SearchableDocument = {
      id: '1',
      fileName: 'test1.txt',
      originalName: 'test1.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const doc2: SearchableDocument = {
      id: '2',
      fileName: 'test2.txt',
      originalName: 'test2.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 150,
    };

    // Add documents with content for indexing
    searchService.addDocument(doc1, 'This is a test document about programming and JavaScript.');
    searchService.addDocument(doc2, 'Another document about web development and React.');

    // FlexSearchService doesn't track document count, only search functionality

    // Search for documents - now returns SearchResponse
    const results = searchService.search('programming');
    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('1');

    // Search for another term
    const results2 = searchService.search('React');
    expect(results2.results).toHaveLength(1);
    expect(results2.results[0].id).toBe('2');
  });

  it('should handle empty search queries', () => {
    const doc: SearchableDocument = {
      id: '1',
      fileName: 'test.txt',
      originalName: 'test.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    searchService.addDocument(doc, 'Test content');

    const results = searchService.search('');
    expect(results.results).toHaveLength(0);
  });

  it('should search across different file types', () => {
    const doc1: SearchableDocument = {
      id: '1',
      fileName: 'test.txt',
      originalName: 'test.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const doc2: SearchableDocument = {
      id: '2',
      fileName: 'test.pdf',
      originalName: 'test.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      uploadDate: new Date(),
      fileSize: 200,
    };

    searchService.addDocument(doc1, 'Text document content');
    searchService.addDocument(doc2, 'PDF document content');

    // Search for documents containing "document"
    const results = searchService.search('document');
    expect(results.results).toHaveLength(2);
    expect(results.results.map((r) => r.id)).toContain('1');
    expect(results.results.map((r) => r.id)).toContain('2');
  });

  it('should remove documents', () => {
    const doc: SearchableDocument = {
      id: '1',
      fileName: 'test.txt',
      originalName: 'test.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    searchService.addDocument(doc, 'Test content');

    searchService.removeDocument('1');

    const results = searchService.search('test');
    expect(results.results).toHaveLength(0);
  });

  it('should update documents', () => {
    const doc: SearchableDocument = {
      id: '1',
      fileName: 'test.txt',
      originalName: 'test.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    searchService.addDocument(doc, 'Original content');

    const updatedDoc: SearchableDocument = {
      ...doc,
    };

    searchService.updateDocument(updatedDoc, 'Updated content with new information');

    const results = searchService.search('new information');
    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('1');
  });

  it('should clear all documents', () => {
    const doc1: SearchableDocument = {
      id: '1',
      fileName: 'test1.txt',
      originalName: 'test1.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const doc2: SearchableDocument = {
      id: '2',
      fileName: 'test2.txt',
      originalName: 'test2.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 150,
    };

    searchService.addDocument(doc1, 'Test content 1');
    searchService.addDocument(doc2, 'Test content 2');

    searchService.clear();

    const results = searchService.search('test');
    expect(results.results).toHaveLength(0);
  });

  it('should search by file name using contains match', () => {
    const doc1: SearchableDocument = {
      id: '1',
      fileName: 'my-document.txt',
      originalName: 'my-document.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const doc2: SearchableDocument = {
      id: '2',
      fileName: 'report.pdf',
      originalName: 'report.pdf',
      fileExtension: 'pdf',
      mimeType: 'application/pdf',
      uploadDate: new Date(),
      fileSize: 200,
    };

    const doc3: SearchableDocument = {
      id: '3',
      fileName: 'presentation.pptx',
      originalName: 'presentation.pptx',
      fileExtension: 'pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      uploadDate: new Date(),
      fileSize: 300,
    };

    // Add documents with content that doesn't match the search terms
    searchService.addDocument(doc1, 'Some random content here');
    searchService.addDocument(doc2, 'Another random content');
    searchService.addDocument(doc3, 'More random content');

    // Search by file name - should find documents even if content doesn't match
    const results1 = searchService.search('document');
    expect(results1.results).toHaveLength(1);
    expect(results1.results[0].id).toBe('1');
    expect(results1.results[0].fileName).toBe('my-document.txt');

    const results2 = searchService.search('report');
    expect(results2.results).toHaveLength(1);
    expect(results2.results[0].id).toBe('2');
    expect(results2.results[0].fileName).toBe('report.pdf');

    const results3 = searchService.search('presentation');
    expect(results3.results).toHaveLength(1);
    expect(results3.results[0].id).toBe('3');
    expect(results3.results[0].fileName).toBe('presentation.pptx');

    // Test case-insensitive search
    const results4 = searchService.search('DOCUMENT');
    expect(results4.results).toHaveLength(1);
    expect(results4.results[0].id).toBe('1');

    // Test partial match
    const results5 = searchService.search('doc');
    expect(results5.results).toHaveLength(1);
    expect(results5.results[0].id).toBe('1');
  });

  it('should combine content and file name search results', () => {
    const doc1: SearchableDocument = {
      id: '1',
      fileName: 'programming-guide.txt',
      originalName: 'programming-guide.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const doc2: SearchableDocument = {
      id: '2',
      fileName: 'notes.txt',
      originalName: 'notes.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 150,
    };

    // Add documents - one matches by content, one by filename
    searchService.addDocument(doc1, 'This is about programming concepts');
    searchService.addDocument(doc2, 'Some random content here');

    // Search for "programming" - should find both:
    // - doc1 by content match
    // - doc1 by filename match (should be deduplicated)
    const results = searchService.search('programming');
    expect(results.results).toHaveLength(1); // Should be deduplicated
    expect(results.results[0].id).toBe('1');

    // Search for "notes" - should find doc2 by filename
    const results2 = searchService.search('notes');
    expect(results2.results).toHaveLength(1);
    expect(results2.results[0].id).toBe('2');
  });
});
