import { Client } from 'minio';

let minioClient = null;
let isInitialized = false;

export const initializeMinIO = async () => {
  try {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT) || 9000;
    
    minioClient = new Client({
      endPoint,
      port,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    // Test connection
    await minioClient.listBuckets();
    
    // Ensure default bucket exists
    const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Created bucket: ${bucketName}`);
      
      // Set bucket policy to public read (for images)
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
    
    isInitialized = true;
    console.log(`MinIO initialized with bucket: ${bucketName}`);
    
  } catch (error) {
    console.error('Error initializing MinIO:', error);
    throw error;
  }
};

export const getMinIOClient = () => {
  if (!minioClient || !isInitialized) {
    throw new Error('MinIO client not initialized');
  }
  return minioClient;
};

export const uploadFile = async (file, objectName) => {
  const client = getMinIOClient();
  const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
  
  try {
    await client.putObject(bucketName, objectName, file.buffer, {
      'Content-Type': file.mimetype,
      'Content-Length': file.size
    });
    
    return {
      success: true,
      objectName,
      bucketName,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
};

export const getFileUrl = (objectName, expiresIn = 3600) => {
  const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
  
  try {
    // Create a client with external hostname for presigned URLs
    const externalClient = new Client({
      endPoint: process.env.MINIO_EXTERNAL_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_EXTERNAL_PORT) || 9000,
      useSSL: false, // Use HTTP for local development
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
    
    return externalClient.presignedGetObject(bucketName, objectName, expiresIn);
  } catch (error) {
    console.error('Error generating file URL:', error);
    // Fallback to direct MinIO URL if presigned URL fails
    return `http://localhost:9000/${bucketName}/${objectName}`;
  }
};

export const deleteFile = async (objectName) => {
  const client = getMinIOClient();
  const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';
  
  try {
    await client.removeObject(bucketName, objectName);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw error;
  }
};

export const getStorageStatus = () => {
  return {
    initialized: isInitialized,
    client: minioClient ? 'connected' : 'disconnected'
  };
}; 