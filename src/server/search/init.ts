import { FlexSearchFactory } from './index';

/**
 * Initialize search service on server startup
 * The FlexSearchFactory.getService() method handles singleton behavior
 * using global variables
 */
export async function initializeSearchService(): Promise<void> {
  try {
    console.log('🔧 Initializing search service...');
    FlexSearchFactory.getService();
    console.log('✅ Search service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize search service:', error);
    throw error;
  }
}

/**
 * Reset search service instance (useful for testing)
 * This delegates to FlexSearchFactory which manages the global singleton
 */
export function resetSearchServiceInitialization(): void {
  FlexSearchFactory.reset();
}
