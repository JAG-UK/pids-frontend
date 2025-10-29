import { Client } from 'minio';

let storageClient = null;
let isInitialized = false;

export const initializeStorage = async () => {
  try {
    // Use MinIO for all environments
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT) || 9000;
    
    storageClient = new Client({
      endPoint,
      port,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    // Test connection
    await storageClient.listBuckets();
    
    console.log('MinIO initialized');
    
    // Ensure default bucket exists
    const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
    await ensureBucketExists(bucketName);
    
    isInitialized = true;
    console.log(`Storage initialized with bucket: ${bucketName}`);
    
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

const ensureBucketExists = async (bucketName) => {
  const bucketExists = await storageClient.bucketExists(bucketName);
  if (!bucketExists) {
    await storageClient.makeBucket(bucketName);
    console.log(`Created MinIO bucket: ${bucketName}`);
    
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
    
    await storageClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  }
};

export const getStorageClient = () => {
  if (!storageClient || !isInitialized) {
    throw new Error('Storage client not initialized');
  }
  return storageClient;
};

export const uploadFile = async (file, objectName) => {
  const client = getStorageClient();
  const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
  
  try {
    await client.putObject(bucketName, objectName, file.buffer, {
      'Content-Type': file.mimetype,
      'Content-Length': file.size
    });
    
    return {
      success: true,
      objectName,
      bucketName,
      size: file.size,
      url: `${process.env.MINIO_EXTERNAL_URL || 'http://localhost:9000'}/${bucketName}/${objectName}`
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = (objectName, expiresIn = 3600) => {
  const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
  
  try {
    // MinIO - generate presigned URL
    const externalClient = new Client({
      endPoint: process.env.MINIO_EXTERNAL_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_EXTERNAL_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
    
    return externalClient.presignedGetObject(bucketName, objectName, expiresIn);
  } catch (error) {
    console.error('Error generating file URL:', error);
    // Fallback URL
    return `${process.env.MINIO_EXTERNAL_URL || 'http://localhost:9000'}/${bucketName}/${objectName}`;
  }
};

export const deleteFile = async (objectName) => {
  const client = getStorageClient();
  const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
  
  try {
    await client.removeObject(bucketName, objectName);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getStorageStatus = () => {
  return {
    initialized: isInitialized,
    type: 'minio',
    client: storageClient ? 'connected' : 'disconnected'
  };
};