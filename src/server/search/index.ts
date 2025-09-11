import { FlexSearchService } from './flexSearchService';

// Use global variable to ensure singleton across all Next.js contexts
// This is necessary because Next.js API routes and tRPC endpoints run in separate contexts
declare global {
  var __flexSearchServiceInstance: FlexSearchService | undefined;
}

/**
 * Get or create the FlexSearch service instance
 */
export function getFlexSearchService(): FlexSearchService {
  if (!global.__flexSearchServiceInstance) {
    global.__flexSearchServiceInstance = new FlexSearchService();
    console.log('🔍 FlexSearch service initialized - new global instance created');
  } else {
    console.log('🔍 FlexSearch service - returning existing global instance');
  }
  return global.__flexSearchServiceInstance;
}

/**
 * Get or create the search service instance (now just FlexSearchService)
 * Uses global variable to ensure singleton across all Next.js contexts
 */
export function getSearchService(): FlexSearchService {
  return getFlexSearchService();
}

/**
 * Reset the search service instance (useful for testing)
 */
export function resetSearchService(): void {
  if (global.__flexSearchServiceInstance) {
    global.__flexSearchServiceInstance.close();
    global.__flexSearchServiceInstance = undefined;
  }
}

// Export types and classes
export * from './types';
export { FlexSearchService } from './flexSearchService';
export type { IndexResult } from './flexSearchService';
