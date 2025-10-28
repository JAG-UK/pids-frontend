#!/bin/bash

# Cleanup script for local Kubernetes deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}This will delete all PIDS resources from local Kubernetes${NC}"
echo -e "${YELLOW}Namespace: pids-local${NC}"
echo ""
read -p "Are you sure? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo -e "${GREEN}Deleting namespace pids-local...${NC}"
kubectl delete namespace pids-local

echo ""
echo -e "${GREEN}✓ Cleanup complete!${NC}"
echo ""
echo "To redeploy: ./deploy/deploy-local.sh"

