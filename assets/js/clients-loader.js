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
    const createLogo = (client, isClone) => {
        const div = document.createElement('div');
        const slug = String(client.name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        div.className = 'client-logo';
        div.dataset.clientSlug = slug;
        div.dataset.clientLabel = client.name || '';
        if (slug === 'behbehani-brothers' || slug === 'dp-world') {
            div.classList.add('client-logo--needs-label');
        }
        if (isClone) div.setAttribute('aria-hidden', 'true');
        div.innerHTML = `<img loading="lazy" alt="${esc(client.name)}" src="${client.logo}">`;
        return div;
    };

    // Render logos twice for a seamless marquee loop
    data.forEach(client => container.appendChild(createLogo(client, false)));
    data.forEach(client => container.appendChild(createLogo(client, true)));
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.client-logo-track');
    if (track) {
        window.renderClientLogos(track);
    }
});
