import Link from 'next/link';
interface NavigationProps {
  currentPage?: 'home' | 'upload' | 'search';
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">SearchBox</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentPage === 'upload'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Upload
            </Link>
            <Link
              href="/search"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentPage === 'search'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
