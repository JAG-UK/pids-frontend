import { ErrorBoundary } from '@components/ErrorBoundary';
import { PerformanceMonitor } from '@components/PerformanceMonitor';
import { AuthProvider } from './contexts/AuthContext';
import { AuthenticatedApp } from './components/AuthenticatedApp';
import { Toaster } from '@components/ui/sonner';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthenticatedApp />
        <PerformanceMonitor />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
