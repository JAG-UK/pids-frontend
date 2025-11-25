#!/bin/bash

# Development script for Frontend
# This script starts the development version of the frontend with hot reloading and all services

echo "🚀 Starting TOADS Dataset Directory Frontend in DEVELOPMENT mode..."
echo "📝 This will enable:"
echo "   - Hot reloading"
echo "   - Source maps for debugging"
echo "   - Browser console debugging"
echo "   - Breakpoint support"
echo "   - Complete service stack (Frontend, API, MongoDB, MinIO, Keycloak)"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed or not in PATH"
    exit 1
fi

# Stop the production frontend if it's running
echo "🛑 Stopping production frontend..."
docker-compose stop pids-frontend 2>/dev/null || true

# Rebuild latest
echo "🚧 Building development frontend..."
docker-compose build --no-cache pids-frontend-dev

# Start all development services
echo "🔧 Starting development services..."
echo "   - Frontend (Development)"
echo "   - API"
echo "   - MongoDB"
echo "   - MinIO"
echo "   - Keycloak"
echo "   - Keycloak Database"
echo "🔧 Setting environment variables:"
echo "   - VITE_USE_MOCK_DATA=false"
echo "   - VITE_API_URL=http://localhost:3000/api"
docker-compose up -d pids-frontend-dev pids-api mongodb minio keycloak keycloak-db

# Wait for the services to be ready
echo "⏳ Waiting for development services to start..."
sleep 10

# Check if the services are running
if docker-compose ps pids-frontend-dev pids-api mongodb minio keycloak keycloak-db | grep -q "Up"; then
    echo ""
    echo "✅ Development services are running!"
    echo "🌐 Access the application at: http://localhost:5173"
    echo "🔐 Keycloak Admin Console: http://localhost:8081/admin/"
    echo "📊 MinIO Console: http://localhost:9001"
    echo ""
    echo "🔍 You can now:"
    echo "   - Set breakpoints in browser dev tools"
    echo "   - Use console.log() for debugging"
    echo "   - See source maps for TypeScript files"
    echo "   - Hot reload changes automatically"
    echo ""
    echo "📊 To view logs:"
    echo "   - Frontend: docker-compose logs -f pids-frontend-dev"
    echo "   - API: docker-compose logs -f pids-api"
    echo "   - Keycloak: docker-compose logs -f keycloak"
    echo ""
    echo "🛑 To stop all: docker-compose stop"
    echo "🔄 To restart all: docker-compose restart"
else
    echo "❌ Failed to start development services"
    echo "📋 Check logs with: docker-compose logs"
    exit 1
fi
