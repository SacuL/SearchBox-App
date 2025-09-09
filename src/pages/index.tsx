import type { NextPageWithLayout } from './_app';
import Link from 'next/link';
import { Navigation } from '../components/Navigation';

const IndexPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Navigation currentPage="home" />
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">SearchBox App</h1>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Upload and search through your documents with ease. Choose what you'd like to do:
          </p>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Upload Card */}
            <Link href="/upload" className="group">
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-200 border-2 border-transparent group-hover:border-blue-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                    <svg
                      className="w-8 h-8 text-blue-600"
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
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Documents</h2>
                  <p className="text-gray-600 mb-6">
                    Upload your documents to make them searchable. Support for TXT, MD, DOCX, and
                    PDF files.
                  </p>
                  <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg group-hover:bg-blue-700 transition-colors duration-200">
                    Start Uploading
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Search Card */}
            <Link href="/search" className="group">
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-200 border-2 border-transparent group-hover:border-green-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-200">
                    <svg
                      className="w-8 h-8 text-green-600"
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Documents</h2>
                  <p className="text-gray-600 mb-6">
                    Search through your uploaded documents. Find the information you need quickly
                    and easily.
                  </p>
                  <div className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg group-hover:bg-green-700 transition-colors duration-200">
                    Start Searching
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
