import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { AdminDashboard } from '@components/AdminDashboard';
import { PublicDirectory } from '@components/PublicDirectory';
import { ExploreDataset } from '@components/ExploreDataset';
import { Dataset, ViewMode } from '@components/types';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, isUsingMockData } from '../utils/apiClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mock file structures for explore feature
const mockFileStructures = {
  '1': [
    {
      id: 'climate-root',
      name: 'climate_data_2024',
      type: 'directory' as const,
      children: [
        {
          id: 'temperature',
          name: 'temperature',
          type: 'directory' as const,
          children: [
            { id: 'temp-jan', name: 'january_temps.csv', type: 'file' as const, size: '2.4 MB', mimeType: 'text/csv', content: 'date,location,temperature\n2024-01-01,New York,32\n2024-01-01,Los Angeles,65' },
            { id: 'temp-feb', name: 'february_temps.csv', type: 'file' as const, size: '2.6 MB', mimeType: 'text/csv' }
          ]
        },
        {
          id: 'precipitation',
          name: 'precipitation',
          type: 'directory' as const,
          children: [
            { id: 'precip-q1', name: 'q1_rainfall.csv', type: 'file' as const, size: '1.8 MB', mimeType: 'text/csv' }
          ]
        },
        { id: 'readme', name: 'README.md', type: 'file' as const, size: '4 KB', mimeType: 'text/markdown', content: '# Climate Data 2024\n\nThis dataset contains comprehensive climate data including temperature, precipitation, and wind patterns for 2024.\n\n## Data Sources\n- NOAA Weather Stations\n- Satellite Data\n- Ground Observations' }
      ]
    }
  ],
  '2': [
    {
      id: 'census-root',
      name: 'population_census',
      type: 'directory' as const,
      children: [
        { id: 'demographics', name: 'demographics.json', type: 'file' as const, size: '1.2 MB', mimeType: 'application/json', content: '{\n  "total_population": 331449281,\n  "age_groups": {\n    "0-18": 22.3,\n    "19-64": 61.2,\n    "65+": 16.5\n  },\n  "ethnicity": {\n    "white": 57.8,\n    "hispanic": 18.7,\n    "black": 12.1,\n    "asian": 6.0,\n    "other": 5.4\n  }\n}' },
        { id: 'methodology', name: 'methodology.pdf', type: 'file' as const, size: '890 KB', mimeType: 'application/pdf' },
        { id: 'summary', name: 'summary_report.pdf', type: 'file' as const, size: '2.1 MB', mimeType: 'application/pdf' }
      ]
    }
  ],
  '6': [
    {
      id: 'cats-root',
      name: 'cat_photography_collection',
      type: 'directory' as const,
      children: [
        {
          id: 'portraits',
          name: 'portraits',
          type: 'directory' as const,
          children: [
            { id: 'cat1', name: 'persian_cat.jpg', type: 'file' as const, size: '2.8 MB', mimeType: 'image/jpeg', content: 'A beautiful Persian cat with long fluffy fur sitting regally on a velvet cushion. The cat has striking blue eyes and a luxurious white coat with subtle gray markings.', imageUrl: '/images/cats/portraits/persian_cat.jpg' },
            { id: 'cat2', name: 'siamese_cat.jpg', type: 'file' as const, size: '3.1 MB', mimeType: 'image/jpeg', content: 'An elegant Siamese cat with distinctive pointed coloring - cream body with dark brown ears, face, paws, and tail. The cat is perched on a windowsill looking out thoughtfully.', imageUrl: '/images/cats/portraits/siamese_cat.jpg' },
            { id: 'cat3', name: 'orange_tabby.jpg', type: 'file' as const, size: '2.5 MB', mimeType: 'image/jpeg', content: 'A playful orange tabby cat with distinctive striped markings, bright green eyes, and a white belly. The cat is in a playful pose with ears perked up.', imageUrl: '/images/cats/portraits/orange_tabby.jpg' }
          ]
        },
        {
          id: 'action',
          name: 'action_shots',
          type: 'directory' as const,
          children: [
            { id: 'cat4', name: 'jumping_cat.jpg', type: 'file' as const, size: '3.4 MB', mimeType: 'image/jpeg', content: 'A dynamic action shot of a cat mid-leap, captured in perfect focus. The cat appears to be jumping from one surface to another with graceful form.', imageUrl: '/images/cats/action_shots/jumping_cat.jpg' },
            { id: 'cat5', name: 'playing_cat.jpg', type: 'file' as const, size: '2.9 MB', mimeType: 'image/jpeg', content: 'A cat playing with a toy mouse, showing natural hunting instincts. The cat is crouched low with focused attention on the toy.', imageUrl: '/images/cats/action_shots/playing_cat.jpg' }
          ]
        },
        {
          id: 'cute',
          name: 'cute_moments',
          type: 'directory' as const,
          children: [
            { id: 'cat6', name: 'sleeping_kitten.jpg', type: 'file' as const, size: '2.2 MB', mimeType: 'image/jpeg', content: 'An adorable sleeping kitten curled up in a cozy basket. The kitten has soft, fluffy fur and looks completely peaceful and content.', imageUrl: '/images/cats/cute_moments/sleeping_kitten.jpg' },
            { id: 'cat7', name: 'yawning_cat.jpg', type: 'file' as const, size: '2.7 MB', mimeType: 'image/jpeg', content: 'A cat caught mid-yawn, showing its tiny teeth and pink tongue. The expression is both funny and endearing.', imageUrl: '/images/cats/cute_moments/yawning_cat.jpg' }
          ]
        },
        { id: 'metadata', name: 'photo_metadata.json', type: 'file' as const, size: '15 KB', mimeType: 'application/json', content: '{\n  "collection_info": {\n    "title": "Cat Photography Collection",\n    "photographer": "Sarah Johnson",\n    "date_created": "2024-01-15",\n    "total_photos": 7\n  },\n  "categories": {\n    "portraits": 3,\n    "action_shots": 2,\n    "cute_moments": 2\n  },\n  "technical_details": {\n    "camera": "Canon EOS R5",\n    "lens": "70-200mm f/2.8",\n    "resolution": "45MP",\n    "format": "RAW + JPEG"\n  }\n}' },
        { id: 'readme', name: 'README.md', type: 'file' as const, size: '8 KB', mimeType: 'text/markdown', content: '# Cat Photography Collection\n\nA curated collection of high-quality cat photographs showcasing various breeds, poses, and moments.\n\n## Categories\n- **Portraits**: Professional shots of different cat breeds\n- **Action Shots**: Dynamic photos capturing cats in motion\n- **Cute Moments**: Adorable and heartwarming cat moments\n\n## Technical Details\n- Shot with Canon EOS R5\n- 45MP resolution\n- Professional lighting setup\n- Natural and studio environments\n\n## Usage\nThese images are perfect for:\n- Pet photography portfolios\n- Animal welfare campaigns\n- Educational materials\n- Social media content' }
      ]
    }
  ]
};

// Mock data for demonstration
export const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Climate Data 2024',
    origin: 'NOAA Weather Service',
    uploadDate: '2024-01-15',
    status: 'approved',
    verifiedDate: '2024-01-16',
    description: 'Comprehensive climate data including temperature, precipitation, and wind patterns for 2024.',
    size: '2.3 GB',
    tags: ['climate', 'weather', 'temperature'],
    downloadUrl: '#',
    files: mockFileStructures['1']
  },
  {
    id: '2',
    name: 'Population Census Data',
    origin: 'US Census Bureau',
    uploadDate: '2024-01-12',
    status: 'approved',
    verifiedDate: '2024-01-13',
    description: 'Detailed population demographics and statistics from the latest census.',
    size: '1.8 GB',
    tags: ['demographics', 'population', 'census'],
    downloadUrl: '#',
    files: mockFileStructures['2']
  },
  {
    id: '3',
    name: 'Economic Indicators Q4',
    origin: 'Federal Reserve',
    uploadDate: '2024-01-10',
    status: 'pending',
    description: 'Quarterly economic indicators including GDP, unemployment, and inflation data.',
    size: '450 MB',
    tags: ['economics', 'gdp', 'indicators'],
    downloadUrl: '#'
  },
  {
    id: '4',
    name: 'Traffic Flow Analysis',
    origin: 'Department of Transportation',
    uploadDate: '2024-01-08',
    status: 'approved',
    verifiedDate: '2024-01-09',
    description: 'Real-time traffic flow data from major highways and urban centers.',
    size: '3.1 GB',
    tags: ['traffic', 'transportation', 'urban'],
    downloadUrl: '#'
  },
  {
    id: '5',
    name: 'Energy Consumption Report',
    origin: 'Energy Information Administration',
    uploadDate: '2024-01-05',
    status: 'pending',
    description: 'Monthly energy consumption patterns across residential and commercial sectors.',
    size: '890 MB',
    tags: ['energy', 'consumption', 'sustainability'],
    downloadUrl: '#'
  },
  {
    id: '6',
    name: 'Cat Photography Collection',
    origin: 'Sarah Johnson Photography',
    uploadDate: '2024-01-15',
    status: 'approved',
    verifiedDate: '2024-01-16',
    description: 'A curated collection of high-quality cat photographs showcasing various breeds, poses, and moments. Perfect for pet photography portfolios and educational materials.',
    size: '18.7 MB',
    tags: ['photography', 'cats', 'pets', 'images', 'portraits'],
    downloadUrl: '#',
    files: mockFileStructures['6']
  }
];

export function AuthenticatedApp() {
  console.log('🚀 AuthenticatedApp component rendered');
  const { isAuthenticated, isLoading: authLoading, login, logout, user, hasRole, keycloak } = useAuth();
  const [isAdminMode, setIsAdminMode] = useLocalStorage('isAdminMode', false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('directory');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load datasets from API
  const loadDatasets = useCallback(async () => {
    console.log('🔄 AuthenticatedApp: loadDatasets called');
    console.log('🔍 AuthenticatedApp: Auth state:', { isAuthenticated, isAdminMode, hasToken: !!keycloak?.token });
    console.log('🔍 AuthenticatedApp: Token value:', keycloak?.token ? 'present' : 'none');
    setIsLoading(true);
    try {
      // Get token if user is authenticated
      const token = keycloak?.token;
      console.log('📞 AuthenticatedApp: Calling apiClient.getDatasets() with token:', token ? 'present' : 'none');
      const result = await apiClient.getDatasets('', { tags: [], dateRange: 'all', sizeRange: 'all' }, 1, 10, token);
      console.log('📊 AuthenticatedApp: loadDatasets result:', result);
      console.log('📊 AuthenticatedApp: Number of datasets in result:', result.datasets?.length || 0);
      console.log('📊 AuthenticatedApp: Datasets array:', result.datasets);
      
      if (result.datasets && Array.isArray(result.datasets)) {
        console.log('✅ AuthenticatedApp: Setting datasets state with:', result.datasets);
        setDatasets(result.datasets);
      } else {
        console.error('❌ AuthenticatedApp: Invalid datasets format:', result.datasets);
        setDatasets([]);
      }
    } catch (error) {
      console.error('❌ AuthenticatedApp: Failed to load datasets:', error);
      // Fallback to mock data if API fails
      console.log('🔄 AuthenticatedApp: Falling back to mock data');
      setDatasets(mockDatasets);
    } finally {
      console.log('🏁 AuthenticatedApp: loadDatasets completed, setting isLoading to false');
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdminMode]);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  const approvedDatasets = useMemo(() => {
    console.log('🔍 AuthenticatedApp: Filtering approved datasets from:', datasets);
    const approved = datasets.filter(d => d.status === 'approved');
    console.log('✅ AuthenticatedApp: Approved datasets:', approved);
    return approved;
  }, [datasets]);

  const pendingDatasets = useMemo(() => {
    console.log('🔍 AuthenticatedApp: Filtering pending datasets from:', datasets);
    const pending = datasets.filter(d => d.status === 'pending');
    console.log('✅ AuthenticatedApp: Pending datasets:', pending);
    return pending;
  }, [datasets]);

  const handleApproveDataset = async (id: string) => {
    try {
      const token = keycloak?.token;
      console.log('🔄 Approving dataset:', id, 'with token:', token ? 'present' : 'none');
      
      const updatedDataset = await apiClient.approveDataset(id, token);
      if (updatedDataset) {
        setDatasets(prev => prev.map(d => 
          d.id === id ? updatedDataset : d
        ));
        console.log('✅ Dataset approved successfully:', updatedDataset);
      } else {
        console.error('❌ Failed to approve dataset:', id);
      }
    } catch (error) {
      console.error('❌ Error approving dataset:', error);
    }
  };

  const handleRejectDataset = async (id: string) => {
    try {
      const token = keycloak?.token;
      console.log('🔄 Rejecting dataset:', id, 'with token:', token ? 'present' : 'none');
      
      const updatedDataset = await apiClient.rejectDataset(id, token);
      if (updatedDataset) {
        setDatasets(prev => prev.map(d => 
          d.id === id ? updatedDataset : d
        ));
        console.log('✅ Dataset rejected successfully:', updatedDataset);
      } else {
        console.error('❌ Failed to reject dataset:', id);
      }
    } catch (error) {
      console.error('❌ Error rejecting dataset:', error);
    }
  };

  const handleRemoveDataset = async (id: string) => {
    try {
      console.log(`🗑️ Admin delete request for dataset: ${id}`);
      
      // Get the current token for authentication
      const token = keycloak?.token;
      if (!token) {
        console.error('❌ No authentication token available');
        return;
      }
      
      // Call the API to delete the dataset
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || '/api'}/datasets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Dataset deleted successfully:', result);
      
      // Remove from local state only after successful API deletion
      setDatasets(prev => prev.filter(d => d.id !== id));
      
      // Show success notification
      toast.success('Dataset deleted successfully', {
        description: `"${result.message}" - All files and data have been permanently removed.`
      });
      
    } catch (error) {
      console.error('❌ Error deleting dataset:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show error notification
      toast.error('Failed to delete dataset', {
        description: errorMessage
      });
    }
  };

  const handleExploreDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setViewMode('explore');
  };

  const handleBackToDirectory = () => {
    setViewMode('directory');
    setSelectedDataset(null);
  };

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing..." />
      </div>
    );
  }

  // Show login screen for admin mode when not authenticated
  if (isAdminMode && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-4">
              Please log in to access admin features
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-chart-1 hover:bg-chart-1/90 text-white"
                onClick={login}
              >
                Login with Keycloak
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAdminMode(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if user doesn't have admin role
  if (isAdminMode && isAuthenticated && !hasRole('admin')) {
    console.log('User roles:', user?.roles);
    console.log('Has admin role:', hasRole('admin'));
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-4">
              You don't have permission to access admin features.
              <br />
              <span className="text-xs">User roles: {user?.roles?.join(', ') || 'none'}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsAdminMode(false)}
              >
                Go to Public View
              </Button>
              <Button 
                variant="outline"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card relative overflow-hidden">
        {/* Subtle background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{
            backgroundImage: `url('/images/toad.png')`
          }}
        />
        {/* Content overlay */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-4">
          {!isAdminMode && (
            <div className="mb-6">
              {/* Hero Header for Public Interface */}
              <div className="text-center py-8 px-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(247, 245, 254, 0.3)' }}>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="bg-chart-1 text-white px-6 py-3 rounded-lg">
                    <span className="text-2xl font-bold tracking-tight">TOADS</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-foreground">
                      The Open Access Dataset Service
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                      Discover public datasets stored on the Filecoin network
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Home
              </Button>
              <h2 className="text-xl font-medium">
                {isAdminMode ? 'Admin Dashboard' : viewMode === 'explore' ? 'Dataset Explorer' : 'Dataset Directory'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {!isAdminMode && viewMode === 'directory' && (
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{approvedDatasets.length} datasets available</span>
                  <span>{datasets.reduce((acc, d) => acc + parseFloat(d.size), 0).toFixed(1)} GB total</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isUsingMockData() 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isUsingMockData() ? 'Mock Data' : 'Live API'}
                  </span>
                </div>
              )}
              
              {/* User info and auth buttons */}
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <div className="text-sm text-muted-foreground">
                    Welcome, {user?.name || user?.username || 'User'}
                  </div>
                )}
                
                {isAuthenticated ? (
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <Button variant="outline" onClick={login}>
                    Login
                  </Button>
                )}
                
                <Button
                  variant={isAdminMode ? "default" : "outline"}
                  className={isAdminMode ? "bg-chart-1 hover:bg-chart-1/90 text-white" : ""}
                  onClick={() => {
                    if (isAdminMode) {
                      setIsAdminMode(false);
                    } else {
                      setIsAdminMode(true);
                    }
                    setViewMode('directory');
                    setSelectedDataset(null);
                  }}
                >
                  {isAdminMode ? 'Exit Admin' : 'Admin'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading datasets..." />
          </div>
        ) : isAdminMode ? (
          <AdminDashboard
            datasets={datasets}
            pendingDatasets={pendingDatasets}
            onApproveDataset={handleApproveDataset}
            onRejectDataset={handleRejectDataset}
            onRemoveDataset={handleRemoveDataset}
          />
        ) : viewMode === 'explore' && selectedDataset ? (
          <ExploreDataset
            dataset={selectedDataset}
            onBack={handleBackToDirectory}
          />
        ) : (
          <PublicDirectory 
            datasets={approvedDatasets} 
            onExploreDataset={handleExploreDataset}
          />
        )}
      </main>
    </div>
  );
} 