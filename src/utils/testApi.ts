import { apiClient, isUsingMockData, getApiBaseUrl } from './apiClient';

// Test the API client
export const testApiClient = async () => {
  console.log('🧪 Testing API Client...');
  console.log('API Base URL:', getApiBaseUrl());
  console.log('Using Mock Data:', isUsingMockData());
  
  try {
    const result = await apiClient.getDatasets();
    console.log('✅ API Client Test Successful');
    console.log('Datasets loaded:', result.datasets.length);
    console.log('Pagination:', result.pagination);
    
    if (result.datasets.length > 0) {
      console.log('First dataset:', result.datasets[0].name);
    }
    
    return true;
  } catch (error) {
    console.error('❌ API Client Test Failed:', error);
    return false;
  }
}; 