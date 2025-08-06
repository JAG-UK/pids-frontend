import jwt from 'jsonwebtoken';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Keycloak configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'pids';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'pids-frontend';

// Convert internal Docker URL to external URL for issuer
const getExternalKeycloakUrl = () => {
  return KEYCLOAK_URL.replace('http://keycloak:8080', 'http://localhost:8081');
};

// Create JWKS client (use internal URL for fetching keys)
const JWKS = createRemoteJWKSet(new URL(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`));

// Verify JWT token using jose library
const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${getExternalKeycloakUrl()}/realms/${KEYCLOAK_REALM}`,
      audience: [KEYCLOAK_CLIENT_ID, 'account', 'pids-frontend'] // Allow multiple audiences
    });

    return payload;
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
      const decoded = await verifyToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.preferred_username,
        roles: decoded.realm_access?.roles || [],
        name: decoded.name
      };
    }
    
    next();
  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
}; 