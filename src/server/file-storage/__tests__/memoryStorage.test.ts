import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorage } from '../memoryStorage';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    storage.clearAll(); // Clear any existing data
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(storage.initialize()).resolves.toBeUndefined();
    });
  });

  describe('saveFile', () => {
    it('should save a file successfully', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType);

      expect(result.success).toBe(true);
      expect(result.fileId).toBeDefined();
      expect(result.filePath).toBe(`memory://${result.fileId}`);
    });

    it('should generate unique file names', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result1 = await storage.saveFile(fileBuffer, fileName, mimeType);
      const result2 = await storage.saveFile(fileBuffer, fileName, mimeType);

      expect(result1.fileId).not.toBe(result2.fileId);
      expect(result1.filePath).not.toBe(result2.filePath);
    });

    it('should preserve original name when requested', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType, {
        preserveOriginalName: true,
      });

      const metadata = await storage.getFileMetadata(result.fileId!);
      expect(metadata?.originalName).toBe(fileName);
    });

    it('should calculate checksum', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType);
      const metadata = await storage.getFileMetadata(result.fileId!);

      expect(metadata?.checksum).toBeDefined();
      expect(metadata?.checksum).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });
  });

  describe('getFile', () => {
    it('should retrieve a saved file', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType);
      const retrievedBuffer = await storage.getFile(result.fileId!);

      expect(retrievedBuffer).toEqual(fileBuffer);
    });

    it('should return null for non-existent file', async () => {
      const retrievedBuffer = await storage.getFile('non-existent-id');
      expect(retrievedBuffer).toBeNull();
    });
  });

  describe('getFileMetadata', () => {
    it('should return correct metadata', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType);
      const metadata = await storage.getFileMetadata(result.fileId!);

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe(result.fileId);
      expect(metadata?.fileSize).toBe(fileBuffer.length);
      expect(metadata?.mimeType).toBe(mimeType);
      expect(metadata?.fileExtension).toBe('.txt');
      expect(metadata?.uploadDate).toBeInstanceOf(Date);
    });

    it('should return null for non-existent file', async () => {
      const metadata = await storage.getFileMetadata('non-existent-id');
      expect(metadata).toBeNull();
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType);
      const exists = await storage.fileExists(result.fileId!);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const exists = await storage.fileExists('non-existent-id');
      expect(exists).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.saveFile(fileBuffer, fileName, mimeType);
      const deleted = await storage.deleteFile(result.fileId!);

      expect(deleted).toBe(true);

      // Verify file is gone
      const retrievedBuffer = await storage.getFile(result.fileId!);
      const metadata = await storage.getFileMetadata(result.fileId!);
      const exists = await storage.fileExists(result.fileId!);

      expect(retrievedBuffer).toBeNull();
      expect(metadata).toBeNull();
      expect(exists).toBe(false);
    });

    it('should return false for non-existent file', async () => {
      const deleted = await storage.deleteFile('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('listFiles', () => {
    it('should return empty array when no files', async () => {
      const files = await storage.listFiles();
      expect(files).toEqual([]);
    });

    it('should return all saved files', async () => {
      const file1Buffer = Buffer.from('content 1');
      const file2Buffer = Buffer.from('content 2');

      const result1 = await storage.saveFile(file1Buffer, 'file1.txt', 'text/plain');
      const result2 = await storage.saveFile(file2Buffer, 'file2.pdf', 'application/pdf');

      const files = await storage.listFiles();

      expect(files).toHaveLength(2);
      expect(files.map((f) => f.id)).toContain(result1.fileId);
      expect(files.map((f) => f.id)).toContain(result2.fileId);
    });
  });

  describe('getStorageStats', () => {
    it('should return correct statistics', async () => {
      const file1Buffer = Buffer.from('content 1');
      const file2Buffer = Buffer.from('content 2');

      await storage.saveFile(file1Buffer, 'file1.txt', 'text/plain');
      await storage.saveFile(file2Buffer, 'file2.txt', 'text/plain');

      const stats = storage.getStorageStats();

      expect(stats.fileCount).toBe(2);
      expect(stats.totalSize).toBe(file1Buffer.length + file2Buffer.length);
      expect(stats.memoryUsage).toMatch(/^\d+\.\d{2} MB$/);
    });
  });

  describe('clearAll', () => {
    it('should clear all files', async () => {
      const fileBuffer = Buffer.from('test content');
      await storage.saveFile(fileBuffer, 'test.txt', 'text/plain');

      expect(await storage.listFiles()).toHaveLength(1);

      storage.clearAll();

      expect(await storage.listFiles()).toHaveLength(0);
    });
  });
});
