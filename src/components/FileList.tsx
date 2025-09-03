import {
  FileText,
  FileImage,
  Archive,
  File,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    const fileName = file.name;
    const hasExtension = fileName.includes('.');

    if (fileType.includes('pdf'))
      return <FileText className="w-6 h-6 text-red-600" />;
    if (fileType.includes('doc'))
      return <FileText className="w-6 h-6 text-blue-700" />;
    if (fileType.includes('xls'))
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    if (fileType.includes('ppt'))
      return <Presentation className="w-6 h-6 text-orange-600" />;
    if (fileType.includes('txt'))
      return <FileText className="w-6 h-6 text-gray-600" />;
    if (fileType.includes('markdown') || fileType.includes('md'))
      return <FileText className="w-6 h-6 text-emerald-600" />;
    if (fileType.includes('image'))
      return <FileImage className="w-6 h-6 text-purple-600" />;
    if (
      fileType.includes('zip') ||
      fileType.includes('rar') ||
      fileType.includes('7z')
    )
      return <Archive className="w-6 h-6 text-yellow-600" />;

    // If no MIME type, check if file has extension
    if (!hasExtension) {
      return <File className="w-6 h-6 text-slate-400" />; // Lighter gray for no extension
    }

    return <File className="w-6 h-6 text-gray-500" />; // Regular gray for unknown types with extension
  };

  const getFileTypeDisplay = (file: File): string => {
    // If we have a MIME type, try to map it to a friendly name
    if (file.type && file.type !== '') {
      const mimeType = file.type.toLowerCase();

      // Common MIME type mappings
      if (mimeType.includes('pdf')) return 'PDF';
      if (
        mimeType.includes('wordprocessingml.document') ||
        mimeType.includes('doc')
      )
        return 'DOCX';
      if (
        mimeType.includes('spreadsheetml.sheet') ||
        mimeType.includes('excel')
      )
        return 'XLSX';
      if (
        mimeType.includes('presentationml.presentation') ||
        mimeType.includes('powerpoint')
      )
        return 'PPTX';
      if (mimeType.includes('text/plain')) return 'TXT';
      if (
        mimeType.includes('text/markdown') ||
        mimeType.includes('text/x-markdown')
      )
        return 'Markdown';
      if (mimeType.includes('image/')) return 'Image';
      if (
        mimeType.includes('zip') ||
        mimeType.includes('rar') ||
        mimeType.includes('7z')
      )
        return 'Archive';
    }

    // If no MIME type or unknown MIME type, try to extract extension from filename
    const fileName = file.name;
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex > 0 && lastDotIndex < fileName.length - 1) {
      // Extract the extension (everything after the last dot)
      const extension = fileName.substring(lastDotIndex + 1).toLowerCase();

      // Map common extensions to friendly names
      if (extension === 'md') return 'Markdown';
      if (extension === 'txt') return 'Text';
      if (extension === 'doc') return 'DOC';
      if (extension === 'docx') return 'DOCX';
      if (extension === 'xls') return 'XLS';
      if (extension === 'xlsx') return 'XLSX';
      if (extension === 'ppt') return 'PPT';
      if (extension === 'pptx') return 'PPTX';
      if (extension === 'pdf') return 'PDF';
      if (extension === 'zip' || extension === 'rar' || extension === '7z')
        return 'Archive';

      // Return extension in uppercase for unknown types
      return extension.toUpperCase();
    }

    // If no extension found, return empty string
    return '';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-700">
        Selected Files ({files.length})
      </h3>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file)}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 truncate max-w-xs">
                  {file.name}
                </span>
                <span className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                  {getFileTypeDisplay(file) && ` • ${getFileTypeDisplay(file)}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => onRemoveFile(index)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
              title="Remove file"
            >
              <svg
                className="w-5 h-5"
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
        ))}
      </div>
    </div>
  );
};
