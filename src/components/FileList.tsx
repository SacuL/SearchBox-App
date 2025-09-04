import { FileText, File } from 'lucide-react';

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
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'docx':
        return <FileText className="w-6 h-6 text-blue-700" />;
      case 'txt':
        return <FileText className="w-6 h-6 text-gray-600" />;
      case 'md':
        return <FileText className="w-6 h-6 text-emerald-600" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFileTypeDisplay = (file: File): string => {
    // Simple extension-based approach for supported file types
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'txt':
        return 'Text';
      case 'md':
        return 'Markdown';
      case 'docx':
        return 'DOCX';
      case 'pdf':
        return 'PDF';
      default:
        return extension?.toUpperCase() || '';
    }
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
