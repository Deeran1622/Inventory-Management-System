// backend/src/services/transactionService.js
// ------------------------------------------------------------
// Handles stock transactions and automatically updates
// product quantity using SQLite transactions (atomic).
// ------------------------------------------------------------

const db = require("../database/db");

// ── Get all transactions (with product name) ─────────────────
function getAllTransactions() {
  const stmt = db.prepare(`
    SELECT
      t.*,
      p.name AS product_name,
      p.sku  AS product_sku
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    ORDER BY t.created_at DESC
  `);
  return stmt.all();
}

// ── Get transactions for a specific product ──────────────────
function getTransactionsByProduct(product_id) {
  const stmt = db.prepare(`
    SELECT
      t.*,
      p.name AS product_name,
      p.sku  AS product_sku
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    WHERE t.product_id = ?
    ORDER BY t.created_at DESC
  `);
  return stmt.all(product_id);
}

// ── Get single transaction by ID ─────────────────────────────
function getTransactionById(id) {
  const stmt = db.prepare(`
    SELECT
      t.*,
      p.name AS product_name,
      p.sku  AS product_sku
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    WHERE t.id = ?
  `);
  return stmt.get(id);
}

// ── Create transaction + update product quantity (atomic) ────
function createTransaction({ product_id, type, quantity, note }) {
  // Use a SQLite transaction so both operations succeed or fail together
  const execute = db.transaction(() => {
    // First check the product exists
    const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(product_id);
    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    let newQuantity;

    if (type === "IN") {
      // Stock coming in — add to current quantity
      newQuantity = product.quantity + quantity;
    } else if (type === "OUT") {
      // Stock going out — subtract from current quantity
      newQuantity = product.quantity - quantity;
      if (newQuantity < 0) {
        const err = new Error(`Insufficient stock. Available: ${product.quantity}`);
        err.statusCode = 400;
        throw err;
      }
    } else if (type === "ADJUSTMENT") {
      // Direct adjustment — set quantity to exact value
      newQuantity = quantity;
      if (newQuantity < 0) {
        const err = new Error("Quantity cannot be negative");
        err.statusCode = 400;
        throw err;
      }
    }

    // Update the product quantity
    db.prepare(`
      UPDATE products
      SET quantity   = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(newQuantity, product_id);

    // Insert the transaction record
    const result = db.prepare(`
      INSERT INTO transactions (product_id, type, quantity, note)
      VALUES (@product_id, @type, @quantity, @note)
    `).run({
      product_id,
      type,
      quantity,
      note: note || null,
    });

    return getTransactionById(result.lastInsertRowid);
  });

  return execute(); // Run the atomic transaction
}

module.exports = {
  getAllTransactions,
  getTransactionsByProduct,
  getTransactionById,
  createTransaction,
};