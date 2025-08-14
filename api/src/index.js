import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy (needed for rate limiting behind nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',  // Production frontend
  'http://localhost:5173',  // Development frontend
  'http://127.0.0.1:8080', // Alternative localhost
  'http://127.0.0.1:5173', // Alternative localhost
  process.env.FRONTEND_URL // Environment variable
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// File upload middleware - only for /api/files routes
app.use('/api/files', fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  abortOnLimit: true,
  useTempFiles: false, // Keep files in memory for MinIO upload
  tempFileDir: '/tmp/',
  debug: process.env.NODE_ENV === 'development'
}));

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

    // Initialize MinIO
    await initializeMinIO();
    console.log('✅ Connected to MinIO');

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