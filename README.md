# PIDS Dataset Explorer

A production-ready React-based web application for exploring and managing public interest datasets with advanced search, filtering, and admin capabilities.

## 🚀 Features

### Core Functionality
- **Dataset Directory**: Browse and search through verified public datasets
- **Advanced Search**: Full-text search with debounced input
- **Smart Filtering**: Filter by format, tags, date range, and file size
- **Dataset Explorer**: Interactive file tree exploration
- **Admin Dashboard**: Dataset approval and management system

### Production Features
- **Error Boundary**: Graceful error handling with user-friendly fallbacks
- **Performance Monitoring**: Real-time metrics tracking
- **Service Worker**: Offline functionality and caching
- **Health Checks**: Comprehensive application health monitoring
- **Security Headers**: Production-grade security configuration
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first responsive UI

### DevOps & Deployment
- **Docker Support**: Multi-stage Docker builds with Nginx
- **Kubernetes Ready**: Complete K8s deployment configuration
- **CI/CD Ready**: Automated deployment scripts
- **Health Monitoring**: Built-in health check endpoints
- **Rollback Support**: One-command rollback functionality

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks with localStorage persistence
- **Build Tool**: Vite with optimized production builds
- **Container**: Docker with Nginx for production serving
- **Deployment**: Kubernetes with Digital Ocean integration
- **Performance**: Service Worker for caching and offline support

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Docker
- kubectl (for deployment)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd pids-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application at http://localhost:8080
```

## 🚀 Production Deployment

### Environment Variables

Create a `.env` file for production configuration:

```bash
# Application
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_SHOW_PERFORMANCE=false

# Deployment
REGISTRY_URL=registry.digitalocean.com/your-registry
IMAGE_TAG=latest
DOMAIN=your-domain.com
```

### Quick Deployment

```bash
# Full deployment (build, test, deploy)
./deploy.sh

# Build only
./deploy.sh build

# Health check
./deploy.sh health

# Rollback if needed
./deploy.sh rollback
```

### Manual Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Build Docker image**:
   ```bash
   docker build -t pids-frontend:latest .
   ```

3. **Push to registry**:
   ```bash
   docker tag pids-frontend:latest registry.digitalocean.com/your-registry/pids-frontend:latest
   docker push registry.digitalocean.com/your-registry/pids-frontend:latest
   ```

4. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

### Digital Ocean Setup

1. **Create Container Registry**:
   ```bash
   doctl registry create your-registry
   ```

2. **Configure Kubernetes**:
   ```bash
   doctl kubernetes cluster kubeconfig save your-cluster
   ```

3. **Deploy**:
   ```bash
   ./deploy.sh
   ```

## 🔧 Configuration

### Nginx Configuration

The application includes a production-optimized Nginx configuration with:
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint
- API proxy preparation

### Kubernetes Configuration

The `k8s-deployment.yaml` includes:
- Multi-replica deployment
- Resource limits and requests
- Health checks (liveness and readiness probes)
- Ingress with TLS support
- Service configuration

## 📊 Monitoring & Health Checks

### Health Endpoint
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Performance Monitoring

The application includes built-in performance monitoring that tracks:
- Page load times
- Memory usage
- Network requests
- Error counts

Enable in production by setting:
```bash
REACT_APP_SHOW_PERFORMANCE=true
```

## 🔒 Security Features

- **CSP Headers**: Content Security Policy implementation
- **XSS Protection**: X-XSS-Protection headers
- **Frame Options**: X-Frame-Options for clickjacking protection
- **Content Type**: X-Content-Type-Options for MIME sniffing protection
- **HTTPS Only**: Production deployment with TLS

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📁 Project Structure

```
pids-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── SearchBar.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/              # Utility functions
│   │   └── api.ts          # API client and utilities
│   └── styles/             # Global styles
├── public/
│   └── sw.js              # Service worker
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Development environment
├── k8s-deployment.yaml   # Kubernetes deployment
├── nginx.conf            # Production Nginx config
└── deploy.sh             # Deployment script
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the health endpoint: `/health`
- Review deployment logs: `kubectl logs deployment/pids-app`