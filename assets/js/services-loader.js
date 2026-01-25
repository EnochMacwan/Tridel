/**
 * Services Loader
 * Dynamically generates:
 * 1. Mega Menu Content for Services (on all pages)
 * 2. Service Grid Content (on services.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Mega Menu
    const megaMenuContainer = document.querySelector('.mm-services');
    if (megaMenuContainer) {
        renderServicesMegaMenu(megaMenuContainer);
    }

    // 2. Load Services Page Grid
    const serviceListContainer = document.getElementById('dynamic-services-container');
    if (serviceListContainer) {
        renderServicesPage(serviceListContainer);
    }
});

/**
 * Renders the Mega Menu Columns for Services
 */
function renderServicesMegaMenu(container) {
    if (typeof servicesData === 'undefined') return;

    container.innerHTML = ''; // Clear existing

    // Define Columns
    const columns = [
        { title: 'Environmental Monitoring', icon: 'fas fa-satellite-dish', category: 'Environmental Monitoring' },
        { title: 'Environmental Surveying', icon: 'fas fa-map-marked-alt', category: 'Environmental Surveying' },
        { title: 'Geoscience Studies', icon: 'fas fa-globe-americas', category: 'Geoscience Studies' }
    ];

    columns.forEach(col => {
        const colDiv = document.createElement('div');
        colDiv.className = 'glass-col';
        colDiv.innerHTML = `<h4><i class="${col.icon}"></i> ${col.title}</h4>`;

        const items = servicesData.filter(s => s.category === col.category);
        
        items.forEach(item => {
            const link = document.createElement('a');
            link.href = item.link;
            link.className = 'glass-link';
            link.dataset.title = item.name;
            link.dataset.desc = item.description;
            link.dataset.img = item.image;
            link.textContent = item.name;
            colDiv.appendChild(link);
        });

        container.appendChild(colDiv);
    });

    // Spotlight Card (Column 3)
    // We can define a featured service in services-data.js or hardcode it fallback
    if (typeof featuredService !== 'undefined') {
        const spotlight = document.createElement('div');
        spotlight.className = 'glass-spotlight';
        spotlight.innerHTML = `
            <div class="spotlight-content">
                <span class="spotlight-tag">${featuredService.tag}</span>
                <h3>${featuredService.title}</h3>
                <p>${featuredService.description}</p>
                <a href="${featuredService.link}" class="spotlight-btn">${featuredService.buttonText} <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="spotlight-image">
                <img src="${featuredService.image}" alt="${featuredService.title}">
            </div>
        `;
        container.appendChild(spotlight);
    }

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
    if (typeof servicesData === 'undefined') return;
    
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
        },
        { 
            title: 'Geoscience Studies', 
            subtitle: 'Comprehensive geological and geophysical studies.',
            category: 'Geoscience Studies', 
            bgClass: 'section--light-bg' // Light bg
        }
    ];

    sections.forEach((section, index) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = `section ${section.bgClass || ''}`;

        let sectionContent = `
            <div class="container">
                <div class="section__header">
                    <h2 class="section__title">${section.title}</h2>
                    <p class="section__subtitle">${section.subtitle}</p>
                </div>
                <div class="product-list-grid">
        `;

        const items = servicesData.filter(s => s.category === section.category);
        
        items.forEach(item => {
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
            </div>
        `;

        sectionEl.innerHTML = sectionContent;
        container.appendChild(sectionEl);
    });
}
