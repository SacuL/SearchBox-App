import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VectorStoreService } from '../index';

// Mock all external dependencies
vi.mock('../../file-storage', () => ({
  StorageFactory: {
    getStorage: vi.fn().mockResolvedValue({
      listFiles: vi.fn(),
      getFile: vi.fn(),
      getFileMetadata: vi.fn(),
    }),
  },
}));

vi.mock('../../text-extraction', () => ({
  extractFileContent: vi.fn().mockResolvedValue({
    success: true,
    content: 'test content',
  }),
}));

vi.mock('../../env', () => ({
  env: {
    GOOGLE_API_KEY: 'test-api-key',
  },
}));

// Mock LangChain modules
vi.mock('@langchain/google-genai', () => ({
  GoogleGenerativeAIEmbeddings: vi.fn().mockImplementation(() => ({
    embedQuery: vi.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4, 0.5]),
    embedDocuments: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3, 0.4, 0.5]]),
  })),
}));

vi.mock('@langchain/community/vectorstores/faiss', () => ({
  FaissStore: {
    fromDocuments: vi.fn().mockResolvedValue({
      addDocuments: vi.fn().mockResolvedValue(undefined),
      similaritySearch: vi
        .fn()
        .mockResolvedValue([{ pageContent: 'test content', metadata: { fileId: 'test-id' } }]),
    }),
  },
}));

vi.mock('@langchain/textsplitters', () => ({
  RecursiveCharacterTextSplitter: vi.fn().mockImplementation(() => ({
    splitDocuments: vi.fn().mockImplementation((docs) => docs),
  })),
}));

describe('VectorStoreService', () => {
  beforeEach(() => {
    VectorStoreService.reset();
  });

  afterEach(() => {
    VectorStoreService.reset();
  });

  describe('basic functionality', () => {
    it('should initialize without errors', () => {
      expect(VectorStoreService).toBeDefined();
    });

    it('should track processed files count', () => {
      expect(VectorStoreService.getProcessedFilesCount()).toBe(0);
    });

    it('should check if file is processed', () => {
      expect(VectorStoreService.isFileProcessed('test-id')).toBe(false);
    });

    it('should check vector store availability', async () => {
      expect(await VectorStoreService.isAvailable()).toBe(false);
    });
  });

  describe('addDocumentToVectorStore', () => {
    it('should add a document successfully', async () => {
      const result = await VectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      expect(result.success).toBe(true);
      expect(VectorStoreService.isFileProcessed('test-id')).toBe(true);
      expect(VectorStoreService.getProcessedFilesCount()).toBe(1);
    });

    it('should skip already processed files', async () => {
      // Add document first time
      await VectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      // Try to add the same document again
      const result = await VectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      expect(result.success).toBe(true);
      expect(VectorStoreService.getProcessedFilesCount()).toBe(1); // Should still be 1
    });
  });

  describe('buildVectorStore', () => {
    it('should build vector store from storage files', async () => {
      const { StorageFactory } = await import('../../file-storage');
      const mockStorage = await (StorageFactory as any).getStorage();

      mockStorage.listFiles.mockResolvedValue([
        {
          id: 'file-1',
          fileName: 'test1.txt',
          originalName: 'test1.txt',
          fileSize: 100,
          mimeType: 'text/plain',
          uploadDate: new Date(),
        },
      ]);

      // Mock getFile to return actual content
      mockStorage.getFile.mockResolvedValue(Buffer.from('test content'));

      const result = await VectorStoreService.buildVectorStore();

      expect(result.success).toBe(true);
      expect(VectorStoreService.getProcessedFilesCount()).toBe(1);
    });

    it('should handle empty storage', async () => {
      const { StorageFactory } = await import('../../file-storage');
      const mockStorage = await (StorageFactory as any).getStorage();

      mockStorage.listFiles.mockResolvedValue([]);

      const result = await VectorStoreService.buildVectorStore();

      expect(result.success).toBe(true);
      expect(VectorStoreService.getProcessedFilesCount()).toBe(0);
    });
  });

  describe('similaritySearch', () => {
    it('should return error when vector store is not built', async () => {
      const result = await VectorStoreService.similaritySearch('test query', 5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Vector store not built');
    });

    it('should perform search when vector store exists', async () => {
      // First create a vector store
      await VectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      const result = await VectorStoreService.similaritySearch('test query', 5);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('reset functionality', () => {
    it('should reset vector store state', async () => {
      // Add some documents
      await VectorStoreService.addDocumentToVectorStore(
        'test-id-1',
        'test-file-1.txt',
        'test-file-1.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content 1',
      );

      await VectorStoreService.addDocumentToVectorStore(
        'test-id-2',
        'test-file-2.txt',
        'test-file-2.txt',
        150,
        'text/plain',
        new Date(),
        'This is test content 2',
      );

      expect(VectorStoreService.getProcessedFilesCount()).toBe(2);
      expect(await VectorStoreService.isAvailable()).toBe(true);

      // Reset
      VectorStoreService.reset();

      expect(VectorStoreService.getProcessedFilesCount()).toBe(0);
      expect(await VectorStoreService.isAvailable()).toBe(false);
    });
  });

  describe('forceRebuildVectorStore', () => {
    it('should force rebuild and clear processed files', async () => {
      // First add some documents
      await VectorStoreService.addDocumentToVectorStore(
        'test-id-1',
        'test-file-1.txt',
        'test-file-1.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content 1',
      );

      expect(VectorStoreService.getProcessedFilesCount()).toBe(1);

      // Setup mock for rebuild
      const { StorageFactory } = await import('../../file-storage');
      const mockStorage = await (StorageFactory as any).getStorage();

      mockStorage.listFiles.mockResolvedValue([
        {
          id: 'test-id-1',
          fileName: 'test-file-1.txt',
          originalName: 'test-file-1.txt',
          fileSize: 100,
          mimeType: 'text/plain',
          uploadDate: new Date(),
        },
        {
          id: 'test-id-2',
          fileName: 'test-file-2.txt',
          originalName: 'test-file-2.txt',
          fileSize: 150,
          mimeType: 'text/plain',
          uploadDate: new Date(),
        },
      ]);

      // Mock getFile to return actual content
      mockStorage.getFile.mockResolvedValue(Buffer.from('test content'));

      const result = await VectorStoreService.forceRebuildVectorStore();

      expect(result.success).toBe(true);
      expect(VectorStoreService.getProcessedFilesCount()).toBe(2);
    });
  });
});
