import { useState, useRef } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  multiple = true,
  accept = '*',
  maxSize = 50 * 1024 * 1024, // 50MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragFileCount, setDragFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);

    // Count files being dragged
    if (event.dataTransfer.items) {
      let count = 0;
      for (const item of event.dataTransfer.items) {
        if (item.kind === 'file') {
          count++;
        }
      }
      setDragFileCount(count);
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Only set drag over to false if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragFileCount(0);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    setDragFileCount(0);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {multiple ? 'Select Files' : 'Select File'}
      </button>

      {/* Drag and drop area */}
      <div
        className={`mt-4 p-6 border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105 shadow-lg'
            : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        title="Click to select files or drag and drop files here"
      >
        <div className="flex flex-col items-center space-y-2">
          <svg
            className={`w-8 h-8 transition-transform duration-200 ${
              isDragOver ? 'text-blue-600 scale-110' : 'text-gray-400'
            }`}
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
          <p className="text-sm font-medium">
            {isDragOver
              ? dragFileCount > 0
                ? `Drop ${dragFileCount} file${dragFileCount > 1 ? 's' : ''} here!`
                : 'Drop files here!'
              : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-gray-500">or click to browse files</p>
        </div>
      </div>

      {/* File info */}
      <p className="mt-2 text-xs text-gray-500 text-center">
        {multiple ? 'Select multiple files' : 'Select a single file'} • Max size
        per file: {(maxSize / (1024 * 1024)).toFixed(1)}MB
      </p>
    </div>
  );
};
