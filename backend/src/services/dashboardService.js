// backend/src/services/dashboardService.js
// ------------------------------------------------------------
// Aggregates key inventory statistics for the dashboard.
// All queries are read-only — no data is modified here.
// ------------------------------------------------------------

const db = require("../database/db");

function getDashboardStats() {

  // ── Total number of products ───────────────────────────────
  const totalProducts = db.prepare(`
    SELECT COUNT(*) AS count FROM products
  `).get().count;

  // ── Total number of categories ─────────────────────────────
  const totalCategories = db.prepare(`
    SELECT COUNT(*) AS count FROM categories
  `).get().count;

  // ── Total number of suppliers ──────────────────────────────
  const totalSuppliers = db.prepare(`
    SELECT COUNT(*) AS count FROM suppliers
  `).get().count;

  // ── Total inventory value (quantity × cost_price) ──────────
  const inventoryValue = db.prepare(`
    SELECT ROUND(SUM(quantity * cost_price), 2) AS value FROM products
  `).get().value || 0;

  // ── Total retail value (quantity × price) ──────────────────
  const retailValue = db.prepare(`
    SELECT ROUND(SUM(quantity * price), 2) AS value FROM products
  `).get().value || 0;

  // ── Low stock products (quantity <= min_quantity) ──────────
  const lowStockProducts = db.prepare(`
    SELECT
      p.id,
      p.name,
      p.sku,
      p.quantity,
      p.min_quantity,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.quantity <= p.min_quantity
    ORDER BY p.quantity ASC
    LIMIT 10
  `).all();

  // ── Out of stock products (quantity = 0) ───────────────────
  const outOfStockCount = db.prepare(`
    SELECT COUNT(*) AS count FROM products WHERE quantity = 0
  `).get().count;

  // ── Recent transactions (last 10) ─────────────────────────
  const recentTransactions = db.prepare(`
    SELECT
      t.id,
      t.type,
      t.quantity,
      t.note,
      t.created_at,
      p.name AS product_name,
      p.sku  AS product_sku
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    ORDER BY t.created_at DESC
    LIMIT 10
  `).all();

  // ── Top 5 products by quantity ─────────────────────────────
  const topProducts = db.prepare(`
    SELECT
      p.id,
      p.name,
      p.sku,
      p.quantity,
      p.price,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.quantity DESC
    LIMIT 5
  `).all();

  return {
    summary: {
      totalProducts,
      totalCategories,
      totalSuppliers,
      outOfStockCount,
      lowStockCount: lowStockProducts.length,
      inventoryValue,
      retailValue,
    },
    lowStockProducts,
    recentTransactions,
    topProducts,
  };
}

module.exports = { getDashboardStats };