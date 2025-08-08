# PIDS Data Explorer

A modern web application for exploring and analyzing public information datasets.

## Features

- **Dataset Management**: Upload, organize, and manage datasets
- **File Preview**: View files in various formats (images, PDFs, code, etc.)
- **Search & Filter**: Advanced search and filtering capabilities
- **Real-time Updates**: Live updates and notifications
- **Responsive Design**: Works on desktop and mobile devices

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

## Project Structure

```
pids-frontend/
├── api/                    # Backend API
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── public/             # Static files
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utility functions
├── public/                 # Public assets
└── docs/                   # Documentation
```

## Development

### Backend Development

The backend is built with Node.js and Express:

```bash
cd api
npm install
npm run dev
```

### Frontend Development

The frontend is built with React and TypeScript:

```bash
npm run dev
```

### Testing

Run tests:

```bash
# Backend tests
cd api && npm test

# Frontend tests
npm test
```

## API Documentation

### Datasets

- `GET /api/datasets` - List all datasets
- `GET /api/datasets/:id` - Get dataset details
- `POST /api/datasets` - Create new dataset
- `PUT /api/datasets/:id` - Update dataset
- `DELETE /api/datasets/:id` - Delete dataset

### Files

- `GET /api/files/:path` - Get file content
- `POST /api/files/upload` - Upload file
- `DELETE /api/files/:id` - Delete file

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Email: support@pids-explorer.com
- Documentation: https://docs.pids-explorer.com
