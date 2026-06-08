// backend/src/services/categoryService.js
// ------------------------------------------------------------
// All database operations for categories live here.
// Controllers call these functions — never query DB directly.
// ------------------------------------------------------------

const db = require("../database/db");

// ── Get all categories ───────────────────────────────────────
function getAllCategories() {
  const stmt = db.prepare(`
    SELECT * FROM categories
    ORDER BY name ASC
  `);
  return stmt.all();
}

// ── Get single category by ID ────────────────────────────────
function getCategoryById(id) {
  const stmt = db.prepare(`
    SELECT * FROM categories WHERE id = ?
  `);
  return stmt.get(id); // Returns undefined if not found
}

// ── Create new category ──────────────────────────────────────
function createCategory({ name, description }) {
  const stmt = db.prepare(`
    INSERT INTO categories (name, description)
    VALUES (@name, @description)
  `);
  const result = stmt.run({ name, description: description || null });
  // Return the newly created category
  return getCategoryById(result.lastInsertRowid);
}

// ── Update category ──────────────────────────────────────────
function updateCategory(id, { name, description }) {
  const stmt = db.prepare(`
    UPDATE categories
    SET name        = @name,
        description = @description
    WHERE id = @id
  `);
  const result = stmt.run({ id, name, description: description || null });
  // result.changes = 0 means no row was found with that ID
  return result.changes > 0 ? getCategoryById(id) : null;
}

// ── Delete category ──────────────────────────────────────────
function deleteCategory(id) {
  const stmt = db.prepare(`
    DELETE FROM categories WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes > 0; // true = deleted, false = not found
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};