// backend/src/controllers/transactionController.js
// ------------------------------------------------------------
// Handles HTTP requests and responses for transactions.
// Note: transactions are never updated or deleted (audit trail).
// ------------------------------------------------------------

const transactionService = require("../services/transactionService");

// ── GET /api/transactions ────────────────────────────────────
function getAll(req, res, next) {
  try {
    // Optional filter by product_id: /api/transactions?product_id=1
    const { product_id } = req.query;
    const transactions = product_id
      ? transactionService.getTransactionsByProduct(product_id)
      : transactionService.getAllTransactions();
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/transactions/:id ────────────────────────────────
function getOne(req, res, next) {
  try {
    const transaction = transactionService.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/transactions ───────────────────────────────────
function create(req, res, next) {
  try {
    const { product_id, type, quantity, note } = req.body;

    // Validate required fields
    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required" });
    }
    if (!type || !["IN", "OUT", "ADJUSTMENT"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be IN, OUT, or ADJUSTMENT" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "quantity must be a positive number" });
    }

    const transaction = transactionService.createTransaction({
      product_id: Number(product_id),
      type,
      quantity: Number(quantity),
      note,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    // Forward errors thrown inside the service (404, 400)
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
}

module.exports = { getAll, getOne, create };