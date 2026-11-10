/**
 * Utility functions for input sanitization and ReDoS protection
 */

/**
 * Escapes regex special characters in a string to prevent ReDoS (Regular Expression Denial of Service)
 * and syntax errors from malicious or malformed user input.
 *
 * @param {string} str - Raw user input string
 * @returns {string} Sanitized string safe for new RegExp() or MongoDB $regex
 */
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitizes and validates search input for database queries.
 * Enforces a strict maximum length (default 50 characters) and escapes all regex tokens.
 * Returns null if input is empty or invalid.
 *
 * @param {*} rawInput - Query parameter input
 * @param {number} [maxLength=50] - Maximum allowed string length
 * @returns {string|null} Safe escaped regex string or null
 */
const sanitizeSearchQuery = (rawInput, maxLength = 50) => {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) return null;
  const truncated = trimmed.slice(0, maxLength);
  return escapeRegex(truncated);
};

module.exports = {
  escapeRegex,
  sanitizeSearchQuery
};

