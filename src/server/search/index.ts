import { FlexSearchService } from './flexSearchService';

// Use global variable to ensure singleton across all contexts
declare global {
  var __searchServiceInstance: FlexSearchService | undefined;
}

/**
 * Get or create the search service instance
 */
export function getSearchService(): FlexSearchService {
  if (!global.__searchServiceInstance) {
    global.__searchServiceInstance = new FlexSearchService();
    console.log('🔍 FlexSearch service initialized - new global instance created');
  } else {
    console.log('🔍 FlexSearch service - returning existing global instance');
  }
  return global.__searchServiceInstance;
}

/**
 * Reset the search service instance (useful for testing)
 */
export function resetSearchService(): void {
  if (global.__searchServiceInstance) {
    global.__searchServiceInstance = undefined;
  }
}

// Export types and classes
export * from './types';
export { FlexSearchService } from './flexSearchService';
