import type { NextPageWithLayout } from './_app';
import { SearchBar } from '../components/SearchBar';
import { Navigation } from '../components/Navigation';

const SearchPage: NextPageWithLayout = () => {
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
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
