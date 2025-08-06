export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = Object.values(err.errors).map(e => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.status = 400;
    error.message = 'Duplicate field value entered';
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error.status = 400;
    error.message = 'Invalid ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.status = 400;
    error.message = 'File too large';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.status = 400;
    error.message = 'Unexpected file field';
  }

  // Rate limit errors
  if (err.status === 429) {
    error.status = 429;
    error.message = 'Too many requests';
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 