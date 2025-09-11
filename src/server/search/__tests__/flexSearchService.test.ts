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
});
