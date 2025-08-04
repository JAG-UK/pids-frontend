#!/bin/bash

# Digital Ocean deployment script for PIDS application
# Usage: ./deploy.sh [version]

set -e

# Configuration
REGISTRY="registry.digitalocean.com"
REPOSITORY="your-registry/pids-app"
VERSION=${1:-latest}

echo "🚀 Starting deployment for PIDS application..."
echo "📦 Version: $VERSION"
echo "🏗️  Building Docker image..."

# Build the Docker image
docker build -t $REPOSITORY:$VERSION .

echo "✅ Build completed successfully!"
echo "🏷️  Tagging image..."

# Tag the image
docker tag $REPOSITORY:$VERSION $REPOSITORY:latest

echo "📤 Pushing to Digital Ocean Container Registry..."

# Push to Digital Ocean Container Registry
docker push $REPOSITORY:$VERSION
docker push $REPOSITORY:latest

echo "✅ Image pushed successfully!"
echo ""
echo "🎯 Next steps for Digital Ocean deployment:"
echo "1. Create a Digital Ocean Container Registry if you haven't already:"
echo "   doctl registry create your-registry"
echo ""
echo "2. Configure your Digital Ocean Kubernetes cluster:"
echo "   doctl kubernetes cluster kubeconfig save your-cluster"
echo ""
echo "3. Create a deployment YAML file (see k8s-deployment.yaml)"
echo ""
echo "4. Deploy to Kubernetes:"
echo "   kubectl apply -f k8s-deployment.yaml"
echo ""
echo "📋 Image details:"
echo "   Registry: $REGISTRY"
echo "   Repository: $REPOSITORY"
echo "   Version: $VERSION" 