// backend/src/services/productService.js
// ------------------------------------------------------------
// All database operations for products.
// Products JOIN with categories and suppliers for full detail.
// ------------------------------------------------------------

const db = require("../database/db");

// ── Base SELECT with JOINs (reused across queries) ───────────
const BASE_QUERY = `
  SELECT
    p.*,
    c.name AS category_name,
    s.name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN suppliers  s ON p.supplier_id  = s.id
`;

// ── Get all products ─────────────────────────────────────────
function getAllProducts() {
  const stmt = db.prepare(`${BASE_QUERY} ORDER BY p.name ASC`);
  return stmt.all();
}

// ── Get single product by ID ─────────────────────────────────
function getProductById(id) {
  const stmt = db.prepare(`${BASE_QUERY} WHERE p.id = ?`);
  return stmt.get(id);
}

// ── Get low stock products (quantity <= min_quantity) ────────
function getLowStockProducts() {
  const stmt = db.prepare(`
    ${BASE_QUERY}
    WHERE p.quantity <= p.min_quantity
    ORDER BY p.quantity ASC
  `);
  return stmt.all();
}

// ── Create new product ───────────────────────────────────────
function createProduct({ name, sku, description, price, cost_price, quantity, min_quantity, category_id, supplier_id }) {
  const stmt = db.prepare(`
    INSERT INTO products
      (name, sku, description, price, cost_price, quantity, min_quantity, category_id, supplier_id)
    VALUES
      (@name, @sku, @description, @price, @cost_price, @quantity, @min_quantity, @category_id, @supplier_id)
  `);
  const result = stmt.run({
    name,
    sku,
    description:  description  || null,
    price:        price        || 0,
    cost_price:   cost_price   || 0,
    quantity:     quantity     || 0,
    min_quantity: min_quantity || 0,
    category_id:  category_id  || null,
    supplier_id:  supplier_id  || null,
  });
  return getProductById(result.lastInsertRowid);
}

// ── Update product ───────────────────────────────────────────
function updateProduct(id, { name, sku, description, price, cost_price, quantity, min_quantity, category_id, supplier_id }) {
  const stmt = db.prepare(`
    UPDATE products
    SET name         = @name,
        sku          = @sku,
        description  = @description,
        price        = @price,
        cost_price   = @cost_price,
        quantity     = @quantity,
        min_quantity = @min_quantity,
        category_id  = @category_id,
        supplier_id  = @supplier_id,
        updated_at   = datetime('now')
    WHERE id = @id
  `);
  const result = stmt.run({
    id,
    name,
    sku,
    description:  description  || null,
    price:        price        || 0,
    cost_price:   cost_price   || 0,
    quantity:     quantity     || 0,
    min_quantity: min_quantity || 0,
    category_id:  category_id  || null,
    supplier_id:  supplier_id  || null,
  });
  return result.changes > 0 ? getProductById(id) : null;
}

// ── Delete product ───────────────────────────────────────────
function deleteProduct(id) {
  const stmt = db.prepare(`DELETE FROM products WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}

module.exports = {
  getAllProducts,
  getProductById,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};