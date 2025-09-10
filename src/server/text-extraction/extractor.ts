import type { ExtractResult, ExtractorRegistration } from './types';
import { getFileExtension, getFileTypeInfo } from './fileTypes';
import { extractText, extractPdf, extractDocx } from './extractors';

/**
 * Registered extractors for different file types
 */
const EXTRACTORS: ExtractorRegistration[] = [
  {
    extensions: ['txt', 'md'],
    extractor: extractText,
    name: 'Text Extractor',
  },
  {
    extensions: ['pdf'],
    extractor: extractPdf,
    name: 'PDF Extractor',
  },
  {
    extensions: ['docx'],
    extractor: extractDocx,
    name: 'DOCX Extractor',
  },
];

/**
 * Find the appropriate extractor for a file type
 * @param extension - The file extension
 * @returns The extractor registration or null if not found
 */
function findExtractor(extension: string): ExtractorRegistration | null {
  return (
    EXTRACTORS.find((extractor) => extractor.extensions.includes(extension.toLowerCase())) || null
  );
}

/**
 * Extract text content from a file buffer
 * @param buffer - The file buffer to extract text from
 * @param fileName - The name of the file
 * @param _mimeType - The MIME type of the file (currently unused)
 * @returns Promise<ExtractResult> - The result of the extraction operation
 */
export async function extractFileContent(
  buffer: Buffer,
  fileName: string,
  _mimeType: string,
): Promise<ExtractResult> {
  try {
    // Get file type information
    const fileTypeInfo = getFileTypeInfo(fileName);
    if (!fileTypeInfo) {
      return {
        success: false,
        error: `Unknown file type: ${getFileExtension(fileName)}`,
      };
    }

    console.log('🔍 Starting text extraction process...');
    console.log(`📄 Extracting text content from ${fileName}...`);

    // Find and use the appropriate extractor
    const extension = getFileExtension(fileName);
    const extractorRegistration = findExtractor(extension);

    if (!extractorRegistration) {
      return {
        success: false,
        error: `No extractor found for file type: ${extension}`,
      };
    }

    console.log(
      `🔧 Using ${extractorRegistration.name} for ${extension.toUpperCase()} file: ${fileName}`,
    );

    // Extract content
    const content = await extractorRegistration.extractor(buffer, fileName);

    // Check if content is empty
    if (!content || content.length === 0) {
      console.log('⚠️ No content extracted or empty content');
      return {
        success: true,
        content: '',
      };
    }

    console.log(`📄 Text extraction complete: ${content.length} characters extracted`);

    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error('❌ Text extraction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown extraction error',
    };
  }
}

/**
 * Register a new extractor
 * @param registration - The extractor registration
 */
export function registerExtractor(registration: ExtractorRegistration): void {
  EXTRACTORS.push(registration);
}

/**
 * Get all registered extractors
 * @returns Array of extractor registrations
 */
export function getRegisteredExtractors(): ExtractorRegistration[] {
  return [...EXTRACTORS];
}
