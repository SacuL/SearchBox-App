import { StorageFactory } from './index';

/**
 * Initialize storage on server startup
 * The StorageFactory.getStorage() method handles singleton behavior
 * using global variables
 */
export async function initializeStorage(): Promise<void> {
  try {
    console.log('🔧 Initializing storage system...');
    await StorageFactory.getStorage('memory');
    console.log('✅ Memory storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Reset storage instance (useful for testing)
 * This delegates to StorageFactory which manages the global singleton
 */
export function resetStorageInitialization(): void {
  StorageFactory.reset();
}
