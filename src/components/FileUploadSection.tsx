import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';

export const FileUploadSection: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          File Upload
        </h2>

        <FileUpload onFilesSelected={handleFilesSelected} />

        <div className="mt-6">
          <FileList files={selectedFiles} onRemoveFile={handleRemoveFile} />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Clear All
            </button>
            <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Upload Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
