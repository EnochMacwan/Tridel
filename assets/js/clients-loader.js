/**
 * Clients Logo Loader
 * Dynamically generates the scrolling client logo track.
 *
 * Exports:
 *   window.renderClientLogos(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/**
 * Renders the Client Logos into the track element
 * Exported as window.renderClientLogos for SPA router usage.
 */
window.renderClientLogos = function(container) {
    if (!container) container = document.querySelector('.client-logo-track');
    // Support both variable names
    const data = typeof CLIENTS_DATA !== 'undefined' ? CLIENTS_DATA : (typeof clientsData !== 'undefined' ? clientsData : null);
    if (!data) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }
    if (!container) return;

    // Clear existing static content
    container.innerHTML = '';

    // Function to create logo element
    const createLogo = (client) => {
        const div = document.createElement('div');
        div.className = 'client-logo';
        div.innerHTML = `<img loading="lazy" alt="${escapeHtml(client.name)}" src="${client.logo}">`;
        return div;
    };

    // 1. Render Original Set
    data.forEach(client => {
        container.appendChild(createLogo(client));
    });

    // 2. Render Duplicate Set (for seamless scroll)
    // We typically duplicate the list enough times to fill the specific width.
    // For CSS infinite scroll, we usually need at least 2 sets.
    data.forEach(client => {
        container.appendChild(createLogo(client));
    });

    // 3. Triplicate (as in original HTML for wide screens)
    data.forEach(client => {
        container.appendChild(createLogo(client));
    });
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.client-logo-track');
    if (track) {
        window.renderClientLogos(track);
    }
});
