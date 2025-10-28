# Kubernetes Deployment Manifests

This directory contains all Kubernetes manifests for deploying the PIDS application.

## Directory Structure

```
k8s/
├── namespace/           # Namespace configuration
├── storage/            # Persistent Volume Claims
├── databases/          # Database services (MongoDB, PostgreSQL)
├── infrastructure/     # Infrastructure services (MinIO, Keycloak)
├── applications/       # Application services (Frontend, API)
├── backups/           # Backup CronJobs
├── ingress/           # Ingress and SSL configuration
├── secrets-template.yaml  # Template for creating secrets (DO NOT commit actual secrets!)
└── README.md          # This file
```

## Quick Start

### Prerequisites

1. Kubernetes cluster (DOKS, EKS, or local)
2. `kubectl` installed and configured
3. Access to container registry

### Deployment Steps

1. **Create secrets:**
   ```bash
   cd deploy
   ./setup-secrets.sh
   ```

2. **Deploy application:**
   ```bash
   ./deploy-to-k8s.sh production
   ```

3. **Get access information:**
   ```bash
   ./deploy-to-k8s.sh info
   ```

## Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Create namespace
kubectl apply -f namespace/

# 2. Create secrets (after filling in values)
cp secrets-template.yaml secrets.yaml
# Edit secrets.yaml with actual values
kubectl apply -f secrets.yaml

# 3. Deploy storage
kubectl apply -f storage/

# 4. Deploy databases
kubectl apply -f databases/

# 5. Deploy infrastructure
kubectl apply -f infrastructure/

# 6. Deploy applications
kubectl apply -f applications/

# 7. (Optional) Deploy backups
kubectl apply -f backups/

# 8. (Optional) Configure ingress/SSL
kubectl apply -f ingress/
```

## Service Dependencies

The services must be deployed in order due to dependencies:

```
1. Storage (PVCs)
   ↓
2. Databases (MongoDB, PostgreSQL)
   ↓
3. Infrastructure (MinIO, Keycloak)
   ↓
4. Applications (API, Frontend)
```

## Configuration

### Environment-Specific Configuration

For different environments (dev, staging, production), you can:

1. Use separate namespaces:
   ```bash
   kubectl apply -f . --namespace=pids-staging
   ```

2. Use Kustomize overlays:
   ```bash
   kubectl apply -k overlays/production
   ```

3. Use Helm charts with values files

### Resource Sizing

Default resource requests/limits are set conservatively. Adjust based on your needs:

| Service | Default Request | Default Limit | Notes |
|---------|----------------|---------------|-------|
| Frontend | 128Mi / 100m | 512Mi / 500m | Static files, minimal |
| API | 256Mi / 250m | 1Gi / 1000m | Main workload |
| MongoDB | 512Mi / 250m | 2Gi / 1000m | Increase for large datasets |
| PostgreSQL | 256Mi / 250m | 1Gi / 1000m | Keycloak only |
| MinIO | 512Mi / 250m | 2Gi / 1000m | Object storage |
| Keycloak | 512Mi / 250m | 2Gi / 1000m | Auth service |

### Scaling

**Stateless services** (can be scaled horizontally):
```bash
kubectl scale deployment frontend --replicas=3 -n pids-production
kubectl scale deployment pids-api --replicas=3 -n pids-production
kubectl scale deployment keycloak --replicas=3 -n pids-production
```

**Stateful services** (currently single replica):
- MongoDB, PostgreSQL, MinIO use StatefulSets
- Scaling requires additional configuration (replication, clustering)
- Consider managed services for production scaling

## Secrets Management

### Required Secrets

1. **postgres-secret:**
   - `password`: PostgreSQL password

2. **minio-secret:**
   - `root-user`: MinIO admin username
   - `root-password`: MinIO admin password

3. **keycloak-secret:**
   - `admin-password`: Keycloak admin password
   - `client-secret`: OAuth client secret

### Creating Secrets

Use the automated script:
```bash
cd deploy
./setup-secrets.sh
```

Or create manually:
```bash
kubectl create secret generic postgres-secret \
  --from-literal=password=$(openssl rand -base64 32) \
  -n pids-production

kubectl create secret generic minio-secret \
  --from-literal=root-user=admin \
  --from-literal=root-password=$(openssl rand -base64 32) \
  -n pids-production

kubectl create secret generic keycloak-secret \
  --from-literal=admin-password=$(openssl rand -base64 32) \
  --from-literal=client-secret=$(openssl rand -base64 32) \
  -n pids-production
```

## Storage

### Persistent Volumes

All stateful services use PersistentVolumeClaims:

- **mongodb-pvc**: 5Gi (application data)
- **postgres-pvc**: 1Gi (Keycloak data)
- **minio-pvc**: 20Gi (file storage)

### Storage Classes

- **Digital Ocean**: `do-block-storage` (default)
- **AWS EKS**: `aws-ebs-gp3` (requires EBS CSI driver)
- **Local/Minikube**: `standard`

### Expanding Volumes

```bash
# Edit PVC to increase size
kubectl edit pvc mongodb-pvc -n pids-production

# Change storage size (e.g., 40Gi -> 80Gi)
# The volume will automatically expand
```

## Networking

### Internal Communication

Services communicate using Kubernetes DNS:

- `mongodb.pids-production.svc.cluster.local:27017`
- `keycloak-db.pids-production.svc.cluster.local:5432`
- `minio.pids-production.svc.cluster.local:9000`
- `keycloak.pids-production.svc.cluster.local:8080`
- `pids-api.pids-production.svc.cluster.local:3000`

### External Access

**LoadBalancer Service** (default):
- Frontend service creates a cloud load balancer
- Get external IP: `kubectl get svc frontend -n pids-production`

**Ingress** (optional):
- More advanced routing
- SSL/TLS termination
- Multiple domains
- See `ingress/` directory

## Monitoring

### View Logs

```bash
# Stream logs
kubectl logs -f deployment/frontend -n pids-production
kubectl logs -f deployment/pids-api -n pids-production

# View recent logs
kubectl logs deployment/pids-api --tail=100 -n pids-production

# Logs from all pods in deployment
kubectl logs -l app=pids-api -n pids-production
```

### Check Pod Status

```bash
# List all pods
kubectl get pods -n pids-production

# Describe pod (shows events)
kubectl describe pod <pod-name> -n pids-production

# Get pod resource usage
kubectl top pods -n pids-production
```

### Check Service Status

```bash
# List services
kubectl get svc -n pids-production

# Check endpoints
kubectl get endpoints -n pids-production
```

## Backups

### Automated Backups

Backup CronJobs run daily at 2 AM UTC:

- **mongodb-backup**: Backs up MongoDB data
- **postgres-backup**: Backs up PostgreSQL data

View backup jobs:
```bash
kubectl get cronjobs -n pids-production
kubectl get jobs -n pids-production
```

### Manual Backup

```bash
# Trigger backup manually
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-manual -n pids-production
kubectl create job --from=cronjob/postgres-backup postgres-backup-manual -n pids-production
```

### Restore from Backup

1. Scale down affected service
2. Restore data from backup volume
3. Scale up service

See `deploy/README.md` for detailed restore procedures.

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status and events
kubectl describe pod <pod-name> -n pids-production

# Common issues:
# - Image pull errors: Check registry credentials
# - Insufficient resources: Check node capacity
# - Failed health checks: Check application logs
```

### PVC Not Binding

```bash
# Check PVC status
kubectl get pvc -n pids-production
kubectl describe pvc <pvc-name> -n pids-production

# Common issues:
# - No storage class: Create storage class
# - Insufficient capacity: Check node storage
# - Zone mismatch: Ensure PVC and pod in same zone
```

### Service Not Accessible

```bash
# Check service and endpoints
kubectl get svc,endpoints -n pids-production

# Test from within cluster
kubectl run curl --image=curlimages/curl -it --rm --restart=Never -- \
  curl http://pids-api:3000/health

# Check load balancer (for frontend)
kubectl get svc frontend -n pids-production
```

### Database Connection Issues

```bash
# Test connectivity
kubectl run mongodb-client --image=mongo:7 -it --rm --restart=Never -- \
  mongosh --host mongodb.pids-production.svc.cluster.local

# Check database logs
kubectl logs statefulset/mongodb -n pids-production
kubectl logs statefulset/postgres -n pids-production
```

## Security Considerations

### Network Policies

Consider implementing network policies to restrict pod-to-pod communication:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: pids-production
spec:
  podSelector:
    matchLabels:
      app: pids-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3000
```

### Pod Security

All services run with security best practices:
- Non-root user (where possible)
- Read-only root filesystem (where applicable)
- Resource limits to prevent DoS
- Health checks for automatic recovery

### Secret Rotation

Rotate secrets periodically:
1. Generate new secrets
2. Update Kubernetes secrets
3. Restart affected pods

## Advanced Topics

### Using Kustomize

Structure with Kustomize overlays:
```
k8s/
├── base/              # Base manifests
└── overlays/
    ├── development/   # Dev overrides
    ├── staging/       # Staging overrides
    └── production/    # Production overrides
```

Deploy with Kustomize:
```bash
kubectl apply -k overlays/production
```

### Using Helm

Convert manifests to Helm chart for easier management:
```bash
helm install pids-app ./helm/pids-app \
  --namespace pids-production \
  --values values-production.yaml
```

### GitOps with ArgoCD

For automated deployments:
1. Install ArgoCD
2. Connect to Git repository
3. ArgoCD automatically syncs cluster state

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Digital Ocean Kubernetes](https://docs.digitalocean.com/products/kubernetes/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)

