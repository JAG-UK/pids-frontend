#!/bin/bash

# PIDS Local Kubernetes Deployment Script
# Deploys the PIDS application to Docker Desktop Kubernetes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running Docker Desktop Kubernetes
check_context() {
    CURRENT_CONTEXT=$(kubectl config current-context)
    if [[ "$CURRENT_CONTEXT" != "docker-desktop" ]]; then
        warn "Current context is: $CURRENT_CONTEXT"
        warn "Expected: docker-desktop"
        echo ""
        read -p "Continue anyway? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
            error "Cancelled by user"
            exit 0
        fi
    fi
}

# Check if Docker Desktop is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker Desktop is not running"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
    
    if ! kubectl cluster-info > /dev/null 2>&1; then
        error "Kubernetes is not enabled in Docker Desktop"
        echo "Enable it in: Docker Desktop → Settings → Kubernetes → Enable Kubernetes"
        exit 1
    fi
    
    log "Docker Desktop Kubernetes is running"
}

# Build images locally
build_images() {
    log "Building Docker images locally..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error "Not in project root directory"
        exit 1
    fi
    
    # Build frontend
    info "Building frontend..."
    npm ci --silent
    npm run build --silent
    docker build -t pids-app:frontend-local . -q
    log "Frontend image built: pids-app:frontend-local"
    
    # Build backend
    info "Building backend..."
    cd api
    npm ci --silent
    docker build -t pids-app:backend-local . -q
    cd ..
    log "Backend image built: pids-app:backend-local"
    
    # Verify images
    info "Verifying images..."
    docker images | grep pids-app | grep local
}

# Deploy to Kubernetes
deploy_k8s() {
    log "Deploying to local Kubernetes..."
    
    # Apply namespace first
    info "Creating namespace..."
    kubectl apply -f k8s-local/namespace.yaml
    
    # Wait for namespace to be ready
    sleep 2
    
    # Apply secrets and storage
    info "Creating secrets and storage..."
    kubectl apply -f k8s-local/secrets.yaml
    kubectl apply -f k8s-local/storage.yaml
    
    # Apply databases
    info "Deploying databases..."
    kubectl apply -f k8s-local/mongodb.yaml
    kubectl apply -f k8s-local/postgres.yaml
    
    # Apply infrastructure
    info "Deploying infrastructure services..."
    kubectl apply -f k8s-local/minio.yaml
    kubectl apply -f k8s-local/keycloak.yaml
    
    # Apply applications
    info "Deploying applications..."
    kubectl apply -f k8s-local/api.yaml
    kubectl apply -f k8s-local/frontend.yaml
    
    log "Waiting for pods to be ready..."
    sleep 5
    
    # Wait for key services
    kubectl wait --for=condition=ready pod -l app=mongodb -n pids-local --timeout=120s || warn "MongoDB not ready yet"
    kubectl wait --for=condition=ready pod -l app=postgres -n pids-local --timeout=120s || warn "Postgres not ready yet"
    kubectl wait --for=condition=ready pod -l app=minio -n pids-local --timeout=120s || warn "MinIO not ready yet"
    kubectl wait --for=condition=ready pod -l app=keycloak -n pids-local --timeout=120s || warn "Keycloak not ready yet"
    kubectl wait --for=condition=ready pod -l app=pids-api -n pids-local --timeout=120s || warn "API not ready yet"
    kubectl wait --for=condition=ready pod -l app=frontend -n pids-local --timeout=120s || warn "Frontend not ready yet"
}

# Show access information
show_info() {
    log "Deployment complete!"
    echo ""
    echo "=========================================="
    echo "🎉 PIDS is running locally on Kubernetes!"
    echo "=========================================="
    echo ""
    echo "Access your services:"
    echo "  Frontend:      http://localhost:30080"
    echo "  API:           http://localhost:30000"
    echo "  Keycloak:      http://localhost:30081"
    echo "  MinIO Console: http://localhost:30091"
    echo ""
    echo "Credentials (local development):"
    echo "  Keycloak admin:  admin / admin123"
    echo "  MinIO:           minioadmin / minioadmin123"
    echo ""
    echo "Useful commands:"
    echo "  View pods:       kubectl get pods -n pids-local"
    echo "  View services:   kubectl get svc -n pids-local"
    echo "  Frontend logs:   kubectl logs -f deployment/frontend -n pids-local"
    echo "  API logs:        kubectl logs -f deployment/pids-api -n pids-local"
    echo ""
    echo "  Clean up:        kubectl delete namespace pids-local"
    echo ""
    echo "=========================================="
}

# Main function
main() {
    log "Starting PIDS local Kubernetes deployment..."
    
    check_docker
    check_context
    
    info "This will:"
    echo "  1. Build Docker images locally"
    echo "  2. Deploy to local Kubernetes (docker-desktop)"
    echo "  3. Make services available on localhost"
    echo ""
    
    build_images
    deploy_k8s
    show_info
}

# Run main function
main

