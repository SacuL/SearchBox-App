import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pdf-parse to avoid initialization issues
vi.mock('pdf-parse', () => ({
  default: vi.fn().mockResolvedValue({
    text: 'Mock PDF content',
    numpages: 1,
  }),
}));

// Mock mammoth to avoid any potential issues
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn().mockResolvedValue({
      value: 'Mock DOCX content',
    }),
  },
  extractRawText: vi.fn().mockResolvedValue({
    value: 'Mock DOCX content',
  }),
}));

import { extractFileContent } from '../extractor';

describe('Text Extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TXT files', () => {
    it('should extract text from TXT files', async () => {
      const content = 'This is a test text file.';
      const buffer = Buffer.from(content, 'utf-8');

      const result = await extractFileContent(buffer, 'test.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty TXT files', async () => {
      const buffer = Buffer.from('', 'utf-8');

      const result = await extractFileContent(buffer, 'empty.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe('');
    });

    it('should handle TXT files with only whitespace', async () => {
      const buffer = Buffer.from('   \n\t  ', 'utf-8');

      const result = await extractFileContent(buffer, 'whitespace.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe('   \n\t  '); // Content is no longer trimmed
    });
  });

  describe('MD files', () => {
    it('should extract text from MD files', async () => {
      const content = '# Test Markdown\n\nThis is a **test** markdown file.';
      const buffer = Buffer.from(content, 'utf-8');

      const result = await extractFileContent(buffer, 'test.md', 'text/markdown');

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
      expect(result.error).toBeUndefined();
    });

    it('should handle complex MD files', async () => {
      const content = `# Title

## Subtitle

- List item 1
- List item 2

**Bold text** and *italic text*

\`\`\`javascript
const code = 'example';
\`\`\`
`;
      const buffer = Buffer.from(content, 'utf-8');

      const result = await extractFileContent(buffer, 'complex.md', 'text/markdown');

      expect(result.success).toBe(true);
      expect(result.content).toBe(content); // Content is no longer trimmed
    });
  });

  describe('PDF files', () => {
    it('should extract text from PDF files', async () => {
      const buffer = Buffer.from('fake pdf content');

      const result = await extractFileContent(buffer, 'test.pdf', 'application/pdf');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Mock PDF content');
    });

    it('should handle PDF extraction errors gracefully', async () => {
      const { default: pdf } = await import('pdf-parse');
      vi.mocked(pdf).mockRejectedValueOnce(new Error('PDF parsing failed'));

      const buffer = Buffer.from('invalid pdf');

      const result = await extractFileContent(buffer, 'invalid.pdf', 'application/pdf');

      expect(result.success).toBe(false); // New extractor returns false on error
      expect(result.error).toBeDefined();
    });
  });

  describe('DOCX files', () => {
    it('should extract text from DOCX files', async () => {
      const buffer = Buffer.from('fake docx content');

      const result = await extractFileContent(
        buffer,
        'test.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );

      expect(result.success).toBe(true);
      expect(result.content).toBe('Mock DOCX content');
    });

    it('should handle DOCX files with various content', async () => {
      const buffer = Buffer.from('valid docx content');

      const result = await extractFileContent(
        buffer,
        'valid.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );

      expect(result.success).toBe(true);
      expect(result.content).toBe('Mock DOCX content');
    });
  });

  describe('Unsupported file types', () => {
    it('should attempt extraction for unsupported file types', async () => {
      const buffer = Buffer.from('some content');

      const result = await extractFileContent(buffer, 'image.jpg', 'image/jpeg');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should attempt extraction for files with no extension', async () => {
      const buffer = Buffer.from('some content');

      const result = await extractFileContent(buffer, 'noextension', 'text/plain');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle various unsupported extensions', async () => {
      const unsupportedTypes = [
        'image.png',
        'video.mp4',
        'audio.mp3',
        'archive.zip',
        'executable.exe',
        'script.js',
        'style.css',
        'data.json',
        'spreadsheet.xlsx',
        'presentation.pptx',
      ];

      for (const fileName of unsupportedTypes) {
        const buffer = Buffer.from('content');
        const result = await extractFileContent(buffer, fileName, 'application/octet-stream');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('File type detection', () => {
    it('should handle case-insensitive file extensions', async () => {
      const content = 'Test content';
      const buffer = Buffer.from(content, 'utf-8');

      const testCases = [
        'test.TXT',
        'test.Txt',
        'test.MD',
        'test.Md',
        'test.PDF',
        'test.Pdf',
        'test.DOCX',
        'test.Docx',
      ];

      for (const fileName of testCases) {
        const result = await extractFileContent(buffer, fileName, 'text/plain');
        expect(result.success).toBe(true);
      }
    });

    it('should handle files with multiple dots in name', async () => {
      const content = 'Test content';
      const buffer = Buffer.from(content, 'utf-8');

      const result = await extractFileContent(buffer, 'my.document.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
    });
  });

  describe('Error handling', () => {
    it('should handle extraction errors gracefully', async () => {
      // Test error handling through PDF parsing error (already tested above)
      const buffer = Buffer.from('test content');

      const result = await extractFileContent(buffer, 'test.txt', 'text/plain');

      // This should work normally
      expect(result.success).toBe(true);
      expect(result.content).toBe('test content');
    });
  });

  describe('Content validation', () => {
    it('should handle files with special characters', async () => {
      const content = 'Special chars: àáâãäåæçèéêë ñöøùúûüýþÿ';
      const buffer = Buffer.from(content, 'utf-8');

      const result = await extractFileContent(buffer, 'special.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
    });

    it('should handle files with unicode content', async () => {
      const content = 'Unicode: 🚀 📄 🔍 ✅ ❌';
      const buffer = Buffer.from(content, 'utf-8');

      const result = await extractFileContent(buffer, 'unicode.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
    });

    it('should handle very large content', async () => {
      const largeContent = 'A'.repeat(100000); // 100KB of 'A's
      const buffer = Buffer.from(largeContent, 'utf-8');

      const result = await extractFileContent(buffer, 'large.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.content).toBe(largeContent);
      expect(result.content?.length).toBe(100000);
    });
  });
});
