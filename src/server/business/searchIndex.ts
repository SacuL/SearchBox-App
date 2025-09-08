import { getSearchService } from '../search';
import { FileMetadata } from '../storage/types';

export interface IndexResult {
  success: boolean;
  indexed: boolean;
  error?: string;
}

/**
 * Index file content for search
 * @param metadata - The file metadata
 * @param content - The extracted text content
 * @returns Promise<IndexResult> - The result of the indexing operation
 */
export async function indexFileContent(
  metadata: FileMetadata,
  content: string,
): Promise<IndexResult> {
  try {
    if (!content || content.trim().length === 0) {
      console.log('⚠️ No content to index, skipping');
      return {
        success: true,
        indexed: false,
      };
    }

    console.log('🔍 Starting search indexing process...');
    const searchService = getSearchService();

    const searchableDocument = {
      id: metadata.id,
      fileName: metadata.fileName,
      originalName: metadata.originalName,
      fileExtension: metadata.fileExtension,
      mimeType: metadata.mimeType,
      uploadDate: metadata.uploadDate,
      fileSize: metadata.fileSize,
    };

    console.log(`🔍 Adding document to search index (${content.length} characters)...`);
    searchService.addDocument(searchableDocument, content);
    console.log('✅ File indexed successfully');

    return {
      success: true,
      indexed: true,
    };
  } catch (error) {
    console.error('❌ Search indexing failed:', error);
    return {
      success: false,
      indexed: false,
      error: error instanceof Error ? error.message : 'Unknown indexing error',
    };
  }
}
