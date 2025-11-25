# TOADS (The Open Access Dataset Standard) Directory Frontend

![TOADS hero image - a wise toad guards vast wealth of knowledge in a huge library](https://github.com/JAG-UK/pids-frontend/blob/main/public/images/toad.png?raw=true)

A web application for exploring and analyzing public information datasets prepared with the [TOADS standard](https://github.com/fidlabs/data-prep-standard).

Main instance hosted at https://toads.directory

## Onward development

You are heartily encouraged to submit PRs here, or create a clone for your own local datraset directory. If that's what you want to do, read on!

### Prerequisites

- Node.js 22+ 
- Docker and Docker Compose
- MongoDB (optional, can use Docker)
- k8s cluster for deployment

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

4. Start the development environment with hot reloading:
```bash
./dev.sh
```

5. Open your browser and navigate to `http://localhost:5173`

**Features in Development Mode:**
- 🔥 Hot reloading (changes reflect immediately)
- 🐛 Source maps for debugging
- 📝 Console logging and breakpoints
- 🔍 Browser dev tools integration
- ⚡ Fast refresh for React components

## Production Deployment

The official production environment is hosted in Digital Ocean DOKS and managed with k9s on dev machines. If you want to host a clone in DOKS then small chages to the config should Just Work and you can do the same.