import { FlexSearchService } from './flexSearchService';
import { SearchOrchestrator } from './searchOrchestrator';
import { SQLiteSearchStorage } from './sqliteStorage';
import { MemorySearchStorage } from './memorySearchStorage';
import { SearchStorageInterface } from './storageInterface';

// Use global variable to ensure singleton across all Next.js contexts
// This is necessary because Next.js API routes and tRPC endpoints run in separate contexts
declare global {
  var __searchOrchestratorInstance: SearchOrchestrator | undefined;
  var __searchStorageInstance: SearchStorageInterface | undefined;
  var __flexSearchServiceInstance: FlexSearchService | undefined;
}

/**
 * Get or create the storage instance
 */
function getSearchStorage(): SearchStorageInterface {
  if (!global.__searchStorageInstance) {
    // Use SQLite storage by default, but can be configured via environment variable
    const storageType = process.env.SEARCH_STORAGE_TYPE || 'sqlite';

    if (storageType === 'memory') {
      global.__searchStorageInstance = new MemorySearchStorage();
      console.log('💾 Memory storage initialized - new global instance created');
    } else {
      global.__searchStorageInstance = new SQLiteSearchStorage();
      console.log('🗄️ SQLite storage initialized - new global instance created');
    }
  } else {
    console.log('🗄️ Storage - returning existing global instance');
  }
  return global.__searchStorageInstance;
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
 * Get or create the search orchestrator instance
 * Uses global variable to ensure singleton across all Next.js contexts
 */
export function getSearchService(): SearchOrchestrator {
  if (!global.__searchOrchestratorInstance) {
    const storage = getSearchStorage();
    const flexSearchService = getFlexSearchService();
    global.__searchOrchestratorInstance = new SearchOrchestrator(flexSearchService, storage);
    console.log('🔍 Search orchestrator initialized - new global instance created');
  } else {
    console.log('🔍 Search orchestrator - returning existing global instance');
  }
  return global.__searchOrchestratorInstance;
}

/**
 * Reset the search service instance (useful for testing)
 */
export function resetSearchService(): void {
  if (global.__searchOrchestratorInstance) {
    global.__searchOrchestratorInstance.close();
    global.__searchOrchestratorInstance = undefined;
  }
  if (global.__flexSearchServiceInstance) {
    global.__flexSearchServiceInstance.close();
    global.__flexSearchServiceInstance = undefined;
  }
  if (global.__searchStorageInstance) {
    if (global.__searchStorageInstance.close) {
      global.__searchStorageInstance.close();
    }
    global.__searchStorageInstance = undefined;
  }
}

// Export types and classes
export * from './types';
export { FlexSearchService } from './flexSearchService';
export type { IndexResult } from './flexSearchService';
export { SearchOrchestrator } from './searchOrchestrator';
export { SQLiteSearchStorage } from './sqliteStorage';
export { MemorySearchStorage } from './memorySearchStorage';
export type { SearchStorageInterface } from './storageInterface';
