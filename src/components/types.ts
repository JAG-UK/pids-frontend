export interface Dataset {
  id: string;
  name: string;
  origin: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedDate?: string; // Date when the dataset was verified/approved
  description: string;
  size: string;
  tags: string[];
  downloadUrl: string;
  files?: FileStructure[]; // File structure for explore feature
  pieces?: Piece[]; // Pieces from manifest format
}

export interface Piece {
  piece_cid: string;
  payload_cid: string;
}

export interface FileStructure {
  id: string;
  name: string;
  type: 'file' | 'directory' | 'split-file';
  size?: string;
  lastModified?: string;
  mimeType?: string;
  children?: FileStructure[];
  content?: string; // For preview content
  imageUrl?: string; // For image file previews
  // New manifest fields
  hash?: string;
  cid?: string;
  byte_length?: number;
  media_type?: string;
  piece_cid?: string;
  parts?: any[]; // For split-files
  // New file handling fields
  path?: string; // File path from manifest
  fileUrl?: string; // Constructed file URL for new dataset format
}

export interface SearchFilters {
  tags: string[];
  dateRange: 'all' | 'week' | 'month' | 'year';
  sizeRange: 'all' | 'small' | 'medium' | 'large';
}

export interface AdminDashboardProps {
  datasets: Dataset[];
  pendingDatasets: Dataset[];
  onApproveDataset: (id: string) => void;
  onRejectDataset: (id: string) => void;
  onRemoveDataset: (id: string) => void;
}

export interface PublicDirectoryProps {
  datasets: Dataset[];
  onExploreDataset: (dataset: Dataset) => void;
}

export interface DatasetCardProps {
  dataset: Dataset;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRemove?: (id: string) => void;
  onDownloadCache?: (id: string) => void;
  onExplore?: (dataset: Dataset) => void;
}

export interface ExploreDatasetProps {
  dataset: Dataset;
  onBack: () => void;
}

export type ViewMode = 'directory' | 'explore';