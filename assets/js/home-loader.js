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
    if (typeof homeCardsData === 'undefined') return;

    container.innerHTML = '';
    
    homeCardsData.forEach(card => {
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
