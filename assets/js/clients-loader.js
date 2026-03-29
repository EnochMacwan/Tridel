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

    const shell = container.closest('.client-logos');
    const viewport = shell ? shell.querySelector('.client-logos__viewport') : null;
    const prevButton = shell ? shell.querySelector('.client-logos__control--prev') : null;
    const nextButton = shell ? shell.querySelector('.client-logos__control--next') : null;

    // Clear existing static content
    container.innerHTML = '';

    // Function to create logo element
    const createLogo = (client) => {
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
        div.innerHTML = `<img loading="lazy" alt="${esc(client.name)}" src="${client.logo}">`;
        return div;
    };

    data.forEach(client => {
        container.appendChild(createLogo(client));
    });

    if (!viewport || !prevButton || !nextButton) return;

    const getScrollStep = () => {
        const firstCard = container.querySelector('.client-logo');
        if (!firstCard) return viewport.clientWidth * 0.8;
        const gap = parseFloat(window.getComputedStyle(container).columnGap || window.getComputedStyle(container).gap || '0') || 0;
        return firstCard.getBoundingClientRect().width + gap;
    };

    const syncControls = () => {
        const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        prevButton.disabled = viewport.scrollLeft <= 4;
        nextButton.disabled = viewport.scrollLeft >= (maxScrollLeft - 4);
    };

    if (!viewport.dataset.clientControlsBound) {
        prevButton.addEventListener('click', () => {
            viewport.scrollBy({ left: -getScrollStep() * 2, behavior: 'smooth' });
        });
        nextButton.addEventListener('click', () => {
            viewport.scrollBy({ left: getScrollStep() * 2, behavior: 'smooth' });
        });
        viewport.addEventListener('scroll', syncControls, { passive: true });
        viewport.dataset.clientControlsBound = 'true';
    }

    viewport.scrollLeft = 0;
    requestAnimationFrame(syncControls);
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.client-logo-track');
    if (track) {
        window.renderClientLogos(track);
    }
});
