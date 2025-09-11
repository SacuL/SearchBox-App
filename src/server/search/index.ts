import { FlexSearchService } from './flexSearchService';

// Use global variable to ensure singleton across all Next.js contexts
// This is necessary because Next.js API routes and tRPC endpoints run in separate contexts
declare global {
  var __flexSearchServiceInstance: FlexSearchService | undefined;
}

// FlexSearch factory to create service instances
export class FlexSearchFactory {
  /**
   * Get or create a FlexSearch service instance
   */
  static getService(): FlexSearchService {
    if (!global.__flexSearchServiceInstance) {
      global.__flexSearchServiceInstance = new FlexSearchService();
      console.log('🔍 FlexSearch service initialized - new global instance created');
    } else {
      console.log('🔍 FlexSearch service - returning existing global instance');
    }
    return global.__flexSearchServiceInstance;
  }

  /**
   * Reset the service instance (useful for testing)
   */
  static reset(): void {
    if (global.__flexSearchServiceInstance) {
      global.__flexSearchServiceInstance.close();
      global.__flexSearchServiceInstance = undefined;
    }
  }
}

// Export types and classes
export * from './types';
export { FlexSearchService } from './flexSearchService';
export type { IndexResult } from './flexSearchService';
