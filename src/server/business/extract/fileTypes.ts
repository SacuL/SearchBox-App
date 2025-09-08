import type { FileTypeInfo } from './types';

/**
 * Supported file types for text extraction
 */
export const SUPPORTED_EXTENSIONS = ['txt', 'md', 'pdf', 'docx'] as const;

/**
 * File type registry with metadata
 */
export const FILE_TYPE_REGISTRY: Record<string, FileTypeInfo> = {
  txt: {
    extension: 'txt',
    mimeType: 'text/plain',
    supportsExtraction: true,
  },
  md: {
    extension: 'md',
    mimeType: 'text/markdown',
    supportsExtraction: true,
  },
  pdf: {
    extension: 'pdf',
    mimeType: 'application/pdf',
    supportsExtraction: true,
  },
  docx: {
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    supportsExtraction: true,
  },
};

/**
 * Get file extension from filename
 * @param fileName - The filename to extract extension from
 * @returns The file extension in lowercase, or empty string if none
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if a file type supports text extraction
 * @param fileName - The name of the file
 * @returns True if the file supports text extraction
 */
export function supportsTextExtraction(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  const fileType = FILE_TYPE_REGISTRY[extension];
  return fileType?.supportsExtraction ?? false;
}

/**
 * Get file type information
 * @param fileName - The name of the file
 * @returns File type information or null if unknown
 */
export function getFileTypeInfo(fileName: string): FileTypeInfo | null {
  const extension = getFileExtension(fileName);
  return FILE_TYPE_REGISTRY[extension] || null;
}
