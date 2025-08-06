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
    const config = {
      url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
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