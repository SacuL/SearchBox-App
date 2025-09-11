import { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { Toast } from './Toast';
import { trpc } from '~/utils/trpc';

export const FileUploadSection: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    fileTypeErrors: string[];
    sizeErrors: { name: string; size: number }[];
  }>({ fileTypeErrors: [], sizeErrors: [] });

  // Upload queue state
  const [uploadQueue, setUploadQueue] = useState<
    {
      id: string;
      file: File;
      status: 'pending' | 'uploading' | 'completed' | 'failed';
      progress: number;
      error?: string;
    }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  // Get tRPC utils for invalidating queries
  const utils = trpc.useUtils();

  // Effect to show toast when all uploads are completed successfully
  useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      const allCompleted = uploadQueue.every((item) => item.status === 'completed');
      const hasFailures = uploadQueue.some((item) => item.status === 'failed');

      if (allCompleted && !hasFailures) {
        setShowToast(true);
      }
    }
  }, [uploadQueue, isUploading]);

  // Animation state to control fade-out timing
  const [showFileSection, setShowFileSection] = useState(true);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    const newFiles: File[] = [];

    files.forEach((file) => {
      // Check if a file with the same name already exists
      const isDuplicate = selectedFiles.some((existingFile) => existingFile.name === file.name);

      // Silently ignore duplicates
      if (!isDuplicate) {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setShowFileSection(true); // Show the file section when new files are added
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setValidationErrors({ fileTypeErrors: [], sizeErrors: [] }); // Clear validation errors when clearing files
    setShowFileSection(false); // Hide the file section when clearing
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
    if (selectedFiles.length === 0) return;

    // Initialize upload queue
    const queue = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    // Start fade-out animation for all components
    setShowFileSection(false);

    // Wait for animation to complete, then show upload queue and start processing
    setTimeout(() => {
      setSelectedFiles([]);
      setValidationErrors({ fileTypeErrors: [], sizeErrors: [] });
      setUploadQueue(queue);
      setIsUploading(true);
      // Start processing the queue
      processUploadQueue(queue);
    }, 500); // Match the animation duration
  };

  const processUploadQueue = async (
    queue: {
      id: string;
      file: File;
      status: 'pending' | 'uploading' | 'completed' | 'failed';
      progress: number;
      error?: string;
    }[],
  ) => {
    for (const queueItem of queue) {
      // Update status to uploading
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === queueItem.id ? { ...item, status: 'uploading' } : item)),
      );

      try {
        const formData = new FormData();
        formData.append('file', queueItem.file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // Mark as completed
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueItem.id ? { ...item, status: 'completed', progress: 100 } : item,
            ),
          );

          // Invalidate search index stats to trigger SearchBar to appear
          utils.search.getIndexStats.invalidate();
        } else {
          // Mark as failed
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueItem.id
                ? {
                    ...item,
                    status: 'failed',
                    error: result.error || 'Upload failed',
                  }
                : item,
            ),
          );
        }
      } catch (error) {
        // Mark as failed
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id
              ? {
                  ...item,
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : item,
          ),
        );
      }
    }

    // All uploads completed
    setIsUploading(false);

    // Note: Upload queue remains visible to show completion status
    // Selected files and validation errors are already cleared when upload started
  };

  // Function to format error messages into user-friendly text
  const formatErrorMessage = (error: string): string => {
    // Handle common error patterns and convert them to user-friendly messages
    if (error.includes('File type not supported')) {
      return 'File type is not supported. Please use .txt, .md, .docx, or .pdf files.';
    }
    if (error.includes('File size')) {
      return 'File is too large. Maximum size is 50MB.';
    }
    if (error.includes('File extension not supported')) {
      return 'File extension is not supported. Please use .txt, .md, .docx, or .pdf files.';
    }
    if (error.includes('File name is required')) {
      return 'File name is required.';
    }
    if (error.includes('File validation failed')) {
      return 'File validation failed. Please check the file type and size.';
    }
    if (error.includes('Upload failed')) {
      return 'Upload failed. Please try again.';
    }
    if (error.includes('Unknown error occurred')) {
      return 'An unexpected error occurred. Please try again.';
    }

    // For any other errors, provide a generic message
    return 'Upload failed. Please try again.';
  };

  // Function to retry a failed upload
  const handleRetryUpload = async (uploadId: string) => {
    const failedItem = uploadQueue.find((item) => item.id === uploadId);
    if (!failedItem) return;

    // Reset the item to pending status
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === uploadId ? { ...item, status: 'pending', progress: 0, error: undefined } : item,
      ),
    );

    // Start processing this single upload
    setIsUploading(true);
    await processSingleUpload(failedItem);
    setIsUploading(false);
  };

  // Function to process a single upload (for retry functionality)
  const processSingleUpload = async (queueItem: {
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    error?: string;
  }) => {
    // Update status to uploading
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === queueItem.id ? { ...item, status: 'uploading' } : item)),
    );

    try {
      const formData = new FormData();
      formData.append('file', queueItem.file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Mark as completed
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, status: 'completed', progress: 100 } : item,
          ),
        );

        // Invalidate search index stats to trigger SearchBar to appear
        utils.search.getIndexStats.invalidate();
      } else {
        // Mark as failed
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id
              ? {
                  ...item,
                  status: 'failed',
                  error: result.error || 'Upload failed',
                }
              : item,
          ),
        );
      }
    } catch (error) {
      // Mark as failed
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === queueItem.id
            ? {
                ...item,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : item,
        ),
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <FileUpload
          onFilesSelected={handleFilesSelected}
          onValidationError={handleValidationError}
        />

        {/* File type validation errors with fade animation */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            validationErrors.fileTypeErrors.length > 0 && showFileSection
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform -translate-y-4 pointer-events-none'
          }`}
          style={{
            minHeight:
              validationErrors.fileTypeErrors.length > 0 && showFileSection ? 'auto' : '0px',
            overflow: 'hidden',
          }}
        >
          {validationErrors.fileTypeErrors.length > 0 && (
            <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-orange-700 font-medium">⚠️ Unsupported file types</p>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>

        {/* File size validation errors with fade animation */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            validationErrors.sizeErrors.length > 0 && showFileSection
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform -translate-y-4 pointer-events-none'
          }`}
          style={{
            minHeight: validationErrors.sizeErrors.length > 0 && showFileSection ? 'auto' : '0px',
            overflow: 'hidden',
          }}
        >
          {validationErrors.sizeErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-red-700 font-medium">⚠️ Files too large</p>
                <button
                  onClick={() => setValidationErrors((prev) => ({ ...prev, sizeErrors: [] }))}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-200 transition-colors duration-200"
                  title="Close error message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="mt-3 pt-2 border-t border-red-200">Maximum size per file: 50MB</div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Queue Display */}
        {uploadQueue.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Queue {isUploading && '(Processing...)'}
            </h3>
            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.file.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'pending'
                          ? 'bg-gray-100 text-gray-600'
                          : item.status === 'uploading'
                            ? 'bg-blue-100 text-blue-600'
                            : item.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {item.status === 'pending'
                        ? 'Pending'
                        : item.status === 'uploading'
                          ? 'Uploading'
                          : item.status === 'completed'
                            ? 'Completed'
                            : 'Failed'}
                    </span>
                  </div>

                  {item.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  )}

                  {item.status === 'failed' && item.error && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600 mb-2">{formatErrorMessage(item.error)}</p>
                      <button
                        onClick={() => handleRetryUpload(item.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors duration-200"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FileList with fade animation */}
        <div
          className={`mt-6 transition-all duration-500 ease-in-out ${
            selectedFiles.length > 0 && showFileSection
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform -translate-y-4 pointer-events-none'
          }`}
          style={{
            minHeight: selectedFiles.length > 0 && showFileSection ? 'auto' : '0px',
            overflow: 'hidden',
          }}
        >
          {selectedFiles.length > 0 && (
            <FileList files={selectedFiles} onRemoveFile={handleRemoveFile} />
          )}
        </div>

        {/* Action buttons with fade animation */}
        <div
          className={`mt-6 flex justify-center space-x-4 transition-all duration-500 ease-in-out ${
            selectedFiles.length > 0 && showFileSection
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform -translate-y-4 pointer-events-none'
          }`}
          style={{
            minHeight: selectedFiles.length > 0 && showFileSection ? 'auto' : '0px',
            overflow: 'hidden',
          }}
        >
          {selectedFiles.length > 0 && (
            <>
              <button
                onClick={handleClearAll}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear All
              </button>
              <button
                onClick={handleUploadFiles}
                disabled={isUploading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Files
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <Toast
          message="All files uploaded successfully! You can now search for your documents."
          type="success"
          actionText="Go to Search"
          actionHref="/search"
          onClose={() => setShowToast(false)}
          autoClose={true}
          duration={8000}
        />
      )}
    </div>
  );
};
