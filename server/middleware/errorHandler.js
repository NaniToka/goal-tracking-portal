/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate entry found.' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
