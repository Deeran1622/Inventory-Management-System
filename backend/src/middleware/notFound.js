// backend/src/middleware/notFound.js
// ------------------------------------------------------------
// Catch-all for routes that don't exist.
// Must be registered AFTER all routes in server.js.
// ------------------------------------------------------------

function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err); // Forward to errorHandler
}

module.exports = notFound;