import mammoth from 'mammoth';
import type { ExtractorFunction } from '../types';

/**
 * Extract text from DOCX files
 * @param buffer - The file buffer
 * @param fileName - The name of the file
 * @returns The extracted text content
 */
export const extractDocx: ExtractorFunction = async (
  buffer: Buffer,
  fileName: string,
): Promise<string> => {
  console.log(`📄 Parsing DOCX file: ${fileName} (${buffer.length} bytes)`);

  const result = await mammoth.extractRawText({ buffer });
  const content = result.value;

  console.log(`📄 DOCX parsing complete: ${content.length} characters extracted`);
  return content;
};
