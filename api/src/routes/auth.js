import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/auth/me - Get current user
router.get('/me', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          name: req.user.name,
          roles: req.user.roles
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/keycloak-config - Get Keycloak configuration for frontend
router.get('/keycloak-config', async (req, res) => {
  try {
    // Use external URL if provided, otherwise use internal URL
    // In production, KEYCLOAK_EXTERNAL_URL should be set to the public-facing URL
    const keycloakUrl = process.env.KEYCLOAK_EXTERNAL_URL || process.env.KEYCLOAK_URL || 'http://localhost:8080';
    
    // For local development, convert internal Docker URL to external
    let externalUrl = keycloakUrl;
    if (process.env.NODE_ENV !== 'production' && keycloakUrl.includes('keycloak:8080')) {
      externalUrl = keycloakUrl.replace('http://keycloak:8080', 'http://localhost:8081');
    }
    
    const config = {
      url: externalUrl,
      realm: process.env.KEYCLOAK_REALM || 'pids',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'pids-frontend'
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 