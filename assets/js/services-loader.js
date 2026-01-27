/**
 * Services Loader
 * Dynamically generates:
 * 1. Mega Menu Content for Services (on all pages)
 * 2. Service Grid Content (on services.html)
 */

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


/**
 * Renders the Mega Menu Columns for Services
 */
function renderServicesMegaMenu(containerElement) { // Renamed to avoid conflict
    // Support both variable names
    const data = typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : (typeof servicesData !== 'undefined' ? servicesData : null);
    if (!data) return;

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


    // Clear loading text (only clears the list area, not the spotlight)
    container.innerHTML = '';

    // Order: Monitoring -> Surveying -> Geoscience
    /* 
       Note: We are NOT generating the Spotlight dynamically anymore. 
       It is statically hardcoded in index.html to ensure visibility.
    */
    const categories = [
        "Environmental Monitoring",
        "Environmental Surveying"
    ];

    categories.forEach(catName => {
        const catData = data.filter(s => s.category === catName);
        if (catData.length === 0) return;

        const colDiv = document.createElement('div');
        colDiv.className = 'glass-col';
        
        // Category Header
        const h4 = document.createElement('h4');
        h4.innerHTML = getIconForCategory(catName) + ' ' + catName; 
        colDiv.appendChild(h4);

        // Separate services: without subcategory first, then grouped by subcategory
        const mainServices = catData.filter(s => !s.subcategory);
        const subcategories = [...new Set(catData.filter(s => s.subcategory).map(s => s.subcategory))];

        // Render main services (no subcategory)
        mainServices.forEach(service => {
            const a = document.createElement('a');
            a.className = 'glass-link';
            a.href = service.link || '#';
            a.textContent = service.name;
            a.dataset.title = service.name;
            a.dataset.desc = service.description;
            a.dataset.img = service.image;
            colDiv.appendChild(a);
        });

        // Render subcategories with their services
        subcategories.forEach(subcat => {
            // Subcategory header
            const subHeader = document.createElement('h5');
            subHeader.className = 'glass-subheader';
            subHeader.innerHTML = '<i class="fas fa-globe-americas"></i> ' + subcat;
            colDiv.appendChild(subHeader);

            // Subcategory services
            const subServices = catData.filter(s => s.subcategory === subcat);
            subServices.forEach(service => {
                const a = document.createElement('a');
                a.className = 'glass-link glass-link--sub';
                a.href = service.link || '#';
                a.textContent = service.name;
                a.dataset.title = service.name;
                a.dataset.desc = service.description;
                a.dataset.img = service.image;
                colDiv.appendChild(a);
            });
        });

        // Append Column to the Dynamic Wrapper
        container.appendChild(colDiv);
    });
    

    
    // --- Dynamic Spotlight Generation (Restored) ---
    // Uses 'featuredService' from services-data.js
    if (typeof featuredService !== 'undefined') {
        const spotlight = document.createElement('div');
        spotlight.className = 'glass-spotlight';
        // Inherits CSS fixes (position: static, etc) from .mm-services .glass-spotlight
        
        spotlight.innerHTML = `
            <div class="spotlight-content">
                <span class="spotlight-tag">${featuredService.tag}</span>
                <h3 class="spotlight-title">${featuredService.title}</h3>
                <p class="spotlight-desc">${featuredService.description}</p>
                <a href="${featuredService.link}" class="spotlight-btn">
                    ${featuredService.buttonText} <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="spotlight-image">
                <img src="${featuredService.image}" alt="${featuredService.title}">
            </div>
        `;
        
        container.appendChild(spotlight);
    } else {
        console.warn("Featured Service data missing for Spotlight");
    }

    console.log("Services Menu Loaded (Dynamic)");

    // Attach Hover Effects
    attachServicesHoverEffects(container);
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
 * Renders the Services Page Grid
 */
function renderServicesPage(container) {
    // Support both variable names
    const data = typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : (typeof servicesData !== 'undefined' ? servicesData : null);
    if (!data) return;
    
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

        // Get all items for this category
        const items = data.filter(s => s.category === section.category);
        
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
                <a href="${item.link}" class="product-grid-wrapper" style="text-decoration:none; color:inherit;">
                    <div class="product-card-visual">
                        <img loading="lazy" alt="${item.name}" class="product-item__image product-image-style" src="${item.image}">
                    </div>
                    <div class="product-content-outside">
                        <h4>${item.name}</h4>
                        <p class="product-item__excerpt">${item.description}</p>
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
                <div class="section__subheader" style="margin-top: 3rem;">
                    <h3 class="section__subtitle" style="font-size: 1.5rem; font-weight: 600; color: var(--color-accent, #00aae7); margin-bottom: 1rem;">
                        <i class="fas fa-globe-americas"></i> ${subcat}
                    </h3>
                </div>
                <div class="product-list-grid">
            `;

            subItems.forEach(item => {
                sectionContent += `
                    <a href="${item.link}" class="product-grid-wrapper" style="text-decoration:none; color:inherit;">
                        <div class="product-card-visual">
                            <img loading="lazy" alt="${item.name}" class="product-item__image product-image-style" src="${item.image}">
                        </div>
                        <div class="product-content-outside">
                            <h4>${item.name}</h4>
                            <p class="product-item__excerpt">${item.description}</p>
                            <span class="button button--secondary">View Details</span>
                        </div>
                    </a>
                `;
            });

            sectionContent += `
                </div>
            `;
        });

        sectionContent += `
            </div>
        `;

        sectionEl.innerHTML = sectionContent;
        container.appendChild(sectionEl);
    });
}

// --- Initialization Logic (Appended) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Mega Menu (Home Page)
    const mmContainer = document.getElementById('services-dynamic-content');
    if (mmContainer) {
        renderServicesMegaMenu(mmContainer);
        console.log('Initializing Services Mega Menu...');
    }

    // 2. Initialize Services Page Grid
    const pageContainer = document.getElementById('dynamic-services-container');
    if (pageContainer) {
        renderServicesPage(pageContainer);
        console.log('Initializing Services Page Grid...');
    }
});
