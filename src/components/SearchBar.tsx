import React, { useState } from 'react';
import { trpc } from '~/utils/trpc';
import { getFileTypeColors, getFileTypeDisplayName } from '~/utils/fileTypeColors';

// Helper function to extract file extension
const getFileExtension = (fileName: string): string => {
  if (!fileName) return '';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return extension ? `.${extension}` : '';
};

interface SearchBarProps {
  onSearchPerformed?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchPerformed }) => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Reset hasSearched when component mounts (when user navigates to search page)
  React.useEffect(() => {
    setHasSearched(false);
  }, []);

  // Check if vector store is available
  const vectorStoreStatus = trpc.search.isVectorStoreAvailable.useQuery(undefined, {
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 0, // Always consider data stale
  });

  // Get list of uploaded files to check if there are any files
  const filesList = trpc.upload.listFiles.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Use tRPC to search with vector store - this is a query that runs when searchQuery changes
  const searchResult = trpc.search.vectorSearch.useQuery(
    {
      query: searchQuery,
      limit: 20,
    },
    {
      enabled: searchQuery.length > 0, // Only run query when we have a search term
    },
  );

  // Update loading state based on query status
  React.useEffect(() => {
    if (searchResult.isLoading) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchResult.isLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchQuery(query.trim());
    setHasSearched(true);
    onSearchPerformed?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleDownload = (fileId: string, fileName: string) => {
    // Create a download link and trigger the download
    const downloadUrl = `/api/download/${fileId}`;

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Debug logging for vector store status
  React.useEffect(() => {
    console.log('🔍 SearchBar vectorStoreStatus:', {
      isLoading: vectorStoreStatus.isLoading,
      isError: vectorStoreStatus.isError,
      data: vectorStoreStatus.data,
      available: vectorStoreStatus.data?.success
        ? vectorStoreStatus.data.data?.available
        : 'unknown',
    });
  }, [vectorStoreStatus.isLoading, vectorStoreStatus.isError, vectorStoreStatus.data]);

  // Show loading message if vector store is not available or while loading
  if (vectorStoreStatus.isLoading) {
    console.log('🔍 SearchBar loading:', {
      isLoading: vectorStoreStatus.isLoading,
      hasData: !!vectorStoreStatus.data,
    });

    return (
      <div className="w-full mx-auto mb-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing Search</h3>
            <p className="text-gray-600 mb-4">Setting up the search system...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show building message if vector store is not available
  if (vectorStoreStatus.data?.success && !vectorStoreStatus.data.data?.available) {
    console.log('🔍 SearchBar building index:', {
      isLoading: vectorStoreStatus.isLoading,
      hasData: !!vectorStoreStatus.data,
      success: vectorStoreStatus.data?.success,
      available: vectorStoreStatus.data?.data?.available,
    });

    // Check if there are any files uploaded
    const hasFiles =
      filesList.data?.success && filesList.data.data && filesList.data.data.length > 0;

    if (!hasFiles) {
      // No files uploaded yet
      return (
        <div className="w-full mx-auto mb-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full h-16 w-16 bg-gray-100 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents to Search</h3>
              <p className="text-gray-600 mb-4">
                Upload some documents first to enable semantic search functionality.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Get started:</strong> Go to the Upload page to add your first documents.
                  Once uploaded, they'll be automatically indexed for intelligent search.
                </p>
              </div>
              <div className="mt-6">
                <a
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Documents
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Files exist but vector store is building
    return (
      <div className="w-full mx-auto mb-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Building Search Index</h3>
            <p className="text-gray-600 mb-4">
              We're processing your uploaded documents to enable semantic search. This may take a
              moment...
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What's happening:</strong> Your documents are being analyzed and indexed
                using AI embeddings to provide intelligent search results.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                This process only happens once when you first upload documents or when the system
                restarts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (vectorStoreStatus.isError || (vectorStoreStatus.data && !vectorStoreStatus.data.success)) {
    return (
      <div className="w-full mx-auto mb-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full h-8 w-8 bg-red-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Unavailable</h3>
            <p className="text-gray-600 mb-4">
              We're having trouble setting up the search system. Please try refreshing the page.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong>{' '}
                {vectorStoreStatus.error?.message ||
                  vectorStoreStatus.data?.error ||
                  'Unknown error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto mb-8 ${hasSearched ? 'max-w-2xl' : 'max-w-4xl'}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {!hasSearched && (
          <div className="text-center mb-6">
            {vectorStoreStatus.data?.success && vectorStoreStatus.data.data?.available && (
              <p className="text-sm text-gray-600">
                Vector search is ready - semantic search enabled
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Enter your search query..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:text-white"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResult.data && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results
              {searchResult.data.success && searchResult.data.data && (
                <span className="text-sm text-gray-500 ml-2">
                  ({searchResult.data.data.length} results found)
                </span>
              )}
            </h3>

            {searchResult.data.success && searchResult.data.data ? (
              <div className="space-y-4">
                {searchResult.data.data.length > 0 ? (
                  searchResult.data.data.map((result: any, index: number) => (
                    <div
                      key={`${result.metadata?.fileId || index}`}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {result.metadata?.originalName ||
                              result.metadata?.fileName ||
                              `Document ${index + 1}`}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getFileTypeColors(getFileExtension(result.metadata?.fileName || result.metadata?.originalName || '')).bg} ${getFileTypeColors(getFileExtension(result.metadata?.fileName || result.metadata?.originalName || '')).text}`}
                          >
                            {getFileTypeDisplayName(
                              getFileExtension(
                                result.metadata?.fileName || result.metadata?.originalName || '',
                              ),
                            )}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">
                            <strong>Relevant content:</strong>
                          </p>
                          <p className="bg-white p-3 rounded border text-gray-800">
                            {result.pageContent}
                          </p>
                        </div>
                        {result.metadata?.fileId && (
                          <div className="flex justify-end">
                            <button
                              onClick={() =>
                                handleDownload(
                                  result.metadata.fileId,
                                  result.metadata.originalName ||
                                    result.metadata.fileName ||
                                    'document',
                                )
                              }
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">
                  Search failed: {searchResult.data.error || 'Unknown error'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {searchResult.isLoading && (
          <div className="mt-6 text-center py-8">
            <p className="text-gray-500">Searching...</p>
          </div>
        )}

        {/* Error Display */}
        {searchResult.error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Search error: {searchResult.error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
