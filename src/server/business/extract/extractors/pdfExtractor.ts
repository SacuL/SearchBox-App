import pdf from 'pdf-parse';
import type { ExtractorFunction } from '../types';

/**
 * Extract text from PDF files
 * @param buffer - The file buffer
 * @param fileName - The name of the file
 * @returns The extracted text content
 */
export const extractPdf: ExtractorFunction = async (
  buffer: Buffer,
  fileName: string,
): Promise<string> => {
  console.log(`📄 Parsing PDF file: ${fileName} (${buffer.length} bytes)`);

  const pdfData = await pdf(buffer);
  const content = pdfData.text;

  console.log(
    `📄 PDF parsing complete: ${content.length} characters extracted from ${pdfData.numpages} pages`,
  );
  return content;
};
