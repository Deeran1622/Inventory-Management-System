// backend/src/services/supplierService.js
// ------------------------------------------------------------
// All database operations for suppliers.
// ------------------------------------------------------------

const db = require("../database/db");

// ── Get all suppliers ────────────────────────────────────────
function getAllSuppliers() {
  const stmt = db.prepare(`
    SELECT * FROM suppliers
    ORDER BY name ASC
  `);
  return stmt.all();
}

// ── Get single supplier by ID ────────────────────────────────
function getSupplierById(id) {
  const stmt = db.prepare(`
    SELECT * FROM suppliers WHERE id = ?
  `);
  return stmt.get(id);
}

// ── Create new supplier ──────────────────────────────────────
function createSupplier({ name, contact_name, email, phone, address }) {
  const stmt = db.prepare(`
    INSERT INTO suppliers (name, contact_name, email, phone, address)
    VALUES (@name, @contact_name, @email, @phone, @address)
  `);
  const result = stmt.run({
    name,
    contact_name: contact_name || null,
    email:        email        || null,
    phone:        phone        || null,
    address:      address      || null,
  });
  return getSupplierById(result.lastInsertRowid);
}

// ── Update supplier ──────────────────────────────────────────
function updateSupplier(id, { name, contact_name, email, phone, address }) {
  const stmt = db.prepare(`
    UPDATE suppliers
    SET name         = @name,
        contact_name = @contact_name,
        email        = @email,
        phone        = @phone,
        address      = @address
    WHERE id = @id
  `);
  const result = stmt.run({
    id,
    name,
    contact_name: contact_name || null,
    email:        email        || null,
    phone:        phone        || null,
    address:      address      || null,
  });
  return result.changes > 0 ? getSupplierById(id) : null;
}

// ── Delete supplier ──────────────────────────────────────────
function deleteSupplier(id) {
  const stmt = db.prepare(`
    DELETE FROM suppliers WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes > 0;
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};