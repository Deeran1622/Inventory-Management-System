// backend/src/routes/transactionRoutes.js
// ------------------------------------------------------------
// Transactions are append-only (no PUT or DELETE).
// They form a permanent audit trail of all stock movements.
// ------------------------------------------------------------

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/transactionController");

router.get("/",    controller.getAll);  // GET  /api/transactions
router.get("/:id", controller.getOne);  // GET  /api/transactions/:id
router.post("/",   controller.create);  // POST /api/transactions

module.exports = router;