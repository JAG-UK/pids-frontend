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
  
  // New dataset: Technical Documentation and Code
  { source: '../../public/files/sample-pdf-1.pdf', objectName: 'docs/technical/sample-pdf-1.pdf' },
  { source: '../../public/files/sample-pdf-2.pdf', objectName: 'docs/technical/sample-pdf-2.pdf' },
  { source: '../../public/files/main.py', objectName: 'code/python/main.py' },
  { source: '../../public/files/utils.py', objectName: 'code/python/utils.py' },
  { source: '../../public/files/config.json', objectName: 'code/python/config.json' },
  { source: '../../public/files/README.md', objectName: 'code/python/README.md' },
  { source: '../../public/files/app.js', objectName: 'code/javascript/app.js' },
  { source: '../../public/files/package.json', objectName: 'code/javascript/package.json' },
  { source: '../../public/files/styles.css', objectName: 'code/css/styles.css' },
  { source: '../../public/files/index.html', objectName: 'code/html/index.html' },
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

    // Create new Technical Documentation and Code dataset
    const technicalDataset = await Dataset.findOne({ title: 'Technical Documentation and Code' });
    if (!technicalDataset) {
      const newTechnicalDataset = new Dataset({
        title: 'Technical Documentation and Code',
        description: 'A comprehensive collection of technical documentation, source code, and configuration files for the PIDS Data Explorer project.',
        format: 'Mixed',
        size: 2200000, // 2.1 MB in bytes
        files: 12,
        status: 'approved',
        fileStructure: [
          {
            name: 'docs',
            type: 'directory',
            size: 0,
            path: '/docs',
            children: [
              {
                name: 'technical',
                type: 'directory',
                size: 0,
                path: '/docs/technical',
                children: [
                  {
                    name: 'sample-pdf-1.pdf',
                    type: 'file',
                    size: 1024,
                    path: '/docs/technical/sample-pdf-1.pdf',
                    content: 'Technical Documentation - Sample PDF 1',
                    imageUrl: 'http://localhost:8080/public/static/docs/technical/sample-pdf-1.pdf'
                  },
                  {
                    name: 'sample-pdf-2.pdf',
                    type: 'file',
                    size: 2048,
                    path: '/docs/technical/sample-pdf-2.pdf',
                    content: 'Technical Documentation - Sample PDF 2',
                    imageUrl: 'http://localhost:8080/public/static/docs/technical/sample-pdf-2.pdf'
                  }
                ]
              }
            ]
          },
          {
            name: 'code',
            type: 'directory',
            size: 0,
            path: '/code',
            children: [
              {
                name: 'python',
                type: 'directory',
                size: 0,
                path: '/code/python',
                children: [
                  {
                    name: 'main.py',
                    type: 'file',
                    size: 2048,
                    path: '/code/python/main.py',
                    content: '#!/usr/bin/env python3\n\n"""\nMain application entry point for the PIDS Data Explorer.\n\nThis module provides the core functionality for exploring and analyzing\ndatasets in the PIDS (Public Information Data System) platform.\n"""',
                    imageUrl: 'http://localhost:8080/public/static/code/python/main.py'
                  },
                  {
                    name: 'utils.py',
                    type: 'file',
                    size: 3072,
                    path: '/code/python/utils.py',
                    content: '"""\nUtility functions for the PIDS Data Explorer.\n\nThis module provides common utility functions used throughout the application.\n"""',
                    imageUrl: 'http://localhost:8080/public/static/code/python/utils.py'
                  },
                  {
                    name: 'config.json',
                    type: 'file',
                    size: 1024,
                    path: '/code/python/config.json',
                    content: '{\n  "app": {\n    "name": "PIDS Data Explorer",\n    "version": "1.0.0"\n  }\n}',
                    imageUrl: 'http://localhost:8080/public/static/code/python/config.json'
                  },
                  {
                    name: 'README.md',
                    type: 'file',
                    size: 4096,
                    path: '/code/python/README.md',
                    content: '# PIDS Data Explorer\n\nA modern web application for exploring and analyzing public information datasets.',
                    imageUrl: 'http://localhost:8080/public/static/code/python/README.md'
                  }
                ]
              },
              {
                name: 'javascript',
                type: 'directory',
                size: 0,
                path: '/code/javascript',
                children: [
                  {
                    name: 'app.js',
                    type: 'file',
                    size: 5120,
                    path: '/code/javascript/app.js',
                    content: '/**\n * PIDS Data Explorer - Frontend Application\n * \n * This is the main JavaScript application for the PIDS Data Explorer\n * frontend interface.\n */',
                    imageUrl: 'http://localhost:8080/public/static/code/javascript/app.js'
                  },
                  {
                    name: 'package.json',
                    type: 'file',
                    size: 1024,
                    path: '/code/javascript/package.json',
                    content: '{\n  "name": "pids-frontend",\n  "version": "1.0.0",\n  "description": "PIDS Data Explorer Frontend"}',
                    imageUrl: 'http://localhost:8080/public/static/code/javascript/package.json'
                  }
                ]
              },
              {
                name: 'css',
                type: 'directory',
                size: 0,
                path: '/code/css',
                children: [
                  {
                    name: 'styles.css',
                    type: 'file',
                    size: 1536,
                    path: '/code/css/styles.css',
                    content: '/* PIDS Data Explorer Styles */\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  margin: 0;\n  padding: 0;\n}',
                    imageUrl: 'http://localhost:8080/public/static/code/css/styles.css'
                  }
                ]
              },
              {
                name: 'html',
                type: 'directory',
                size: 0,
                path: '/code/html',
                children: [
                  {
                    name: 'index.html',
                    type: 'file',
                    size: 1024,
                    path: '/code/html/index.html',
                    content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>PIDS Data Explorer</title>\n</head>\n<body>\n    <div id="app"></div>\n</body>\n</html>',
                    imageUrl: 'http://localhost:8080/public/static/code/html/index.html'
                  }
                ]
              }
            ]
          }
        ]
      });

      await newTechnicalDataset.save();
      console.log('✅ Created Technical Documentation and Code dataset');
    } else {
      // Update existing technical dataset with correct URLs
      const updatedFileStructure = technicalDataset.fileStructure.map(file => {
        if (file.name === 'docs' && file.type === 'directory' && file.children) {
          return {
            ...file,
            children: file.children.map(child => {
              if (child.name === 'technical' && child.type === 'directory' && child.children) {
                return {
                  ...child,
                  children: child.children.map(grandchild => {
                    if (grandchild.name === 'sample-pdf-1.pdf') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/docs/technical/sample-pdf-1.pdf' };
                    } else if (grandchild.name === 'sample-pdf-2.pdf') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/docs/technical/sample-pdf-2.pdf' };
                    }
                    return grandchild;
                  })
                };
              }
              return child;
            })
          };
        } else if (file.name === 'code' && file.type === 'directory' && file.children) {
          return {
            ...file,
            children: file.children.map(child => {
              if (child.name === 'python' && child.type === 'directory' && child.children) {
                return {
                  ...child,
                  children: child.children.map(grandchild => {
                    if (grandchild.name === 'main.py') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/python/main.py' };
                    } else if (grandchild.name === 'utils.py') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/python/utils.py' };
                    } else if (grandchild.name === 'config.json') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/python/config.json' };
                    } else if (grandchild.name === 'README.md') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/python/README.md' };
                    }
                    return grandchild;
                  })
                };
              } else if (child.name === 'javascript' && child.type === 'directory' && child.children) {
                return {
                  ...child,
                  children: child.children.map(grandchild => {
                    if (grandchild.name === 'app.js') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/javascript/app.js' };
                    } else if (grandchild.name === 'package.json') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/javascript/package.json' };
                    }
                    return grandchild;
                  })
                };
              } else if (child.name === 'css' && child.type === 'directory' && child.children) {
                return {
                  ...child,
                  children: child.children.map(grandchild => {
                    if (grandchild.name === 'styles.css') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/css/styles.css' };
                    }
                    return grandchild;
                  })
                };
              } else if (child.name === 'html' && child.type === 'directory' && child.children) {
                return {
                  ...child,
                  children: child.children.map(grandchild => {
                    if (grandchild.name === 'index.html') {
                      return { ...grandchild, imageUrl: 'http://localhost:8080/public/static/code/html/index.html' };
                    }
                    return grandchild;
                  })
                };
              }
              return child;
            })
          };
        }
        return file;
      });

      technicalDataset.fileStructure = updatedFileStructure;
      await technicalDataset.save();
      console.log('✅ Updated Technical Documentation and Code dataset with correct URLs');
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
