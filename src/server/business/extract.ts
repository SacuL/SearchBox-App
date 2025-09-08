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

export interface ExtractResult {
  success: boolean;
  content?: string;
  shouldIndex: boolean;
  error?: string;
}

/**
 * Extract text content from a file
 * @param fileBuffer - The file buffer to extract text from
 * @param fileName - The name of the file
 * @param mimeType - The MIME type of the file
 * @returns Promise<ExtractResult> - The result of the extraction operation
 */
export async function extractFileContent(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<ExtractResult> {
  try {
    const shouldIndex = shouldIndexFile(fileName, mimeType);

    if (!shouldIndex) {
      console.log('⏭️ File type not supported for text extraction, skipping');
      return {
        success: true,
        shouldIndex: false,
      };
    }

    console.log('🔍 Starting text extraction process...');
    console.log(`📄 Extracting text content from ${fileName}...`);

    const content = await extractTextContent(fileBuffer, fileName);

    if (!content || content.trim().length === 0) {
      console.log('⚠️ No content extracted or empty content');
      return {
        success: true,
        content: '',
        shouldIndex: true,
      };
    }

    console.log(`📄 Text extraction complete: ${content.length} characters extracted`);

    return {
      success: true,
      content,
      shouldIndex: true,
    };
  } catch (error) {
    console.error('❌ Text extraction failed:', error);
    return {
      success: false,
      shouldIndex: shouldIndexFile(fileName, mimeType),
      error: error instanceof Error ? error.message : 'Unknown extraction error',
    };
  }
}
