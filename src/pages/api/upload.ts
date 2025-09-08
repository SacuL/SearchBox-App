import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { StorageFactory } from '../../server/storage';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../server/routers/upload';

// Extend NextApiRequest to include file property
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (!fileExtension || !ALLOWED_FILE_TYPES.includes(fileExtension as any)) {
      return cb(
        new Error(`File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`),
      );
    }

    cb(null, true);
  },
});

// Disable body parsing for multer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  console.log('📁 Upload API called:', {
    method: req.method,
    headers: req.headers['content-type'],
  });

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use multer to handle file upload
    await new Promise<void>((resolve, reject) => {
      upload.single('file')(req as any, res as any, (err) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        } else {
          resolve();
        }
      });
    });

    const file = req.file;
    console.log(
      '📄 File received:',
      file
        ? {
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          }
        : 'No file',
    );

    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get storage instance
    console.log('💾 Getting storage instance...');
    const storage = await StorageFactory.getStorage('local', { uploadsDir: 'uploads' });

    // Save file to storage
    console.log('💾 Saving file to storage...');
    const result = await storage.saveFile(file.buffer, file.originalname, file.mimetype, {
      generateUniqueName: true,
      preserveOriginalName: true,
      createSubdirectories: true,
    });

    console.log('💾 Storage result:', {
      success: result.success,
      fileId: result.fileId,
      error: result.error,
    });

    if (!result.success) {
      console.log('❌ Storage save failed:', result.error);
      return res.status(500).json({
        error: result.error || 'Failed to save file',
      });
    }

    // Get file metadata
    console.log('📋 Getting file metadata...');
    const metadata = await storage.getFileMetadata(result.fileId!);
    console.log(
      '📋 Metadata retrieved:',
      metadata
        ? {
            id: metadata.id,
            fileName: metadata.fileName,
            fileSize: metadata.fileSize,
          }
        : 'No metadata',
    );

    console.log('✅ Upload successful!');
    return res.status(200).json({
      success: true,
      data: {
        fileId: result.fileId,
        fileName: metadata?.fileName,
        originalName: metadata?.originalName,
        fileSize: metadata?.fileSize,
        mimeType: metadata?.mimeType,
        uploadDate: metadata?.uploadDate,
        message: 'File uploaded successfully',
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
}
