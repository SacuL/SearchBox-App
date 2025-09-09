import React from 'react';
import { trpc } from '~/utils/trpc';

interface LastUploadedFilesProps {
  onFileClick?: (fileId: string, fileName: string) => void;
}

export const LastUploadedFiles: React.FC<LastUploadedFilesProps> = ({ onFileClick }) => {
  // Fetch the list of uploaded files
  const filesQuery = trpc.upload.listFiles.useQuery();

  if (filesQuery.isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Files</h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading recent files...</span>
          </div>
        </div>
      </div>
    );
  }

  if (filesQuery.error || !filesQuery.data?.success) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Files</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Unable to load recent files</p>
          </div>
        </div>
      </div>
    );
  }

  const files = filesQuery.data.data || [];

  // Sort by upload date (newest first) and take the first 5
  const recentFiles = files
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

  if (recentFiles.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Files</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No files uploaded yet</p>
            <p className="text-sm mt-2">Upload some files to see them here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Files</h2>
        <div className="space-y-3">
          {recentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => onFileClick?.(file.id, file.originalName)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {(file.fileSize / 1024).toFixed(1)} KB •{' '}
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {file.fileExtension.toUpperCase()}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
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
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Click on a file to search for it, or use the search bar above
          </p>
        </div>
      </div>
    </div>
  );
};
