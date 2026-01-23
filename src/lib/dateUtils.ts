/**
 * Formats a date string (ISO or YYYY-MM-DD) for human-readable display.
 * Handles timezone shifts by parsing as local date.
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  // Extract YYYY-MM-DD and replace hyphens with slashes to parse as local date
  const localDate = new Date(dateString.substring(0, 10).replace(/-/g, '/'));
  return localDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Parses a date string (ISO or YYYY-MM-DD) into a YYYY-MM-DD format suitable for HTML5 date inputs.
 */
export function parseDateForInput(dateString?: string): string {
  if (!dateString) return '';
  return dateString.substring(0, 10);
}
