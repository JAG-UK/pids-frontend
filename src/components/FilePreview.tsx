import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Download, File, FileImage, FileVideo } from 'lucide-react';
import { FileStructure } from './types';
import { JSONViewer } from './JSONViewer';
import { CSVTableView } from './CSVTableView';
import { CodeViewer } from './CodeViewer';
import { PDFViewer } from './PDFViewer';

interface FilePreviewProps {
  file: FileStructure;
  datasetId: string;
}

  // Utility function for formatting bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Utility function to construct file URLs using the new dataset-based scheme
  const getFileUrl = (datasetId: string, file: FileStructure): string => {
    console.log('🔍 getFileUrl called with:', { datasetId, file: { name: file.name, path: file.path, fileUrl: file.fileUrl, imageUrl: file.imageUrl } });
    // If the file has a direct fileUrl (from the new manifest format), use it
    // But only if it's a valid, non-empty URL
    if (file.fileUrl && file.fileUrl.trim() !== '' && file.fileUrl !== 'undefined') {
      console.log('✅ Using fileUrl:', file.fileUrl);
      return file.fileUrl;
    }
    
    // If the file has an imageUrl (legacy), use it
    // But only if it's a valid, non-empty URL
    if (file.imageUrl && file.imageUrl.trim() !== '' && file.imageUrl !== 'undefined') {
      console.log('✅ Using imageUrl:', file.imageUrl);
      return file.imageUrl;
    }
    
    // Construct the new URL using dataset ID and file path
    // The path should be the file's path from the manifest, or fallback to name
    let filePath = file.path || file.name;
    
    // Remove leading slash if present to avoid double slashes
    if (filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }
    
    // Check if we're in development mode (localhost:5173) or production
    const isDevelopment = window.location.hostname === 'localhost' && window.location.port === '5173';
    console.log('🔧 Environment check:', { hostname: window.location.hostname, port: window.location.port, isDevelopment });
    
    if (isDevelopment) {
      // Development mode - use explicit API URL
      console.log('🔧 Development mode - using explicit API URL');
      const finalUrl = `http://localhost:3000/api/files/datasets/${datasetId}/${filePath}`;
      console.log('🔧 Constructed URL (dev):', finalUrl);
      return finalUrl;
    } else {
      // Production mode - use relative path (goes through nginx proxy)
      console.log('🔧 Production mode - using relative path');
      const finalUrl = `/api/files/datasets/${datasetId}/${filePath}`;
      console.log('🔧 Constructed URL (prod):', finalUrl);
      return finalUrl;
    }
  };

/**
 * File Preview Component
 * 
 * Hidden but code preserved for future use - eg highly retrievable PDP data
 * 
 * Renders appropriate preview components based on file type and MIME type.
 * Supports split-files, JSON, CSV, code files, text files, images, videos, and PDFs.
 */
export function FilePreview({ file, datasetId }: FilePreviewProps) {
  const mimeType = file.mimeType?.toLowerCase() || '';
  
  console.log(`Creating preview for filetype: ${mimeType}`);

  // Handle split-files
  if (file.type === 'split-file') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Split File</Badge>
          {file.size && (
            <span className="text-sm text-muted-foreground">{file.size}</span>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This is a split file with {file.parts?.length || 0} parts.
          </p>
          {file.parts && file.parts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Parts:</h4>
              <div className="space-y-1">
                {file.parts.map((part: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{part.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {part.byte_length ? formatBytes(part.byte_length) : 'Unknown size'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (file.content) {
    if (mimeType.includes('json')) {
      return <JSONViewer content={file.content} file={file} datasetId={datasetId} getFileUrl={getFileUrl} />;
    }
    
    if (mimeType.includes('csv')) {
      return <CSVTableView content={file.content} file={file} datasetId={datasetId} getFileUrl={getFileUrl} />;
    }
    
    // Handle code files - check for various code-related MIME types
    if (mimeType.includes('text/x-') || mimeType.includes('text/javascript') || mimeType.includes('text/typescript') || mimeType.includes('text/html') || mimeType.includes('text/css') || mimeType.includes('text/xml') || mimeType.includes('text/yaml') || mimeType.includes('text/markdown') || mimeType.includes('text/plain')) {
      return <CodeViewer content={file.content} filename={file.name} file={file} datasetId={datasetId} getFileUrl={getFileUrl} />;
    }
    
    // Fallback for any text content
    if (mimeType.includes('text')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Text File</Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {file.content.length} characters
              </span>
              <Button 
                size="sm" 
                className="bg-chart-1 hover:bg-chart-1/90 text-white"
                onClick={() => {
                  const downloadUrl = getFileUrl(datasetId, file);
                  window.open(downloadUrl, '_blank');
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[60vh]">
            <pre className="bg-muted p-4 rounded text-sm font-mono">
              <code>{file.content}</code>
            </pre>
          </ScrollArea>
        </div>
      );
    }
  }
  
  if (mimeType.includes('image')) {
    const imageUrl = getFileUrl(datasetId, file);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Image Preview</Badge>
          <div className="flex items-center gap-2">
            {file.size && (
              <span className="text-sm text-muted-foreground">{file.size}</span>
            )}
            <Button 
              size="sm" 
              className="bg-chart-1 hover:bg-chart-1/90 text-white"
              onClick={() => {
                const downloadUrl = getFileUrl(datasetId, file);
                window.open(downloadUrl, '_blank');
              }}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center bg-muted rounded overflow-hidden">
          <img 
            src={imageUrl} 
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden flex items-center justify-center h-64 w-full">
            <div className="text-center">
              <FileImage className="h-16 w-16 mx-auto mb-4 text-chart-3" />
              <p className="text-sm text-muted-foreground">Image not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (mimeType.includes('video')) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Video File</Badge>
          <div className="flex items-center gap-2">
            {file.size && (
              <span className="text-sm text-muted-foreground">{file.size}</span>
            )}
            <Button 
              size="sm" 
              className="bg-chart-1 hover:bg-chart-1/90 text-white"
              onClick={() => {
                const downloadUrl = getFileUrl(datasetId, file);
                window.open(downloadUrl, '_blank');
              }}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 bg-muted rounded">
          <div className="text-center">
            <FileVideo className="h-16 w-16 mx-auto mb-4 text-chart-4" />
            <p className="text-sm text-muted-foreground">Video preview not available</p>
            <p className="text-xs text-muted-foreground mt-1">Click download to view video</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (mimeType.includes('pdf')) {
    return <PDFViewer file={file} datasetId={datasetId} getFileUrl={getFileUrl} />;
  }
  
  return (
    <div className="flex items-center justify-center h-64 bg-muted rounded">
      <div className="text-center">
        <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Unable to render preview</p>
        <p className="text-xs text-muted-foreground mt-1">Please download to view this file</p>
      </div>
    </div>
  );
}
