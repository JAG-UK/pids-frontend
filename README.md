# PIDS Frontend

A modern web application for exploring and analyzing public information datasets.

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