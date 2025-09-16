import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getVectorStoreService, resetVectorStoreService } from '../index';

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
      save: vi.fn().mockResolvedValue(undefined),
    }),
    load: vi.fn().mockResolvedValue({
      addDocuments: vi.fn().mockResolvedValue(undefined),
      similaritySearch: vi
        .fn()
        .mockResolvedValue([{ pageContent: 'test content', metadata: { fileId: 'test-id' } }]),
      save: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('@langchain/textsplitters', () => ({
  RecursiveCharacterTextSplitter: vi.fn().mockImplementation(() => ({
    splitDocuments: vi.fn().mockImplementation((docs) => docs),
  })),
}));

// Mock file system operations
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn().mockReturnValue([]),
  renameSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('path', () => ({
  join: vi.fn().mockImplementation((...args) => args.join('/')),
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('test-uuid-123'),
}));

describe('VectorStoreService', () => {
  let vectorStoreService: any;

  beforeEach(() => {
    resetVectorStoreService();
    vectorStoreService = getVectorStoreService();
  });

  afterEach(() => {
    resetVectorStoreService();
  });

  describe('basic functionality', () => {
    it('should initialize without errors', () => {
      expect(vectorStoreService).toBeDefined();
    });

    it('should check vector store availability', async () => {
      expect(await vectorStoreService.isAvailable()).toBe(false);
    });
  });

  describe('addDocumentToVectorStore', () => {
    it('should add a document successfully', async () => {
      const result = await vectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      expect(result.success).toBe(true);
    });

    it('should add the same document multiple times', async () => {
      // Add document first time
      const result1 = await vectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      // Try to add the same document again
      const result2 = await vectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
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

      const result = await vectorStoreService.buildVectorStore();

      expect(result.success).toBe(true);
    });

    it('should handle empty storage', async () => {
      const { StorageFactory } = await import('../../file-storage');
      const mockStorage = await (StorageFactory as any).getStorage();

      mockStorage.listFiles.mockResolvedValue([]);

      const result = await vectorStoreService.buildVectorStore();

      expect(result.success).toBe(true);
    });
  });

  describe('similaritySearch', () => {
    it('should return error when vector store is not built', async () => {
      const result = await vectorStoreService.similaritySearch('test query', 5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Vector store not available');
    });

    it('should perform search when vector store exists', async () => {
      // First create a vector store
      await vectorStoreService.addDocumentToVectorStore(
        'test-id',
        'test-file.txt',
        'test-file.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content',
      );

      const result = await vectorStoreService.similaritySearch('test query', 5);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('reset functionality', () => {
    it('should reset vector store state', async () => {
      // Add some documents
      await vectorStoreService.addDocumentToVectorStore(
        'test-id-1',
        'test-file-1.txt',
        'test-file-1.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content 1',
      );

      await vectorStoreService.addDocumentToVectorStore(
        'test-id-2',
        'test-file-2.txt',
        'test-file-2.txt',
        150,
        'text/plain',
        new Date(),
        'This is test content 2',
      );

      expect(await vectorStoreService.isAvailable()).toBe(true);

      // Reset
      vectorStoreService.reset();

      expect(await vectorStoreService.isAvailable()).toBe(false);
    });
  });

  describe('forceRebuildVectorStore', () => {
    it('should force rebuild vector store', async () => {
      // First add some documents
      await vectorStoreService.addDocumentToVectorStore(
        'test-id-1',
        'test-file-1.txt',
        'test-file-1.txt',
        100,
        'text/plain',
        new Date(),
        'This is test content 1',
      );

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

      const result = await vectorStoreService.forceRebuildVectorStore();

      expect(result.success).toBe(true);
    });
  });
});
