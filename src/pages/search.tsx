import type { NextPageWithLayout } from './_app';
import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { LastUploadedFiles } from '../components/LastUploadedFiles';
import { Navigation } from '../components/Navigation';

const SearchPage: NextPageWithLayout = () => {
  const [hasSearched, setHasSearched] = useState(false);

  const handleFileClick = (fileId: string, fileName: string) => {
    // This could be used to pre-fill the search with the file name
    // For now, we'll just trigger a search for the file name
    console.log('File clicked:', fileName);
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Navigation currentPage="search" />
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Search Documents</h1>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Search through your uploaded documents. Find the information you need quickly and
            easily.
          </p>

          {/* Search Section */}
          <SearchBar onSearchPerformed={() => setHasSearched(true)} />

          {/* Show recent files only when no search has been performed */}
          {!hasSearched && <LastUploadedFiles onFileClick={handleFileClick} />}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
