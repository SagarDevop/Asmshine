const errorHandler = (err, req, res, next) => {
  // If response headers have already been sent (e.g. streaming responses),
  // delegate to default Express handler to avoid ERR_HTTP_HEADERS_SENT crash
  if (res.headersSent) {
    return next(err);
  }

  // Always log server-side diagnostic details
  console.error(`[API Error] ${req.method} ${req.originalUrl || req.url}: ${err.message}`, err.stack);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format.';
  }

  // 2. MongoDB Duplicate Key (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // 3. Mongoose Schema Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationErrors = Object.values(err.errors || {}).map((e) => e.message);
    message = validationErrors.join('. ') || 'Invalid input data.';
  }

  // 4. Malformed JSON Request Body
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON request body.';
  }

  // 5. JWT Authentication Errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authorization token. Please log in again.';
  }

  // 6. Generic unhandled 500 error in production - mask sensitive internal paths and stack traces
  else if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected internal error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
