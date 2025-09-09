/**
 * File type color utilities for consistent styling across the application
 */

export interface FileTypeColors {
  bg: string;
  text: string;
  border?: string;
}

/**
 * Get consistent colors for file type tags
 */
export function getFileTypeColors(extension: string): FileTypeColors {
  const ext = extension.toLowerCase().replace('.', '');

  switch (ext) {
    case 'pdf':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
      };
    case 'docx':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'txt':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-900',
        border: 'border-gray-200',
      };
    case 'md':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        border: 'border-gray-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-900',
        border: 'border-gray-200',
      };
  }
}

/**
 * Get file type display name
 */
export function getFileTypeDisplayName(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');

  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'docx':
      return 'DOCX';
    case 'txt':
      return 'TXT';
    case 'md':
      return 'MD';
    default:
      return ext.toUpperCase();
  }
}

/**
 * Get file type icon color for consistency
 */
export function getFileTypeIconColor(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');

  switch (ext) {
    case 'pdf':
      return 'text-red-600';
    case 'docx':
      return 'text-blue-600';
    case 'txt':
      return 'text-gray-900';
    case 'md':
      return 'text-gray-500';
    default:
      return 'text-slate-600';
  }
}
