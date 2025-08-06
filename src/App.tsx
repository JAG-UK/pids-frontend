import { ErrorBoundary } from '@components/ErrorBoundary';
import { PerformanceMonitor } from '@components/PerformanceMonitor';
import { AuthProvider } from './contexts/AuthContext';
import { AuthenticatedApp } from './components/AuthenticatedApp';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthenticatedApp />
        <PerformanceMonitor />
      </AuthProvider>
    </ErrorBoundary>
  );
}
