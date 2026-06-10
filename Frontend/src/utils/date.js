/**
 * Format a date string as a human-readable short date (day Month year).
 * e.g. "10 Jun 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string as a full date + time.
 * Used where both date and time are meaningful (e.g. DetailsModal).
 * e.g. "10/06/2026, 9:02:00 pm"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}
