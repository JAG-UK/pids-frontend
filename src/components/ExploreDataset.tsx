import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

import { ExploreDatasetProps, FileStructure} from './types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Code,
  FileCode,
  BookOpen,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

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

// Enhanced CSV Table Component
function CSVTableView({ content, file, datasetId }: { content: string; file: FileStructure; datasetId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const parsedData = useMemo(() => {
    if (!content) return { headers: [], rows: [] };
    
    const lines = content.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as Record<string, string>);
    });
    
    return { headers, rows };
  }, [content]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = parsedData.rows;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    if (sortColumn !== null && parsedData.headers[sortColumn]) {
      const header = parsedData.headers[sortColumn];
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[header] || '';
        const bVal = b[header] || '';
        
        // Try to sort as numbers if possible
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Otherwise sort as strings
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return filtered;
  }, [parsedData, searchTerm, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">CSV Data</Badge>
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedData.length} rows
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
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              {parsedData.headers.map((header, index) => (
                <TableHead key={header} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(index)}>
                  <div className="flex items-center gap-2">
                    {header}
                    {sortColumn === index && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {parsedData.headers.map((header) => (
                  <TableCell key={header} className="font-mono text-sm">
                    {row[header] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced JSON Viewer Component
function JSONViewer({ content, file, datasetId }: { content: string; file: FileStructure; datasetId: string }) {
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

// Enhanced Code Viewer Component
function CodeViewer({ content, language, filename, file, datasetId }: { content: string; language?: string; filename?: string; file: FileStructure; datasetId: string }) {
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

// Enhanced PDF Viewer Component
function PDFViewer({ file, datasetId }: { file: FileStructure; datasetId: string }) {
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

// Download Instructions Component
function DownloadInstructions({ dataset, selectedFile, selectedCid, getFileIcon }: { dataset: any; selectedFile: FileStructure | null; selectedCid: string | null; getFileIcon: (file: FileStructure) => JSX.Element }) {
  const [selectedTool, setSelectedTool] = useState<'boost' | 'lassie' | 'lotus'>('lassie');
  const [copied, setCopied] = useState(false);
  const [copiedCar, setCopiedCar] = useState(false);

  // Get dataset-level piece CID for entire dataset download
  const datasetPieceCid = dataset.pieces && dataset.pieces.length > 0 
    ? dataset.pieces[0].piece_cid 
    : null;

  // Use dataset piece CID when no file is selected, otherwise use selectedCid. TODO should this be payload CID?
  const cidToUse = selectedFile ? selectedCid : datasetPieceCid;

  const getDownloadCommand = (cid: string) => {
    if (!cid) return '';

    const outputName = selectedFile 
      ? `${selectedFile.name.replace(/\s+/g, '_')}`
      : `${dataset.name.replace(/\s+/g, '_')}_${cid}.car`;

    switch (selectedTool) {
      case 'boost':
        return `boost retrieve --provider <provider> -o ${outputName} ${cid}`;
      case 'lassie':
        return `lassie fetch ${cid} -o ${outputName}`;
      case 'lotus':
        return `lotus client retrieve --miner <provider> ${cid} ${outputName}`;
      default:
        return '';
    }
  };

  const getCarDownloadCommand = () => {
    if (!selectedFile || !selectedFile.piece_cid) return '';

    const pieceCid = selectedFile.piece_cid;
    const outputName = `${pieceCid}.car`;

    switch (selectedTool) {
      case 'boost':
        return `boost retrieve --provider <provider> -o ${outputName} ${pieceCid}`;
      case 'lassie':
        return `lassie fetch ${pieceCid} -o ${outputName}`;
      case 'lotus':
        return `lotus client retrieve --miner <provider> ${pieceCid} ${outputName}`;
      default:
        return '';
    }
  };

  const getToolDescription = () => {
    switch (selectedTool) {
      case 'boost':
        return 'Retrieve from this storage provider using the Filecoin boost client.';
      case 'lassie':
        return 'Retrieve using Lassie, a simple Filecoin retrieval client.';
      case 'lotus':
        return 'Retrieve using Lotus, the reference Filecoin implementation.';
      default:
        return '';
    }
  };

  const handleCopyCommand = async () => {
    if (!cidToUse) return;
    const command = getDownloadCommand(cidToUse);
    if (command) {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCarCommand = async () => {
    const command = getCarDownloadCommand();
    if (command) {
      await navigator.clipboard.writeText(command);
      setCopiedCar(true);
      setTimeout(() => setCopiedCar(false), 2000);
    }
  };

  const command = cidToUse ? getDownloadCommand(cidToUse) : '';
  const carCommand = getCarDownloadCommand();

  return (
    <div className="space-y-6 h-full flex flex-col">
      {selectedFile && selectedCid ? (
        // File details when a file is selected
        <div className="space-y-3 pb-4">
          <div className="flex items-center gap-2">
            {getFileIcon(selectedFile)}
            <span className="font-medium">{selectedFile.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 capitalize">{selectedFile.mimeType || selectedFile.type}</span>
            </div>
            {selectedFile.size && (
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2">{selectedFile.size}</span>
              </div>
            )}
          </div>
          <div>
            <span className="text-muted-foreground text-sm">CID:</span>
            <span className="ml-2 font-mono text-sm text-foreground mt-1 break-all">
              {selectedCid}
            </span>
          </div>
        </div>
      ) : (
        // Dataset summary when no file is selected
        <div className="space-y-3 pb-4">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-chart-2" />
            <span className="font-medium text-lg">{dataset.name}</span>
          </div>
          {dataset.description && (
            <div>
              <span className="text-muted-foreground text-sm">Description:</span>
              <p className="text-sm text-foreground mt-1">{dataset.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Size:</span>
              <span className="ml-2">{dataset.size}</span>
            </div>
            {dataset.uploadDate && (
              <div>
                <span className="text-muted-foreground">Upload Date:</span>
                <span className="ml-2">{new Date(dataset.uploadDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Storage Status Section */}
      {(() => {
        // Use file's piece_cid if available, otherwise use dataset's piece CID
        const pieceCidToUse = selectedFile?.piece_cid || datasetPieceCid;
        const cidForIpfs = selectedFile ? selectedCid : (dataset.pieces && dataset.pieces.length > 0 ? dataset.pieces[0].payload_cid : null);
        
        if (!pieceCidToUse) return null;
        
        return (
          <div className="border-t pt-4 pb-4">
            <h4 className="text-sm font-medium mb-2">Storage Status</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedFile 
                ? `This file is stored in Piece ${pieceCidToUse}.`
                : `This dataset is stored in Piece ${pieceCidToUse}.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://filecoin.tools/search?q=${pieceCidToUse}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-chart-1 hover:text-chart-1/80 underline flex items-center gap-1"
              >
                Check on filecoin.tools
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://filscan.io/tipset/storage-deal?cid=${pieceCidToUse}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-chart-1 hover:text-chart-1/80 underline flex items-center gap-1"
              >
                Check on filscan
                <ExternalLink className="h-3 w-3" />
              </a>
              {cidForIpfs && (
                <a
                  href={`https://check.ipfs.network/?cid=${cidForIpfs}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-chart-1 hover:text-chart-1/80 underline flex items-center gap-1"
                >
                  Check on IPFS
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        );
      })()}

      <div className="border-t pt-4">
        <div className="space-y-4">
          {/* Tool Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Retrieval Tool</label>
            <ToggleGroup
              type="single"
              value={selectedTool}
              onValueChange={(value) => {
                if (value && (value === 'boost' || value === 'lassie' || value === 'lotus')) {
                  setSelectedTool(value);
                }
              }}
              variant="outline"
              size="default"
              className="shadow-md"
            >
              <ToggleGroupItem
                value="lassie"
                aria-label="Lassie"
                className="data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=off]:bg-muted data-[state=off]:text-muted-foreground"
              >
                Lassie
              </ToggleGroupItem>
              <ToggleGroupItem
                value="boost"
                aria-label="Boost"
                className="data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=off]:bg-muted data-[state=off]:text-muted-foreground"
              >
                Boost
              </ToggleGroupItem>
              <ToggleGroupItem
                value="lotus"
                aria-label="Lotus"
                className="data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=off]:bg-muted data-[state=off]:text-muted-foreground"
              >
                Lotus 
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {!cidToUse && (
            <div className="text-sm text-muted-foreground p-4 bg-muted rounded">
              {selectedFile 
                ? 'Select a file from the directory tree to view download instructions.'
                : 'No dataset pieces available for download.'}
            </div>
          )}

          {/* Download Instructions */}
          {cidToUse && (
            <>
              <div>
                <div className="text-sm text-muted-foreground mb-3">
                  {getToolDescription()}
                </div>
                
                {command && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Command</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCommand}
                        className="h-7"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 font-mono text-sm break-all">
                      {command}
                    </div>
                  </div>
                )}

                {/* CAR file download option */}
                {carCommand && selectedFile?.piece_cid && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Or download the entire CAR file</label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Using piece CID: <span className="font-mono">{selectedFile.piece_cid.slice(0, 16)}...</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCarCommand}
                        className="h-7"
                      >
                        {copiedCar ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 font-mono text-sm break-all">
                      {carCommand}
                    </div>
                  </div>
                )}
              </div>

              {(() => {
                const toolLinks = {
                  boost: {
                    name: 'Boost',
                    url: 'https://boost.filecoin.io'
                  },
                  lassie: {
                    name: 'Lassie',
                    url: 'https://docs.filecoin.io/basics/how-retrieval-works/basic-retrieval'
                  },
                  lotus: {
                    name: 'Lotus client',
                    url: 'https://lotus.filecoin.io/lotus/get-started/what-is-lotus/'
                  }
                };

                const tool = toolLinks[selectedTool];
                if (!tool) return null;

                return (
                  <div className="text-xs text-muted-foreground">
                    Don't have {tool.name.toLowerCase()}?{' '}
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-chart-1 hover:text-chart-1/80 underline"
                    >
                      Get started here.
                    </a>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Manifest Viewer Component
function ManifestViewer({ dataset }: { dataset: any }) {
  const [manifestContent, setManifestContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if we're in development mode (localhost:5173) or production
        const isDevelopment = window.location.hostname === 'localhost' && window.location.port === '5173';
        const apiBaseUrl = isDevelopment ? 'http://localhost:3000/api' : '/api';
        // Prefer direct file path if available; fallback to dataset-based endpoint
        const manifestUrl = dataset.manifestFile
          ? `${apiBaseUrl}/files/${dataset.manifestFile}`
          : `${apiBaseUrl}/files/manifest/${dataset.id}`;
        
        console.log('🔍 Fetching manifest from:', manifestUrl);
        console.log('🔍 Dataset ID:', dataset.id);
        console.log('🔍 Dataset manifestFile:', dataset.manifestFile);
        
        // Try to fetch the manifest file directly from the API
        const response = await fetch(manifestUrl);
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 Error response body:', errorText);
          throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
        }
        
        const manifestText = await response.text();
        console.log('🔍 Manifest content preview:', manifestText.substring(0, 200));
        setManifestContent(manifestText);
      } catch (err) {
        console.error('Error fetching manifest:', err);
        setError(err instanceof Error ? err.message : 'Failed to load manifest');
      } finally {
        setIsLoading(false);
      }
    };

    if (dataset.id) {
      fetchManifest();
    }
  }, [dataset.id]);

  if (isLoading) {
    return (
      <div className="h-[55vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading manifest...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[55vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Error loading manifest</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[55vh] overflow-auto">
      <div className="p-4 bg-muted rounded" style={{ minWidth: 'max-content' }}>
        <SyntaxHighlighter
          language="json"
          style={coy}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.875rem',
            lineHeight: '1.5',
            backgroundColor: 'transparent',
            whiteSpace: 'pre'
          }}
        >
          {manifestContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function ExploreDataset({ dataset, onBack }: ExploreDatasetProps) {
  const [selectedFile, setSelectedFile] = useState<FileStructure | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Extract CID from selected entry
  const selectedCid = useMemo(() => {
    if (!selectedFile) return null;

    if (selectedFile.type === 'file' || selectedFile.type === 'directory') {
      return selectedFile.cid || null;
    } else if (selectedFile.type === 'split-file') {
      return null; //NYI
    } else {
      return null;
    }
  }, [selectedFile]);

  const getFileIcon = (file: FileStructure) => {
    const mimeType = file.mimeType?.toLowerCase() || '';
    
    if (file.type === 'directory') {
      return <Folder className="h-4 w-4 text-chart-2" />;
    }
    
    if (file.type === 'split-file') {
      return <FileVideo className="h-4 w-4 text-chart-4" />; // Use video icon for split files
    }
    
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
    if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-destructive" />;
    }
    if (mimeType.includes('text') || mimeType.includes('code') || mimeType.includes('script')) {
      return <FileCode className="h-4 w-4 text-chart-6" />;
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
    return files.map((file) => {
      const fileId = `${file.name}-${level}`;
      const isExpanded = expandedFolders.has(fileId);
      const isSelected = selectedFile?.id === file.id;
      
      return (
        <div key={fileId}>
          <div
            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
              isSelected ? 'bg-muted' : ''
            }`}
            onClick={() => {
              // Always select the item (file or directory)
              setSelectedFile(file);
              
              // If it's a directory, also toggle expand/collapse
              if (file.type === 'directory') {
                toggleFolder(fileId);
              }
            }}
            style={{ marginLeft: level * 20 }}
          >
            {file.type === 'directory' ? (
              <ChevronRight
                className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            ) : null}
            {getFileIcon(file)}
            <span className="text-sm truncate">{file.name}</span>
            {file.size && (
              <span className="text-xs text-muted-foreground ml-auto">
                {file.size}
              </span>
            )}
          </div>
          
          {file.type === 'directory' && isExpanded && file.children && (
            <div>{renderFileTree(file.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  /* File Preview - Hidden but code preserved for future use - eg highly retrievable PDP data
   *
  const renderFilePreview = (file: FileStructure, datasetId: string) => {
    const mimeType = file.mimeType?.toLowerCase() || '';
    
    console.log(`Creating preview for filetype: ${mimeType}`)

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
        return <JSONViewer content={file.content} file={file} datasetId={datasetId} />;
      }
      
      if (mimeType.includes('csv')) {
        return <CSVTableView content={file.content} file={file} datasetId={datasetId} />;
      }
      
      // Handle code files - check for various code-related MIME types
      if (mimeType.includes('text/x-') || mimeType.includes('text/javascript') || mimeType.includes('text/typescript') || mimeType.includes('text/html') || mimeType.includes('text/css') || mimeType.includes('text/xml') || mimeType.includes('text/yaml') || mimeType.includes('text/markdown') || mimeType.includes('text/plain')) {
        return <CodeViewer content={file.content} filename={file.name} file={file} datasetId={datasetId} />;
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
      return <PDFViewer file={file} datasetId={datasetId} />;
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
  *
  END File Preview */ 

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
          {dataset.projectUrl ? (
            <a 
              href={dataset.projectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-chart-1 hover:text-chart-1/80 underline inline-flex items-center gap-1"
            >
              {new URL(dataset.projectUrl).hostname}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">{dataset.origin}</p>
          )}
        </div>
      </div>

      {/* Explorer Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {/* File Tree */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <Tabs defaultValue="files" className="w-full">
              <div className="px-4 pt-4 pb-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="files" className="text-xs">View as files</TabsTrigger>
                  <TabsTrigger value="manifest" className="text-xs">View as manifest</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="files" className="mt-2">
                <div className="px-4 pb-2">
                  <div 
                    className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                    onClick={() => setSelectedFile(null)}
                  >
                    <Folder className="h-4 w-4 text-chart-2" />
                    <span className="text-sm font-medium">{dataset.name} Dataset</span>
                  </div>
                </div>
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
              </TabsContent>
              
              <TabsContent value="manifest" className="mt-2">
                <div className="px-4">
                  <ManifestViewer dataset={dataset} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Download Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(70vh-4rem)] p-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                <DownloadInstructions dataset={dataset} selectedFile={selectedFile} selectedCid={selectedCid} getFileIcon={getFileIcon} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}