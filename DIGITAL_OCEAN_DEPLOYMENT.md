# Digital Ocean App Platform Deployment

This repository is configured for **Digital Ocean App Platform** with a **multi-service architecture**. When you push to `main`, GitHub Actions builds and pushes Docker images, and Digital Ocean automatically deploys the entire stack.

## 🏗️ Architecture

The app consists of **6 services**:

1. **pids-frontend** - React app with nginx (port 80)
2. **pids-api** - Express.js backend (port 3000) 
3. **mongodb** - Database (port 27017)
4. **minio** - Object storage (port 9000)
5. **keycloak** - Authentication (port 8080)
6. **keycloak-db** - PostgreSQL for Keycloak (port 5432)

## 🚀 How It Works

### 1. **GitHub Actions** (`.github/workflows/docker-image.yml`)
When you push to `main`:
- Builds frontend (`npm run build`)
- Builds API Docker image
- Pushes both images to Digital Ocean Container Registry:
  - `registry.digitalocean.com/fidl-containers/pids-frontend:main`
  - `registry.digitalocean.com/fidl-containers/pids-api:main`

### 2. **Digital Ocean App Platform** (`.do/app.yaml`)
Digital Ocean automatically:
- Detects new images with `main` tag
- Deploys all 6 services
- Sets up networking between services
- Handles load balancing and health checks

## 🔧 Configuration

### Service Dependencies
- **Frontend** → **API** (via nginx proxy)
- **API** → **MongoDB**, **MinIO**, **Keycloak**
- **Keycloak** → **PostgreSQL**

### Environment Variables
The API service gets these environment variables:
```yaml
NODE_ENV: production
MONGODB_URI: mongodb://mongodb:27017/pids
MINIO_ENDPOINT: minio:9000
MINIO_ACCESS_KEY: minioadmin
MINIO_SECRET_KEY: minioadmin
KEYCLOAK_URL: http://keycloak:8080
KEYCLOAK_REALM: pids
KEYCLOAK_CLIENT_ID: pids-frontend
```

## 📊 Monitoring

### Health Checks
Each service has health checks:
- **Frontend**: `GET /health`
- **API**: `GET /api/health`
- **MongoDB**: Port 27017
- **MinIO**: Port 9000
- **Keycloak**: Port 8080
- **PostgreSQL**: Port 5432

### Access Points
- **Main App**: `https://your-app.ondigitalocean.app/`
- **MinIO Console**: `https://your-app.ondigitalocean.app:9001/`
- **Keycloak Admin**: `https://your-app.ondigitalocean.app:8080/admin/`

## 🔄 Deployment Process

### Automatic Deployment
1. **Make changes** to your code
2. **Commit and push** to `main`:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **GitHub Actions** builds and pushes images
4. **Digital Ocean** automatically deploys the new images
5. **All services restart** with the new code

### Manual Deployment
If you need to manually trigger a deployment:
1. Go to Digital Ocean App Platform dashboard
2. Select your app
3. Click "Deploy" to force a new deployment

## 🛠️ Local Development

For local development, use the docker-compose setup:
```bash
# Start all services locally
./prod.sh

# Or use the full stack script
./deploy-full-stack.sh deploy
```

## 🚨 Troubleshooting

### Services Not Starting
1. Check Digital Ocean App Platform logs
2. Verify all images are pushed to registry
3. Check environment variables are correct

### API Connection Issues
1. Verify `MONGODB_URI` points to `mongodb:27017`
2. Check `MINIO_ENDPOINT` is `minio:9000`
3. Ensure `KEYCLOAK_URL` is `http://keycloak:8080`

### Frontend Not Loading
1. Check nginx configuration in `nginx.conf`
2. Verify API proxy settings
3. Check frontend build completed successfully

## 📁 Key Files

- `.do/app.yaml` - Digital Ocean App Platform configuration
- `.github/workflows/docker-image.yml` - CI/CD pipeline
- `Dockerfile` - Frontend container
- `api/Dockerfile` - API container
- `nginx.conf` - Nginx configuration with API proxy

## 🎯 Benefits

✅ **Fully Automated** - No manual deployment steps  
✅ **Multi-Service** - Each service runs in its own container  
✅ **Scalable** - Can scale individual services independently  
✅ **Robust** - Digital Ocean handles networking, health checks, and restarts  
✅ **DR-Friendly** - Works anywhere Digital Ocean App Platform is available  
✅ **Best Practices** - Follows containerized microservices architecture
