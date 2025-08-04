# Docker Configuration for PIDS Application

This document provides instructions for building, testing, and deploying the PIDS (Public Interest Dataset Service) application using Docker.

## 🐳 Local Development

### Prerequisites
- Docker installed on your machine
- Docker Compose (usually comes with Docker Desktop)

### Quick Start

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```
   The application will be available at `http://localhost:8080`

2. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Manual Docker Commands

1. **Build the image:**
   ```bash
   docker build -t pids-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:80 pids-app
   ```

3. **Test the health endpoint:**
   ```bash
   curl http://localhost:8080/health
   ```

## 🚀 Digital Ocean Deployment

### Prerequisites
- Digital Ocean account
- `doctl` CLI tool installed and authenticated
- Digital Ocean Container Registry
- Digital Ocean Kubernetes cluster

### Setup Steps

1. **Create a Digital Ocean Container Registry:**
   ```bash
   doctl registry create your-registry-name
   ```

2. **Configure Docker to use Digital Ocean registry:**
   ```bash
   doctl registry docker-config
   ```

3. **Update the deployment script:**
   Edit `deploy.sh` and replace `your-registry` with your actual registry name.

4. **Build and push the image:**
   ```bash
   ./deploy.sh v1.0.0
   ```

### Kubernetes Deployment

1. **Configure kubectl for your Digital Ocean cluster:**
   ```bash
   doctl kubernetes cluster kubeconfig save your-cluster-name
   ```

2. **Update the Kubernetes deployment:**
   Edit `k8s-deployment.yaml` and replace:
   - `your-registry` with your actual registry name
   - `your-domain.com` with your actual domain

3. **Deploy to Kubernetes:**
   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

4. **Check deployment status:**
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

## 🔧 Configuration Files

### Dockerfile
- Multi-stage build for optimized production image
- Uses Node.js 18 Alpine for building
- Uses Nginx Alpine for serving
- Includes health check endpoint

### nginx.conf
- Optimized for React SPA
- Includes security headers
- Gzip compression enabled
- Static asset caching
- Health check endpoint at `/health`

### docker-compose.yml
- Local development setup
- Port mapping: 8080:80
- Health check configuration
- Restart policy

### k8s-deployment.yaml
- Kubernetes deployment with 2 replicas
- Resource limits and requests
- Liveness and readiness probes
- Service and Ingress configuration
- TLS support with Let's Encrypt

## 📊 Monitoring and Health Checks

The application includes a health check endpoint at `/health` that returns:
- HTTP 200 status
- "healthy" response body
- Used by Docker and Kubernetes for monitoring

## 🔒 Security Features

- Security headers in Nginx configuration
- Content Security Policy
- XSS Protection
- Frame options
- HTTPS/TLS support in Kubernetes

## 📈 Performance Optimizations

- Multi-stage Docker build for smaller images
- Nginx with gzip compression
- Static asset caching (1 year)
- Resource limits in Kubernetes
- Load balancing with multiple replicas

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 8080
   lsof -i :8080
   # Use different port
   docker run -p 8081:80 pids-app
   ```

2. **Build fails:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   # Rebuild
   docker build --no-cache -t pids-app .
   ```

3. **Kubernetes deployment issues:**
   ```bash
   # Check pod logs
   kubectl logs -l app=pids-app
   # Check pod status
   kubectl describe pod -l app=pids-app
   ```

### Useful Commands

```bash
# View running containers
docker ps

# View container logs
docker logs <container-id>

# Execute commands in container
docker exec -it <container-id> sh

# View Kubernetes resources
kubectl get all -l app=pids-app
```

## 📝 Environment Variables

The application can be configured with these environment variables:

- `NODE_ENV`: Set to `production` for optimized builds
- `PORT`: Port for the application (default: 80)

## 🔄 CI/CD Integration

For automated deployments, you can integrate this with:

- GitHub Actions
- GitLab CI
- Jenkins
- Digital Ocean App Platform

Example GitHub Actions workflow would use the `deploy.sh` script in the deployment step. 