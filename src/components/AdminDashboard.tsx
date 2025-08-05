import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { DatasetCard } from './DatasetCard';
import { AdminDashboardProps } from './types';

export function AdminDashboard({ 
  datasets, 
  pendingDatasets, 
  onApproveDataset, 
  onRejectDataset, 
  onRemoveDataset 
}: AdminDashboardProps) {
  const approvedDatasets = datasets.filter(d => d.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-chart-5">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-chart-5">{pendingDatasets.length}</div>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-4">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-chart-4">{approvedDatasets.length}</div>
            <p className="text-sm text-muted-foreground">Verified Datasets</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-chart-1">{datasets.length}</div>
            <p className="text-sm text-muted-foreground">Total Datasets</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-chart-2">
              {datasets.reduce((acc, d) => acc + parseFloat(d.size), 0).toFixed(1)} GB
            </div>
            <p className="text-sm text-muted-foreground">Total Storage</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="relative">
            Recent Uploads
            {pendingDatasets.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingDatasets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">All Datasets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2>Pending Approval</h2>
            <p className="text-sm text-muted-foreground">
              {pendingDatasets.length} dataset{pendingDatasets.length !== 1 ? 's' : ''} waiting for review
            </p>
          </div>
          
          {pendingDatasets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending datasets to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  isAdmin
                  onApprove={onApproveDataset}
                  onReject={onRejectDataset}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2>Manage Datasets</h2>
            <p className="text-sm text-muted-foreground">
              {approvedDatasets.length} verified dataset{approvedDatasets.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid gap-4">
            {approvedDatasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isAdmin
                onRemove={onRemoveDataset}
                onDownloadCache={() => console.log('Download to cache:', dataset.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}