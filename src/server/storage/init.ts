import { StorageFactory } from './index';

/**
 * Initialize storage on server startup
 */
export async function initializeStorage(): Promise<void> {
  try {
    console.log('🔧 Initializing storage system...');
    await StorageFactory.getStorage('local', { uploadsDir: 'uploads' });
    console.log('✅ Storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}
