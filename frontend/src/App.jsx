// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import Dashboard    from "./pages/Dashboard/Dashboard";
import Products     from "./pages/Products/Products";
import Categories   from "./pages/Categories/Categories";
import Suppliers    from "./pages/Suppliers/Suppliers";
import Transactions from "./pages/Transactions/Transactions";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/products"     element={<Products />} />
            <Route path="/categories"   element={<Categories />} />
            <Route path="/suppliers"    element={<Suppliers />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}