import pdf from 'pdf-parse';

/**
 * Extract text content from various file types
 * @param fileBuffer - The file buffer to extract text from
 * @param fileName - The name of the file (used to determine file type)
 * @returns Promise<string> - The extracted text content
 */
export async function extractTextContent(fileBuffer: Buffer, fileName: string): Promise<string> {
  try {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    console.log(`🔧 Extracting text from ${fileExtension?.toUpperCase()} file: ${fileName}`);

    if (fileExtension === 'pdf') {
      console.log(`📄 Parsing PDF file: ${fileName} (${fileBuffer.length} bytes)`);
      const pdfData = await pdf(fileBuffer);
      const content = pdfData.text;
      console.log(
        `📄 PDF parsing complete: ${content.length} characters extracted from ${pdfData.numpages} pages`,
      );
      return content;
    } else if (fileExtension === 'txt' || fileExtension === 'md') {
      // Handle text files (TXT, MD)
      const content = fileBuffer.toString('utf-8');
      console.log(
        `📄 Text extraction complete: ${content.length} characters from ${fileExtension.toUpperCase()} file`,
      );
      return content;
    } else {
      console.log(`⚠️ Unsupported file type for text extraction: ${fileExtension}`);
      return '';
    }
  } catch (error) {
    console.error(`❌ Failed to extract content from ${fileName}:`, error);
    return '';
  }
}

/**
 * Check if a file type is supported for text extraction and indexing
 * @param fileName - The name of the file
 * @param _mimeType - The MIME type of the file (currently unused)
 * @returns boolean - True if the file should be indexed
 */
export function shouldIndexFile(fileName: string, _mimeType: string): boolean {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  return fileExtension === 'txt' || fileExtension === 'md' || fileExtension === 'pdf';
}

/**
 * Get the file extension from a filename
 * @param fileName - The name of the file
 * @returns string - The file extension in lowercase
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if a file type is supported for text extraction
 * @param fileName - The name of the file
 * @returns boolean - True if the file type is supported
 */
export function isTextExtractionSupported(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  return ['txt', 'md', 'pdf'].includes(extension);
}
