import type { ExtractorFunction } from '../types';

/**
 * Extract text from plain text files (TXT, MD)
 * @param buffer - The file buffer
 * @param fileName - The name of the file
 * @returns The extracted text content
 */
export const extractText: ExtractorFunction = async (
  buffer: Buffer,
  fileName: string,
): Promise<string> => {
  const content = buffer.toString('utf-8');
  console.log(`📄 Text extraction complete: ${content.length} characters from ${fileName}`);
  return content;
};
