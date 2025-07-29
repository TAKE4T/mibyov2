const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.details;
  }

  // OpenAI API errors
  if (err.response && err.response.data) {
    error.message = 'OpenAI API Error';
    error.status = err.response.status || 500;
    error.details = err.response.data.error;
  }

  // Firebase errors
  if (err.code && err.code.startsWith('permission-denied')) {
    error.message = 'Database permission denied';
    error.status = 403;
  }

  // Rate limit errors
  if (err.type === 'entity.too.large') {
    error.message = 'Request payload too large';
    error.status = 413;
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };