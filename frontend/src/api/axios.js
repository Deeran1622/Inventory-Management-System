// frontend/src/api/axios.js
// ------------------------------------------------------------
// Global Axios instance with base URL and default headers.
// All API calls in the app import from here — never create
// a new axios instance elsewhere.
// ------------------------------------------------------------

import axios from "axios";

const api = axios.create({
  baseURL: "https://inventory-management-system-xrfn.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Response interceptor ─────────────────────────────────────
// Logs errors globally so individual pages don't have to
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
