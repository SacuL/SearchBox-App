import { useState, useRef } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onValidationError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

// Define allowed file types and MIME types
const ALLOWED_FILE_TYPES = ['.txt', '.md', '.docx', '.pdf'];
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
  'application/x-pdf',
  'binary/octet-stream', // Some systems use this for PDFs
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Format validation errors into a clean, user-friendly message
const formatValidationErrors = (
  rejectedFiles: { name: string; reason: string }[],
  maxSize: number,
): string => {
  if (rejectedFiles.length === 0) return '';

  // Group errors by type for cleaner display
  const fileTypeErrors: string[] = [];
  const sizeErrors: { name: string; size: number }[] = [];

  rejectedFiles.forEach(({ name, reason }) => {
    if (reason.includes('File size')) {
      // Extract file size from the reason for display
      const sizeRegex = /File size \(([\d.]+)MB\)/;
      const sizeMatch = sizeRegex.exec(reason);
      const fileSize = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
      sizeErrors.push({ name, size: fileSize });
    } else {
      // All other errors (unsupported types, no type info) are grouped together
      fileTypeErrors.push(name);
    }
  });

  let errorMessage = '';

  if (fileTypeErrors.length > 0) {
    errorMessage += `${fileTypeErrors.map((name) => `• ${name}`).join('\n\n')}\n\n`;
  }

  if (sizeErrors.length > 0) {
    errorMessage += `${sizeErrors.map(({ name, size }) => `• ${name}  ${size.toFixed(0)}MB`).join('\n\n')}\n\n`;
  }

  // Add specific information based on error types
  if (fileTypeErrors.length > 0) {
    errorMessage += `Supported formats: ${ALLOWED_FILE_TYPES.join(', ')}`;
  } else if (sizeErrors.length > 0) {
    errorMessage += `Maximum file size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
  }

  return errorMessage;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onValidationError,
  multiple = true,
  accept = ALLOWED_FILE_TYPES.join(','),
  maxSize = 50 * 1024 * 1024, // 50MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragFileCount, setDragFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation function
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed size (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`,
      };
    }

    // Debug logging
    console.log('Validating file:', file.name);
    console.log('File MIME type:', file.type);
    console.log('File size:', file.size);

    // Check file type by MIME type first (prioritize this for files without extensions)
    if (file.type && file.type !== '') {
      // More flexible MIME type checking
      const isMimeTypeValid = ALLOWED_MIME_TYPES.some((mimeType) => {
        const fileTypeLower = file.type.toLowerCase();
        const mimeTypeLower = mimeType.toLowerCase();
        return (
          fileTypeLower.includes(mimeTypeLower) ||
          mimeTypeLower.includes(fileTypeLower)
        );
      });

      if (isMimeTypeValid) {
        console.log('File accepted by MIME type:', file.type);
        return { isValid: true };
      }
    }

    // Check file type by extension
    const fileName = file.name.toLowerCase();
    if (ALLOWED_FILE_TYPES.some((ext) => fileName.endsWith(ext))) {
      console.log('File accepted by extension:', fileName);
      return { isValid: true };
    }

    // If no MIME type and no extension, reject the file
    if (!file.type || file.type === '') {
      console.log('File rejected: No type information and no extension');
      return {
        isValid: false,
        error: `File has no type information and no extension. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      };
    }

    console.log('File rejected: Type not supported');
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Validate each file
      const validFiles: File[] = [];
      const rejectedFiles: { name: string; reason: string }[] = [];

      files.forEach((file) => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else if (validation.error) {
          rejectedFiles.push({ name: file.name, reason: validation.error });
        }
      });

      // Show validation errors if any
      if (rejectedFiles.length > 0 && onValidationError) {
        const errorMessage = formatValidationErrors(rejectedFiles, maxSize);
        onValidationError(errorMessage);
      }

      // Only pass valid files to parent component
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
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
      // Validate each file
      const validFiles: File[] = [];
      const rejectedFiles: { name: string; reason: string }[] = [];

      files.forEach((file) => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else if (validation.error) {
          rejectedFiles.push({ name: file.name, reason: validation.error });
        }
      });

      // Show validation errors if any
      if (rejectedFiles.length > 0 && onValidationError) {
        const errorMessage = formatValidationErrors(rejectedFiles, maxSize);
        onValidationError(errorMessage);
      }

      // Only pass valid files to parent component
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
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
