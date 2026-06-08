// frontend/src/pages/Suppliers/Suppliers.jsx

import { useEffect, useState } from "react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../api/supplierApi";

const EMPTY_FORM = {
  name: "", contact_name: "", email: "", phone: "", address: ""
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchSuppliers(); }, []);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const res = await getSuppliers();
      setSuppliers(res.data.data);
    } catch {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(supplier) {
    setEditingId(supplier.id);
    setForm({
      name:         supplier.name         || "",
      contact_name: supplier.contact_name || "",
      email:        supplier.email        || "",
      phone:        supplier.phone        || "",
      address:      supplier.address      || "",
    });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Supplier name is required");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      if (editingId) {
        await updateSupplier(editingId, form);
      } else {
        await createSupplier(form);
      }
      await fetchSuppliers();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSupplier(id);
      await fetchSuppliers();
      setDeletingId(null);
    } catch {
      alert("Failed to delete supplier");
    }
  }

  if (loading) return <div className="loading">Loading suppliers...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <h1>Suppliers</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Supplier
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="card">
        {suppliers.length === 0 ? (
          <div className="empty-state">
            <p>No suppliers yet. Add your first one!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td style={{ color: "#94a3b8" }}>{sup.id}</td>
                    <td><strong>{sup.name}</strong></td>
                    <td>{sup.contact_name || "—"}</td>
                    <td>
                      {sup.email
                        ? <a href={`mailto:${sup.email}`}
                            style={{ color: "#3b82f6", textDecoration: "none" }}>
                            {sup.email}
                          </a>
                        : "—"}
                    </td>
                    <td>{sup.phone || "—"}</td>
                    <td style={{ color: "#64748b", maxWidth: "160px",
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap" }}>
                      {sup.address || "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(sup)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingId(sup.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Supplier" : "Add Supplier"}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {formError && (
              <div className="alert alert-error">{formError}</div>
            )}

            <div className="form-group">
              <label>Supplier Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Tech Corp"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. contact@techcorp.com"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────── */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close"
                onClick={() => setDeletingId(null)}>×</button>
            </div>
            <p style={{ color: "#64748b", marginBottom: "8px" }}>
              Are you sure you want to delete this supplier?
            </p>
            <p style={{ color: "#ef4444", fontSize: "13px" }}>
              ⚠️ Products from this supplier will have their supplier removed.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary"
                onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger"
                onClick={() => handleDelete(deletingId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}