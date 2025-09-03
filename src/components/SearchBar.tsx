import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Checkbox } from '@components/ui/checkbox';
import { Label } from '@components/ui/label';
import { useDebounce } from '../hooks/useDebounce';
import { apiClient } from '../utils/apiClient';

interface SearchFilters {
  tags: string[];
  dateRange: 'all' | 'week' | 'month' | 'year';
  sizeRange: 'all' | 'small' | 'medium' | 'large';
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  onFiltersChange, 
  placeholder = "Search datasets...",
  className 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    tags: [],
    dateRange: 'all',
    sizeRange: 'all'
  });
  const [availableTags, setAvailableTags] = useState<{ tag: string; count: number }[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch available tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
        const tags = await apiClient.getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        // Fallback to empty array
        setAvailableTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Trigger search when debounced query changes
  React.useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  // Trigger filters change when filters change
  React.useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      tags: [],
      dateRange: 'all',
      sizeRange: 'all'
    });
  }, []);

  const hasActiveFilters = filters.tags.length > 0 || 
                         filters.dateRange !== 'all' || 
                         filters.sizeRange !== 'all';

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            className={hasActiveFilters ? "bg-chart-1 hover:bg-chart-1/90 text-white" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              {isLoadingTags ? (
                <div className="text-sm text-muted-foreground">Loading tags...</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {availableTags.map((tagData) => (
                    <Badge
                      key={tagData.tag}
                      variant={filters.tags.includes(tagData.tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tagData.tag)}
                    >
                      {tagData.tag} ({tagData.count})
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Date</Label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="all">All time</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
              </select>
            </div>

            {/* Size Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">File Size</Label>
              <select
                value={filters.sizeRange}
                onChange={(e) => handleFilterChange('sizeRange', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="all">All sizes</option>
                <option value="small">Small (&lt; 100MB)</option>
                <option value="medium">Medium (100MB - 1GB)</option>
                <option value="large">Large (&gt; 1GB)</option>
              </select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 