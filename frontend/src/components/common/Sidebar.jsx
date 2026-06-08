// frontend/src/components/common/Sidebar.jsx

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        Invent<span>ory</span>
      </div>
      <nav>
        <NavLink to="/">
          📊 Dashboard
        </NavLink>
        <NavLink to="/products">
          📦 Products
        </NavLink>
        <NavLink to="/categories">
          🏷️ Categories
        </NavLink>
        <NavLink to="/suppliers">
          🏭 Suppliers
        </NavLink>
        <NavLink to="/transactions">
          🔄 Transactions
        </NavLink>
      </nav>
    </div>
  );
}