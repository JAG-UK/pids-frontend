#!/usr/bin/env node

/**
 * Keycloak Initialization Script
 * 
 * This script initializes Keycloak with the required realm and client configuration.
 * It can be run as a standalone script or called from the API server on startup.
 * 
 * Usage:
 *   node src/scripts/initKeycloak.js
 * 
 * Environment Variables:
 *   KEYCLOAK_URL - Internal Keycloak URL (e.g., http://keycloak:8080)
 *   KEYCLOAK_ADMIN - Admin username (default: admin)
 *   KEYCLOAK_ADMIN_PASSWORD - Admin password
 *   KEYCLOAK_REALM - Realm name (default: pids)
 *   KEYCLOAK_CLIENT_ID - Client ID (default: pids-frontend)
 *   KEYCLOAK_EXTERNAL_URL - External URL for redirects (optional, auto-detected)
 */

// Use built-in fetch (Node 18+)
// Note: If using Node < 18, you'll need to install node-fetch and import it

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost';
const KEYCLOAK_ADMIN = process.env.KEYCLOAK_ADMIN || 'admin';
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'pids';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'pids-frontend';
const KEYCLOAK_EXTERNAL_URL = process.env.KEYCLOAK_EXTERNAL_URL || KEYCLOAK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || (KEYCLOAK_EXTERNAL_URL ? KEYCLOAK_EXTERNAL_URL.replace(/\/auth\./, '') : 'http://localhost:8080');

// Keycloak operates on 2 ports
// Extract hostname from KEYCLOAK_URL (e.g., http://keycloak:8080 -> http://keycloak)
const baseUrl = KEYCLOAK_URL.replace(/\/$/, '').replace(/:\d+$/, ''); // Remove trailing port
const managementUrl = `${baseUrl}:9000`; // Management/health port
const serviceUrl = `${baseUrl}:8080`;     // Main service port

// Helper function to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Wait for Keycloak to be ready
// First check health endpoint, then try to get an admin token
async function waitForKeycloak(maxRetries = 30, delay = 5000) {
  console.log(`⏳ Waiting for Keycloak to be ready at ${KEYCLOAK_URL}...`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      // First check if Keycloak health endpoint says it's ready
      const healthUrl = `${managementUrl}/health/ready`;
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!healthResponse.ok) {
        console.log(`   ⏳ Health check: HTTP ${healthResponse.status} - Keycloak still starting...`);
        if (i < maxRetries - 1) {
          console.log(`   Attempt ${i + 1}/${maxRetries}... waiting ${delay/1000}s`);
          await sleep(delay);
        }
        continue;
      } else {
        console.log(`   🔗 Health check passed`);
        return true;
      }
    } catch (error) {
      // Distinguish between different error types
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        console.log(`   ⚠️  Request timeout - Keycloak may be starting up`);
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        const serviceName = KEYCLOAK_URL.replace(/^https?:\/\//, '').split(':')[0];
        console.log(`   ❌ DNS failure - Cannot resolve '${serviceName}'`);
        console.log(`   💡 Check: kubectl get svc -n pids-production keycloak`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`   ❌ Connection refused - Service may not be listening on port 8080`);
      } else {
        console.log(`   ⚠️  Request error: ${error.message}`);
      }
    }
    
    if (i < maxRetries - 1) {
      console.log(`   Attempt ${i + 1}/${maxRetries}... waiting ${delay/1000}s`);
      await sleep(delay);
    }
  }
  
  // Final diagnostic information
  console.log('');
  console.log('❌ Keycloak initialization failed after all retries');
  console.log('');
  console.log('🔍 Diagnostic information:');
  console.log(`   KEYCLOAK_URLS: ${managementUrl}, ${serviceUrl}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log('');
  
  throw new Error(`Keycloak did not become ready after ${maxRetries} attempts`);
}

// Get admin token
async function getAdminToken() {
  console.log('🔑 Getting admin token...');
  
  const tokenUrl =`${serviceUrl}/realms/master/protocol/openid-connect/token`;
  const params = new URLSearchParams({
    username: KEYCLOAK_ADMIN,
    password: KEYCLOAK_ADMIN_PASSWORD,
    grant_type: 'password',
    client_id: 'admin-cli'
  });
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get admin token: ${response.status} ${text}`);
    }
    
    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token in response');
    }
    
    console.log('✅ Admin token obtained');
    return data.access_token;
  } catch (error) {
    throw new Error(`Failed to get admin token: ${error.message}`);
  }
}

// Check if realm exists
async function realmExists(adminToken) {
  const realmUrl = `${serviceUrl}/admin/realms/${KEYCLOAK_REALM}`;
  try {
    const response = await fetch(realmUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Create realm
async function createRealm(adminToken) {
  console.log(`🏰 Creating '${KEYCLOAK_REALM}' realm...`);
  
  const realmData = {
    realm: KEYCLOAK_REALM,
    enabled: true,
    displayName: 'PIDS Dataset Explorer',
    displayNameHtml: '<div class="kc-logo-text"><span>PIDS</span></div>'
  };
  
  try {
    const realmUrl = `${serviceUrl}/admin/realms`;
    const response = await fetch(realmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(realmData)
    });
    
    if (response.ok || response.status === 409) {
      // 409 means realm already exists, which is fine
      console.log(`✅ Realm '${KEYCLOAK_REALM}' exists`);
      return true;
    }
    
    const text = await response.text();
    throw new Error(`Failed to create realm: ${response.status} ${text}`);
  } catch (error) {
    throw new Error(`Failed to create realm: ${error.message}`);
  }
}

// Check if client exists
async function clientExists(adminToken) {
  try {
    const clientUrl = `${serviceUrl}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${KEYCLOAK_CLIENT_ID}`;
    const response = await fetch(clientUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const clients = await response.json();
    return clients.length > 0;
  } catch (error) {
    return false;
  }
}

// Create client
async function createClient(adminToken) {
  console.log(`🔧 Creating '${KEYCLOAK_CLIENT_ID}' client...`);
  
  // Determine redirect URIs based on environment
  // Redirect URIs should point to the FRONTEND, not Keycloak
  // In production, use the frontend URL (without auth. prefix)
  const frontendUrl = process.env.FRONTEND_URL || 
    (KEYCLOAK_EXTERNAL_URL ? KEYCLOAK_EXTERNAL_URL.replace(/\auth\.?$/, '') : 'http://localhost:8080');
  
  // Keycloak requires explicit paths - wildcard doesn't always match root
  // So we need both the root path and the wildcard pattern
  const redirectUris = process.env.KEYCLOAK_REDIRECT_URIS 
    ? process.env.KEYCLOAK_REDIRECT_URIS.split(',')
    : [
        'http://localhost:8080',
        'http://localhost:8080/*',
        'http://localhost:5173',
        'http://localhost:5173/*',
        'http://localhost:3000',
        'http://localhost:3000/*',
        frontendUrl,  // Root path (exact match)
        `${frontendUrl}/*`  // Wildcard pattern
      ];
  
  console.log(`   Frontend URL: ${frontendUrl}`);
  console.log(`   Redirect URIs: ${redirectUris.join(', ')}`);
  
  const webOrigins = process.env.KEYCLOAK_WEB_ORIGINS
    ? process.env.KEYCLOAK_WEB_ORIGINS.split(',')
    : [
        'http://localhost:8080',
        'http://localhost:5173',
        'http://localhost:3000',
        frontendUrl
      ];
  
  const clientData = {
    clientId: KEYCLOAK_CLIENT_ID,
    enabled: true,
    publicClient: true,
    standardFlowEnabled: true,
    directAccessGrantsEnabled: true,
    redirectUris: redirectUris,
    webOrigins: webOrigins,
    attributes: {
      'saml.assertion.signature': 'false',
      'saml.force.post.binding': 'false',
      'saml.multivalued.roles': 'false',
      'saml.encrypt': 'false',
      'saml.server.signature': 'false',
      'saml.server.signature.keyinfo.ext': 'false',
      'exclude.session.state.from.auth.response': 'false',
      'saml_force_name_id_format': 'false',
      'saml.client.signature': 'false',
      'tls.client.certificate.bound.access.tokens': 'false',
      'saml.authnstatement': 'false',
      'display.on.consent.screen': 'false',
      'saml.onetimeuse.condition': 'false'
    }
  };
  
  try {
    const clientUrl = `${serviceUrl}/admin/realms/${KEYCLOAK_REALM}/clients`;
    const response = await fetch(clientUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    });
    
    if (response.ok || response.status === 409) {
      console.log(`✅ Client '${KEYCLOAK_CLIENT_ID}' exists`);
      return true;
    }
    
    const text = await response.text();
    throw new Error(`Failed to create client: ${response.status} ${text}`);
  } catch (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }
}

// Create roles
async function createRoles(adminToken) {
  console.log('👥 Creating roles...');
  
  const roles = [
    { name: 'admin', description: 'Administrator role' },
    { name: 'user', description: 'Regular user role' }
  ];
  
  for (const role of roles) {
    try {
      const roleUrl = `${serviceUrl}/admin/realms/${KEYCLOAK_REALM}/roles`;
      const response = await fetch(roleUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(role)
      });
      
      if (response.ok || response.status === 409) {
        console.log(`   ✅ Role '${role.name}' exists`);
      } else {
        const text = await response.text();
        console.warn(`   ⚠️  Failed to create role '${role.name}': ${response.status} ${text}`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to create role '${role.name}': ${error.message}`);
    }
  }
}

// Smart sync: Only update client config if redirect URIs or web origins have changed
async function syncClientConfig(adminToken) {
  console.log(`🔄 Checking client '${KEYCLOAK_CLIENT_ID}' configuration...`);
  
  try {
    let clientUrl = `${serviceUrl}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${KEYCLOAK_CLIENT_ID}`;
    const clientsResponse = await fetch(clientUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!clientsResponse.ok) {
      console.warn('⚠️  Could not fetch client list');
      return;
    }
    
    const clients = await clientsResponse.json();
    if (clients.length === 0) {
      console.warn(`⚠️  Client '${KEYCLOAK_CLIENT_ID}' not found`);
      return;
    }
    
    const clientId = clients[0].id;
    
    // Get the full client configuration
    clientUrl = `${serviceUrl}/admin/realms/${KEYCLOAK_REALM}/clients/${clientId}`;
    const getClientResponse = await fetch(clientUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!getClientResponse.ok) {
      console.warn('⚠️  Could not fetch existing client configuration');
      return;
    }
    
    const existingClient = await getClientResponse.json();
    
    // Calculate desired redirect URIs and web origins
    const frontendUrl = FRONTEND_URL;
    const desiredRedirectUris = process.env.KEYCLOAK_REDIRECT_URIS 
      ? process.env.KEYCLOAK_REDIRECT_URIS.split(',').map(uri => uri.trim())
      : [
          'http://localhost:8080',
          'http://localhost:8080/*',
          'http://localhost:5173',
          'http://localhost:5173/*',
          'http://localhost:3000',
          'http://localhost:3000/*',
          frontendUrl,
          `${frontendUrl}/*`
        ];
    
    const desiredWebOrigins = process.env.KEYCLOAK_WEB_ORIGINS
      ? process.env.KEYCLOAK_WEB_ORIGINS.split(',').map(origin => origin.trim())
      : [
          'http://localhost:8080',
          'http://localhost:5173',
          'http://localhost:3000',
          frontendUrl
        ];
    
    // Normalize arrays for comparison (sort and remove duplicates)
    const normalizeArray = (arr) => [...new Set(arr.map(s => s.trim()).sort())];
    const currentRedirectUris = normalizeArray(existingClient.redirectUris || []);
    const currentWebOrigins = normalizeArray(existingClient.webOrigins || []);
    const normalizedDesiredRedirectUris = normalizeArray(desiredRedirectUris);
    const normalizedDesiredWebOrigins = normalizeArray(desiredWebOrigins);
    
    // Compare arrays
    const redirectUrisChanged = 
      currentRedirectUris.length !== normalizedDesiredRedirectUris.length ||
      !currentRedirectUris.every((uri, i) => uri === normalizedDesiredRedirectUris[i]);
    
    const webOriginsChanged = 
      currentWebOrigins.length !== normalizedDesiredWebOrigins.length ||
      !currentWebOrigins.every((origin, i) => origin === normalizedDesiredWebOrigins[i]);
    
    if (!redirectUrisChanged && !webOriginsChanged) {
      console.log(`✅ Client configuration is up to date (no changes needed)`);
      return;
    }
    
    // Configuration has changed, update it
    console.log(`📝 Client configuration changed, updating...`);
    if (redirectUrisChanged) {
      console.log(`   Redirect URIs: ${currentRedirectUris.join(', ')} → ${normalizedDesiredRedirectUris.join(', ')}`);
    }
    if (webOriginsChanged) {
      console.log(`   Web Origins: ${currentWebOrigins.join(', ')} → ${normalizedDesiredWebOrigins.join(', ')}`);
    }
    
    // Update only the changed fields, keep everything else
    const updatedClient = {
      ...existingClient,
      redirectUris: normalizedDesiredRedirectUris,
      webOrigins: normalizedDesiredWebOrigins
    };
    
    // Update client
    const updateResponse = await fetch(clientUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedClient)
    });
    
    if (updateResponse.ok) {
      console.log(`✅ Client configuration updated successfully`);
    } else {
      const text = await updateResponse.text();
      console.error(`❌ Failed to update client configuration: ${updateResponse.status} ${text}`);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to sync client configuration: ${error.message}`);
  }
}

// Main initialization function
async function initializeKeycloak() {
  try {
    console.log('🔐 Initializing Keycloak...');
    console.log(`   Keycloak Internal URL (for admin API): ${KEYCLOAK_URL}`);
    console.log(`   Keycloak External URL (for redirect URIs): ${KEYCLOAK_EXTERNAL_URL}`);
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`   Realm: ${KEYCLOAK_REALM}`);
    console.log(`   Client ID: ${KEYCLOAK_CLIENT_ID}`);
    
    // Wait for Keycloak to be ready
    await waitForKeycloak();
    
    // Get admin token
    const adminToken = await getAdminToken();
    
    // Check if realm exists, create if not
    const realmAlreadyExists = await realmExists(adminToken);
    if (!realmAlreadyExists) {
      await createRealm(adminToken);
      // Wait a bit for realm to be fully created
      await sleep(2000);
    }
    
    // Check if client exists, create or update it
    const clientAlreadyExists = await clientExists(adminToken);
    if (!clientAlreadyExists) {
      await createClient(adminToken);
    } else {
      // Smart sync: Only update redirect URIs if they've actually changed
      await syncClientConfig(adminToken);
    }
    
    // Create roles
    await createRoles(adminToken);
    
    console.log('');
    console.log('🎉 Keycloak initialization complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Realm: ${KEYCLOAK_REALM}`);
    console.log(`   Client: ${KEYCLOAK_CLIENT_ID}`);
    console.log(`   Keycloak URL: ${KEYCLOAK_URL}`);
    console.log(`   External URL: ${KEYCLOAK_EXTERNAL_URL}`);
    
    return true;
  } catch (error) {
    console.error('❌ Keycloak initialization failed:', error.message);
    throw error;
  }
}

// Export for use in other modules
export default initializeKeycloak;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('initKeycloak.js')) {
  initializeKeycloak()
    .then(() => {
      console.log('✅ Initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

