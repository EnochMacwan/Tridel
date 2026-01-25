document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dynamic-success-stories');
    if (!container || typeof successStoriesData === 'undefined') return;

    container.innerHTML = '';

    // Group by category
    const categories = {};
    successStoriesData.forEach(story => {
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
                <h2 class="product-category__title">${categoryName}</h2>
                <div class="product-list-grid">
        `;

        stories.forEach(story => {
            html += `
                <div class="grid-card-wrapper">
                    <div class="grid-card-visual">
                        <img loading="lazy" alt="${story.title}" class="story-card__image"
                            src="${story.image}">
                    </div>
                    <div class="grid-content-outside">
                        <h3 class="story-card__title">
                            ${story.title}
                        </h3>
                        <p>
                            ${story.description}
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
