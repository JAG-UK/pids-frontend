interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Utility function for retry logic
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
}

// Mock API functions for development
export const mockApi = {
  async getDatasets(): Promise<ApiResponse<any[]>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: [
        {
          id: '1',
          name: 'Climate Data 2024',
          origin: 'NOAA Weather Service',
          uploadDate: '2024-01-15',
          status: 'approved',
          verifiedDate: '2024-01-16',
          description: 'Comprehensive climate data including temperature, precipitation, and wind patterns for 2024.',
          size: '2.3 GB',
          format: 'CSV',
          tags: ['climate', 'weather', 'temperature'],
          downloadUrl: '#',
        },
        // Add more mock datasets as needed
      ],
      status: 200,
    };
  },

  async approveDataset(id: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: { id, status: 'approved' },
      status: 200,
    };
  },

  async rejectDataset(id: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: { id, status: 'rejected' },
      status: 200,
    };
  },
}; 