import { ErrorBoundary } from '@components/ErrorBoundary';
import { PerformanceMonitor } from '@components/PerformanceMonitor';
import { AuthProvider } from './contexts/AuthContext';
import { AuthenticatedApp } from './components/AuthenticatedApp';
import { Toaster } from '@components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<AuthenticatedApp />} />
            <Route path="/admin" element={<AuthenticatedApp />} />
          </Routes>
          <PerformanceMonitor />
          <Toaster />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
