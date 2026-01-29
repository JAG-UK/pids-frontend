import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Download, ChevronRight } from 'lucide-react';
import { FileStructure } from './types';

interface JSONViewerProps {
  content: string;
  file: FileStructure;
  datasetId: string;
  getFileUrl: (datasetId: string, file: FileStructure) => string;
}

export function JSONViewer({ content, file, datasetId, getFileUrl }: JSONViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [searchTerm, setSearchTerm] = useState('');

  const parsedData = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderJsonValue = (value: any, path: string, level: number = 0): JSX.Element => {
    const indent = level * 20;
    const isExpanded = expandedPaths.has(path);

    if (typeof value === 'object' && value !== null) {
      const isArray = Array.isArray(value);
      const keys = Object.keys(value);
      
      return (
        <div key={path}>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
            onClick={() => togglePath(path)}
            style={{ marginLeft: indent }}
          >
            <ChevronRight 
              className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
            <span className="font-mono text-sm">
              {isArray ? '[' : '{'}
              {!isExpanded && keys.length > 0 && (
                <span className="text-muted-foreground">
                  {keys.length} {isArray ? 'items' : 'properties'}
                </span>
              )}
              {!isExpanded && '}'}
            </span>
          </div>
          
          {isExpanded && (
            <div>
              {keys.map((key) => {
                const childPath = `${path}.${key}`;
                const childValue = value[key];
                return (
                  <div key={childPath}>
                    <div className="flex items-center gap-2" style={{ marginLeft: indent + 20 }}>
                      <span className="font-mono text-sm text-blue-600">"{key}":</span>
                      {typeof childValue === 'object' && childValue !== null ? (
                        renderJsonValue(childValue, childPath, level + 1)
                      ) : (
                        <span className="font-mono text-sm">
                          {typeof childValue === 'string' ? `"${childValue}"` : String(childValue)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginLeft: indent + 20 }}>
                <span className="font-mono text-sm">{isArray ? ']' : '}'}</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <span className="font-mono text-sm" style={{ marginLeft: indent }}>
        {typeof value === 'string' ? `"${value}"` : String(value)}
      </span>
    );
  };

  if (!parsedData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Invalid JSON</Badge>
        </div>
        <ScrollArea className="h-[60vh]">
          <pre className="bg-muted p-4 rounded text-sm font-mono text-destructive">
            {content}
          </pre>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">JSON Data</Badge>
          <span className="text-sm text-muted-foreground">
            {Object.keys(parsedData).length} root properties
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
        <Input
          placeholder="Search JSON..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>
      
      <ScrollArea className="h-[60vh]">
        <div className="p-4 bg-muted rounded">
          {renderJsonValue(parsedData, 'root')}
        </div>
      </ScrollArea>
    </div>
  );
}
