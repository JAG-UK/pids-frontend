import express from 'express';
import { getMinIOClient } from '../utils/storage.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

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
    try {
      const dataStream = await client.getObject(bucketName, filename);
      dataStream.pipe(res);
    } catch (error) {
      console.error('Error reading file from MinIO:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error reading file'
        });
      }
    }
    
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

// GET /api/files/manifest/:datasetId - Get manifest file for a dataset
router.get('/manifest/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const client = getMinIOClient();
    const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
    
    // Import Dataset model
    const Dataset = (await import('../models/Dataset.js')).default;
    
    // Find the dataset
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }
    
    if (!dataset.manifestFile) {
      return res.status(404).json({
        success: false,
        error: 'No manifest file found for this dataset'
      });
    }
    
    // Check if manifest file exists
    let stat;
    try {
      stat = await client.statObject(bucketName, dataset.manifestFile);
    } catch (error) {
      if (error.code === 'NotFound') {
        return res.status(404).json({
          success: false,
          error: 'Manifest file not found'
        });
      }
      throw error;
    }
    
    // Set appropriate headers for JSON manifest
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Get the manifest file and send it
    const dataStream = client.getObject(bucketName, dataset.manifestFile);
    const chunks = [];
    
    dataStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    dataStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.send(buffer);
    });
    
    dataStream.on('error', (error) => {
      console.error('Error reading manifest file from MinIO:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error reading manifest file'
        });
      }
    });
    
  } catch (error) {
    console.error('Error serving manifest file:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// GET /api/files/datasets/:datasetId/:filepath(*) - Get file from dataset directory in MinIO
router.get('/datasets/:datasetId/:filepath(*)', async (req, res) => {
  try {
    const { datasetId, filepath } = req.params;
    const client = getMinIOClient();
    const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
    
    // Construct the full path: datasets/{datasetId}/{filepath}
    const fullPath = `datasets/${datasetId}/${filepath}`;
    console.log(`🔍 Serving file: ${fullPath} from bucket: ${bucketName}`);
    
    // Check if file exists
    let stat;
    try {
      stat = await client.statObject(bucketName, fullPath);
    } catch (error) {
      if (error.code === 'NotFound') {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }
      throw error;
    }
    
    // Set appropriate headers (CORS handled by nginx proxy)
    res.setHeader('Content-Type', stat.metaData?.['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Get the file data and send it
    try {
      const dataStream = await client.getObject(bucketName, fullPath);
      dataStream.pipe(res);
    } catch (error) {
      console.error('Error reading file from MinIO:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error reading file'
        });
      }
    }
    
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

// POST /api/files/upload - Upload file (Admin only)
router.post('/upload', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📤 File upload request received');
    
    // Check if file was uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }
    
    // Check if path was specified
    if (!req.body.path) {
      return res.status(400).json({
        success: false,
        error: 'No destination path specified'
      });
    }
    
    const uploadedFile = req.files.file;
    const destinationPath = req.body.path;
    
    console.log('📁 File upload details:', {
      originalName: uploadedFile.name,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      destinationPath: destinationPath
    });
    
    // Get MinIO client
    const client = getMinIOClient();
    const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
    
    // Ensure bucket exists
    try {
      const bucketExists = await client.bucketExists(bucketName);
      if (!bucketExists) {
        console.log(`📦 Creating bucket: ${bucketName}`);
        await client.makeBucket(bucketName);
      }
    } catch (error) {
      console.error('❌ Error checking/creating bucket:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to access MinIO bucket'
      });
    }
    
    // Upload file to MinIO
    try {
      console.log(`📤 Uploading file to MinIO: ${bucketName}/${destinationPath}`);
      
      const uploadResult = await client.putObject(
        bucketName,
        destinationPath,
        uploadedFile.data,
        {
          'Content-Type': uploadedFile.mimetype,
          'Content-Length': uploadedFile.size
        }
      );
      
      console.log('✅ File uploaded successfully to MinIO:', uploadResult);
      
      // Return success response
      res.json({
        success: true,
        data: {
          path: destinationPath,
          bucket: bucketName,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype,
          etag: uploadResult.etag
        },
        message: 'File uploaded successfully'
      });
      
    } catch (error) {
      console.error('❌ Error uploading to MinIO:', error);
      return res.status(500).json({
        success: false,
        error: `Failed to upload file to MinIO: ${error.message}`
      });
    }
    
  } catch (error) {
    console.error('❌ Error in file upload:', error);
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