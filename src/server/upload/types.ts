export interface UploadRequest {
  file: Express.Multer.File;
}

export interface UploadResult {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: Date;
    indexed: boolean;
    message: string;
  };
  error?: string;
}

export interface UploadConfig {
  maxFileSize: number;
  supportedExtensions: readonly string[];
}
