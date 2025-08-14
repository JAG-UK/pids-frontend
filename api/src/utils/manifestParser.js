/**
 * Manifest Parser Utility
 * Converts Filecoin Data Preparation Manifest to internal dataset format
 */

// Convert manifest contents to file structure
const convertContentsToFileStructure = (contents, basePath = '') => {
  const fileStructure = [];
  
  for (const item of contents) {
    const itemPath = basePath ? `${basePath}/${item.name}` : item.name;
    
    if (item['@type'] === 'directory') {
      const directory = {
        name: item.name,
        type: 'directory',
        size: 0,
        path: itemPath,
        children: item.contents ? convertContentsToFileStructure(item.contents, itemPath) : []
      };
      fileStructure.push(directory);
    } else if (item['@type'] === 'file') {
      const file = {
        name: item.name,
        type: 'file',
        size: item.byte_length || 0,
        path: itemPath,
        hash: item.hash,
        cid: item.cid,
        byte_length: item.byte_length,
        media_type: item.media_type,
        piece_cid: item.piece_cid
      };
      fileStructure.push(file);
    } else if (item['@type'] === 'split-file') {
      const splitFile = {
        name: item.name,
        type: 'split-file',
        size: item.byte_length || 0,
        path: itemPath,
        hash: item.hash,
        cid: item.cid,
        byte_length: item.byte_length,
        media_type: item.media_type,
        parts: item.parts || []
      };
      fileStructure.push(splitFile);
    }
  }
  
  return fileStructure;
};

// Calculate total size from file structure
const calculateTotalSize = (fileStructure) => {
  let totalSize = 0;
  
  const calculateSize = (items) => {
    for (const item of items) {
      if (item.type === 'file' || item.type === 'split-file') {
        totalSize += item.byte_length || item.size || 0;
      } else if (item.type === 'directory' && item.children) {
        calculateSize(item.children);
      }
    }
  };
  
  calculateSize(fileStructure);
  return totalSize;
};

// Convert manifest to dataset format
export const parseManifest = (manifestData) => {
  try {
    console.log('🔍 Parsing manifest:', manifestData.name);
    
    // Validate required fields
    if (!manifestData.name || !manifestData.description) {
      throw new Error('Manifest must contain name and description');
    }
    
    // Convert contents to file structure
    const fileStructure = manifestData.contents ? 
      convertContentsToFileStructure(manifestData.contents) : [];
    
    // Calculate total size
    const totalSize = calculateTotalSize(fileStructure);
    
    // Determine format based on contents
    const format = determineFormat(fileStructure);
    
    // Create dataset object
    const dataset = {
      _id: manifestData.uuid, // Use UUID as the document ID
      title: manifestData.name,
      description: manifestData.description,
      format: format,
      size: totalSize,
      tags: manifestData.tags || [],
      fileStructure: fileStructure,
      status: 'pending', // Always start as pending
      // Manifest-specific fields
      manifestData: manifestData,
      spec: manifestData['@spec'],
      specVersion: manifestData['@spec_version'],
      manifestType: manifestData['@type'],
      version: manifestData.version,
      openWith: manifestData.open_with,
      license: manifestData.license,
      projectUrl: manifestData.project_url,
      uuid: manifestData.uuid, // uuid from manifest (kept for backward compatibility)
      nPieces: manifestData.n_pieces,
      pieces: manifestData.pieces || []
    };
    
    console.log('✅ Manifest parsed successfully:', {
      title: dataset.title,
      size: dataset.size,
      format: dataset.format,
      fileCount: countFiles(fileStructure)
    });
    
    return dataset;
  } catch (error) {
    console.error('❌ Error parsing manifest:', error);
    throw error;
  }
};

// Determine format based on file structure
const determineFormat = (fileStructure) => {
  const extensions = new Set();
  
  const collectExtensions = (items) => {
    for (const item of items) {
      if (item.type === 'file' || item.type === 'split-file') {
        const ext = item.name.split('.').pop()?.toLowerCase();
        if (ext) extensions.add(ext);
      } else if (item.type === 'directory' && item.children) {
        collectExtensions(item.children);
      }
    }
  };
  
  collectExtensions(fileStructure);
  
  // Return the most common format or a default
  if (extensions.size === 0) return 'Unknown';
  if (extensions.size === 1) return extensions.values().next().value.toUpperCase();
  
  // Multiple formats - return the most common
  const formatCounts = {};
  for (const ext of extensions) {
    formatCounts[ext] = (formatCounts[ext] || 0) + 1;
  }
  
  const mostCommon = Object.entries(formatCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return mostCommon.toUpperCase();
};

// Count total files in structure
const countFiles = (fileStructure) => {
  let count = 0;
  
  const countItems = (items) => {
    for (const item of items) {
      if (item.type === 'file' || item.type === 'split-file') {
        count++;
      } else if (item.type === 'directory' && item.children) {
        countItems(item.children);
      }
    }
  };
  
  countItems(fileStructure);
  return count;
};

// Validate manifest structure
export const validateManifest = (manifestData) => {
  const errors = [];
  
  // Check required fields
  if (!manifestData.name) errors.push('Missing required field: name');
  if (!manifestData.description) errors.push('Missing required field: description');
  if (!manifestData['@spec']) errors.push('Missing required field: @spec');
  if (!manifestData['@spec_version']) errors.push('Missing required field: @spec_version');
  //if (!manifestData['@type']) errors.push('Missing required field: @type');
  
  // Check contents structure
  if (!manifestData.contents || !Array.isArray(manifestData.contents)) {
    errors.push('Missing or invalid contents array');
  }
  
  if (errors.length > 0) {
    throw new Error(`Manifest validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};
