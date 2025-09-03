import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';

export const FileUploadSection: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [duplicateError, setDuplicateError] = useState<string>('');

  const handleFilesSelected = (files: File[]) => {
    const newFiles: File[] = [];
    const duplicates: string[] = [];

    files.forEach((file) => {
      // Check if a file with the same name already exists
      const isDuplicate = selectedFiles.some(
        (existingFile) => existingFile.name === file.name,
      );

      if (isDuplicate) {
        duplicates.push(file.name);
      } else {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    if (duplicates.length > 0) {
      const message =
        duplicates.length === 1
          ? `"${duplicates[0]}" is already selected`
          : `These files are already selected: ${duplicates.join(', ')}`;
      setDuplicateError(message);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setDuplicateError(''); // Clear error when clearing files
  };

  const handleUploadFiles = () => {
    // TODO: Implement actual upload logic
    console.log('Uploading files:', selectedFiles);
    setSelectedFiles([]); // Clear files after upload
    setDuplicateError(''); // Clear error when uploading
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          File Upload
        </h2>

        <FileUpload onFilesSelected={handleFilesSelected} />

        {/* Duplicate file error message */}
        {duplicateError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ {duplicateError}
              </p>
              <button
                onClick={() => setDuplicateError('')}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-200 transition-colors duration-200"
                title="Close error message"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
            </div>
          </div>
        )}

        {/* Only show FileList when there are files */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <FileList files={selectedFiles} onRemoveFile={handleRemoveFile} />
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Clear All
            </button>
            <button
              onClick={handleUploadFiles}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Upload Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
