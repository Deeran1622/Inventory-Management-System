// backend/src/database/db.js
// ------------------------------------------------------------
// Singleton database connection using better-sqlite3.
// All queries in the app go through this module.
// ------------------------------------------------------------

const Database = require("better-sqlite3");
const path = require("path");
require("dotenv").config();

// Resolve absolute path to the .db file from project root
const DB_PATH = path.resolve(__dirname, "../../", process.env.DB_PATH || "./src/database/inventory.db");

// Open (or create) the SQLite database file
const db = new Database(DB_PATH, {
  // Log every SQL statement in development for debugging
  verbose: process.env.NODE_ENV === "development" ? console.log : null,
});

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Enforce foreign key constraints (SQLite disables them by default)
db.pragma("foreign_keys = ON");

module.exports = db;