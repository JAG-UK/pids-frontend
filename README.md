# PIDS Frontend

A web application for exploring and analyzing public information datasets.

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- MongoDB (optional, can use Docker)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/pids-frontend.git
cd pids-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
docker-compose up -d
```

5. Open your browser and navigate to `http://localhost:8080`

## Development Setup

### Development Mode (with Hot Reloading)

For debugging with breakpoints, console logging, and hot reloading:

```bash
# Start development frontend
./dev.sh

# Access at: http://localhost:5173
```

**Features in Development Mode:**
- 🔥 Hot reloading (changes reflect immediately)
- 🐛 Source maps for debugging
- 📝 Console logging and breakpoints
- 🔍 Browser dev tools integration
- ⚡ Fast refresh for React components

### Production Mode (Optimized)

For production use with optimized builds:

```bash
# Start production frontend
./prod.sh

# Access at: http://localhost:8080
```

**Features in Production Mode:**
- 🚀 Optimized bundle size
- ⚡ Better performance
- 🛡️ Minified and compressed assets
- 📊 Production-ready logging

### Switching Between Modes

```bash
# Switch to development
./dev.sh

# Switch back to production
./prod.sh

# Check current status
docker-compose ps
```

### Development Workflow

1. **Start Development Mode:**
   ```bash
   ./dev.sh
   ```

2. **Make Changes:**
   - Edit files in `src/`
   - Changes will hot reload automatically
   - Use browser dev tools for debugging

3. **Debug Features:**
   - Set breakpoints in browser dev tools
   - Use `console.log()` for debugging
   - View source maps for TypeScript files
   - Hot reload changes instantly

4. **Switch to Production:**
   ```bash
   ./prod.sh
   ```

### Useful Commands

```bash
# View development logs
docker-compose logs -f pids-frontend-dev

# View production logs
docker-compose logs -f pids-frontend

# Restart development service
docker-compose restart pids-frontend-dev

# Stop all services
docker-compose down
```

## Production Deployment

For deploying to production on Kubernetes (Digital Ocean or AWS):

### 🚀 Quick Production Deployment

```bash
# 30-minute deployment to Digital Ocean Kubernetes
# See QUICK_START.md for complete instructions

# 1. Install prerequisites
brew install doctl kubectl  # macOS

# 2. Create cluster
doctl kubernetes cluster create pids-production --region nyc1

# 3. Deploy application
cd deploy
./setup-secrets.sh
./deploy-to-k8s.sh production
```

### 📚 Deployment Documentation

- **[QUICK_START.md](QUICK_START.md)** - 30-minute deployment guide (start here!)
- **[DEPLOYMENT_STRATEGY.md](DEPLOYMENT_STRATEGY.md)** - Comprehensive deployment strategy
- **[AWS_EKS_DEPLOYMENT.md](AWS_EKS_DEPLOYMENT.md)** - AWS-specific deployment guide
- **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** - Complete package overview
- **[k8s/README.md](k8s/README.md)** - Kubernetes manifests documentation
- **[deploy/README.md](deploy/README.md)** - Deployment scripts documentation

### 🎯 What You Get

✅ **High Availability:** Multi-pod deployments with automatic failover  
✅ **Data Persistence:** Survives restarts, node failures, and upgrades  
✅ **Automated Backups:** Daily backups of all databases  
✅ **Load Balancing:** Automatic traffic distribution  
✅ **Zero-Downtime Deployments:** Rolling updates with health checks  
✅ **Scalability:** Easy horizontal and vertical scaling  
✅ **Security:** Secrets management and network isolation  
✅ **Monitoring:** Built-in health checks and logging  
✅ **CI/CD Ready:** GitHub Actions integration included  

### 💰 Cost Estimates

- **Digital Ocean DOKS:** ~$56/month (recommended)
- **AWS EKS:** ~$176/month (enterprise features)

### 🆘 Quick Help

```bash
# Check deployment health
./deploy/deploy-to-k8s.sh health

# View logs
kubectl logs -f deployment/pids-api -n pids-production

# Rollback if needed
./deploy/deploy-to-k8s.sh rollback
```
