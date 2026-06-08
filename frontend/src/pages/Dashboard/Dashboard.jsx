// frontend/src/pages/Dashboard/Dashboard.jsx
import { formatDate } from "../../utils/formatDate";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/dashboardApi";

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  const { summary, lowStockProducts, recentTransactions, topProducts } = stats;

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn btn-secondary" onClick={fetchStats}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Summary Stats ─────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{summary.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{summary.totalCategories}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suppliers</div>
          <div className="stat-value">{summary.totalSuppliers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className={`stat-value ${summary.lowStockCount > 0 ? "warning" : "success"}`}>
            {summary.lowStockCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Out of Stock</div>
          <div className={`stat-value ${summary.outOfStockCount > 0 ? "danger" : "success"}`}>
            {summary.outOfStockCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value" style={{ fontSize: "20px" }}>
            ₹{summary.inventoryValue.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Retail Value</div>
          <div className="stat-value success" style={{ fontSize: "20px" }}>
            ₹{summary.retailValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Low Stock Alert ────────────────────────────────── */}
      {lowStockProducts.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: "16px", color: "#92400e", fontSize: "16px" }}>
            ⚠️ Low Stock Alert ({lowStockProducts.length} items)
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Qty</th>
                  <th>Min Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="badge badge-gray">{p.sku}</span></td>
                    <td>{p.category_name || "—"}</td>
                    <td><strong style={{ color: "#ef4444" }}>{p.quantity}</strong></td>
                    <td>{p.min_quantity}</td>
                    <td>
                      {p.quantity === 0
                        ? <span className="badge badge-danger">Out of Stock</span>
                        : <span className="badge badge-warning">Low Stock</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Two column layout ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Recent Transactions */}
        <div className="card">
          <h2 style={{ marginBottom: "16px", fontSize: "16px", color: "#1e293b" }}>
            🔄 Recent Transactions
          </h2>
          {recentTransactions.length === 0 ? (
            <div className="empty-state"><p>No transactions yet</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.product_name}</td>
                    <td>
                      <span className={`badge ${
                        t.type === "IN"         ? "badge-success" :
                        t.type === "OUT"        ? "badge-danger"  :
                        "badge-info"
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td>{t.quantity}</td>
                    <td style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {formatDate(t.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 style={{ marginBottom: "16px", fontSize: "16px", color: "#1e293b" }}>
            📦 Top Products by Stock
          </h2>
          {topProducts.length === 0 ? (
            <div className="empty-state"><p>No products yet</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="badge badge-gray">{p.sku}</span></td>
                    <td>{p.quantity}</td>
                    <td>₹{p.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}