import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';

export const FileUploadSection: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    fileTypeErrors: string[];
    sizeErrors: { name: string; size: number }[];
  }>({ fileTypeErrors: [], sizeErrors: [] });

  const handleFilesSelected = (files: File[]) => {
    const newFiles: File[] = [];

    files.forEach((file) => {
      // Check if a file with the same name already exists
      const isDuplicate = selectedFiles.some(
        (existingFile) => existingFile.name === file.name,
      );

      // Silently ignore duplicates
      if (!isDuplicate) {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setValidationErrors({ fileTypeErrors: [], sizeErrors: [] }); // Clear validation errors when clearing files
  };

  const handleValidationError = (error: string) => {
    // Parse the error message to separate different error types
    const fileTypeErrors: string[] = [];
    const sizeErrors: { name: string; size: number }[] = [];

    // Split the error message into lines and parse each section
    const lines = error.split('\n').filter((line) => line.trim());

    lines.forEach((line) => {
      if (line.startsWith('• ')) {
        // Check if it's a size error (contains MB)
        if (line.includes('MB')) {
          const sizeRegex = /• (.+?)\s+(\d+)MB/;
          const match = sizeRegex.exec(line);
          if (match) {
            sizeErrors.push({ name: match[1], size: parseInt(match[2]) });
          }
        } else {
          // It's a file type error
          const fileName = line.replace('• ', '').trim();
          fileTypeErrors.push(fileName);
        }
      }
    });

    setValidationErrors({ fileTypeErrors, sizeErrors });
  };

  const handleUploadFiles = () => {
    // TODO: Implement actual upload logic
    console.log('Uploading files:', selectedFiles);
    setSelectedFiles([]); // Clear files after upload
    setValidationErrors({ fileTypeErrors: [], sizeErrors: [] }); // Clear validation errors when uploading
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          File Upload
        </h2>

        <FileUpload
          onFilesSelected={handleFilesSelected}
          onValidationError={handleValidationError}
        />

        {/* File type validation errors */}
        {validationErrors.fileTypeErrors.length > 0 && (
          <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-orange-700 font-medium">
                ⚠️ Unsupported file types
              </p>
              <button
                onClick={() =>
                  setValidationErrors((prev) => ({
                    ...prev,
                    fileTypeErrors: [],
                  }))
                }
                className="text-orange-500 hover:text-orange-700 p-1 rounded-full hover:bg-orange-200 transition-colors duration-200"
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
            {/* File type error content */}
            <div className="text-sm text-orange-700">
              {validationErrors.fileTypeErrors.map((fileName, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  • {fileName}
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-orange-200">
                Supported formats: .txt, .md, .docx, .pdf
              </div>
            </div>
          </div>
        )}

        {/* File size validation errors */}
        {validationErrors.sizeErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Files too large
              </p>
              <button
                onClick={() =>
                  setValidationErrors((prev) => ({ ...prev, sizeErrors: [] }))
                }
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
            {/* File size error content */}
            <div className="text-sm text-red-700">
              {validationErrors.sizeErrors.map(({ name, size }, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  • {name} - {size}MB
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-red-200">
                Maximum size per file: 50MB
              </div>
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
