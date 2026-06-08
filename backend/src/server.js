// backend/src/server.js
// ------------------------------------------------------------
// Application entry point.
// Initialises Express, registers middleware, mounts routes,
// runs DB migrations, then starts the HTTP server.
// ------------------------------------------------------------

require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const runMigrations = require("./database/migrate");
const errorHandler  = require("./middleware/errorHandler");
const notFound      = require("./middleware/notFound");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173", // Vite dev server default
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());               // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running 🟢" });
});

// ── API Routes (will be added per module) ───────────────────
app.use("/api/categories",   require("./routes/categoryRoutes"));
app.use("/api/suppliers",    require("./routes/supplierRoutes"));
app.use("/api/products",     require("./routes/productRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/dashboard",    require("./routes/dashboardRoutes"));

// ── 404 + Error Handlers (must be LAST) ─────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
runMigrations(); // Create tables if they don't exist

app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});