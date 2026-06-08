// backend/src/controllers/productController.js
// ------------------------------------------------------------
// Handles HTTP requests and responses for products.
// ------------------------------------------------------------

const productService = require("../services/productService");

// ── GET /api/products ────────────────────────────────────────
function getAll(req, res, next) {
  try {
    const products = productService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/products/low-stock ──────────────────────────────
function getLowStock(req, res, next) {
  try {
    const products = productService.getLowStockProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/products/:id ────────────────────────────────────
function getOne(req, res, next) {
  try {
    const product = productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/products ───────────────────────────────────────
function create(req, res, next) {
  try {
    const {
      name, sku, description,
      price, cost_price,
      quantity, min_quantity,
      category_id, supplier_id,
    } = req.body;

    // Required field validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    if (!sku || sku.trim() === "") {
      return res.status(400).json({ success: false, message: "SKU is required" });
    }

    const product = productService.createProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      description,
      price,
      cost_price,
      quantity,
      min_quantity,
      category_id,
      supplier_id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }
    next(err);
  }
}

// ── PUT /api/products/:id ────────────────────────────────────
function update(req, res, next) {
  try {
    const {
      name, sku, description,
      price, cost_price,
      quantity, min_quantity,
      category_id, supplier_id,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    if (!sku || sku.trim() === "") {
      return res.status(400).json({ success: false, message: "SKU is required" });
    }

    const product = productService.updateProduct(req.params.id, {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      description,
      price,
      cost_price,
      quantity,
      min_quantity,
      category_id,
      supplier_id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }
    next(err);
  }
}

// ── DELETE /api/products/:id ─────────────────────────────────
function remove(req, res, next) {
  try {
    const deleted = productService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, getLowStock, create, update, remove };