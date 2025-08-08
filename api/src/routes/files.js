import express from 'express';
import { getMinIOClient } from '../utils/storage.js';

const router = express.Router();

// GET /api/files/:filename - Get file from MinIO
router.get('/:filename(*)', async (req, res) => {
  try {
    const { filename } = req.params;
    const client = getMinIOClient();
    const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
    
    // Check if file exists
    let stat;
    try {
      stat = await client.statObject(bucketName, filename);
    } catch (error) {
      if (error.code === 'NotFound') {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }
      throw error;
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', stat.metaData?.['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Get the file data and send it
    const dataStream = client.getObject(bucketName, filename);
    const chunks = [];
    
    dataStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    dataStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.send(buffer);
    });
    
    dataStream.on('error', (error) => {
      console.error('Error reading file from MinIO:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error reading file'
        });
      }
    });
    
  } catch (error) {
    console.error('Error serving file from MinIO:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// GET /api/files/info/:id - Get file info by ID (for API routes)
router.get('/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement file retrieval from MinIO
    res.json({
      success: true,
      data: null,
      message: `File ${id} - coming soon`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/files/upload - Upload file
router.post('/upload', async (req, res) => {
  try {
    // TODO: Implement file upload to MinIO
    res.json({
      success: true,
      data: null,
      message: 'File upload - coming soon'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/files/delete/:id - Delete file
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement file deletion from MinIO
    res.json({
      success: true,
      data: null,
      message: `File ${id} deletion - coming soon`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 