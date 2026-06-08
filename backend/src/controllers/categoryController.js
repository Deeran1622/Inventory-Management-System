// backend/src/controllers/categoryController.js
// ------------------------------------------------------------
// Handles HTTP requests and responses for categories.
// Validates input, calls the service, and sends back JSON.
// ------------------------------------------------------------

const categoryService = require("../services/categoryService");

// ── GET /api/categories ──────────────────────────────────────
function getAll(req, res, next) {
  try {
    const categories = categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err); // Forward to global error handler
  }
}

// ── GET /api/categories/:id ──────────────────────────────────
function getOne(req, res, next) {
  try {
    const category = categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/categories ─────────────────────────────────────
function create(req, res, next) {
  try {
    const { name, description } = req.body;

    // Basic validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = categoryService.createCategory({ name: name.trim(), description });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    // SQLite unique constraint error (duplicate name)
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ success: false, message: "Category name already exists" });
    }
    next(err);
  }
}

// ── PUT /api/categories/:id ──────────────────────────────────
function update(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = categoryService.updateCategory(req.params.id, { name: name.trim(), description });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ success: false, message: "Category name already exists" });
    }
    next(err);
  }
}

// ── DELETE /api/categories/:id ───────────────────────────────
function remove(req, res, next) {
  try {
    const deleted = categoryService.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };