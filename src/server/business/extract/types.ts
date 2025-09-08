/**
 * Result of a text extraction operation
 */
export interface ExtractResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * File type information
 */
export interface FileTypeInfo {
  /** File extension (lowercase) */
  extension: string;
  /** MIME type */
  mimeType: string;
  /** Whether this file type supports text extraction */
  supportsExtraction: boolean;
}

/**
 * Extractor function signature
 */
export type ExtractorFunction = (buffer: Buffer, fileName: string) => Promise<string>;

/**
 * Extractor registration
 */
export interface ExtractorRegistration {
  /** File extensions this extractor handles */
  extensions: string[];
  /** The extraction function */
  extractor: ExtractorFunction;
  /** Human-readable name for logging */
  name: string;
}
