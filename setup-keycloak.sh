#!/bin/bash

# Keycloak Setup Script for PIDS Application
# This script sets up the Keycloak realm and client

set -e

echo "🔐 Setting up Keycloak for PIDS Application..."

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
until curl -s http://localhost:8081/ > /dev/null 2>&1; do
    echo "   Waiting for Keycloak..."
    sleep 5
done

echo "✅ Keycloak is ready!"

# Get admin token
echo "🔑 Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8081/realms/master/protocol/openid-connect/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin" \
    -d "password=admin123" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Admin token obtained"

# Create realm
echo "🏰 Creating 'pids' realm..."
curl -s -X POST http://localhost:8081/admin/realms \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "realm": "pids",
        "enabled": true,
        "displayName": "PIDS Dataset Explorer",
        "displayNameHtml": "<div class=\"kc-logo-text\"><span>PIDS</span></div>"
    }'

echo "✅ Realm created"

# Create client
echo "🔧 Creating 'pids-frontend' client..."
curl -s -X POST http://localhost:8081/admin/realms/pids/clients \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "pids-frontend",
        "enabled": true,
        "publicClient": true,
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true,
        "redirectUris": ["http://localhost:8080/*", "http://localhost:3000/*"],
        "webOrigins": ["http://localhost:8080", "http://localhost:3000"],
        "attributes": {
            "saml.assertion.signature": "false",
            "saml.force.post.binding": "false",
            "saml.multivalued.roles": "false",
            "saml.encrypt": "false",
            "saml.server.signature": "false",
            "saml.server.signature.keyinfo.ext": "false",
            "exclude.session.state.from.auth.response": "false",
            "saml_force_name_id_format": "false",
            "saml.client.signature": "false",
            "tls.client.certificate.bound.access.tokens": "false",
            "saml.authnstatement": "false",
            "display.on.consent.screen": "false",
            "saml.onetimeuse.condition": "false"
        }
    }'

echo "✅ Client created"

# Get client ID for role creation
CLIENT_ID=$(curl -s http://localhost:8081/admin/realms/pids/clients \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId == "pids-frontend") | .id')

echo "📋 Client ID: $CLIENT_ID"

# Create roles
echo "👥 Creating roles..."
curl -s -X POST http://localhost:8081/admin/realms/pids/roles \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "admin", "description": "Administrator role"}'

curl -s -X POST http://localhost:8081/admin/realms/pids/roles \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "user", "description": "Regular user role"}'

echo "✅ Roles created"

# Create admin user
echo "👤 Creating admin user..."
curl -s -X POST http://localhost:8081/admin/realms/pids/users \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "admin",
        "email": "admin@pids.local",
        "firstName": "Admin",
        "lastName": "User",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "admin123",
            "temporary": false
        }]
    }'

# Get user ID
USER_ID=$(curl -s http://localhost:8081/admin/realms/pids/users \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.username == "admin") | .id')

# Get admin role ID
ADMIN_ROLE_ID=$(curl -s http://localhost:8081/admin/realms/pids/roles \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.name == "admin") | .id')

# Assign admin role to user
echo "🔗 Assigning admin role to user..."
curl -s -X POST http://localhost:8081/admin/realms/pids/users/$USER_ID/role-mappings/realm \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "[{\"id\":\"$ADMIN_ROLE_ID\",\"name\":\"admin\"}]"

echo "✅ Admin user created and configured"

echo ""
echo "🎉 Keycloak setup complete!"
echo ""
echo "📋 Summary:"
echo "   Realm: pids"
echo "   Client: pids-frontend"
echo "   Admin User: admin / admin123"
echo "   Keycloak URL: http://localhost:8081"
echo "   Admin Console: http://localhost:8081/admin"
echo ""
echo "🔗 You can now access:"
echo "   - Keycloak Admin Console: http://localhost:8081/admin"
echo "   - PIDS Frontend: http://localhost:8080"
echo "   - PIDS API: http://localhost:3000" 