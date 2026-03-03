function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', req.method, req.path, '-', err.message);
  res.status(err.statusCode || 500).json({
    error: err.message || 'internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
module.exports = {errorHandler};