// backend/src/database/migrate.js
// ------------------------------------------------------------
// Runs once at server startup to create all tables if they
// don't already exist. Safe to run multiple times (idempotent).
// ------------------------------------------------------------

const db = require("./db");

function runMigrations() {
  // ── Categories ──────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // ── Suppliers ───────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      contact_name TEXT,
      email        TEXT,
      phone        TEXT,
      address      TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );
  `);

  // ── Products ────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      sku           TEXT    NOT NULL UNIQUE,
      description   TEXT,
      price         REAL    NOT NULL DEFAULT 0,
      cost_price    REAL    NOT NULL DEFAULT 0,
      quantity      INTEGER NOT NULL DEFAULT 0,
      min_quantity  INTEGER NOT NULL DEFAULT 0,
      category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      supplier_id   INTEGER REFERENCES suppliers(id)  ON DELETE SET NULL,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  // ── Transactions (stock in / stock out / adjustment) ────
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      type        TEXT    NOT NULL CHECK(type IN ('IN','OUT','ADJUSTMENT')),
      quantity    INTEGER NOT NULL,
      note        TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log("✅  Database migrations complete.");
}

module.exports = runMigrations;