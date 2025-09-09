import { StorageFactory } from './index';

// Flag to track if storage has been initialized
let isInitialized = false;

/**
 * Initialize storage on server startup
 */
export async function initializeStorage(): Promise<void> {
  // Only initialize once
  if (isInitialized) {
    return;
  }

  try {
    console.log('🔧 Initializing storage system...');
    await StorageFactory.getStorage('memory');
    console.log('✅ Memory storage initialized successfully');
    isInitialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Reset initialization flag (useful for testing)
 */
export function resetStorageInitialization(): void {
  isInitialized = false;
}
