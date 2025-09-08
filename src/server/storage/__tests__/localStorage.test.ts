import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { LocalStorage } from '../localStorage';

describe('LocalStorage', () => {
  const testUploadsDir = 'test-uploads';
  let storage: LocalStorage;

  beforeEach(async () => {
    storage = new LocalStorage(testUploadsDir);
    await storage.initialize();
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should initialize storage and create directories', async () => {
    const metadataPath = join(testUploadsDir, 'metadata.json');
    const metadataExists = await fs
      .access(metadataPath)
      .then(() => true)
      .catch(() => false);
    expect(metadataExists).toBe(true);
  });

  it('should save and retrieve a file', async () => {
    const testContent = Buffer.from('Hello, World!');
    const fileName = 'test.txt';
    const mimeType = 'text/plain';

    const result = await storage.saveFile(testContent, fileName, mimeType);

    expect(result.success).toBe(true);
    expect(result.fileId).toBeDefined();

    const retrievedContent = await storage.getFile(result.fileId!);
    expect(retrievedContent).toEqual(testContent);
  });

  it('should get file metadata', async () => {
    const testContent = Buffer.from('Test content');
    const fileName = 'metadata-test.txt';
    const mimeType = 'text/plain';

    const result = await storage.saveFile(testContent, fileName, mimeType);
    const metadata = await storage.getFileMetadata(result.fileId!);

    expect(metadata).toBeDefined();
    expect(metadata?.fileName).toContain('metadata-test');
    expect(metadata?.fileSize).toBe(testContent.length);
    expect(metadata?.mimeType).toBe(mimeType);
    expect(metadata?.checksum).toBeDefined();
  });

  it('should list all files', async () => {
    const files = [
      { content: Buffer.from('File 1'), name: 'file1.txt', type: 'text/plain' },
      { content: Buffer.from('File 2'), name: 'file2.txt', type: 'text/plain' },
    ];

    for (const file of files) {
      await storage.saveFile(file.content, file.name, file.type);
    }

    const allFiles = await storage.listFiles();
    expect(allFiles).toHaveLength(2);
  });

  it('should delete a file', async () => {
    const testContent = Buffer.from('To be deleted');
    const fileName = 'delete-test.txt';
    const mimeType = 'text/plain';

    const result = await storage.saveFile(testContent, fileName, mimeType);
    const fileId = result.fileId!;

    const existsBefore = await storage.fileExists(fileId);
    expect(existsBefore).toBe(true);

    const deleteResult = await storage.deleteFile(fileId);
    expect(deleteResult).toBe(true);

    const existsAfter = await storage.fileExists(fileId);
    expect(existsAfter).toBe(false);
  });

  it('should check file existence', async () => {
    const testContent = Buffer.from('Existence test');
    const fileName = 'existence-test.txt';
    const mimeType = 'text/plain';

    const result = await storage.saveFile(testContent, fileName, mimeType);
    const fileId = result.fileId!;

    const exists = await storage.fileExists(fileId);
    expect(exists).toBe(true);

    const nonExistent = await storage.fileExists('non-existent-id');
    expect(nonExistent).toBe(false);
  });
});
