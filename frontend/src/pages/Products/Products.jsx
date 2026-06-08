// frontend/src/pages/Products/Products.jsx

import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import { getSuppliers }  from "../../api/supplierApi";

const EMPTY_FORM = {
  name: "", sku: "", description: "",
  price: "", cost_price: "",
  quantity: "", min_quantity: "",
  category_id: "", supplier_id: "",
};

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search and filter
  const [search, setSearch]         = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [prodRes, catRes, supRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getSuppliers(),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
      setSuppliers(supRes.data.data);
    } catch {
      setError("Failed to load products");
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

  function openEdit(product) {
    setEditingId(product.id);
    setForm({
      name:        product.name        || "",
      sku:         product.sku         || "",
      description: product.description || "",
      price:       product.price       ?? "",
      cost_price:  product.cost_price  ?? "",
      quantity:    product.quantity    ?? "",
      min_quantity: product.min_quantity ?? "",
      category_id: product.category_id ?? "",
      supplier_id: product.supplier_id ?? "",
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
      setFormError("Product name is required");
      return;
    }
    if (!form.sku.trim()) {
      setFormError("SKU is required");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const payload = {
        ...form,
        price:        parseFloat(form.price)        || 0,
        cost_price:   parseFloat(form.cost_price)   || 0,
        quantity:     parseInt(form.quantity)        || 0,
        min_quantity: parseInt(form.min_quantity)    || 0,
        category_id:  form.category_id ? parseInt(form.category_id) : null,
        supplier_id:  form.supplier_id ? parseInt(form.supplier_id) : null,
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      await fetchAll();
      setDeletingId(null);
    } catch {
      alert("Failed to delete product");
    }
  }

  // ── Filter products by search and category ────────────────
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCategory
      ? String(p.category_id) === filterCategory
      : true;
    return matchSearch && matchCat;
  });

  // ── Stock status badge ────────────────────────────────────
  function stockBadge(p) {
    if (p.quantity === 0)
      return <span className="badge badge-danger">Out of Stock</span>;
    if (p.quantity <= p.min_quantity)
      return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  }

  if (loading) return <div className="loading">Loading products...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {/* ── Search and Filter Bar ─────────────────────────── */}
      <div className="card" style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <input
            style={{ flex: 1, padding: "9px 12px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "14px", outline: "none" }}
            placeholder="🔍 Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ padding: "9px 12px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "14px", outline: "none",
              background: "#fff", minWidth: "180px" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span style={{ color: "#94a3b8", fontSize: "13px", whiteSpace: "nowrap" }}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Products Table ────────────────────────────────── */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{products.length === 0 ? "No products yet. Add your first one!" : "No products match your search."}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge badge-gray">{p.sku}</span></td>
                    <td>{p.category_name || "—"}</td>
                    <td>{p.supplier_name || "—"}</td>
                    <td>₹{p.price.toLocaleString()}</td>
                    <td style={{ color: "#64748b" }}>₹{p.cost_price.toLocaleString()}</td>
                    <td>
                      <strong style={{
                        color: p.quantity === 0 ? "#ef4444" :
                               p.quantity <= p.min_quantity ? "#f59e0b" : "#10b981"
                      }}>
                        {p.quantity}
                      </strong>
                    </td>
                    <td>{stockBadge(p)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(p)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingId(p.id)}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {formError && (
              <div className="alert alert-error">{formError}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Laptop"
                />
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. LAP001"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Cost Price (₹)</label>
                <input
                  name="cost_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost_price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Min Quantity (Low Stock Alert)</label>
                <input
                  name="min_quantity"
                  type="number"
                  min="0"
                  value={form.min_quantity}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">— Select Category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <select
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={handleChange}
                >
                  <option value="">— Select Supplier —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
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
              Are you sure you want to delete this product?
            </p>
            <p style={{ color: "#ef4444", fontSize: "13px" }}>
              ⚠️ All transactions for this product will also be deleted.
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