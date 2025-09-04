// File validation utilities
export const ALLOWED_FILE_TYPES = ['.txt', '.md', '.docx', '.pdf'];
export const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
  'application/x-pdf',
  'binary/octet-stream', // Some systems use this for PDFs
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RejectedFile {
  name: string;
  reason: string;
}

// File validation function
export const validateFile = (file: File, maxSize: number): ValidationResult => {
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

// Format validation errors into a clean, user-friendly message
export const formatValidationErrors = (
  rejectedFiles: RejectedFile[],
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

// Process and validate multiple files
export const processFiles = (
  files: File[],
  maxSize: number,
): { validFiles: File[]; rejectedFiles: RejectedFile[] } => {
  const validFiles: File[] = [];
  const rejectedFiles: RejectedFile[] = [];

  files.forEach((file) => {
    const validation = validateFile(file, maxSize);
    if (validation.isValid) {
      validFiles.push(file);
    } else if (validation.error) {
      rejectedFiles.push({ name: file.name, reason: validation.error });
    }
  });

  return { validFiles, rejectedFiles };
};
