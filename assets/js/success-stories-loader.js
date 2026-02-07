document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dynamic-success-stories');
    
    // Support both variable names
    const data = typeof SUCCESS_STORIES_DATA !== 'undefined' ? SUCCESS_STORIES_DATA : (typeof successStoriesData !== 'undefined' ? successStoriesData : null);
    if (!data) {
        if (container) container.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:40px;">Content is currently unavailable. Please try again later.</p>';
        return;
    }
    if (!container) return;

    container.innerHTML = '';

    // Group by category
    const categories = {};
    data.forEach(story => {
        if (!categories[story.category]) {
            categories[story.category] = [];
        }
        categories[story.category].push(story);
    });

    // Render Categories
    for (const [categoryName, stories] of Object.entries(categories)) {
        const section = document.createElement('section');
        section.className = 'section product-category';
        
        let html = `
            <div class="container">
                <h2 class="product-category__title">${escapeHtml(categoryName)}</h2>
                <div class="product-list-grid">
        `;

        stories.forEach(story => {
            html += `
                <div class="grid-card-wrapper">
                    <div class="grid-card-visual">
                        <img loading="lazy" alt="${escapeHtml(story.title)}" class="story-card__image"
                            src="${story.image}">
                    </div>
                    <div class="grid-content-outside">
                        <h3 class="story-card__title">
                            ${escapeHtml(story.title)}
                        </h3>
                        <p>
                            ${escapeHtml(story.description)}
                        </p>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        section.innerHTML = html;
        container.appendChild(section);
    }
});
