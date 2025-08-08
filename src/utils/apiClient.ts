import { Dataset, SearchFilters, FileStructure } from '../components/types';

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = (import.meta as any).env?.VITE_USE_MOCK_DATA === 'true';

// Mock data (moved from App.tsx)
const mockDatasets: Dataset[] = [
  {
    id: "1",
    name: "Climate Research Data",
    origin: "admin",
    uploadDate: "2024-01-15",
    status: "pending",
    verifiedDate: "2024-01-15",
    description: "Comprehensive climate data collected from various research stations across the globe. Includes temperature, humidity, and atmospheric pressure readings.",
    format: "CSV",
    size: "2.0 MB",
    tags: ["climate", "research", "environmental"],
    downloadUrl: "#",
    files: [
      {
        id: "temp-data",
        name: "temperature_data.csv",
        type: "file",
        size: "1.0 MB",
        mimeType: "text/csv",
        content: `Date,Station,Latitude,Longitude,Temperature_C,Humidity_Percent,Pressure_hPa
2024-01-01,Station_A,40.7128,-74.0060,15.2,65,1013.25
2024-01-01,Station_B,34.0522,-118.2437,18.5,58,1012.80
2024-01-01,Station_C,51.5074,-0.1278,8.9,72,1014.50
2024-01-02,Station_A,40.7128,-74.0060,12.8,68,1012.90
2024-01-02,Station_B,34.0522,-118.2437,17.2,61,1011.45
2024-01-02,Station_C,51.5074,-0.1278,7.5,75,1013.80
2024-01-03,Station_A,40.7128,-74.0060,14.1,63,1014.20
2024-01-03,Station_B,34.0522,-118.2437,19.8,55,1010.90
2024-01-03,Station_C,51.5074,-0.1278,9.2,70,1015.10
2024-01-04,Station_A,40.7128,-74.0060,13.5,67,1013.60
2024-01-04,Station_B,34.0522,-118.2437,16.9,59,1012.15
2024-01-04,Station_C,51.5074,-0.1278,8.1,73,1014.90`
      },
      {
        id: "humidity-data",
        name: "humidity_data.csv",
        type: "file",
        size: "1.0 MB",
        mimeType: "text/csv",
        content: `Date,Station,Morning_Humidity,Afternoon_Humidity,Evening_Humidity,Dew_Point
2024-01-01,Station_A,72,45,68,8.5
2024-01-01,Station_B,65,38,62,12.2
2024-01-01,Station_C,78,52,75,4.8
2024-01-02,Station_A,75,48,71,7.2
2024-01-02,Station_B,68,41,65,11.8
2024-01-02,Station_C,81,55,78,3.9
2024-01-03,Station_A,70,43,69,9.1
2024-01-03,Station_B,62,35,60,13.5
2024-01-03,Station_C,76,49,74,5.2
2024-01-04,Station_A,73,46,70,8.8
2024-01-04,Station_B,66,39,63,12.9
2024-01-04,Station_C,79,53,76,4.5`
      }
    ]
  },
  {
    id: "2",
    name: "Urban Traffic Patterns",
    origin: "admin",
    uploadDate: "2024-02-20",
    status: "pending",
    verifiedDate: "2024-02-20",
    description: "Traffic flow data from major metropolitan areas. Contains vehicle counts, speed measurements, and congestion indicators.",
    format: "JSON",
    size: "1.5 MB",
    tags: ["traffic", "urban", "transportation"],
    downloadUrl: "#",
    files: [
      {
        id: "traffic-flow",
        name: "traffic_flow.json",
        type: "file",
        size: "1.5 MB",
        mimeType: "application/json",
        content: `{
  "metadata": {
    "dataset_name": "Urban Traffic Patterns",
    "collection_date": "2024-02-20",
    "version": "1.0",
    "description": "Traffic flow data from major metropolitan areas"
  },
  "locations": [
    {
      "id": "NYC_001",
      "name": "Manhattan Bridge",
      "coordinates": {
        "latitude": 40.7061,
        "longitude": -73.9969
      },
      "traffic_data": [
        {
          "timestamp": "2024-02-20T08:00:00Z",
          "vehicle_count": 1247,
          "average_speed": 28.5,
          "congestion_level": "moderate",
          "incidents": 0
        },
        {
          "timestamp": "2024-02-20T09:00:00Z",
          "vehicle_count": 1892,
          "average_speed": 22.1,
          "congestion_level": "high",
          "incidents": 1
        },
        {
          "timestamp": "2024-02-20T10:00:00Z",
          "vehicle_count": 1654,
          "average_speed": 25.8,
          "congestion_level": "moderate",
          "incidents": 0
        }
      ]
    },
    {
      "id": "LA_001",
      "name": "Hollywood Freeway",
      "coordinates": {
        "latitude": 34.1016,
        "longitude": -118.3267
      },
      "traffic_data": [
        {
          "timestamp": "2024-02-20T08:00:00Z",
          "vehicle_count": 2156,
          "average_speed": 35.2,
          "congestion_level": "low",
          "incidents": 0
        },
        {
          "timestamp": "2024-02-20T09:00:00Z",
          "vehicle_count": 2987,
          "average_speed": 18.9,
          "congestion_level": "high",
          "incidents": 2
        },
        {
          "timestamp": "2024-02-20T10:00:00Z",
          "vehicle_count": 2678,
          "average_speed": 24.3,
          "congestion_level": "moderate",
          "incidents": 1
        }
      ]
    }
  ],
  "summary": {
    "total_locations": 2,
    "total_records": 6,
    "average_vehicle_count": 1935.67,
    "average_speed": 25.98,
    "most_congested_hour": "09:00",
    "total_incidents": 4
  }
}`
      }
    ]
  },
  {
    id: "3",
    name: "Cat Photography Collection",
    origin: "admin",
    uploadDate: "2024-03-10",
    status: "pending",
    verifiedDate: "2024-03-10",
    description: "A curated collection of high-quality cat photographs from various breeds and settings. Perfect for machine learning training or artistic reference.",
    format: "JPEG",
    size: "50.0 MB",
    tags: ["photography", "cats", "images", "animals"],
    downloadUrl: "#",
    files: [
      {
        id: "images",
        name: "images",
        type: "directory",
        children: [
          {
            id: "cat1",
            name: "cat1.jpg",
            type: "file",
            size: "2.0 MB",
            mimeType: "image/jpeg",
            imageUrl: "/api/files/cat1.jpg"
          },
          {
            id: "cat2",
            name: "cat2.jpg",
            type: "file",
            size: "1.8 MB",
            mimeType: "image/jpeg",
            imageUrl: "/api/files/cat2.jpg"
          },
          {
            id: "cat3",
            name: "cat3.jpg",
            type: "file",
            size: "2.1 MB",
            mimeType: "image/jpeg",
            imageUrl: "/api/files/cat3.jpg"
          },
          {
            id: "cat4",
            name: "cat4.jpg",
            type: "file",
            size: "1.9 MB",
            mimeType: "image/jpeg",
            imageUrl: "/api/files/cat4.jpg"
          },
          {
            id: "cat5",
            name: "cat5.jpg",
            type: "file",
            size: "2.1 MB",
            mimeType: "image/jpeg",
            imageUrl: "/api/files/cat5.jpg"
          }
        ]
      },
      {
        id: "metadata",
        name: "metadata.json",
        type: "file",
        size: "1.0 KB",
        mimeType: "application/json",
        content: `{
  "collection_info": {
    "name": "Cat Photography Collection",
    "description": "High-quality cat photographs for ML training",
    "total_images": 5,
    "total_size_mb": 9.9,
    "date_created": "2024-03-10"
  },
  "images": [
    {
      "filename": "cat1.jpg",
      "breed": "Persian",
      "age": "3 years",
      "setting": "indoor",
      "tags": ["fluffy", "white", "portrait"]
    },
    {
      "filename": "cat2.jpg",
      "breed": "Siamese",
      "age": "2 years",
      "setting": "outdoor",
      "tags": ["elegant", "brown", "action"]
    },
    {
      "filename": "cat3.jpg",
      "breed": "Maine Coon",
      "age": "4 years",
      "setting": "indoor",
      "tags": ["large", "orange", "sleeping"]
    },
    {
      "filename": "cat4.jpg",
      "breed": "British Shorthair",
      "age": "1 year",
      "setting": "outdoor",
      "tags": ["gray", "playful", "garden"]
    },
    {
      "filename": "cat5.jpg",
      "breed": "Ragdoll",
      "age": "2 years",
      "setting": "indoor",
      "tags": ["blue", "relaxed", "window"]
    }
  ],
  "statistics": {
    "breeds": ["Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll"],
    "settings": ["indoor", "outdoor"],
    "average_age": 2.4,
    "most_common_breed": "Mixed"
  }
}`
      }
    ]
  },
  {
    id: "4",
    name: "Financial Market Analysis",
    origin: "admin",
    uploadDate: "2024-01-30",
    status: "pending",
    verifiedDate: "2024-01-30",
    description: "Historical stock market data with technical indicators and trading signals. Includes price movements, volume analysis, and market sentiment metrics.",
    format: "CSV",
    size: "4.0 MB",
    tags: ["finance", "trading", "stocks", "analysis"],
    downloadUrl: "#",
    files: [
      {
        id: "market-data",
        name: "market_data.csv",
        type: "file",
        size: "4.0 MB",
        mimeType: "text/csv",
        content: `Date,Symbol,Open,High,Low,Close,Volume,Market_Cap,PE_Ratio,Dividend_Yield
2024-01-01,AAPL,185.50,187.20,184.30,186.80,45678900,2.95T,28.5,0.52
2024-01-01,GOOGL,142.30,144.10,141.80,143.90,23456700,1.82T,25.2,0.00
2024-01-01,MSFT,375.20,378.50,374.10,377.40,18923400,2.81T,32.1,0.78
2024-01-02,AAPL,186.80,188.90,185.60,187.50,52345600,2.96T,28.7,0.52
2024-01-02,GOOGL,143.90,145.70,143.20,144.80,25678900,1.83T,25.4,0.00
2024-01-02,MSFT,377.40,380.20,376.80,379.60,20123400,2.82T,32.3,0.78
2024-01-03,AAPL,187.50,189.30,186.20,188.70,48912300,2.97T,28.9,0.52
2024-01-03,GOOGL,144.80,146.40,144.10,145.90,26789000,1.84T,25.6,0.00
2024-01-03,MSFT,379.60,382.10,378.90,381.30,21567800,2.83T,32.5,0.78
2024-01-04,AAPL,188.70,190.50,187.80,189.40,51234500,2.98T,29.1,0.52
2024-01-04,GOOGL,145.90,147.20,145.30,146.60,27890100,1.85T,25.8,0.00
2024-01-04,MSFT,381.30,383.80,380.50,382.70,22987600,2.84T,32.7,0.78`
      }
    ]
  },
  {
    id: "5",
    name: "Medical Imaging Dataset",
    origin: "admin",
    uploadDate: "2024-02-15",
    status: "pending",
    verifiedDate: "2024-02-15",
    description: "Collection of medical scans including X-rays, CT scans, and MRI images. Anonymized patient data for research purposes.",
    format: "DICOM",
    size: "100.0 MB",
    tags: ["medical", "imaging", "healthcare", "research"],
    downloadUrl: "#",
    files: [
      {
        id: "xray-scans",
        name: "xray_scans",
        type: "directory",
        children: [
          {
            id: "scan001",
            name: "scan001.dcm",
            type: "file",
            size: "2.0 MB",
            mimeType: "application/dicom"
          },
          {
            id: "scan002",
            name: "scan002.dcm",
            type: "file",
            size: "2.0 MB",
            mimeType: "application/dicom"
          }
        ]
      },
      {
        id: "ct-scans",
        name: "ct_scans",
        type: "directory",
        children: [
          {
            id: "ct001",
            name: "ct001.dcm",
            type: "file",
            size: "4.0 MB",
            mimeType: "application/dicom"
          }
        ]
      },
      {
        id: "patient-data",
        name: "patient_data.json",
        type: "file",
        size: "2.0 KB",
        mimeType: "application/json",
        content: `{
  "dataset_info": {
    "name": "Medical Imaging Dataset",
    "description": "Anonymized medical scans for research",
    "total_scans": 3,
    "total_size_mb": 8.0,
    "date_created": "2024-02-15"
  },
  "scans": [
    {
      "id": "scan001",
      "type": "xray",
      "body_part": "chest",
      "patient_age": 45,
      "diagnosis": "normal",
      "anonymized_id": "P001"
    },
    {
      "id": "scan002",
      "type": "xray",
      "body_part": "chest",
      "patient_age": 62,
      "diagnosis": "pneumonia",
      "anonymized_id": "P002"
    },
    {
      "id": "ct001",
      "type": "ct",
      "body_part": "head",
      "patient_age": 38,
      "diagnosis": "normal",
      "anonymized_id": "P003"
    }
  ],
  "statistics": {
    "scan_types": ["xray", "ct"],
    "body_parts": ["chest", "head"],
    "average_age": 48.3,
    "diagnoses": ["normal", "pneumonia"]
  }
}`
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
      status: apiDataset.status || 'pending', // Use actual status from database
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
      content: file.content, // Include content field for file previews
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
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }

    // Format filter
    if (filters.format && filters.format.length > 0) {
      if (!filters.format.includes(dataset.format)) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        dataset.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Date range filter (simplified for now)
    if (filters.dateRange && filters.dateRange !== 'all') {
      // TODO: Implement date range filtering
      // For now, just pass through
    }

    // Size range filter (simplified for now)
    if (filters.sizeRange && filters.sizeRange !== 'all') {
      // TODO: Implement size range filtering
      // For now, just pass through
    }

    return true;
  });
};

// Mock API functions
const mockApi = {
  async getDatasets(searchQuery: string = '', filters: SearchFilters = { format: [], tags: [], dateRange: 'all', sizeRange: 'all' }, page: number = 1, limit: number = 10): Promise<PaginatedDatasets> {
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
  },

  async approveDataset(id: string): Promise<Dataset | null> {
    await delay(400);
    const index = mockDatasets.findIndex(dataset => dataset.id === id);
    if (index === -1) return null;
    
    const currentDate = new Date().toISOString().split('T')[0];
    mockDatasets[index] = { 
      ...mockDatasets[index], 
      status: 'approved' as const,
      verifiedDate: currentDate
    };
    return mockDatasets[index];
  },

  async rejectDataset(id: string): Promise<Dataset | null> {
    await delay(400);
    const index = mockDatasets.findIndex(dataset => dataset.id === id);
    if (index === -1) return null;
    
    mockDatasets[index] = { 
      ...mockDatasets[index], 
      status: 'rejected' as const
    };
    return mockDatasets[index];
  }
};

// Real API functions
const realApi = {
  async getDatasets(searchQuery: string = '', filters: SearchFilters = { format: [], tags: [], dateRange: 'all', sizeRange: 'all' }, page: number = 1, limit: number = 10, token?: string): Promise<PaginatedDatasets> {
    console.log('🚀 getDatasets called with:', { searchQuery, filters, page, limit, hasToken: !!token });
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.format && filters.format.length > 0) params.append('format', filters.format.join(','));
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${API_BASE_URL}/datasets?${params}`;
      console.log('🌐 Fetching from URL:', url);

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Adding Authorization header');
      }

      const response = await fetch(url, { headers });
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

  async getDataset(id: string, token?: string): Promise<Dataset | null> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, { headers });
    
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

  async createDataset(dataset: Omit<Dataset, 'id'>, token?: string): Promise<Dataset> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'POST',
      headers,
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

  async updateDataset(id: string, updates: Partial<Dataset>, token?: string): Promise<Dataset | null> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: 'PUT',
      headers,
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

  async deleteDataset(id: string, token?: string): Promise<boolean> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: 'DELETE',
      headers,
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
  },

  async approveDataset(id: string, token?: string): Promise<Dataset | null> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/datasets/${id}/approve`, {
      method: 'PUT',
      headers,
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: ApiResponse<Dataset> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to approve dataset');
    }

    return transformDataset(result.data);
  },

  async rejectDataset(id: string, token?: string): Promise<Dataset | null> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/datasets/${id}/reject`, {
      method: 'PUT',
      headers,
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: ApiResponse<Dataset> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to reject dataset');
    }

    return transformDataset(result.data);
  }
};

// Main API client that switches between real and mock
export const apiClient = {
  async getDatasets(searchQuery: string = '', filters: SearchFilters = { format: [], tags: [], dateRange: 'all', sizeRange: 'all' }, page: number = 1, limit: number = 10, token?: string): Promise<PaginatedDatasets> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.getDatasets(searchQuery, filters, page, limit);
      } else {
        return await realApi.getDatasets(searchQuery, filters, page, limit, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.getDatasets(searchQuery, filters, page, limit);
    }
  },

  async getDataset(id: string, token?: string): Promise<Dataset | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.getDataset(id);
      } else {
        return await realApi.getDataset(id, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.getDataset(id);
    }
  },

  async createDataset(dataset: Omit<Dataset, 'id'>, token?: string): Promise<Dataset> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.createDataset(dataset);
      } else {
        return await realApi.createDataset(dataset, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.createDataset(dataset);
    }
  },

  async updateDataset(id: string, updates: Partial<Dataset>, token?: string): Promise<Dataset | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.updateDataset(id, updates);
      } else {
        return await realApi.updateDataset(id, updates, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.updateDataset(id, updates);
    }
  },

  async deleteDataset(id: string, token?: string): Promise<boolean> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.deleteDataset(id);
      } else {
        return await realApi.deleteDataset(id, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.deleteDataset(id);
    }
  },

  async approveDataset(id: string, token?: string): Promise<Dataset | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.approveDataset(id);
      } else {
        return await realApi.approveDataset(id, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.approveDataset(id);
    }
  },

  async rejectDataset(id: string, token?: string): Promise<Dataset | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockApi.rejectDataset(id);
      } else {
        return await realApi.rejectDataset(id, token);
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock data:', error);
      return await mockApi.rejectDataset(id);
    }
  }
};

// Export for debugging
export const isUsingMockData = () => USE_MOCK_DATA;
export const getApiBaseUrl = () => API_BASE_URL; 