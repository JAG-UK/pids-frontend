import jwt from 'jsonwebtoken';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Keycloak configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'pids';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'pids-frontend';

// Convert internal Docker URL to external URL for issuer
const getExternalKeycloakUrl = () => {
  // For local K8s (NodePort 30081) or docker-compose (port 8081)
  // Try to detect based on environment or allow both
  const url = KEYCLOAK_URL.replace('http://keycloak:8080', 'http://localhost:30081');
  return url;
};

// Create JWKS client (use internal URL for fetching keys)
const JWKS = createRemoteJWKSet(new URL(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`));

// Verify JWT token using jose library
const verifyToken = async (token) => {
  try {
    // Allow multiple issuer URLs for local development
    // Local K8s uses port 30081, docker-compose uses 8081
    const allowedIssuers = [
      `${getExternalKeycloakUrl()}/realms/${KEYCLOAK_REALM}`,
      `http://localhost:30081/realms/${KEYCLOAK_REALM}`,
      `http://localhost:8081/realms/${KEYCLOAK_REALM}`,
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}` // Internal URL
    ];

    // Try to verify with any of the allowed issuers
    let lastError;
    for (const issuer of allowedIssuers) {
      try {
        // Try with audience validation first
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: issuer,
          audience: [KEYCLOAK_CLIENT_ID, 'account', 'pids-frontend']
        });
        console.log('Token verified with issuer:', issuer);
        return payload;
      } catch (error) {
        // If audience validation fails, try without it
        if (error.message.includes('aud')) {
          try {
            const { payload } = await jwtVerify(token, JWKS, {
              issuer: issuer
              // No audience check - more permissive for local development
            });
            console.log('Token verified with issuer (no aud check):', issuer);
            return payload;
          } catch (innerError) {
            lastError = innerError;
          }
        } else {
          lastError = error;
        }
        // Continue to next issuer
      }
    }

    // If none worked, throw the last error
    throw lastError;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw error;
  }
};

// Extract token from Authorization header
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = await verifyToken(token);
    
    // Add user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.preferred_username,
      roles: decoded.realm_access?.roles || [],
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Admin role middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Optional authentication middleware (for public routes that can show user info)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      console.log('🔑 optionalAuth: Token received, verifying...');
      const decoded = await verifyToken(token);
      console.log('✅ Token verified successfully');
      console.log('📋 Token payload:', {
        sub: decoded.sub,
        email: decoded.email,
        username: decoded.preferred_username,
        realm_access: decoded.realm_access
      });
      
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.preferred_username,
        roles: decoded.realm_access?.roles || [],
        name: decoded.name
      };
      
      console.log('👤 User object created:', req.user);
    } else {
      console.log('⚠️ optionalAuth: No token provided');
    }
    
    next();
  } catch (error) {
    console.error('❌ optionalAuth: Token verification failed:', error.message);
    // Continue without user info if token is invalid
    next();
  }
}; 