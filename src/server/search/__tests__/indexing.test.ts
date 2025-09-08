import { describe, it, expect, beforeEach } from 'vitest';
import { getSearchService, resetSearchService } from '../index';
import { SearchableDocument } from '../types';

describe('File Indexing Integration', () => {
  beforeEach(() => {
    // Reset the search service for each test
    resetSearchService();
  });

  it('should index TXT file content', () => {
    const searchService = getSearchService();

    const txtDocument: SearchableDocument = {
      id: 'txt-file-1',
      fileName: 'test.txt',
      originalName: 'test.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const content = 'This is a test text file with some content for searching.';

    searchService.addDocument(txtDocument, content);

    expect(searchService.getDocumentCount()).toBe(1);

    const results = searchService.search('test text file');
    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('txt-file-1');
    expect(results.results[0].fileExtension).toBe('txt');
  });

  it('should index MD file content', () => {
    const searchService = getSearchService();

    const mdDocument: SearchableDocument = {
      id: 'md-file-1',
      fileName: 'readme.md',
      originalName: 'readme.md',
      fileExtension: 'md',
      mimeType: 'text/markdown',
      uploadDate: new Date(),
      fileSize: 200,
    };

    const content =
      '# Project README\n\nThis is a markdown file with **bold text** and *italic text*.\n\n## Features\n- Search functionality\n- File upload\n- Content indexing';

    searchService.addDocument(mdDocument, content);

    expect(searchService.getDocumentCount()).toBe(1);

    const results = searchService.search('markdown file');
    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('md-file-1');
    expect(results.results[0].fileExtension).toBe('md');
  });

  it('should handle multiple file types in search', () => {
    const searchService = getSearchService();

    const txtDoc: SearchableDocument = {
      id: 'txt-1',
      fileName: 'notes.txt',
      originalName: 'notes.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 100,
    };

    const mdDoc: SearchableDocument = {
      id: 'md-1',
      fileName: 'documentation.md',
      originalName: 'documentation.md',
      fileExtension: 'md',
      mimeType: 'text/markdown',
      uploadDate: new Date(),
      fileSize: 200,
    };

    searchService.addDocument(txtDoc, 'This is a text file about programming.');
    searchService.addDocument(mdDoc, 'This is a markdown file about programming.');

    expect(searchService.getDocumentCount()).toBe(2);

    // Search should find both files
    const results = searchService.search('programming');
    expect(results.results).toHaveLength(2);

    // Filter by file type
    const txtResults = searchService.search('programming', { fileTypes: ['txt'] });
    expect(txtResults.results).toHaveLength(1);
    expect(txtResults.results[0].fileExtension).toBe('txt');

    const mdResults = searchService.search('programming', { fileTypes: ['md'] });
    expect(mdResults.results).toHaveLength(1);
    expect(mdResults.results[0].fileExtension).toBe('md');
  });

  it('should remove indexed files', () => {
    const searchService = getSearchService();

    const document: SearchableDocument = {
      id: 'file-to-delete',
      fileName: 'temp.txt',
      originalName: 'temp.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 50,
    };

    searchService.addDocument(document, 'Temporary file content.');

    expect(searchService.getDocumentCount()).toBe(1);

    // Remove the document
    searchService.removeDocument('file-to-delete');

    expect(searchService.getDocumentCount()).toBe(0);

    const results = searchService.search('temporary');
    expect(results.results).toHaveLength(0);
  });

  it('should handle empty content gracefully', () => {
    const searchService = getSearchService();

    const document: SearchableDocument = {
      id: 'empty-file',
      fileName: 'empty.txt',
      originalName: 'empty.txt',
      fileExtension: 'txt',
      mimeType: 'text/plain',
      uploadDate: new Date(),
      fileSize: 0,
    };

    // Add document with empty content
    searchService.addDocument(document, '');

    expect(searchService.getDocumentCount()).toBe(1);

    // Search should still work but return no results for empty content
    const results = searchService.search('anything');
    expect(results.results).toHaveLength(0);
  });
});
