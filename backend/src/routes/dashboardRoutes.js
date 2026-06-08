// backend/src/routes/dashboardRoutes.js

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/dashboardController");

router.get("/", controller.getStats); // GET /api/dashboard

module.exports = router;