#!/bin/bash

# Frontend Deployment Script

set -e  # Exit on any error

# Configuration
APP_NAME="pids-frontend"
REGISTRY_URL="${REGISTRY_URL:-registry.digitalocean.com/your-registry}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DOMAIN="${DOMAIN:-your-domain.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    log "All dependencies are installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Type checking
    npm run type-check
    
    # Linting
    npm run lint
    
    log "Tests completed successfully"
}

# Build the application
build_app() {
    log "Building application..."
    
    # Install dependencies
    npm ci
    
    # Build the application
    npm run build
    
    log "Build completed successfully"
}

# Build Docker image
build_docker() {
    log "Building Docker image..."
    
    docker build -t ${APP_NAME}:${IMAGE_TAG} .
    
    if [ ! -z "$REGISTRY_URL" ]; then
        docker tag ${APP_NAME}:${IMAGE_TAG} ${REGISTRY_URL}/${APP_NAME}:${IMAGE_TAG}
    fi
    
    log "Docker image built successfully"
}

# Push Docker image
push_docker() {
    if [ -z "$REGISTRY_URL" ]; then
        warn "No registry URL provided, skipping push"
        return
    fi
    
    log "Pushing Docker image to registry..."
    
    docker push ${REGISTRY_URL}/${APP_NAME}:${IMAGE_TAG}
    
    log "Docker image pushed successfully"
}

# Deploy to Kubernetes
deploy_k8s() {
    log "Deploying to Kubernetes..."
    
    # Update the deployment YAML with current image tag
    sed -i.bak "s|image: .*|image: ${REGISTRY_URL}/${APP_NAME}:${IMAGE_TAG}|g" k8s-deployment.yaml
    sed -i.bak "s|your-domain.com|${DOMAIN}|g" k8s-deployment.yaml
    
    # Apply the deployment
    kubectl apply -f k8s-deployment.yaml
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/pids-app --timeout=300s
    
    log "Kubernetes deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait a bit for the deployment to stabilize
    sleep 30
    
    # Check if the application is responding
    if curl -f http://${DOMAIN}/health > /dev/null 2>&1; then
        log "Health check passed"
    else
        error "Health check failed"
        exit 1
    fi
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    kubectl rollout undo deployment/pids-app
    kubectl rollout status deployment/pids-app --timeout=300s
    
    log "Rollback completed"
}

# Main deployment function
main() {
    log "Starting TOADS Dataset Directory frontend deployment..."
    
    # Check dependencies
    check_dependencies
    
    # Run tests
    run_tests
    
    # Build application
    build_app
    
    # Build Docker image
    build_docker
    
    # Push Docker image (if registry is configured)
    push_docker
    
    # Deploy to Kubernetes
    deploy_k8s
    
    # Health check
    health_check
    
    log "Deployment completed successfully!"
    log "Application is available at: https://${DOMAIN}"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "test")
        check_dependencies
        run_tests
        ;;
    "build")
        check_dependencies
        run_tests
        build_app
        build_docker
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|test|build|health}"
        echo "  deploy  - Full deployment (default)"
        echo "  rollback - Rollback to previous version"
        echo "  test    - Run tests only"
        echo "  build   - Build application and Docker image"
        echo "  health  - Perform health check"
        exit 1
        ;;
esac 