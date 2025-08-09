import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DatasetCardProps } from './types';
import { Download, Info, Check, X, Trash2, HardDrive, Calendar, Building2, FolderOpen, ExternalLink } from 'lucide-react';

export function DatasetCard({ 
  dataset, 
  isAdmin = false, 
  onApprove, 
  onReject, 
  onRemove, 
  onDownloadCache,
  onExplore 
}: DatasetCardProps) {
  const [showMetadata, setShowMetadata] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStatusBadge = () => {
    if (dataset.status === 'approved' && dataset.verifiedDate) {
      return (
        <Badge variant="default" className="text-xs bg-chart-4 hover:bg-chart-4/90 text-white">
          Verified {formatDate(dataset.verifiedDate)}
        </Badge>
      );
    } else if (dataset.status === 'pending') {
      return (
        <Badge variant="secondary" className="text-xs">
          Pending
        </Badge>
      );
    } else if (dataset.status === 'rejected') {
      return (
        <Badge variant="destructive" className="text-xs">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        {dataset.status}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-chart-1/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{dataset.name}</CardTitle>
          {renderStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-chart-1" />
            <span>{dataset.origin}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-chart-2" />
            <span>{formatDate(dataset.uploadDate)}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {dataset.description}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{dataset.size}</span>
            <Badge variant="outline" className="border-chart-5/30 text-chart-5">{dataset.format}</Badge>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {dataset.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20">
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20">
                +{dataset.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          {isAdmin ? (
            <div className="flex flex-wrap gap-2">
              {dataset.status === 'pending' && onApprove && onReject && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onApprove(dataset.id)}
                    className="flex-1 bg-chart-4 hover:bg-chart-4/90 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(dataset.id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              
              {dataset.status === 'approved' && (
                <>
                  {onDownloadCache && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadCache(dataset.id)}
                      className="flex-1 border-chart-2 text-chart-2 hover:bg-chart-2 hover:text-white"
                    >
                      <HardDrive className="h-4 w-4 mr-1" />
                      Cache
                    </Button>
                  )}
                  {onRemove && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove(dataset.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Dialog open={showMetadata} onOpenChange={setShowMetadata}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1 border-chart-1 text-chart-1 hover:bg-chart-1 hover:text-white">
                    <Info className="h-4 w-4 mr-1" />
                    Metadata
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{dataset.name}</DialogTitle>
                    <DialogDescription>{dataset.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Origin</label>
                        <p className="text-sm text-muted-foreground">{dataset.origin}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Upload Date</label>
                        <p className="text-sm text-muted-foreground">{formatDate(dataset.uploadDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Size</label>
                        <p className="text-sm text-muted-foreground">{dataset.size}</p>
                      </div>
                      {dataset.status === 'approved' && dataset.verifiedDate && (
                        <div>
                          <label className="text-sm font-medium">Verified Date</label>
                          <p className="text-sm text-muted-foreground">{formatDate(dataset.verifiedDate)}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dataset.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    {dataset.pieces && dataset.pieces.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Pieces</label>
                        <div className="mt-2 space-y-1">
                          {dataset.pieces.map((piece, index) => (
                            <div key={index} className="bg-muted/50 rounded p-2">
                              <a 
                                href={`https://filecoin.tools/search?q=${piece.piece_cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                              >
                                {piece.piece_cid}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {dataset.files && onExplore && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 border-chart-2 text-chart-2 hover:bg-chart-2 hover:text-white"
                  onClick={() => onExplore(dataset)}
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Explore
                </Button>
              )}
              
              <Button size="sm" className="flex-1 bg-chart-1 hover:bg-chart-1/90 text-white">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}