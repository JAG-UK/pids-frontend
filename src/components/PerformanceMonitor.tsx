import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0
  });

  useEffect(() => {
    // Track page load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));

    // Track memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
      }));
    }

    // Track network requests
    let requestCount = 0;
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      requestCount++;
      setMetrics(prev => ({ ...prev, networkRequests: requestCount }));
      return originalFetch.apply(this, args);
    };

    // Track errors
    const originalError = console.error;
    let errorCount = 0;
    console.error = function(...args) {
      errorCount++;
      setMetrics(prev => ({ ...prev, errors: errorCount }));
      originalError.apply(console, args);
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      console.error = originalError;
    };
  }, []);

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV !== 'development' && !process.env.REACT_APP_SHOW_PERFORMANCE) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg z-50">
      <div className="text-xs space-y-1">
        <div className="font-medium text-muted-foreground">Performance</div>
        <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
        <div>Requests: {metrics.networkRequests}</div>
        <div>Errors: {metrics.errors}</div>
      </div>
    </div>
  );
} 