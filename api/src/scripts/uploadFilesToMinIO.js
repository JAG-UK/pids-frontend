import mongoose from 'mongoose';
import { initializeMinIO, getMinIOClient } from '../utils/storage.js';
import Dataset from '../models/Dataset.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File mappings - all the files we need to upload
const filesToUpload = [
  // Cat images from api/public/files
  { source: '../../public/files/cat1.jpg', objectName: 'images/cats/cat1.jpg' },
  { source: '../../public/files/cat2.jpg', objectName: 'images/cats/cat2.jpg' },
  { source: '../../public/files/cat3.jpg', objectName: 'images/cats/cat3.jpg' },
  { source: '../../public/files/cat4.jpg', objectName: 'images/cats/cat4.jpg' },
  { source: '../../public/files/cat5.jpg', objectName: 'images/cats/cat5.jpg' },
  { source: '../../public/files/persian_cat.jpg', objectName: 'images/cats/persian_cat.jpg' },
  { source: '../../public/files/siamese_cat.jpg', objectName: 'images/cats/siamese_cat.jpg' },
  
  // Additional cat images from public/images/cats
  { source: '../../../public/images/cats/portraits/orange_tabby.jpg', objectName: 'images/cats/portraits/orange_tabby.jpg' },
  { source: '../../../public/images/cats/action_shots/jumping_cat.jpg', objectName: 'images/cats/action_shots/jumping_cat.jpg' },
  { source: '../../../public/images/cats/action_shots/playing_cat.jpg', objectName: 'images/cats/action_shots/playing_cat.jpg' },
  { source: '../../../public/images/cats/cute_moments/sleeping_kitten.jpg', objectName: 'images/cats/cute_moments/sleeping_kitten.jpg' },
  { source: '../../../public/images/cats/cute_moments/yawning_cat.jpg', objectName: 'images/cats/cute_moments/yawning_cat.jpg' },
];

const uploadFilesToMinIO = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pids');
    console.log('✅ Connected to MongoDB');

    // Initialize MinIO
    await initializeMinIO();
    console.log('✅ MinIO initialized');

    const client = getMinIOClient();
    const bucketName = process.env.MINIO_BUCKET || 'pids-datasets';

    // Upload all files
    const uploadedFiles = [];
    
    for (const fileInfo of filesToUpload) {
      const sourcePath = path.join(__dirname, fileInfo.source);
      
      if (!fs.existsSync(sourcePath)) {
        console.log(`⚠️  File not found: ${sourcePath}`);
        continue;
      }

      try {
        const fileBuffer = fs.readFileSync(sourcePath);
        const stats = fs.statSync(sourcePath);
        
        await client.putObject(bucketName, fileInfo.objectName, fileBuffer, {
          'Content-Type': getMimeType(fileInfo.objectName),
          'Content-Length': stats.size
        });
        
        console.log(`✅ Uploaded: ${fileInfo.objectName}`);
        uploadedFiles.push({
          objectName: fileInfo.objectName,
          size: stats.size,
          url: `http://localhost:9000/${bucketName}/${fileInfo.objectName}`
        });
      } catch (error) {
        console.error(`❌ Failed to upload ${fileInfo.objectName}:`, error.message);
      }
    }

    // Update database with new URLs
    console.log('\n🔄 Updating database with new file URLs...');
    
    // Update cat photography collection
    const catDataset = await Dataset.findOne({ title: 'Cat Photography Collection' });
    if (catDataset) {
      const updatedFileStructure = catDataset.fileStructure.map(file => {
        if (file.name === 'images' && file.type === 'directory' && file.children) {
          return {
            ...file,
            children: file.children.map(child => {
              if (child.name === 'cat1.jpg') {
                return { ...child, imageUrl: `http://localhost:8080/public/static/images/cats/cat1.jpg` };
              } else if (child.name === 'cat2.jpg') {
                return { ...child, imageUrl: `http://localhost:8080/public/static/images/cats/cat2.jpg` };
              } else if (child.name === 'cat3.jpg') {
                return { ...child, imageUrl: `http://localhost:8080/public/static/images/cats/cat3.jpg` };
              } else if (child.name === 'cat4.jpg') {
                return { ...child, imageUrl: `http://localhost:8080/public/static/images/cats/cat4.jpg` };
              } else if (child.name === 'cat5.jpg') {
                return { ...child, imageUrl: `http://localhost:8080/public/static/images/cats/cat5.jpg` };
              }
              return child;
            })
          };
        }
        return file;
      });

      catDataset.fileStructure = updatedFileStructure;
      await catDataset.save();
      console.log('✅ Updated Cat Photography Collection');
    }

    console.log('\n📊 Upload Summary:');
    console.log(`Total files uploaded: ${uploadedFiles.length}`);
    uploadedFiles.forEach(file => {
      console.log(`  - ${file.objectName} (${formatBytes(file.size)})`);
    });

    console.log('\n🎉 File upload to MinIO completed successfully!');
    console.log(`\n📁 MinIO Console: http://localhost:9001`);
    console.log(`   Username: minioadmin`);
    console.log(`   Password: minioadmin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading files to MinIO:', error);
    process.exit(1);
  }
};

const getMimeType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'json': 'application/json',
    'csv': 'text/csv'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Run the upload function
uploadFilesToMinIO();
