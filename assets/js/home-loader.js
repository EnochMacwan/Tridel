/**
 * Home Cards Loader
 * Dynamically generates the grid cards on the home page.
 *
 * Exports:
 *   window.renderHomeCards(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/**
 * Renders the Home Page Cards Grid
 * Exported as window.renderHomeCards for SPA router usage.
 */
window.renderHomeCards = function(container) {
    if (!container) container = document.getElementById('home-cards-container');
    // Support both variable names
    const data = typeof HOME_CARDS_DATA !== 'undefined' ? HOME_CARDS_DATA : (typeof homeCardsData !== 'undefined' ? homeCardsData : null);
    if (!data) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    container.innerHTML = '';

    data.forEach(card => {
        const cardLink = document.createElement('a');
        cardLink.className = 'grid-card-wrapper';
        cardLink.href = esc(card.link || '#');

        cardLink.innerHTML = `
            <div class="grid-card-visual">
              <img loading="lazy" alt="${escapeHtml(card.title)}" src="${escapeHtml(card.image)}">
            </div>
            <div class="grid-content-outside">
              <h3 class="card__title">
                ${escapeHtml(card.title)}
              </h3>
              <p class="card__excerpt">
                ${escapeHtml(card.excerpt)}
              </p>
              <span class="card__link">
                ${escapeHtml(card.linkText)}
              </span>
            </div>
        `;

        container.appendChild(cardLink);
    });
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('home-cards-container');
    if (container) {
        window.renderHomeCards(container);
    }
});
