/**
 * Products Loader
 * Dynamically generates:
 * 1. Mega Menu Content for Products (on all pages)
 * 2. Product Grid Content (on products.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Mega Menu
    const megaMenuContainer = document.querySelector('.mm-products');
    if (megaMenuContainer) {
        renderMegaMenu(megaMenuContainer);
    }

    // 2. Load Products Page Grid
    // We look for specific section containers to inject into.
    // However, existing HTML structure separates "Platforms", "Software", "Solutions".
    // We will target specific IDs if they exist, or build a unified grid if we refactor.
    // For now, let's look for a unified container OR separate ones if we change products.html
    const productListContainer = document.getElementById('dynamic-products-container');
    if (productListContainer) {
        renderProductsPage(productListContainer);
    }
});

/**
 * Renders the Mega Menu Columns
 */
function renderMegaMenu(container) {
    // Support both variable names
    const data = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : (typeof productsData !== 'undefined' ? productsData : null);
    if (!data) return;

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
            
            let html = item.name;
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
                <span class="spotlight-tag">${featuredProduct.tag}</span>
                <h3>${featuredProduct.title}</h3>
                <p>${featuredProduct.description}</p>
                <a href="${featuredProduct.link}" class="spotlight-btn">${featuredProduct.buttonText} <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="spotlight-image">
                <img src="${featuredProduct.image}" alt="${featuredProduct.title}">
            </div>
        `;
        container.appendChild(spotlight);
    }
}

/**
 * Renders the Products Page Grid
 * This assumes we replace the complex sections in products.html with a single dynamic container
 * and valid sub-containers for sections.
 */
function renderProductsPage(container) {
    // Support both variable names
    const data = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : (typeof productsData !== 'undefined' ? productsData : null);
    if (!data) return;
    
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
                    <a href="${item.link}" class="product-grid-wrapper" style="text-decoration: none; color: inherit;">
                        <div class="product-card-visual">
                            <img loading="lazy" alt="${item.name}" class="product-item__image" src="${item.image}">
                        </div>
                        <div class="product-content-outside">
                            <h4>${item.name}</h4>
                            <p class="product-item__excerpt">${item.description}</p>
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
}

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
