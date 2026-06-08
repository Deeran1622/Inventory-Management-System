// frontend/src/pages/Categories/Categories.jsx
import { formatDate } from "../../utils/formatDate";

import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";

// ── Initial form state ────────────────────────────────────────
const EMPTY_FORM = { name: "", description: "" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Modal state
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState(null);
  const [saving, setSaving]         = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  // ── Fetch all categories ──────────────────────────────────
  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data.data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  // ── Open modal for create ─────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  // ── Open modal for edit ───────────────────────────────────
  function openEdit(category) {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || "" });
    setFormError(null);
    setShowModal(true);
  }

  // ── Close modal ───────────────────────────────────────────
  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  // ── Handle form input changes ─────────────────────────────
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Save (create or update) ───────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Category name is required");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      await fetchCategories();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await deleteCategory(id);
      await fetchCategories();
      setDeletingId(null);
    } catch {
      alert("Failed to delete category");
    }
  }

  if (loading) return <div className="loading">Loading categories...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Category
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="card">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories yet. Add your first one!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ color: "#94a3b8" }}>{cat.id}</td>
                    <td><strong>{cat.name}</strong></td>
                    <td style={{ color: "#64748b" }}>{cat.description || "—"}</td>
                    <td style={{ fontSize: "13px", color: "#94a3b8" }}>
                     {formatDate(cat.created_at)} 
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(cat)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingId(cat.id)}
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
              <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {formError && (
              <div className="alert alert-error">{formError}</div>
            )}

            <div className="form-group">
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Electronics"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows={3}
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
              <button className="modal-close" onClick={() => setDeletingId(null)}>×</button>
            </div>
            <p style={{ color: "#64748b", marginBottom: "8px" }}>
              Are you sure you want to delete this category?
            </p>
            <p style={{ color: "#ef4444", fontSize: "13px" }}>
              ⚠️ Products in this category will have their category removed.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deletingId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}