import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import Keycloak from 'keycloak-js';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  roles: string[];
}

interface AuthContextType {
  keycloak: Keycloak | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug counters
  const renderCount = React.useRef(0);
  const effectCount = React.useRef(0);
  const isInitializing = React.useRef(false);
  renderCount.current += 1;
  console.log(`🔄 AuthProvider render #${renderCount.current}`);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializing.current) {
      console.log('🚫 AuthProvider useEffect already running, skipping...');
      return;
    }
    
    effectCount.current += 1;
    console.log(`🚀 AuthProvider useEffect #${effectCount.current}`);
    isInitializing.current = true;
    
    const initKeycloak = async () => {
      try {
        console.log('Initializing Keycloak...');
        
        // Get API base URL from environment
        const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
        console.log('Using API base URL for Keycloak config:', API_BASE_URL);
        
        // Get Keycloak configuration from API
        const response = await fetch(`${API_BASE_URL}/auth/keycloak-config`);
        const config = await response.json();
        
        if (!config.success) {
          console.error('Failed to get Keycloak config:', config.error);
          setIsLoading(false);
          return;
        }

        console.log('Keycloak config received:', config.data);

        // Convert internal Docker URL to external URL for browser access
        const keycloakUrl = config.data.url.replace('http://keycloak:8080', 'http://localhost:8081');
        console.log('Using Keycloak URL:', keycloakUrl);
        
        const kc = new Keycloak({
          url: keycloakUrl,
          realm: config.data.realm,
          clientId: config.data.clientId,
        });

        // Define logout function inside useEffect to avoid circular dependency
        const handleLogout = () => {
          if (kc) {
            kc.logout();
          }
        };

        kc.onTokenExpired = () => {
          console.log('Token expired, refreshing...');
          kc.updateToken(30).catch(() => {
            console.error('Failed to refresh token');
            handleLogout();
          });
        };

        console.log('Initializing Keycloak client...');
        const authenticated = await kc.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        });

        console.log('Keycloak initialized, authenticated:', authenticated);
        setKeycloak(kc);
        setIsAuthenticated(authenticated);
        console.log('Keycloak state updated:', { keycloak: !!kc, authenticated });

        if (authenticated) {
          console.log('User is authenticated, getting user info...');
          // Get user info from API
          try {
            const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${kc.token}`,
              },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.success) {
                console.log('User info received:', userData.data.user);
                setUser(userData.data.user);
              }
            }
          } catch (error) {
            console.error('Failed to get user info:', error);
          }
        }

        setIsLoading(false);
        isInitializing.current = false;
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initKeycloak();
  }, []);

  const login = useCallback(() => {
    console.log('Login button clicked');
    console.log('Keycloak state:', { keycloak: !!keycloak, isLoading, isAuthenticated });
    
    if (keycloak && !isLoading) {
      console.log('Redirecting to Keycloak login...');
      keycloak.login().catch((error) => {
        console.error('Login failed:', error);
      });
    } else {
      console.error('Keycloak not initialized or still loading', { keycloak: !!keycloak, isLoading });
    }
  }, [keycloak, isLoading, isAuthenticated]);
  
  // Debug: Track when login function is recreated
  const loginRef = React.useRef(login);
  if (loginRef.current !== login) {
    console.log('🔄 Login function recreated!', { keycloak: !!keycloak, isLoading, isAuthenticated });
    loginRef.current = login;
  }

  const logout = useCallback(() => {
    console.log('Keycloak state:', { keycloak: !!keycloak });
    if (keycloak) {
      keycloak.logout();
    }
  }, [keycloak]);

  const hasRole = useCallback((role: string): boolean => {
    return user?.roles.includes(role) || false;
  }, [user]);

  const value: AuthContextType = useMemo(() => ({
    keycloak,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
  }), [keycloak, user, isAuthenticated, isLoading, login, logout, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 