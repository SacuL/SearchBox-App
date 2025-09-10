import { NextApiRequest, NextApiResponse } from 'next';
import { StorageFactory } from '../../../server/file-storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId } = req.query;

  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    const storage = await StorageFactory.getStorage();

    // Get file metadata
    const metadata = await storage.getFileMetadata(fileId);
    if (!metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file content
    const fileBuffer = await storage.getFile(fileId);
    if (!fileBuffer) {
      return res.status(404).json({ error: 'File content not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader('Content-Length', metadata.fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Send file content
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Download failed',
    });
  }
}
