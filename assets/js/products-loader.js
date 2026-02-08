/**
 * Products Loader
 * Dynamically generates:
 * 1. Mega Menu Content for Products (on all pages)
 * 2. Product Grid Content (on products.html)
 *
 * Exports:
 *   window.renderProductsMegaMenu(container)
 *   window.renderProductsGrid(container)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/**
 * Helper: Get Icon for Product Category
 */
function getIconForProductCategory(category) {
    const icons = {
        'buoys': 'fas fa-life-ring',
        'vessels': 'fas fa-ship',
        'equipment': 'fas fa-screwdriver-wrench',
        'software': 'fas fa-laptop-code',
        'integrated solutions': 'fas fa-layer-group'
    };
    return `<i class="${icons[category.toLowerCase()] || 'fas fa-cube'}"></i>`;
}

/**
 * Renders the Mega Menu Columns
 * Exported as window.renderProductsMegaMenu for SPA router usage.
 */
window.renderProductsMegaMenu = function(container) {
    // Support both variable names
    const data = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : (typeof productsData !== 'undefined' ? productsData : null);
    if (!data) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    container.innerHTML = ''; // Clear existing

    // Define Columns
    const columns = [
        { title: 'Buoys', icon: 'fas fa-life-ring', category: 'Buoys' },
        { title: 'Vessels', icon: 'fas fa-ship', category: 'Vessels' },
        { title: 'Equipment', icon: 'fas fa-screwdriver-wrench', category: 'Equipment' },
        { title: 'Software', icon: 'fas fa-laptop-code', category: 'Software' },
        { title: 'Integrated Solutions', icon: 'fas fa-layer-group', category: 'Integrated Solutions' }
    ];

    // Build 5 Columns
    columns.forEach(col => {
        const colDiv = document.createElement('div');
        colDiv.className = 'glass-col';

        // Header
        colDiv.innerHTML = `<h4><i class="${col.icon}"></i> ${col.title}</h4>`;

        // Items - Case Insensitive Comparison, filtering out nested items
        const items = data.filter(p => p.category.toLowerCase() === col.category.toLowerCase() && !p.isNested);

        // Limit items in menu if too many? (Optional, currently showing all)
        items.forEach(item => {
            const link = document.createElement('a');
            link.href = item.link;
            link.className = 'glass-link';
            link.dataset.title = item.name;
            link.dataset.desc = item.description;
            link.dataset.img = item.image;

            let html = escapeHtml(item.name);
            if (item.isNew) {
                html += ` <span class="badge-new">New</span>`;
            }
            link.innerHTML = html;
            colDiv.appendChild(link);
        });

        container.appendChild(colDiv);
    });

    // Spotlight Card (Column 6)
    if (typeof featuredProduct !== 'undefined') {
        const spotlight = document.createElement('div');
        spotlight.className = 'glass-spotlight';
        spotlight.innerHTML = `
            <div class="spotlight-content">
                <span class="spotlight-tag">${escapeHtml(featuredProduct.tag)}</span>
                <h3>${escapeHtml(featuredProduct.title)}</h3>
                <p>${escapeHtml(featuredProduct.description)}</p>
                <a href="${featuredProduct.link}" class="spotlight-btn">${escapeHtml(featuredProduct.buttonText)} <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="spotlight-image">
                <img src="${featuredProduct.image}" alt="${escapeHtml(featuredProduct.title)}">
            </div>
        `;
        container.appendChild(spotlight);
    }

    // Initialize glass card hover effects
    if (typeof window.initGlassCards === 'function') {
        window.initGlassCards();
    }
};

/**
 * Renders the Products Page Grid
 * Exported as window.renderProductsGrid for SPA router usage.
 */
window.renderProductsGrid = function(container) {
    if (!container) container = document.getElementById('dynamic-products-container');
    // Support both variable names
    const data = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : (typeof productsData !== 'undefined' ? productsData : null);
    if (!data) {
        if (container) container.innerHTML = '<p class="empty-state">Content is currently unavailable. Please try again later.</p>';
        return;
    }

    container.innerHTML = '';

    // Define Sections corresponding to the page layout
    const sections = [
        {
            title: 'Survey & Monitoring Platforms',
            subtitle: 'Robust hardware solutions engineering for the marine environment.',
            categories: ['Buoys', 'Vessels', 'Equipment'] // Grouping hardware
        },
        {
            title: 'Survey & Monitoring Softwares',
            subtitle: 'Advanced software platforms for data management and analysis.',
            categories: ['Software']
        },
        {
            title: 'Integrated Solutions',
            subtitle: 'Comprehensive solutions for environmental and operational intelligence.',
            categories: ['Integrated Solutions']
        }
    ];

    sections.forEach((section, index) => {
        // Create Section HTML
        const sectionEl = document.createElement('section');
        sectionEl.className = index % 2 === 0 ? 'section section--light-bg' : 'section'; // Alternate/Check ID styling
        // Note: products.html used section--light-bg for first, white for second, etc.
        // Let's mimic specific IDs if needed, but generic classes are safer.
        if (section.title === 'Integrated Solutions') sectionEl.id = 'integrated-solutions';

        let sectionContent = `
            <div class="container">
                <div class="section__header">
                    <h2 class="section__title">${section.title}</h2>
                    <p class="section__subtitle">${section.subtitle}</p>
                </div>
        `;

        // Loop through categories in this section
        section.categories.forEach(catName => {
            // Find items - Case Insensitive
            const items = data.filter(p => p.category.toLowerCase() === catName.toLowerCase());
            if (items.length === 0) return;

            // Check if we need a subsection header (like "Buoys", "Vessels")
            // Only show sub-header if there are multiple categories in this section OR it's explicit
            // In the original file, "Buoys", "Vessels", "Winches" had headers.
            // "Software" categories didn't have sub-headers, just a grid.

            const showSubSelect = section.categories.length > 1;

            sectionContent += `<div class="product-category">`;

            if (showSubSelect) {
                sectionContent += `<h3 class="product-category__title">${getIconForProductCategory(catName)} ${catName}</h3>`;
            }

            sectionContent += `<div class="product-list-grid">`;

            items.forEach(item => {
                sectionContent += `
                    <a href="${item.link}" class="product-grid-wrapper" aria-label="View details about ${escapeHtml(item.name)}">
                        <div class="product-card-visual">
                            <img loading="lazy" alt="${escapeHtml(item.name)}" class="product-item__image" src="${item.image}">
                        </div>
                        <div class="product-content-outside">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p class="product-item__excerpt">${escapeHtml(item.description)}</p>
                            <span class="button button--secondary">View Details</span>
                        </div>
                    </a>
                `;
            });

            sectionContent += `</div></div>`; // End grid and category
        });

        sectionContent += `</div>`; // End container
        sectionEl.innerHTML = sectionContent;
        container.appendChild(sectionEl);
    });
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Mega Menu
    const megaMenuContainer = document.querySelector('.mm-products');
    if (megaMenuContainer) {
        window.renderProductsMegaMenu(megaMenuContainer);
    }

    // 2. Load Products Page Grid
    const productListContainer = document.getElementById('dynamic-products-container');
    if (productListContainer) {
        window.renderProductsGrid(productListContainer);
    }
});
