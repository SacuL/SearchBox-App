import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { UploadService, UPLOAD_CONFIG } from '../../server/upload';

// Extend NextApiRequest to include file property
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (!fileExtension || !UPLOAD_CONFIG.supportedExtensions.includes(fileExtension as any)) {
      return cb(
        new Error(
          `File type not supported. Allowed types: ${UPLOAD_CONFIG.supportedExtensions.join(', ')}`,
        ),
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

  // Initialize upload service
  const uploadService = new UploadService();

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

    // Validate file
    const validation = uploadService.validateFile(file);
    if (!validation.valid) {
      console.log('❌ File validation failed:', validation.error);
      return res.status(400).json({ error: validation.error });
    }

    // Process upload using file operations
    const result = await uploadService.processUpload({ file });

    if (result.success) {
      console.log('✅ Upload successful!');
      return res.status(200).json(result);
    } else {
      console.log('❌ Upload failed:', result.error);
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
}
