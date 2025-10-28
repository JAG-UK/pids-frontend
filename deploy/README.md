# Deployment Scripts

This directory contains scripts for deploying the PIDS application to Kubernetes.

## Prerequisites

1. **kubectl** installed and configured
2. **Digital Ocean CLI (doctl)** installed (for DOKS)
3. **Docker** installed (for building images)
4. Access to Digital Ocean Container Registry

## Quick Start

### 1. Create DOKS Cluster

```bash
# Install doctl if not already installed
# macOS: brew install doctl
# Linux: snap install doctl
# Windows: Download from https://github.com/digitalocean/doctl/releases

# Authenticate with Digital Ocean
doctl auth init

# Create Kubernetes cluster
doctl kubernetes cluster create pids-production \
  --region nyc1 \
  --version 1.28.2-do.0 \
  --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=3;auto-scale=true;min-nodes=3;max-nodes=6"

# Configure kubectl
doctl kubernetes cluster kubeconfig save pids-production
```

### 2. Setup Secrets

```bash
# Run the secrets setup script
cd deploy
./setup-secrets.sh

# This will generate and apply all required secrets
# IMPORTANT: Save the generated secrets file to a secure location!
```

### 3. Deploy Application

```bash
# Deploy to production
./deploy-to-k8s.sh production

# Or deploy to staging
./deploy-to-k8s.sh staging
```

### 4. Access Application

```bash
# Get the load balancer IP
kubectl get svc frontend -n pids-production

# Wait for the EXTERNAL-IP to be assigned (may take 2-3 minutes)
# Then access your application at: http://EXTERNAL-IP
```

## Deployment Options

### Production Deployment

```bash
./deploy-to-k8s.sh production
```

This will:
1. Create namespace `pids-production`
2. Deploy persistent volumes
3. Deploy databases (MongoDB, PostgreSQL)
4. Deploy infrastructure (MinIO, Keycloak)
5. Deploy applications (Frontend, API)
6. Setup automated backups

### Staging Deployment

```bash
./deploy-to-k8s.sh staging
```

Same as production but uses namespace `pids-staging`.

### Skip Confirmation (for CI/CD)

```bash
SKIP_CONFIRMATION=true ./deploy-to-k8s.sh production
```

## Management Commands

### Rollback Deployment

```bash
./deploy-to-k8s.sh rollback
```

This will rollback frontend, API, and Keycloak to their previous versions.

### Health Check

```bash
./deploy-to-k8s.sh health
```

Performs health checks on all services.

### Service Information

```bash
./deploy-to-k8s.sh info
```

Displays information about deployed services.

## Monitoring

### View Logs

```bash
# Frontend logs
kubectl logs -f deployment/frontend -n pids-production

# API logs
kubectl logs -f deployment/pids-api -n pids-production

# Keycloak logs
kubectl logs -f deployment/keycloak -n pids-production

# MongoDB logs
kubectl logs -f statefulset/mongodb -n pids-production
```

### View Pods

```bash
kubectl get pods -n pids-production
```

### View Services

```bash
kubectl get svc -n pids-production
```

### View Persistent Volumes

```bash
kubectl get pvc -n pids-production
```

## Access Admin Consoles

### MinIO Console (Object Storage)

```bash
# Port forward to local machine
kubectl port-forward svc/minio 9001:9001 -n pids-production

# Access at: http://localhost:9001
# Login with credentials from secrets file
```

### Keycloak Admin Console (Authentication)

```bash
# Port forward to local machine
kubectl port-forward svc/keycloak 8080:8080 -n pids-production

# Access at: http://localhost:8080/admin
# Login with username: admin
# Password: from secrets file
```

## Backup and Restore

### Manual Backup

#### MongoDB Backup

```bash
# Create a backup job manually
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-manual -n pids-production

# Check backup job status
kubectl get jobs -n pids-production

# View backup logs
kubectl logs job/mongodb-backup-manual -n pids-production
```

#### PostgreSQL Backup

```bash
# Create a backup job manually
kubectl create job --from=cronjob/postgres-backup postgres-backup-manual -n pids-production

# Check backup job status
kubectl get jobs -n pids-production
```

### Restore from Backup

#### MongoDB Restore

```bash
# Port forward to access MongoDB
kubectl port-forward svc/mongodb 27017:27017 -n pids-production

# In another terminal, restore using mongorestore
mongorestore --host localhost:27017 --db pids /path/to/backup/
```

#### PostgreSQL Restore

```bash
# Port forward to access PostgreSQL
kubectl port-forward svc/keycloak-db 5432:5432 -n pids-production

# In another terminal, restore using pg_restore
PGPASSWORD=<password> pg_restore -h localhost -U keycloak -d keycloak /path/to/backup.dump
```

## Scaling

### Scale Applications

```bash
# Scale frontend
kubectl scale deployment frontend --replicas=3 -n pids-production

# Scale API
kubectl scale deployment pids-api --replicas=3 -n pids-production

# Scale Keycloak
kubectl scale deployment keycloak --replicas=3 -n pids-production
```

### Enable Horizontal Pod Autoscaling (HPA)

```bash
# Install metrics-server if not already installed
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Create HPA for API
kubectl autoscale deployment pids-api \
  --cpu-percent=70 \
  --min=2 --max=10 \
  -n pids-production

# Check HPA status
kubectl get hpa -n pids-production
```

## SSL/TLS Configuration

### Option 1: cert-manager (Recommended)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Update email in k8s/ingress/cert-issuer.yaml
# Then apply
kubectl apply -f k8s/ingress/cert-issuer.yaml

# Update domain in k8s/ingress/ingress.yaml
# Then apply
kubectl apply -f k8s/ingress/ingress.yaml
```

### Option 2: Manual SSL Certificate

```bash
# Create secret with your SSL certificate
kubectl create secret tls pids-tls-cert \
  --cert=/path/to/tls.crt \
  --key=/path/to/tls.key \
  -n pids-production
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n pids-production

# Describe pod to see events
kubectl describe pod <pod-name> -n pids-production

# Check logs
kubectl logs <pod-name> -n pids-production
```

### PVC Not Binding

```bash
# Check PVC status
kubectl get pvc -n pids-production

# Describe PVC
kubectl describe pvc <pvc-name> -n pids-production

# Check storage class
kubectl get storageclass
```

### Service Not Accessible

```bash
# Check service
kubectl get svc -n pids-production

# Check endpoints
kubectl get endpoints -n pids-production

# Test connectivity from within cluster
kubectl run curl --image=curlimages/curl -it --rm --restart=Never -- \
  curl http://pids-api:3000/health
```

### Database Connection Issues

```bash
# Check if database pods are running
kubectl get pods -l app=mongodb -n pids-production
kubectl get pods -l app=postgres -n pids-production

# Check database logs
kubectl logs -f statefulset/mongodb -n pids-production
kubectl logs -f statefulset/postgres -n pids-production

# Test database connectivity
kubectl run mongodb-client --image=mongo:7 -it --rm --restart=Never -- \
  mongosh --host mongodb.pids-production.svc.cluster.local
```

## Cleanup

### Delete Application (Keep Data)

```bash
# Delete application deployments
kubectl delete -f k8s/applications/ -n pids-production
kubectl delete -f k8s/infrastructure/ -n pids-production

# PVCs and data are preserved
```

### Delete Everything (Including Data)

```bash
# WARNING: This will delete all data!
kubectl delete namespace pids-production

# Or delete specific resources
kubectl delete -f k8s/ -n pids-production
```

## Cost Optimization

### Reduce Node Count

```bash
# Scale down node pool (outside business hours)
doctl kubernetes cluster node-pool update pids-production worker-pool \
  --count 1
```

### Use Spot Instances (Not Available on DOKS)

For AWS EKS, you can use spot instances to reduce costs.

### Right-Size Resources

Monitor resource usage and adjust requests/limits:

```bash
# Check resource usage
kubectl top pods -n pids-production
kubectl top nodes

# Update deployment with new resource requests/limits
kubectl edit deployment <deployment-name> -n pids-production
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/docker-image.yml`) automatically:
1. Builds Docker images
2. Pushes to Digital Ocean Container Registry
3. Updates Kubernetes deployments

To manually trigger deployment after image push:

```bash
# Update image tags in deployments
kubectl set image deployment/frontend frontend=registry.digitalocean.com/fidl-containers/pids-app:frontend-main -n pids-production
kubectl set image deployment/pids-api pids-api=registry.digitalocean.com/fidl-containers/pids-app:backend-main -n pids-production

# Check rollout status
kubectl rollout status deployment/frontend -n pids-production
kubectl rollout status deployment/pids-api -n pids-production
```

## Additional Resources

- [Digital Ocean Kubernetes Documentation](https://docs.digitalocean.com/products/kubernetes/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm Documentation](https://helm.sh/docs/)

