// backend/src/controllers/supplierController.js
// ------------------------------------------------------------
// Handles HTTP requests and responses for suppliers.
// ------------------------------------------------------------

const supplierService = require("../services/supplierService");

// ── GET /api/suppliers ───────────────────────────────────────
function getAll(req, res, next) {
  try {
    const suppliers = supplierService.getAllSuppliers();
    res.json({ success: true, data: suppliers });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/suppliers/:id ───────────────────────────────────
function getOne(req, res, next) {
  try {
    const supplier = supplierService.getSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/suppliers ──────────────────────────────────────
function create(req, res, next) {
  try {
    const { name, contact_name, email, phone, address } = req.body;

    // Only name is required
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Supplier name is required" });
    }

    const supplier = supplierService.createSupplier({
      name: name.trim(),
      contact_name,
      email,
      phone,
      address,
    });
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/suppliers/:id ───────────────────────────────────
function update(req, res, next) {
  try {
    const { name, contact_name, email, phone, address } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Supplier name is required" });
    }

    const supplier = supplierService.updateSupplier(req.params.id, {
      name: name.trim(),
      contact_name,
      email,
      phone,
      address,
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/suppliers/:id ────────────────────────────────
function remove(req, res, next) {
  try {
    const deleted = supplierService.deleteSupplier(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };