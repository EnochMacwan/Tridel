/**
 * Home Cards Loader
 * Dynamically generates the grid cards on the home page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('home-cards-container');
    if (container) {
        renderHomeCards(container);
    }
});

function renderHomeCards(container) {
    // Support both variable names
    const data = typeof HOME_CARDS_DATA !== 'undefined' ? HOME_CARDS_DATA : (typeof homeCardsData !== 'undefined' ? homeCardsData : null);
    if (!data) return;

    container.innerHTML = '';
    
    data.forEach(card => {
        const cardLink = document.createElement('a');
        cardLink.className = 'grid-card-wrapper';
        cardLink.href = card.link || '#';
        
        cardLink.innerHTML = `
            <div class="grid-card-visual">
              <img loading="lazy" alt="${card.title}" src="${card.image}">
            </div>
            <div class="grid-content-outside">
              <h3 class="card__title">
                ${card.title}
              </h3>
              <p class="card__excerpt">
                ${card.excerpt}
              </p>
              <span class="card__link">
                ${card.linkText}
              </span>
            </div>
        `;
        
        container.appendChild(cardLink);
    });
}
