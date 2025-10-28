#!/bin/bash

# PIDS Kubernetes Deployment Script
# This script deploys the PIDS application to a Kubernetes cluster

set -e  # Exit on any error

# Configuration
NAMESPACE="${NAMESPACE:-pids-production}"
ENVIRONMENT="${1:-production}"
SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    # Check kubectl context
    CURRENT_CONTEXT=$(kubectl config current-context)
    log "Current kubectl context: $CURRENT_CONTEXT"
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Confirm deployment
confirm_deployment() {
    if [ "$SKIP_CONFIRMATION" = "true" ]; then
        return 0
    fi
    
    info "You are about to deploy to: $ENVIRONMENT"
    info "Namespace: $NAMESPACE"
    info "Cluster: $(kubectl config current-context)"
    echo ""
    read -p "Do you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        warn "Deployment cancelled by user"
        exit 0
    fi
}

# Create namespace if it doesn't exist
create_namespace() {
    log "Checking namespace..."
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        info "Namespace $NAMESPACE already exists"
    else
        log "Creating namespace $NAMESPACE..."
        kubectl apply -f k8s/namespace/namespace.yaml
    fi
}

# Check secrets
check_secrets() {
    log "Checking secrets..."
    
    REQUIRED_SECRETS=("postgres-secret" "minio-secret" "keycloak-secret")
    MISSING_SECRETS=()
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if ! kubectl get secret "$secret" -n "$NAMESPACE" &> /dev/null; then
            MISSING_SECRETS+=("$secret")
        fi
    done
    
    if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
        error "Missing required secrets: ${MISSING_SECRETS[*]}"
        echo ""
        echo "Please create secrets before deployment:"
        echo "1. Copy k8s/secrets-template.yaml to k8s/secrets.yaml"
        echo "2. Fill in actual secret values"
        echo "3. Run: kubectl apply -f k8s/secrets.yaml"
        echo ""
        exit 1
    fi
    
    log "All required secrets exist"
}

# Deploy storage (PVCs)
deploy_storage() {
    log "Deploying persistent volumes..."
    kubectl apply -f k8s/storage/
    
    # Wait for PVCs to be bound
    info "Waiting for PVCs to be bound..."
    kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/mongodb-pvc -n "$NAMESPACE" --timeout=120s || warn "MongoDB PVC not bound yet"
    kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/postgres-pvc -n "$NAMESPACE" --timeout=120s || warn "Postgres PVC not bound yet"
    kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/minio-pvc -n "$NAMESPACE" --timeout=120s || warn "MinIO PVC not bound yet"
}

# Deploy databases
deploy_databases() {
    log "Deploying databases..."
    kubectl apply -f k8s/databases/
    
    # Wait for databases to be ready
    info "Waiting for databases to be ready (this may take a few minutes)..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s
    
    log "Databases are ready"
}

# Deploy infrastructure
deploy_infrastructure() {
    log "Deploying infrastructure services..."
    kubectl apply -f k8s/infrastructure/
    
    # Wait for infrastructure to be ready
    info "Waiting for infrastructure services to be ready..."
    kubectl wait --for=condition=ready pod -l app=minio -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=keycloak -n "$NAMESPACE" --timeout=300s
    
    log "Infrastructure services are ready"
}

# Deploy applications
deploy_applications() {
    log "Deploying application services..."
    kubectl apply -f k8s/applications/
    
    # Wait for applications to be ready
    info "Waiting for application services to be ready..."
    kubectl wait --for=condition=ready pod -l app=pids-api -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=frontend -n "$NAMESPACE" --timeout=300s
    
    log "Application services are ready"
}

# Deploy backups (optional)
deploy_backups() {
    log "Deploying backup jobs..."
    kubectl apply -f k8s/backups/ || warn "Backup jobs deployment failed (non-critical)"
}

# Get service information
get_service_info() {
    log "Deployment complete!"
    echo ""
    echo "=========================================="
    echo "Service Information"
    echo "=========================================="
    echo ""
    
    # Get frontend load balancer IP
    FRONTEND_IP=$(kubectl get svc frontend -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    echo "Frontend URL: http://$FRONTEND_IP"
    if [ "$FRONTEND_IP" = "pending" ]; then
        warn "Load balancer IP is still pending. Run 'kubectl get svc frontend -n $NAMESPACE' to check status."
    fi
    
    echo ""
    echo "Internal Services:"
    echo "  - API: pids-api.$NAMESPACE.svc.cluster.local:3000"
    echo "  - MongoDB: mongodb.$NAMESPACE.svc.cluster.local:27017"
    echo "  - PostgreSQL: keycloak-db.$NAMESPACE.svc.cluster.local:5432"
    echo "  - MinIO: minio.$NAMESPACE.svc.cluster.local:9000"
    echo "  - Keycloak: keycloak.$NAMESPACE.svc.cluster.local:8080"
    
    echo ""
    echo "To view logs:"
    echo "  kubectl logs -f deployment/frontend -n $NAMESPACE"
    echo "  kubectl logs -f deployment/pids-api -n $NAMESPACE"
    echo "  kubectl logs -f deployment/keycloak -n $NAMESPACE"
    
    echo ""
    echo "To view all pods:"
    echo "  kubectl get pods -n $NAMESPACE"
    
    echo ""
    echo "To access MinIO console (port-forward):"
    echo "  kubectl port-forward svc/minio 9001:9001 -n $NAMESPACE"
    
    echo ""
    echo "To access Keycloak admin (port-forward):"
    echo "  kubectl port-forward svc/keycloak 8080:8080 -n $NAMESPACE"
    
    echo ""
    echo "=========================================="
}

# Rollback function
rollback() {
    warn "Rolling back deployment..."
    
    kubectl rollout undo deployment/frontend -n "$NAMESPACE"
    kubectl rollout undo deployment/pids-api -n "$NAMESPACE"
    kubectl rollout undo deployment/keycloak -n "$NAMESPACE"
    
    log "Rollback initiated. Checking status..."
    kubectl rollout status deployment/frontend -n "$NAMESPACE" --timeout=300s
    kubectl rollout status deployment/pids-api -n "$NAMESPACE" --timeout=300s
    kubectl rollout status deployment/keycloak -n "$NAMESPACE" --timeout=300s
    
    log "Rollback completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check if all pods are running
    PODS_NOT_RUNNING=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers 2>/dev/null | wc -l)
    
    if [ "$PODS_NOT_RUNNING" -gt 0 ]; then
        warn "Some pods are not running:"
        kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running
        return 1
    fi
    
    log "All pods are running"
    
    # Check if frontend is accessible
    FRONTEND_IP=$(kubectl get svc frontend -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    if [ -n "$FRONTEND_IP" ] && [ "$FRONTEND_IP" != "pending" ]; then
        if curl -f -s -o /dev/null "http://$FRONTEND_IP/health"; then
            log "Frontend health check passed"
        else
            warn "Frontend health check failed"
            return 1
        fi
    else
        info "Frontend load balancer IP not yet assigned, skipping health check"
    fi
    
    log "Health check passed"
}

# Main deployment function
main() {
    log "Starting PIDS Kubernetes deployment..."
    log "Environment: $ENVIRONMENT"
    
    check_prerequisites
    confirm_deployment
    
    create_namespace
    check_secrets
    
    deploy_storage
    deploy_databases
    deploy_infrastructure
    deploy_applications
    deploy_backups
    
    # Wait a bit for everything to stabilize
    info "Waiting for services to stabilize..."
    sleep 10
    
    health_check || warn "Health check failed, but continuing..."
    
    get_service_info
}

# Handle script arguments
case "${1:-deploy}" in
    "production"|"prod")
        NAMESPACE="pids-production"
        main
        ;;
    "staging")
        NAMESPACE="pids-staging"
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "info")
        get_service_info
        ;;
    *)
        echo "Usage: $0 {production|staging|rollback|health|info}"
        echo ""
        echo "  production - Deploy to production environment (default)"
        echo "  staging    - Deploy to staging environment"
        echo "  rollback   - Rollback to previous version"
        echo "  health     - Perform health check"
        echo "  info       - Display service information"
        echo ""
        echo "Environment variables:"
        echo "  SKIP_CONFIRMATION=true - Skip deployment confirmation"
        echo ""
        exit 1
        ;;
esac

