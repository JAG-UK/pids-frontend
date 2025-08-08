import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
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
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Enhanced CSV Table Component
function CSVTableView({ content }: { content: string }) {
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
      {/* Search and Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredAndSortedData.length} rows
        </Badge>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                {parsedData.headers.map((header, index) => (
                  <TableHead key={header} className="cursor-pointer hover:bg-accent" onClick={() => handleSort(index)}>
                    <div className="flex items-center gap-2">
                      {header}
                      {sortColumn === index && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {parsedData.headers.map(header => (
                    <TableCell key={header} className="max-w-[200px] truncate">
                      {row[header] || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
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
function JSONViewer({ content }: { content: string }) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [searchTerm, setSearchTerm] = useState('');

  const parsedJson = useMemo(() => {
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
    
    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600' : 'text-red-600'}>{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-800">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      return (
        <div>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded"
            onClick={() => togglePath(path)}
            style={{ marginLeft: `${indent}px` }}
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            <span className="text-purple-600">[</span>
            <span className="text-muted-foreground">{value.length} items</span>
            {!isExpanded && <span className="text-muted-foreground">...</span>}
            <span className="text-purple-600">]</span>
          </div>
          {isExpanded && (
            <div>
              {value.map((item, index) => (
                <div key={index}>
                  {renderJsonValue(item, `${path}.${index}`, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const isExpanded = expandedPaths.has(path);
      const keys = Object.keys(value);
      return (
        <div>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded"
            onClick={() => togglePath(path)}
            style={{ marginLeft: `${indent}px` }}
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            <span className="text-purple-600">{'{'}</span>
            <span className="text-muted-foreground">{keys.length} properties</span>
            {!isExpanded && <span className="text-muted-foreground">...</span>}
            <span className="text-purple-600">{'}'}</span>
          </div>
          {isExpanded && (
            <div>
              {keys.map(key => (
                <div key={key}>
                  <div style={{ marginLeft: `${indent + 20}px` }}>
                    <span className="text-blue-800 font-medium">"{key}": </span>
                    {renderJsonValue(value[key], `${path}.${key}`, level + 1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  if (!parsedJson) {
    return (
      <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search in JSON..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <ScrollArea className="h-[60vh]">
        <div className="font-mono text-sm">
          {renderJsonValue(parsedJson, 'root')}
        </div>
      </ScrollArea>
    </div>
  );
}

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
        return <JSONViewer content={file.content} />;
      }
      
      if (mimeType.includes('csv')) {
        return <CSVTableView content={file.content} />;
      }
      
      if (mimeType.includes('text')) {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Text File</Badge>
              <span className="text-sm text-muted-foreground">
                {file.content.length} characters
              </span>
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
      if (file.imageUrl) {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Image Preview</Badge>
              {file.size && (
                <span className="text-sm text-muted-foreground">{file.size}</span>
              )}
            </div>
            <div className="flex items-center justify-center bg-muted rounded overflow-hidden">
              <img 
                src={file.imageUrl} 
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
                  <p className="text-xs text-muted-foreground mt-1">Please add the image file to the public folder</p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Video File</Badge>
            {file.size && (
              <span className="text-sm text-muted-foreground">{file.size}</span>
            )}
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
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">PDF Document</Badge>
            {file.size && (
              <span className="text-sm text-muted-foreground">{file.size}</span>
            )}
          </div>
          <div className="flex items-center justify-center h-64 bg-muted rounded">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <p className="text-sm text-muted-foreground">PDF preview not available</p>
              <p className="text-xs text-muted-foreground mt-1">Click download to view PDF</p>
            </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}