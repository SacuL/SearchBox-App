import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../server/routers/upload';
import { storeFile, extractFileContent, indexFileContent } from '../../server/business';

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

    // Step 1: Store the file
    console.log('📁 Step 1: Storing file...');
    const storeResult = await storeFile(file.buffer, file.originalname, file.mimetype);

    if (!storeResult.success) {
      console.log('❌ File storage failed:', storeResult.error);
      return res.status(500).json({
        error: storeResult.error || 'Failed to store file',
      });
    }

    // Step 2: Extract text content
    console.log('📄 Step 2: Extracting text content...');
    const extractResult = await extractFileContent(file.buffer, file.originalname, file.mimetype);

    if (!extractResult.success) {
      console.log('⚠️ Text extraction failed:', extractResult.error);
      // Continue with upload even if extraction fails
    }

    // Step 3: Index the content (if extraction was successful and content exists)
    let indexed = false;
    if (
      extractResult.success &&
      extractResult.shouldIndex &&
      extractResult.content &&
      storeResult.metadata
    ) {
      console.log('🔍 Step 3: Indexing content for search...');
      const indexResult = await indexFileContent(storeResult.metadata, extractResult.content);

      if (indexResult.success) {
        indexed = indexResult.indexed;
      } else {
        console.log('⚠️ Search indexing failed:', indexResult.error);
        // Continue with upload even if indexing fails
      }
    }

    console.log('✅ Upload successful!');
    return res.status(200).json({
      success: true,
      data: {
        fileId: storeResult.fileId,
        fileName: storeResult.metadata?.fileName,
        originalName: storeResult.metadata?.originalName,
        fileSize: storeResult.metadata?.fileSize,
        mimeType: storeResult.metadata?.mimeType,
        uploadDate: storeResult.metadata?.uploadDate,
        indexed,
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
