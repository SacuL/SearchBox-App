// Main exports
export { extractFileContent, registerExtractor, getRegisteredExtractors } from './extractor';

// Type exports
export type {
  ExtractResult,
  FileTypeInfo,
  ExtractorFunction,
  ExtractorRegistration,
} from './types';

// File type utilities
export {
  getFileExtension,
  supportsTextExtraction,
  getFileTypeInfo,
  SUPPORTED_EXTENSIONS,
  FILE_TYPE_REGISTRY,
} from './fileTypes';

// Individual extractors (for advanced usage)
export { extractText } from './extractors/textExtractor';
export { extractPdf } from './extractors/pdfExtractor';
export { extractDocx } from './extractors/docxExtractor';
