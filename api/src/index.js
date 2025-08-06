import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import datasetsRouter from './routes/datasets.js';
import filesRouter from './routes/files.js';
import authRouter from './routes/auth.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './utils/database.js';
import { initializeMinIO } from './utils/storage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (needed for rate limiting behind nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected', // Will be updated based on actual connection
      storage: 'connected'   // Will be updated based on actual connection
    }
  });
});

// API routes
app.use('/api/datasets', datasetsRouter);
app.use('/api/files', filesRouter);
app.use('/api/auth', authRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PIDS API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      datasets: '/api/datasets',
      files: '/api/files',
      auth: '/api/auth'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Initialize MinIO (optional for now)
    try {
      await initializeMinIO();
      console.log('✅ Connected to MinIO');
    } catch (error) {
      console.warn('⚠️  MinIO connection failed, continuing without file storage:', error.message);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 PIDS API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API docs: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 