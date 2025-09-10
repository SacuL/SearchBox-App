import { SUPPORTED_EXTENSIONS } from '../text-extraction/fileTypes';

export const UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
  supportedExtensions: SUPPORTED_EXTENSIONS,
} as const;
