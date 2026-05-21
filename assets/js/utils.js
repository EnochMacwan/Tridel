/**
 * Shared Utilities
 */

/**
 * Escapes HTML special characters in a value.
 * - null / undefined  → ''
 * - non-strings       → converted via String() then escaped
 * Canonical source: all modules reference this; do NOT define a local copy.
 */
function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch];
    });
}
