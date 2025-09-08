import { FlexSearchService } from './flexSearchService';

// Singleton instance of the search service
let searchServiceInstance: FlexSearchService | null = null;

/**
 * Get or create the search service instance
 */
export function getSearchService(): FlexSearchService {
  if (!searchServiceInstance) {
    searchServiceInstance = new FlexSearchService();
    console.log('🔍 FlexSearch service initialized');
  }
  return searchServiceInstance;
}

/**
 * Reset the search service instance (useful for testing)
 */
export function resetSearchService(): void {
  searchServiceInstance = null;
}

// Export types and classes
export * from './types';
export { FlexSearchService } from './flexSearchService';
