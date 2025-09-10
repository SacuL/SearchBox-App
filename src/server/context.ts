/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as trpcNext from '@trpc/server/adapters/next';
import { initializeStorage } from './file-storage/init';
import { getSearchService } from './search';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CreateContextOptions {
  // session: Session | null
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(_opts: CreateContextOptions) {
  // Initialize storage on first context creation
  try {
    await initializeStorage();
  } catch (error) {
    console.error('Storage initialization failed:', error);
  }

  // Initialize search service on first context creation
  try {
    getSearchService();
  } catch (error) {
    console.error('Search service initialization failed:', error);
  }

  return {};
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export async function createContext(opts: trpcNext.CreateNextContextOptions): Promise<Context> {
  // for API-response caching see https://trpc.io/docs/v11/caching

  return await createContextInner({});
}
