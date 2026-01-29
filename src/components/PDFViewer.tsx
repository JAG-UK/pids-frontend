import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, ExternalLink, BookOpen, FileText } from 'lucide-react';
import { FileStructure } from './types';

interface PDFViewerProps {
  file: FileStructure;
  datasetId: string;
  getFileUrl: (datasetId: string, file: FileStructure) => string;
}

export function PDFViewer({ file, datasetId, getFileUrl }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPdfUrl = () => {
    return getFileUrl(datasetId, file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">PDF Document</Badge>
          {file.size && (
            <span className="text-sm text-muted-foreground">{file.size}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(getPdfUrl(), '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open in New Tab
          </Button>
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
      
      <div className="border rounded-lg overflow-hidden bg-white">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <p className="text-sm text-muted-foreground">Failed to load PDF</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}
        
        <iframe
          src={`${getPdfUrl()}#toolbar=0`}
          className="w-full h-[60vh] border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError('Unable to load PDF preview');
          }}
          title={file.name}
        />
      </div>
    </div>
  );
}
