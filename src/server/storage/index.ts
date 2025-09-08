import { LocalStorage } from './localStorage';
import { StorageInterface } from './types';

// Storage factory to create storage instances
export class StorageFactory {
  private static instance: StorageInterface | null = null;

  /**
   * Get or create a storage instance
   * @param type - Type of storage ('local' for now)
   * @param options - Storage-specific options
   */
  static async getStorage(
    type: 'local' = 'local',
    options: { uploadsDir?: string } = {},
  ): Promise<StorageInterface> {
    if (!this.instance) {
      switch (type) {
        case 'local':
          this.instance = new LocalStorage(options.uploadsDir);
          await this.instance.initialize();
          break;
        default:
          throw new Error(`Unsupported storage type: ${type}`);
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
