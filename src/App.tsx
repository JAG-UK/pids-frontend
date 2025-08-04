import React, { useState, useMemo } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { AdminDashboard } from '@components/AdminDashboard';
import { PublicDirectory } from '@components/PublicDirectory';
import { ExploreDataset } from '@components/ExploreDataset';
import { Dataset, ViewMode } from '@components/types';

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
    format: 'CSV',
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
    format: 'JSON',
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
    format: 'Excel',
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
    format: 'CSV',
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
    format: 'PDF',
    tags: ['energy', 'consumption', 'sustainability'],
    downloadUrl: '#'
  }
];

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>(mockDatasets);
  const [viewMode, setViewMode] = useState<ViewMode>('directory');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const approvedDatasets = useMemo(() => 
    datasets.filter(d => d.status === 'approved'), 
    [datasets]
  );

  const pendingDatasets = useMemo(() => 
    datasets.filter(d => d.status === 'pending'), 
    [datasets]
  );

  const handleApproveDataset = (id: string) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    setDatasets(prev => prev.map(d => 
      d.id === id ? { 
        ...d, 
        status: 'approved' as const, 
        verifiedDate: currentDate 
      } : d
    ));
  };

  const handleRejectDataset = (id: string) => {
    setDatasets(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'rejected' as const } : d
    ));
  };

  const handleRemoveDataset = (id: string) => {
    setDatasets(prev => prev.filter(d => d.id !== id));
  };

  const handleExploreDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setViewMode('explore');
  };

  const handleBackToDirectory = () => {
    setViewMode('directory');
    setSelectedDataset(null);
  };

  if (isAdminMode && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-chart-1 hover:bg-chart-1/90 text-white"
                onClick={() => setIsAuthenticated(true)}
              >
                Login
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          {!isAdminMode && (
            <div className="mb-6">
              {/* Hero Header for Public Interface */}
              <div className="text-center py-8 px-4 bg-chart-1/5 rounded-lg mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="bg-chart-1 text-white px-6 py-3 rounded-lg">
                    <span className="text-2xl font-bold tracking-tight">PIDS</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-foreground">
                      Public Interest Dataset Service
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                      Discover, explore, and access verified public datasets from trusted sources
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">
              {isAdminMode ? 'Admin Dashboard' : viewMode === 'explore' ? 'Dataset Explorer' : 'Dataset Directory'}
            </h2>
            <div className="flex items-center gap-4">
              {!isAdminMode && viewMode === 'directory' && (
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{approvedDatasets.length} datasets available</span>
                  <span>{datasets.reduce((acc, d) => acc + parseFloat(d.size), 0).toFixed(1)} GB total</span>
                </div>
              )}
              <Button
                variant={isAdminMode ? "default" : "outline"}
                className={isAdminMode ? "bg-chart-1 hover:bg-chart-1/90 text-white" : ""}
                onClick={() => {
                  if (isAdminMode) {
                    setIsAdminMode(false);
                    setIsAuthenticated(false);
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
      </header>

      <main className="container mx-auto p-4">
        {isAdminMode ? (
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
