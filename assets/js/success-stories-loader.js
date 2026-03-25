/**
 * Success Stories Loader
 * Dynamically generates the success stories grid.
 *
 * Exports:
 *   window.renderSuccessStories(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

var SUCCESS_STORY_CATEGORY_META = {
    'Environmental Monitoring': {
        subtitle: 'Real-time air, odor, noise, and weather monitoring systems for compliance and operational visibility.'
    },
    'Environmental Surveying': {
        subtitle: 'Comprehensive hydrographic and geophysical survey services.'
    },
    'Integrated Solutions': {
        subtitle: 'Integrated platforms that combine sensors, analytics, reporting, and decision support into one workflow.'
    },
    'Offshore Infrastructure': {
        subtitle: 'Marine and offshore systems designed for deployment support, long-term monitoring, and field operations.'
    }
};

/**
 * Renders the Success Stories
 * Exported as window.renderSuccessStories for SPA router usage.
 */
window.renderSuccessStories = function(container) {
    if (!container) container = document.getElementById('dynamic-success-stories');
    // Support both variable names
    const data = typeof SUCCESS_STORIES_DATA !== 'undefined' ? SUCCESS_STORIES_DATA : (typeof successStoriesData !== 'undefined' ? successStoriesData : null);
    if (!data || !container) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

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
        const categoryMeta = SUCCESS_STORY_CATEGORY_META[categoryName] || {
            subtitle: 'Selected projects showcasing Tridel expertise across marine, environmental, and engineering domains.'
        };

        let html = `
            <div class="container">
                <div class="section__header success-stories-category-header">
                    <h2 class="section__title success-stories-category-title">${escapeHtml(categoryName)}</h2>
                    <p class="section__subtitle success-stories-category-subtitle">${escapeHtml(categoryMeta.subtitle)}</p>
                </div>
                <div class="product-list-grid">
        `;

        stories.forEach(story => {
            html += `
                <div class="grid-card-wrapper success-story-card">
                    <div class="grid-content-outside success-story-card__content">
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
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dynamic-success-stories');
    if (container) {
        window.renderSuccessStories(container);
    }
});
