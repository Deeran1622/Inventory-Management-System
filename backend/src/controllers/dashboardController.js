// backend/src/controllers/dashboardController.js
// ------------------------------------------------------------
// Single endpoint that returns all dashboard statistics.
// ------------------------------------------------------------

const dashboardService = require("../services/dashboardService");

// ── GET /api/dashboard ───────────────────────────────────────
function getStats(req, res, next) {
  try {
    const stats = dashboardService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };