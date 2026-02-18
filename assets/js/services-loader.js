/**
 * Services Loader
 * Dynamically generates:
 * 1. Mega Menu Content for Services (on all pages)
 * 2. Service Grid Content (on services.html)
 *
 * Exports:
 *   window.renderServicesMegaMenu(container)
 *   window.renderServicesGrid(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/**
 * Helper: Get Icon Class for Category
 */
function getIconForCategory(category) {
    const icons = {
        'Environmental Monitoring': 'fas fa-satellite-dish',
        'Environmental Surveying': 'fas fa-map-marked-alt'
    };
    return `<i class="${icons[category] || 'fas fa-cube'}"></i>`;
}

function attachServicesHoverEffects(container) {
    const glassLinks = container.querySelectorAll('.glass-link');
    const spotlight = container.querySelector('.glass-spotlight');
    if (!spotlight) return;

    const imgEl = spotlight.querySelector('img');
    const titleEl = spotlight.querySelector('h3');
    const descEl = spotlight.querySelector('p');
    const btnEl = spotlight.querySelector('.spotlight-btn');

    let updateTimeout;

    glassLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const title = link.dataset.title;
            const desc = link.dataset.desc;
            const img = link.dataset.img;
            const href = link.getAttribute('href');

            // 1. Fade out content slightly
            spotlight.style.opacity = '0.9';
            if (imgEl) imgEl.style.transform = 'scale(0.98)';

            // 2. Change content after short delay
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                if (imgEl && img) imgEl.src = img;
                if (titleEl && title) titleEl.textContent = title;
                if (descEl && desc) descEl.textContent = desc;
                if (btnEl) btnEl.href = href;

                // 3. Fade in and pop
                spotlight.style.opacity = '1';
                if (imgEl) imgEl.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

/**
 * Renders the Mega Menu Columns for Services
 * Exported as window.renderServicesMegaMenu for SPA router usage.
 */
window.renderServicesMegaMenu = function(containerElement) {
    // Support both variable names
    const data = typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : (typeof servicesData !== 'undefined' ? servicesData : null);
    if (!data) {
        if (containerElement) containerElement.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    // 1. First try to find the specific wrapper by ID (preferred)
    // 2. If not found, fallback to the main .mm-services container class
    // 3. If neither found, log error and exit
    let container = containerElement || document.getElementById('services-dynamic-content');

    if (!container) {
        // Fallback: Find any .mm-services container
        container = document.querySelector('.mm-services');
    }

    // Safety check: if nothing found, error
    if (!container) {
        console.error("Services Loader: No services mega menu container found!");
        return;
    }


    container.innerHTML = '';

    // Define Columns with Filter (!s.isNested)
    const columns = {
        'Environmental Monitoring': data.filter(s => s.category === 'Environmental Monitoring' && !s.isNested),
        'Environmental Surveying': data.filter(s => s.category === 'Environmental Surveying' && s.subcategory !== 'Geoscience Studies' && !s.isNested)
    };

    // 1. Environmental Monitoring
    const col1 = document.createElement('div');
    col1.className = 'glass-col';
    col1.innerHTML = `<h4>${getIconForCategory('Environmental Monitoring')} Environmental Monitoring</h4>`;
    columns['Environmental Monitoring'].forEach(s => {
        col1.innerHTML += `<a href="${s.link}" class="glass-link" data-title="${escapeHtml(s.name)}" data-desc="${escapeHtml(s.description)}" data-img="${escapeHtml(s.image)}">${escapeHtml(s.name)}</a>`;
    });
    container.appendChild(col1);

    // 2. Environmental Surveying
    const col2 = document.createElement('div');
    col2.className = 'glass-col';
    col2.innerHTML = `<h4>${getIconForCategory('Environmental Surveying')} Environmental Surveying</h4>`;
    columns['Environmental Surveying'].forEach(s => {
        col2.innerHTML += `<a href="${s.link}" class="glass-link" data-title="${escapeHtml(s.name)}" data-desc="${escapeHtml(s.description)}" data-img="${escapeHtml(s.image)}">${escapeHtml(s.name)}</a>`;
    });
    container.appendChild(col2);

    // Spotlight Card (Column 4)
    if (typeof featuredService !== 'undefined') {
        const spotlight = document.createElement('div');
        spotlight.className = 'glass-spotlight';
        spotlight.innerHTML = `
            <div class="spotlight-content">
                <span class="spotlight-tag">${escapeHtml(featuredService.tag)}</span>
                <h3 class="spotlight-title">${escapeHtml(featuredService.title)}</h3>
                <p class="spotlight-desc">${escapeHtml(featuredService.description)}</p>
                <a href="${featuredService.link}" class="spotlight-btn">
                    ${escapeHtml(featuredService.buttonText)} <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="spotlight-image">
                <img src="${featuredService.image}" alt="${escapeHtml(featuredService.title)}">
            </div>
        `;
        container.appendChild(spotlight);
    }

    // Attach Hover Effects
    attachServicesHoverEffects(container);

    // Initialize glass card hover effects
    if (typeof window.initGlassCards === 'function') {
        window.initGlassCards();
    }
};

/**
 * Renders the Services Page Grid
 * Exported as window.renderServicesGrid for SPA router usage.
 */
window.renderServicesGrid = function(container) {
    if (!container) container = document.getElementById('dynamic-services-container');
    // Support both variable names
    const data = typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : (typeof servicesData !== 'undefined' ? servicesData : null);
    if (!data) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    container.innerHTML = '';

    const sections = [
        {
            title: 'Environmental Monitoring',
            subtitle: 'Advanced data collection and analysis for marine and coastal environments.',
            category: 'Environmental Monitoring',
            bgClass: 'section--light-bg'
        },
        {
            title: 'Environmental Surveying',
            subtitle: 'Comprehensive hydrographic and geophysical survey services.',
            category: 'Environmental Surveying',
            bgClass: 'section' // White bg
        }
    ];

    sections.forEach((section, index) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = `section ${section.bgClass || ''}`;

        // Get all items for this category, excluding nested items
        const items = data.filter(s => s.category === section.category && !s.isNested);

        // Separate: main services first, then grouped by subcategory
        const mainItems = items.filter(s => !s.subcategory);
        const subcategories = [...new Set(items.filter(s => s.subcategory).map(s => s.subcategory))];

        let sectionContent = `
            <div class="container">
                <div class="section__header">
                    <h2 class="section__title">${section.title}</h2>
                    <p class="section__subtitle">${section.subtitle}</p>
                </div>
                <div class="product-list-grid">
        `;

        // Render main services (without subcategory)
        mainItems.forEach(item => {
            sectionContent += `
                <a href="${item.link}" class="product-grid-wrapper" aria-label="View details about ${escapeHtml(item.name)}">
                    <div class="product-card-visual">
                        <img loading="lazy" alt="${escapeHtml(item.name)}" class="product-item__image product-image-style" src="${item.image}">
                    </div>
                    <div class="product-content-outside">
                        <h4>${escapeHtml(item.name)}</h4>
                        <p class="product-item__excerpt">${escapeHtml(item.description)}</p>
                        <span class="button button--secondary">View Details</span>
                    </div>
                </a>
            `;
        });

        sectionContent += `
                </div>
        `;

        // Render subcategories with their services
        subcategories.forEach(subcat => {
            const subItems = items.filter(s => s.subcategory === subcat);

            sectionContent += `
                <div class="product-category">
                    <h3 class="product-category__title">
                        <i class="fas fa-globe-americas"></i> ${subcat}
                    </h3>
                    <div class="product-list-grid">
            `;

            subItems.forEach(item => {
                sectionContent += `
                    <a href="${item.link}" class="product-grid-wrapper" aria-label="View details about ${escapeHtml(item.name)}">
                        <div class="product-card-visual">
                            <img loading="lazy" alt="${escapeHtml(item.name)}" class="product-item__image product-image-style" src="${item.image}">
                        </div>
                        <div class="product-content-outside">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p class="product-item__excerpt">${escapeHtml(item.description)}</p>
                            <span class="button button--secondary">View Details</span>
                        </div>
                    </a>
                `;
            });

            sectionContent += `
                    </div>
                </div>
            `;
        });

        sectionContent += `
            </div>
        `;

        sectionEl.innerHTML = sectionContent;
        container.appendChild(sectionEl);
    });
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Mega Menu (Home Page)
    const mmContainer = document.getElementById('services-dynamic-content');
    if (mmContainer) {
        window.renderServicesMegaMenu(mmContainer);
    }

    // 2. Initialize Services Page Grid
    const pageContainer = document.getElementById('dynamic-services-container');
    if (pageContainer) {
        window.renderServicesGrid(pageContainer);
    }
});
