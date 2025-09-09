import { Client } from 'minio';
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';

let storageClient = null;
let isInitialized = false;
let storageType = null;

export const initializeStorage = async () => {
  try {
    // Determine storage type based on environment
    if (process.env.NODE_ENV === 'production' && process.env.SPACES_ACCESS_KEY) {
      // Production: Use Digital Ocean Spaces
      storageType = 'spaces';
      
      // TODO: Fix AWS SDK v3 import issue
      console.log('Digital Ocean Spaces configuration detected but AWS SDK import disabled');
      throw new Error('AWS SDK not available - using MinIO fallback');
      
      // storageClient = new S3Client({
      //   credentials: {
      //     accessKeyId: process.env.SPACES_ACCESS_KEY,
      //     secretAccessKey: process.env.SPACES_SECRET_KEY,
      //   },
      //   region: process.env.SPACES_REGION || 'nyc3',
      //   endpoint: process.env.SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
      //   forcePathStyle: false, // Digital Ocean Spaces uses subdomain style
      // });
      
      // // Test connection (skip for now)
      // // await storageClient.send(new HeadBucketCommand({ Bucket: 'test' }));
      
      // console.log('Digital Ocean Spaces initialized');
      
    } else {
      // Development: Use MinIO
      storageType = 'minio';
      
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
    }
    
    // Ensure default bucket exists
    const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
    await ensureBucketExists(bucketName);
    
    isInitialized = true;
    console.log(`Storage initialized (${storageType}) with bucket: ${bucketName}`);
    
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

const ensureBucketExists = async (bucketName) => {
  if (storageType === 'spaces') {
    try {
      await storageClient.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      if (error.name === 'NotFound') {
        await storageClient.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`Created Spaces bucket: ${bucketName}`);
      } else {
        throw error;
      }
    }
  } else {
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
    if (storageType === 'spaces') {
      // Digital Ocean Spaces
      const params = {
        Bucket: bucketName,
        Key: objectName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };
      
      await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: objectName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      }));
      
      return {
        success: true,
        objectName,
        bucketName,
        size: file.size,
        url: `https://${bucketName}.nyc3.digitaloceanspaces.com/${objectName}`
      };
    } else {
      // MinIO
      await client.putObject(bucketName, objectName, file.buffer, {
        'Content-Type': file.mimetype,
        'Content-Length': file.size
      });
      
      return {
        success: true,
        objectName,
        bucketName,
        size: file.size,
        url: `http://localhost:9000/${bucketName}/${objectName}`
      };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = (objectName, expiresIn = 3600) => {
  const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
  
  try {
    if (storageType === 'spaces') {
      // Digital Ocean Spaces - return public URL
      return `https://${bucketName}.nyc3.digitaloceanspaces.com/${objectName}`;
    } else {
      // MinIO - generate presigned URL
      const externalClient = new Client({
        endPoint: process.env.MINIO_EXTERNAL_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_EXTERNAL_PORT) || 9000,
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      });
      
      return externalClient.presignedGetObject(bucketName, objectName, expiresIn);
    }
  } catch (error) {
    console.error('Error generating file URL:', error);
    // Fallback URL
    if (storageType === 'spaces') {
      return `https://${bucketName}.nyc3.digitaloceanspaces.com/${objectName}`;
    } else {
      return `http://localhost:9000/${bucketName}/${objectName}`;
    }
  }
};

export const deleteFile = async (objectName) => {
  const client = getStorageClient();
  const bucketName = process.env.STORAGE_BUCKET || 'pids-datasets';
  
  try {
    if (storageType === 'spaces') {
      await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectName }));
    } else {
      await client.removeObject(bucketName, objectName);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getStorageStatus = () => {
  return {
    initialized: isInitialized,
    type: storageType,
    client: storageClient ? 'connected' : 'disconnected'
  };
};