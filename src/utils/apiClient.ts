import { Dataset, SearchFilters } from '../components/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data (moved from App.tsx)
const mockDatasets: Dataset[] = [
  {
    id: "1",
    title: "Climate Research Data",
    description: "Comprehensive climate data collected from various research stations across the globe. Includes temperature, humidity, and atmospheric pressure readings.",
    format: "CSV",
    size: 2048576,
    tags: ["climate", "research", "environmental"],
    dateCreated: "2024-01-15",
    dateUpdated: "2024-01-15",
    fileStructure: [
      {
        name: "temperature_data.csv",
        type: "file",
        size: 1024000,
        path: "/temperature_data.csv"
      },
      {
        name: "humidity_data.csv",
        type: "file",
        size: 1024576,
        path: "/humidity_data.csv"
      }
    ]
  },
  {
    id: "2",
    title: "Urban Traffic Patterns",
    description: "Traffic flow data from major metropolitan areas. Contains vehicle counts, speed measurements, and congestion indicators.",
    format: "JSON",
    size: 1536000,
    tags: ["traffic", "urban", "transportation"],
    dateCreated: "2024-02-20",
    dateUpdated: "2024-02-20",
    fileStructure: [
      {
        name: "traffic_flow.json",
        type: "file",
        size: 1536000,
        path: "/traffic_flow.json"
      }
    ]
  },
  {
    id: "3",
    title: "Cat Photography Collection",
    description: "A curated collection of high-quality cat photographs from various breeds and settings. Perfect for machine learning training or artistic reference.",
    format: "JPEG",
    size: 52428800,
    tags: ["photography", "cats", "images", "animals"],
    dateCreated: "2024-03-10",
    dateUpdated: "2024-03-10",
    fileStructure: [
      {
        name: "images",
        type: "directory",
        size: 0,
        path: "/images",
        children: [
          {
            name: "cat1.jpg",
            type: "file",
            size: 2048576,
            path: "/images/cat1.jpg",
            imageUrl: "/api/files/cat1.jpg"
          },
          {
            name: "cat2.jpg",
            type: "file",
            size: 1876544,
            path: "/images/cat2.jpg",
            imageUrl: "/api/files/cat2.jpg"
          },
          {
            name: "cat3.jpg",
            type: "file",
            size: 2150400,
            path: "/images/cat3.jpg",
            imageUrl: "/api/files/cat3.jpg"
          },
          {
            name: "cat4.jpg",
            type: "file",
            size: 1984512,
            path: "/images/cat4.jpg",
            imageUrl: "/api/files/cat4.jpg"
          },
          {
            name: "cat5.jpg",
            type: "file",
            size: 2232320,
            path: "/images/cat5.jpg",
            imageUrl: "/api/files/cat5.jpg"
          }
        ]
      },
      {
        name: "metadata.json",
        type: "file",
        size: 1024,
        path: "/metadata.json"
      }
    ]
  },
  {
    id: "4",
    title: "Financial Market Analysis",
    description: "Historical stock market data with technical indicators and trading signals. Includes price movements, volume analysis, and market sentiment metrics.",
    format: "Parquet",
    size: 4194304,
    tags: ["finance", "trading", "stocks", "analysis"],
    dateCreated: "2024-01-30",
    dateUpdated: "2024-01-30",
    fileStructure: [
      {
        name: "market_data.parquet",
        type: "file",
        size: 4194304,
        path: "/market_data.parquet"
      }
    ]
  },
  {
    id: "5",
    title: "Medical Imaging Dataset",
    description: "Collection of medical scans including X-rays, CT scans, and MRI images. Anonymized patient data for research purposes.",
    format: "DICOM",
    size: 104857600,
    tags: ["medical", "imaging", "healthcare", "research"],
    dateCreated: "2024-02-15",
    dateUpdated: "2024-02-15",
    fileStructure: [
      {
        name: "xray_scans",
        type: "directory",
        size: 0,
        path: "/xray_scans",
        children: [
          {
            name: "scan001.dcm",
            type: "file",
            size: 2097152,
            path: "/xray_scans/scan001.dcm"
          },
          {
            name: "scan002.dcm",
            type: "file",
            size: 2097152,
            path: "/xray_scans/scan002.dcm"
          }
        ]
      },
      {
        name: "ct_scans",
        type: "directory",
        size: 0,
        path: "/ct_scans",
        children: [
          {
            name: "ct001.dcm",
            type: "file",
            size: 4194304,
            path: "/ct_scans/ct001.dcm"
          }
        ]
      }
    ]
  }
];

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface PaginatedDatasets {
  datasets: Dataset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Transform API dataset to frontend format
const transformDataset = (apiDataset: any): Dataset => {
  console.log('🔍 transformDataset input:', apiDataset);
  
  try {
    const transformed = {
      id: apiDataset._id,
      name: apiDataset.title,
      origin: apiDataset.createdBy || 'Unknown',
      uploadDate: apiDataset.dateCreated ? new Date(apiDataset.dateCreated).toISOString().split('T')[0] : '',
      status: 'approved' as const, // All datasets from API are considered approved
      verifiedDate: apiDataset.dateUpdated ? new Date(apiDataset.dateUpdated).toISOString().split('T')[0] : '',
      description: apiDataset.description,
      size: formatBytes(apiDataset.size),
      format: apiDataset.format,
      tags: apiDataset.tags || [],
      downloadUrl: '#', // Placeholder
      files: apiDataset.fileStructure ? transformFileStructure(apiDataset.fileStructure) : undefined
    };
    
    console.log('✅ transformDataset output:', transformed);
    return transformed;
  } catch (error) {
    console.error('❌ transformDataset error:', error, 'for dataset:', apiDataset);
    throw error;
  }
};

// Transform file structure
const transformFileStructure = (files: any[]): FileStructure[] => {
  console.log('🔍 transformFileStructure input:', files);
  
  try {
    const transformed = files.map(file => ({
      id: file._id || file.name,
      name: file.name,
      type: file.type,
      size: file.size ? formatBytes(file.size) : undefined,
      mimeType: getMimeType(file.name),
      children: file.children ? transformFileStructure(file.children) : undefined,
      imageUrl: file.imageUrl
    }));
    
    console.log('✅ transformFileStructure output:', transformed);
    return transformed;
  } catch (error) {
    console.error('❌ transformFileStructure error:', error, 'for files:', files);
    throw error;
  }
};

// Format bytes to human readable format
const formatBytes = (bytes: number): string => {
  console.log('🔢 formatBytes input:', bytes);
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  console.log('🔢 formatBytes output:', result);
  return result;
};

// Get MIME type from filename
const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'csv': 'text/csv',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'dcm': 'application/dicom',
    'parquet': 'application/octet-stream'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
};

const filterDatasets = (datasets: Dataset[], searchQuery: string, filters: SearchFilters): Dataset[] => {
  return datasets.filter(dataset => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        dataset.title.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }

    // Format filter
    if (filters.format && filters.format !== 'all') {
      if (dataset.format !== filters.format) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        dataset.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const datasetDate = new Date(dataset.dateCreated);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      
      if (startDate && datasetDate < startDate) return false;
      if (endDate && datasetDate > endDate) return false;
    }

    // Size range filter
    if (filters.sizeRange) {
      const datasetSize = dataset.size;
      const minSize = filters.sizeRange.min || 0;
      const maxSize = filters.sizeRange.max || Infinity;
      
      if (datasetSize < minSize || datasetSize > maxSize) return false;
    }

    return true;
  });
};

// Mock API functions
const mockApi = {
  async getDatasets(searchQuery: string = '', filters: SearchFilters = {}, page: number = 1, limit: number = 10): Promise<PaginatedDatasets> {
    // Simulate network delay
    await delay(300);
    
    const filteredDatasets = filterDatasets(mockDatasets, searchQuery, filters);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDatasets = filteredDatasets.slice(startIndex, endIndex);
    
    return {
      datasets: paginatedDatasets,
      pagination: {
        page,
        limit,
        total: filteredDatasets.length,
        pages: Math.ceil(filteredDatasets.length / limit)
      }
    };
  },

  async getDataset(id: string): Promise<Dataset | null> {
    await delay(200);
    return mockDatasets.find(dataset => dataset.id === id) || null;
  },

  async createDataset(dataset: Omit<Dataset, 'id'>): Promise<Dataset> {
    await delay(500);
    const newDataset: Dataset = {
      ...dataset,
      id: Date.now().toString()
    };
    mockDatasets.push(newDataset);
    return newDataset;
  },

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset | null> {
    await delay(400);
    const index = mockDatasets.findIndex(dataset => dataset.id === id);
    if (index === -1) return null;
    
    mockDatasets[index] = { ...mockDatasets[index], ...updates };
    return mockDatasets[index];
  },

  async deleteDataset(id: string): Promise<boolean> {
    await delay(300);
    const index = mockDatasets.findIndex(dataset => dataset.id === id);
    if (index === -1) return false;
    
    mockDatasets.splice(index, 1);
    return true;
  }
};

// Real API functions
const realApi = {
  async getDatasets(searchQuery: string = '', filters: SearchFilters = {}, page: number = 1, limit: number = 10): Promise<PaginatedDatasets> {
    console.log('🚀 getDatasets called with:', { searchQuery, filters, page, limit });
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.format && filters.format !== 'all') params.append('format', filters.format);
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${API_BASE_URL}/datasets?${params}`;
      console.log('🌐 Fetching from URL:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result: ApiResponse<any[]> = await response.json();
      console.log('📦 Raw API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch datasets');
      }

      console.log('🔢 Number of datasets from API:', result.data?.length || 0);

      // Transform API data to frontend format
      const transformedDatasets = result.data.map((dataset, index) => {
        console.log(`🔄 Transforming dataset ${index + 1}/${result.data.length}`);
        return transformDataset(dataset);
      });

      console.log('✅ Final transformed datasets:', transformedDatasets);

      const paginatedResult = {
        datasets: transformedDatasets,
        pagination: result.pagination || {
          page,
          limit,
          total: result.data.length,
          pages: 1
        }
      };

      console.log('🎯 Returning paginated result:', paginatedResult);
      return paginatedResult;
      
    } catch (error) {
      console.error('❌ getDatasets error:', error);
      throw error;
    }
  },

  async getDataset(id: string): Promise<Dataset | null> {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dataset');
    }

    return transformDataset(result.data);
  },

  async createDataset(dataset: Omit<Dataset, 'id'>): Promise<Dataset> {
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataset),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: ApiResponse<Dataset> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create dataset');
    }

    return result.data;
  },

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset | null> {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: ApiResponse<Dataset> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update dataset');
    }

    return result.data;
  },

  async deleteDataset(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: 'DELETE',
    });
    
    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: ApiResponse<{ message: string }> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete dataset');
    }

    return true;
  }
};

// Main API client that switches between real and mock
export const apiClient = {
  async getDatasets(searchQuery: string = '', filters: SearchFilters = {}, page: number = 1, limit: number = 10): Promise<PaginatedDatasets> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.getDatasets(searchQuery, filters, page, limit);
      } else {
        return await realApi.getDatasets(searchQuery, filters, page, limit);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.getDatasets(searchQuery, filters, page, limit);
    }
  },

  async getDataset(id: string): Promise<Dataset | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.getDataset(id);
      } else {
        return await realApi.getDataset(id);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.getDataset(id);
    }
  },

  async createDataset(dataset: Omit<Dataset, 'id'>): Promise<Dataset> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.createDataset(dataset);
      } else {
        return await realApi.createDataset(dataset);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.createDataset(dataset);
    }
  },

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.updateDataset(id, updates);
      } else {
        return await realApi.updateDataset(id, updates);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.updateDataset(id, updates);
    }
  },

  async deleteDataset(id: string): Promise<boolean> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.deleteDataset(id);
      } else {
        return await realApi.deleteDataset(id);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.deleteDataset(id);
    }
  }
};

// Export for debugging
export const isUsingMockData = () => USE_MOCK_DATA;
export const getApiBaseUrl = () => API_BASE_URL; 