#!/bin/bash

# PIDS Secrets Setup Script
# This script helps create Kubernetes secrets for the PIDS application

set -e  # Exit on any error

# Configuration
NAMESPACE="${NAMESPACE:-pids-production}"

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

# Generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Check prerequisites
check_prerequisites() {
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v openssl &> /dev/null; then
        error "openssl is not installed"
        exit 1
    fi
}

# Create namespace if it doesn't exist
create_namespace() {
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log "Creating namespace $NAMESPACE..."
        kubectl create namespace "$NAMESPACE"
    fi
}

# Create secrets
create_secrets() {
    log "Creating secrets for $NAMESPACE..."
    echo ""
    
    # PostgreSQL Secret
    info "Creating PostgreSQL secret..."
    POSTGRES_PASSWORD=$(generate_password)
    kubectl create secret generic postgres-secret \
        --from-literal=password="$POSTGRES_PASSWORD" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    log "PostgreSQL password: $POSTGRES_PASSWORD"
    echo ""
    
    # MinIO Secret
    info "Creating MinIO secret..."
    MINIO_USER="admin"
    MINIO_PASSWORD=$(generate_password)
    kubectl create secret generic minio-secret \
        --from-literal=root-user="$MINIO_USER" \
        --from-literal=root-password="$MINIO_PASSWORD" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    log "MinIO user: $MINIO_USER"
    log "MinIO password: $MINIO_PASSWORD"
    echo ""
    
    # Keycloak Secret
    info "Creating Keycloak secret..."
    KEYCLOAK_ADMIN_PASSWORD=$(generate_password)
    KEYCLOAK_CLIENT_SECRET=$(generate_password)
    kubectl create secret generic keycloak-secret \
        --from-literal=admin-password="$KEYCLOAK_ADMIN_PASSWORD" \
        --from-literal=client-secret="$KEYCLOAK_CLIENT_SECRET" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    log "Keycloak admin password: $KEYCLOAK_ADMIN_PASSWORD"
    log "Keycloak client secret: $KEYCLOAK_CLIENT_SECRET"
    echo ""
    
    # Save to file for backup
    SECRETS_FILE="secrets-${NAMESPACE}-$(date +%Y%m%d-%H%M%S).txt"
    cat > "$SECRETS_FILE" <<EOF
# PIDS Secrets for $NAMESPACE
# Generated: $(date)
# KEEP THIS FILE SECURE AND DO NOT COMMIT TO GIT!

PostgreSQL Password: $POSTGRES_PASSWORD
MinIO User: $MINIO_USER
MinIO Password: $MINIO_PASSWORD
Keycloak Admin Password: $KEYCLOAK_ADMIN_PASSWORD
Keycloak Client Secret: $KEYCLOAK_CLIENT_SECRET

# To view secrets in cluster:
kubectl get secret postgres-secret -n $NAMESPACE -o yaml
kubectl get secret minio-secret -n $NAMESPACE -o yaml
kubectl get secret keycloak-secret -n $NAMESPACE -o yaml

# To delete and recreate secrets:
kubectl delete secret postgres-secret minio-secret keycloak-secret -n $NAMESPACE
./deploy/setup-secrets.sh
EOF
    
    log "Secrets saved to: $SECRETS_FILE"
    warn "IMPORTANT: Store this file securely and DO NOT commit to git!"
    echo ""
}

# Verify secrets
verify_secrets() {
    log "Verifying secrets..."
    
    REQUIRED_SECRETS=("postgres-secret" "minio-secret" "keycloak-secret")
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if kubectl get secret "$secret" -n "$NAMESPACE" &> /dev/null; then
            log "✓ $secret exists"
        else
            error "✗ $secret is missing"
            exit 1
        fi
    done
    
    echo ""
    log "All secrets created successfully!"
}

# Main function
main() {
    log "Setting up secrets for PIDS in namespace: $NAMESPACE"
    echo ""
    
    check_prerequisites
    create_namespace
    
    # Check if secrets already exist
    if kubectl get secret postgres-secret -n "$NAMESPACE" &> /dev/null; then
        warn "Secrets already exist in $NAMESPACE"
        echo ""
        read -p "Do you want to recreate them? This will generate new passwords! (yes/no): " -r
        echo
        if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
            info "Keeping existing secrets"
            exit 0
        fi
        log "Deleting existing secrets..."
        kubectl delete secret postgres-secret minio-secret keycloak-secret -n "$NAMESPACE" 2>/dev/null || true
    fi
    
    create_secrets
    verify_secrets
    
    echo ""
    info "Next steps:"
    echo "1. Save the secrets file to a secure location (password manager)"
    echo "2. Update your application configuration if needed"
    echo "3. Deploy the application: ./deploy/deploy-to-k8s.sh"
}

# Run main function
main

