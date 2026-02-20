/**
 * Escape special regex characters in a string to prevent regex injection attacks
 * @param {string} string - The string to escape
 * @returns {string} - Escaped string safe for use in regex
 */
export function escapeRegex(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize a filename to prevent path traversal attacks
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return '';
  // Remove path separators and null bytes, keep only safe characters
  return filename.replace(/[^\w.-]/g, '');
}
