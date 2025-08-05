import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ExploreDatasetProps, FileStructure } from './types';
import { 
  ArrowLeft, 
  Folder, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileSpreadsheet,
  FileJson,
  Download,
  ChevronRight
} from 'lucide-react';

export function ExploreDataset({ dataset, onBack }: ExploreDatasetProps) {
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const getFileIcon = (file: FileStructure) => {
    if (file.type === 'directory') {
      return <Folder className="h-4 w-4 text-chart-2" />;
    }
    
    const mimeType = file.mimeType?.toLowerCase() || '';
    if (mimeType.includes('image')) {
      return <FileImage className="h-4 w-4 text-chart-3" />;
    }
    if (mimeType.includes('video')) {
      return <FileVideo className="h-4 w-4 text-chart-4" />;
    }
    if (mimeType.includes('json')) {
      return <FileJson className="h-4 w-4 text-chart-5" />;
    }
    if (mimeType.includes('csv') || mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-4 w-4 text-chart-1" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (files: FileStructure[], level = 0) => {
    return files.map((file) => (
      <div key={file.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent transition-colors ${
            selectedFile?.id === file.id ? 'bg-chart-1/10 border border-chart-1/30' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (file.type === 'directory') {
              toggleFolder(file.id);
            } else {
              setSelectedFile(file);
            }
          }}
        >
          {file.type === 'directory' && (
            <ChevronRight 
              className={`h-3 w-3 transition-transform ${
                expandedFolders.has(file.id) ? 'rotate-90' : ''
              }`}
            />
          )}
          {getFileIcon(file)}
          <span className="text-sm">{file.name}</span>
          {file.size && (
            <Badge variant="outline" className="ml-auto text-xs">
              {file.size}
            </Badge>
          )}
        </div>
        
        {file.type === 'directory' && 
         expandedFolders.has(file.id) && 
         file.children && 
         renderFileTree(file.children, level + 1)}
      </div>
    ));
  };

  const renderFilePreview = (file: FileStructure) => {
    const mimeType = file.mimeType?.toLowerCase() || '';
    
    if (file.content) {
      if (mimeType.includes('json')) {
        try {
          const formatted = JSON.stringify(JSON.parse(file.content), null, 2);
          return (
            <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96 text-chart-5">
              <code>{formatted}</code>
            </pre>
          );
        } catch {
          return (
            <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
              <code>{file.content}</code>
            </pre>
          );
        }
      }
      
      if (mimeType.includes('csv') || mimeType.includes('text')) {
        return (
          <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
            <code>{file.content}</code>
          </pre>
        );
      }
    }
    
    if (mimeType.includes('image')) {
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded">
          <div className="text-center">
            <FileImage className="h-16 w-16 mx-auto mb-4 text-chart-3" />
            <p className="text-sm text-muted-foreground">Image preview not available</p>
            <p className="text-xs text-muted-foreground mt-1">Click download to view image</p>
          </div>
        </div>
      );
    }
    
    if (mimeType.includes('video')) {
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded">
          <div className="text-center">
            <FileVideo className="h-16 w-16 mx-auto mb-4 text-chart-4" />
            <p className="text-sm text-muted-foreground">Video preview not available</p>
            <p className="text-xs text-muted-foreground mt-1">Click download to view video</p>
          </div>
        </div>
      );
    }
    
    if (mimeType.includes('pdf')) {
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <p className="text-sm text-muted-foreground">PDF preview not available</p>
            <p className="text-xs text-muted-foreground mt-1">Click download to view PDF</p>
          </div>
        </div>
      );
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
  };

  const currentFiles = dataset.files || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-chart-1 text-chart-1 hover:bg-chart-1 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>
        <div>
          <h2 className="text-xl font-medium">{dataset.name}</h2>
          <p className="text-sm text-muted-foreground">{dataset.origin}</p>
        </div>
      </div>

      {/* Explorer Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {/* File Tree */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Folder className="h-4 w-4 text-chart-2" />
              Files & Directories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[55vh] px-4">
              {currentFiles.length > 0 ? (
                renderFileTree(currentFiles)
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <File className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No files available for exploration</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* File Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {selectedFile ? (
                  <>
                    {getFileIcon(selectedFile)}
                    {selectedFile.name}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    File Preview
                  </>
                )}
              </CardTitle>
              {selectedFile && (
                <div className="flex items-center gap-2">
                  {selectedFile.size && (
                    <Badge variant="outline" className="text-xs">
                      {selectedFile.size}
                    </Badge>
                  )}
                  <Button size="sm" className="bg-chart-1 hover:bg-chart-1/90 text-white">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50vh]">
              {selectedFile ? (
                renderFilePreview(selectedFile)
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Select a file to preview its contents</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}