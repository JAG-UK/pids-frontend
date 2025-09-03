#!/bin/bash

# Production script for PIDS Frontend
# This script starts the production version of the frontend with all services

echo "🚀 Starting PIDS Frontend in PRODUCTION mode..."
echo "📝 This will enable:"
echo "   - Optimized production build"
echo "   - Better performance"
echo "   - Smaller bundle size"
echo "   - Complete service stack (Frontend, API, MongoDB, MinIO, Keycloak)"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed or not in PATH"
    exit 1
fi

# Stop the development frontend if it's running
echo "🛑 Stopping development frontend..."
docker-compose stop pids-frontend-dev 2>/dev/null || true

# Rebuild latest
echo "🚧 Building production frontend..."
docker-compose build --no-cache pids-frontend

# Start all production services
echo "🔧 Starting production services..."
echo "   - Frontend (Production)"
echo "   - API"
echo "   - MongoDB"
echo "   - MinIO"
echo "   - Keycloak"
echo "   - Keycloak Database"
docker-compose up -d pids-frontend pids-api mongodb minio keycloak keycloak-db

# Wait for the services to be ready
echo "⏳ Waiting for production services to start..."
sleep 10

# Check if the services are running
if docker-compose ps pids-frontend pids-api mongodb minio keycloak keycloak-db | grep -q "Up"; then
    echo ""
    echo "✅ Production services are running!"
    echo "🌐 Access the application at: http://localhost:8080"
    echo "🔐 Keycloak Admin Console: http://localhost:8081/admin/"
    echo "📊 MinIO Console: http://localhost:9001"
    echo ""
    echo "📊 To view logs:"
    echo "   - Frontend: docker-compose logs -f pids-frontend"
    echo "   - API: docker-compose logs -f pids-api"
    echo "   - Keycloak: docker-compose logs -f keycloak"
    echo ""
    echo "🛑 To stop all: docker-compose stop"
    echo "🔄 To restart all: docker-compose restart"
else
    echo "❌ Failed to start production services"
    echo "📋 Check logs with: docker-compose logs"
    exit 1
fi
