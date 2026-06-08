// frontend/src/utils/formatDate.js
// Converts UTC datetime from SQLite to local Indian time (IST)

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  // Append 'Z' to tell JavaScript this is UTC time
  const date = new Date(dateStr + "Z");
  return date.toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "Z");
  return date.toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}