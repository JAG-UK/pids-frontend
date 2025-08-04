import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { DatasetCard } from './DatasetCard';
import { PublicDirectoryProps } from './types';
import { Search, Grid, List } from 'lucide-react';

export function PublicDirectory({ datasets, onExploreDataset }: PublicDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const filteredDatasets = useMemo(() => {
    return datasets.filter(dataset => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFormat = formatFilter === 'all' || dataset.format.toLowerCase() === formatFilter.toLowerCase();
      
      return matchesSearch && matchesFormat;
    });
  }, [datasets, searchTerm, formatFilter]);

  const availableFormats = useMemo(() => {
    const formats = [...new Set(datasets.map(d => d.format))];
    return formats.sort();
  }, [datasets]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets, origins, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {availableFormats.map(format => (
                <SelectItem key={format} value={format.toLowerCase()}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'cards' ? "bg-chart-1 hover:bg-chart-1/90 text-white" : ""}
            onClick={() => setViewMode('cards')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'list' ? "bg-chart-1 hover:bg-chart-1/90 text-white" : ""}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredDatasets.length} of {datasets.length} dataset{filteredDatasets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Dataset Grid/List */}
      {filteredDatasets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No datasets found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'cards' 
            ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        }>
          {filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              isAdmin={false}
              onExplore={onExploreDataset}
            />
          ))}
        </div>
      )}
    </div>
  );
}