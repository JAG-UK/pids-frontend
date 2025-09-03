#!/bin/bash

# Production script for PIDS Frontend
# This script starts the production version of the frontend

echo "🚀 Starting PIDS Frontend in PRODUCTION mode..."
echo "📝 This will enable:"
echo "   - Optimized production build"
echo "   - Better performance"
echo "   - Smaller bundle size"
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

# Start the production frontend
echo "🔧 Starting production frontend..."
docker-compose up -d pids-frontend

# Wait for the service to be ready
echo "⏳ Waiting for production server to start..."
sleep 5

# Check if the service is running
if docker-compose ps pids-frontend | grep -q "Up"; then
    echo ""
    echo "✅ Production frontend is running!"
    echo "🌐 Access the application at: http://localhost:8080"
    echo "📊 To view logs: docker-compose logs -f pids-frontend"
    echo "🛑 To stop: docker-compose stop pids-frontend"
    echo "🔄 To restart: docker-compose restart pids-frontend"
else
    echo "❌ Failed to start production frontend"
    echo "📋 Check logs with: docker-compose logs pids-frontend"
    exit 1
fi
