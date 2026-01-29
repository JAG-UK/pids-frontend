import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Download, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileStructure } from './types';

interface CodeViewerProps {
  content: string;
  language?: string;
  filename?: string;
  file: FileStructure;
  datasetId: string;
  getFileUrl: (datasetId: string, file: FileStructure) => string;
}

export function CodeViewer({ content, language, filename, file, datasetId, getFileUrl }: CodeViewerProps) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  
  const getLanguageFromFilename = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'py': 'python',
      'py3': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'txt': 'text',
      'sh': 'bash',
      'bash': 'bash',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return languageMap[ext || ''] || 'text';
  };

  const detectedLanguage = language || (filename ? getLanguageFromFilename(filename) : 'text');
  const lines = content.split('\n');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{detectedLanguage.toUpperCase()}</Badge>
          <span className="text-sm text-muted-foreground">
            {lines.length} lines, {content.length} characters
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
          >
            {showLineNumbers ? 'Hide' : 'Show'} Line Numbers
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
      
      <ScrollArea className="h-[60vh]">
        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="text-sm font-medium">{filename || 'code'}</span>
            </div>
          </div>
          <div className="relative">
            <SyntaxHighlighter
              language={detectedLanguage}
              style={coy}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '0.875rem',
                lineHeight: '1.5',
                backgroundColor: 'transparent'
              }}
              lineNumberStyle={{
                minWidth: '2.5rem',
                paddingRight: '1rem',
                textAlign: 'right',
                color: '#6b7280',
                userSelect: 'none'
              }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
