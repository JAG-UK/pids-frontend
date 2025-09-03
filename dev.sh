#!/bin/bash

# Development script for PIDS Frontend
# This script starts the development version of the frontend with hot reloading

echo "🚀 Starting PIDS Frontend in DEVELOPMENT mode..."
echo "📝 This will enable:"
echo "   - Hot reloading"
echo "   - Source maps for debugging"
echo "   - Browser console debugging"
echo "   - Breakpoint support"
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

# Start the development frontend
echo "🔧 Starting development frontend..."
echo "🔧 Setting environment variables:"
echo "   - VITE_USE_MOCK_DATA=false"
echo "   - VITE_API_URL=http://localhost:3000/api"
docker-compose up -d pids-frontend-dev

# Wait for the service to be ready
echo "⏳ Waiting for development server to start..."
sleep 5

# Check if the service is running
if docker-compose ps pids-frontend-dev | grep -q "Up"; then
    echo ""
    echo "✅ Development frontend is running!"
    echo "🌐 Access the application at: http://localhost:5173"
    echo "🔍 You can now:"
    echo "   - Set breakpoints in browser dev tools"
    echo "   - Use console.log() for debugging"
    echo "   - See source maps for TypeScript files"
    echo "   - Hot reload changes automatically"
    echo ""
    echo "📊 To view logs: docker-compose logs -f pids-frontend-dev"
    echo "🛑 To stop: docker-compose stop pids-frontend-dev"
    echo "🔄 To restart: docker-compose restart pids-frontend-dev"
else
    echo "❌ Failed to start development frontend"
    echo "📋 Check logs with: docker-compose logs pids-frontend-dev"
    exit 1
fi
