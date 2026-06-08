// frontend/src/pages/Transactions/Transactions.jsx
import { formatDateTime } from "../../utils/formatDate";
import { useEffect, useState } from "react";
import { getTransactions, createTransaction } from "../../api/transactionApi";
import { getProducts } from "../../api/productApi";

const EMPTY_FORM = { product_id: "", type: "IN", quantity: "", note: "" };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState(null);
  const [saving, setSaving]             = useState(false);

  // Filter state
  const [filterType, setFilterType]     = useState("");
  const [filterProduct, setFilterProduct] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [txRes, prodRes] = await Promise.all([
        getTransactions(),
        getProducts(),
      ]);
      setTransactions(txRes.data.data);
      setProducts(prodRes.data.data);
    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.product_id) {
      setFormError("Please select a product");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setFormError("Quantity must be greater than 0");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      await createTransaction({
        product_id: parseInt(form.product_id),
        type:       form.type,
        quantity:   parseInt(form.quantity),
        note:       form.note || null,
      });
      await fetchAll();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save transaction");
    } finally {
      setSaving(false);
    }
  }

  // ── Filter transactions ───────────────────────────────────
  const filtered = transactions.filter((t) => {
    const matchType    = filterType    ? t.type === filterType : true;
    const matchProduct = filterProduct ? String(t.product_id) === filterProduct : true;
    return matchType && matchProduct;
  });

  // ── Type badge ────────────────────────────────────────────
  function typeBadge(type) {
    if (type === "IN")
      return <span className="badge badge-success">↑ IN</span>;
    if (type === "OUT")
      return <span className="badge badge-danger">↓ OUT</span>;
    return <span className="badge badge-info">⟳ ADJUSTMENT</span>;
  }

  // ── Selected product info (show current stock in modal) ───
  const selectedProduct = products.find(
    (p) => String(p.id) === String(form.product_id)
  );

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={openModal}>
          + New Transaction
        </button>
      </div>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="card" style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <select
            style={{ padding: "9px 12px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "14px", outline: "none",
              background: "#fff", minWidth: "160px" }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>

          <select
            style={{ padding: "9px 12px", border: "1px solid #d1d5db",
              borderRadius: "8px", fontSize: "14px", outline: "none",
              background: "#fff", minWidth: "200px" }}
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>

          <span style={{ color: "#94a3b8", fontSize: "13px", whiteSpace: "nowrap" }}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </span>

          {(filterType || filterProduct) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setFilterType(""); setFilterProduct(""); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Transactions Table ────────────────────────────── */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{transactions.length === 0
              ? "No transactions yet. Create your first one!"
              : "No transactions match your filters."
            }</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Note</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: "#94a3b8" }}>{t.id}</td>
                    <td><strong>{t.product_name}</strong></td>
                    <td>
                      <span className="badge badge-gray">{t.product_sku}</span>
                    </td>
                    <td>{typeBadge(t.type)}</td>
                    <td>
                      <strong style={{
                        color: t.type === "IN"  ? "#10b981" :
                               t.type === "OUT" ? "#ef4444" : "#3b82f6"
                      }}>
                        {t.type === "IN" ? "+" : t.type === "OUT" ? "-" : ""}
                        {t.quantity}
                      </strong>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "13px" }}>
                      {t.note || "—"}
                    </td>
                    <td style={{ fontSize: "13px", color: "#94a3b8" }}>
                      {formatDateTime(t.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── New Transaction Modal ─────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Transaction</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {formError && (
              <div className="alert alert-error">{formError}</div>
            )}

            {/* Transaction type selector */}
            <div className="form-group">
              <label>Transaction Type *</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {["IN", "OUT", "ADJUSTMENT"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "8px",
                      border: form.type === t ? "2px solid" : "1px solid #d1d5db",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px",
                      background: form.type === t
                        ? t === "IN" ? "#dcfce7"
                        : t === "OUT" ? "#fee2e2" : "#dbeafe"
                        : "#fff",
                      borderColor: form.type === t
                        ? t === "IN" ? "#10b981"
                        : t === "OUT" ? "#ef4444" : "#3b82f6"
                        : "#d1d5db",
                      color: form.type === t
                        ? t === "IN" ? "#166534"
                        : t === "OUT" ? "#991b1b" : "#1e40af"
                        : "#64748b",
                    }}
                  >
                    {t === "IN" ? "↑ Stock IN" : t === "OUT" ? "↓ Stock OUT" : "⟳ Adjustment"}
                  </button>
                ))}
              </div>
            </div>

            {/* Product selector */}
            <div className="form-group">
              <label>Product *</label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
              >
                <option value="">— Select Product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Show current stock if product selected */}
            {selectedProduct && (
              <div style={{
                background: "#f8fafc", borderRadius: "8px",
                padding: "12px 16px", marginBottom: "16px",
                fontSize: "13px", color: "#475569",
                border: "1px solid #e2e8f0"
              }}>
                Current stock:
                <strong style={{
                  marginLeft: "8px", fontSize: "16px",
                  color: selectedProduct.quantity === 0 ? "#ef4444" :
                         selectedProduct.quantity <= selectedProduct.min_quantity
                         ? "#f59e0b" : "#10b981"
                }}>
                  {selectedProduct.quantity} units
                </strong>
                {form.type === "OUT" && selectedProduct.quantity === 0 && (
                  <span style={{ color: "#ef4444", marginLeft: "12px" }}>
                    ⚠️ Out of stock!
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <label>
                {form.type === "ADJUSTMENT" ? "Set Quantity To *" : "Quantity *"}
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
              />
            </div>

            <div className="form-group">
              <label>Note</label>
              <input
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder={
                  form.type === "IN"  ? "e.g. New stock arrived" :
                  form.type === "OUT" ? "e.g. Sold to customer"  :
                  "e.g. Stock count correction"
                }
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
                {saving ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}