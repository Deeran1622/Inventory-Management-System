// backend/src/middleware/errorHandler.js
// ------------------------------------------------------------
// Centralised Express error handler.
// Any controller that calls next(err) lands here.
// ------------------------------------------------------------

function errorHandler(err, req, res, next) {
  // Log full stack in development; suppress in production
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Error:", err.stack);
  } else {
    console.error("🔴 Error:", err.message);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only expose stack trace in dev
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;