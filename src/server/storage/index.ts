import { LocalStorage } from './localStorage';
import { MemoryStorage } from './memoryStorage';
import { StorageInterface } from './types';

// Storage factory to create storage instances
export class StorageFactory {
  private static instance: StorageInterface | null = null;

  /**
   * Get or create a storage instance
   * @param type - Type of storage ('local' or 'memory')
   * @param options - Storage-specific options
   */
  static async getStorage(
    type: 'local' | 'memory' = 'memory',
    options: { uploadsDir?: string } = {},
  ): Promise<StorageInterface> {
    // Create a new instance if none exists or if switching storage types
    if (!this.instance) {
      switch (type) {
        case 'local':
          this.instance = new LocalStorage(options.uploadsDir);
          await this.instance.initialize();
          break;
        case 'memory':
          this.instance = new MemoryStorage();
          await this.instance.initialize();
          break;
        default:
          throw new Error(`Unsupported storage type: ${String(type)}`);
      }
    }
    return this.instance;
  }

  /**
   * Reset the storage instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }
}

// Export types and classes
export * from './types';
export { LocalStorage } from './localStorage';
export { MemoryStorage } from './memoryStorage';
