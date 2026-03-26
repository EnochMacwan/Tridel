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
var SERVICES_LIST_STATE_KEY = 'tridel.servicesListState';

function getServiceDisplayName(service) {
    return String((service && (service.title || service.name)) || '').trim();
}

function normalizeServiceMegaMenuIcon(iconClass, fallbackIcon) {
    var icon = String(iconClass || '').trim();
    if (!icon) return fallbackIcon;
    if (/\bfa[srlbd]\b/.test(icon)) return icon;
    if (icon.indexOf('fa-') !== -1) return 'fas ' + icon;
    return fallbackIcon;
}

function getServicesMegaMenuConfig() {
    var defaults = {
        columns: [
            { key: 'Environmental Monitoring', title: 'Environmental Monitoring', icon: 'fas fa-satellite-dish', excludeSubcategories: [] },
            { key: 'Environmental Surveying', title: 'Environmental Surveying', icon: 'fas fa-map-marked-alt', excludeSubcategories: ['Geoscience Studies'] }
        ],
        spotlight: typeof featuredService !== 'undefined' ? featuredService : {
            tag: 'Featured',
            title: 'Comprehensive Solutions',
            description: 'End-to-end expertise from feasibility to real-time monitoring.',
            link: '#/services',
            buttonText: 'Learn More',
            image: 'assets/images/services/port-monitoring.png'
        }
    };
    var rootConfig = typeof MEGA_MENU_CONFIG !== 'undefined' ? MEGA_MENU_CONFIG : (window.MEGA_MENU_CONFIG || {});
    var source = rootConfig && rootConfig.services ? rootConfig.services : {};
    var defaultColumnsByKey = {};

    defaults.columns.forEach(function (column) {
        defaultColumnsByKey[column.key] = column;
    });

    var columns = Array.isArray(source.columns) && source.columns.length
        ? source.columns.map(function (column, index) {
            var fallback = defaultColumnsByKey[column.key] || defaults.columns[index] || {};
            return Object.assign({}, fallback, column, {
                key: column.key || fallback.key || '',
                title: column.title || fallback.title || column.key || '',
                icon: normalizeServiceMegaMenuIcon(column.icon, fallback.icon || 'fas fa-cube')
            });
        })
        : defaults.columns;

    return {
        columns: columns,
        spotlight: Object.assign({}, defaults.spotlight, source.spotlight || {})
    };
}

function saveServicesListState() {
    var hash = window.location.hash || '#/services';
    if (!hash || hash.indexOf('#/services') !== 0 || hash.indexOf('#/services/detail') === 0) return;

    var state = {
        hash: hash,
        scrollY: window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    };

    try {
        sessionStorage.setItem(SERVICES_LIST_STATE_KEY, JSON.stringify(state));
    } catch (e) {
        // Ignore sessionStorage issues
    }
}

function readServicesListState() {
    try {
        var raw = sessionStorage.getItem(SERVICES_LIST_STATE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

window.saveServicesListState = saveServicesListState;

window.restoreServicesListState = function() {
    var state = readServicesListState();
    if (!state || typeof state.scrollY !== 'number') return false;

    function restoreScroll() {
        if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
            window.__lenis.scrollTo(state.scrollY, { immediate: true, force: true });
        } else {
            window.scrollTo({ top: state.scrollY, behavior: 'auto' });
        }
    }

    [120, 260, 520].forEach(function(delay) {
        window.setTimeout(restoreScroll, delay);
    });

    try {
        sessionStorage.removeItem(SERVICES_LIST_STATE_KEY);
    } catch (e) {
        // Ignore sessionStorage issues
    }

    return true;
};

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
    const megaMenuConfig = getServicesMegaMenuConfig();

    megaMenuConfig.columns.forEach(function (column) {
        const col = document.createElement('div');
        const excludedSubcategories = Array.isArray(column.excludeSubcategories) ? column.excludeSubcategories : [];
        const items = data.filter(function (service) {
            return service.category === column.key &&
                !service.isNested &&
                excludedSubcategories.indexOf(service.subcategory) === -1;
        });

        col.className = 'glass-col';
        col.innerHTML = `<h4><i class="${column.icon}"></i> ${column.title}</h4>`;
        items.forEach(function (service) {
            var displayName = getServiceDisplayName(service);
            col.innerHTML += `<a href="${service.link}" class="glass-link" data-title="${escapeHtml(displayName)}" data-desc="${escapeHtml(service.description)}" data-img="${escapeHtml(service.image)}">${escapeHtml(displayName)}</a>`;
        });
        container.appendChild(col);
    });

    if (megaMenuConfig.spotlight) {
        const spotlightData = megaMenuConfig.spotlight;
        const spotlight = document.createElement('div');
        spotlight.className = 'glass-spotlight';
        spotlight.innerHTML = `
            <div class="spotlight-content">
                <span class="spotlight-tag">${escapeHtml(spotlightData.tag)}</span>
                <h3 class="spotlight-title">${escapeHtml(spotlightData.title)}</h3>
                <p class="spotlight-desc">${escapeHtml(spotlightData.description)}</p>
                <a href="${spotlightData.link}" class="spotlight-btn">
                    ${escapeHtml(spotlightData.buttonText)} <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="spotlight-image">
                <img src="${spotlightData.image}" alt="${escapeHtml(spotlightData.title)}">
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
            var displayName = getServiceDisplayName(item);
            sectionContent += `
                <a href="${item.link}" class="product-grid-wrapper" aria-label="View details about ${escapeHtml(displayName)}">
                    <div class="product-card-visual">
                        <img loading="lazy" alt="${escapeHtml(displayName)}" class="product-item__image product-image-style" src="${item.image}">
                    </div>
                    <div class="product-content-outside">
                        <h4>${escapeHtml(displayName)}</h4>
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
                var displayName = getServiceDisplayName(item);
                sectionContent += `
                    <a href="${item.link}" class="product-grid-wrapper" aria-label="View details about ${escapeHtml(displayName)}">
                        <div class="product-card-visual">
                            <img loading="lazy" alt="${escapeHtml(displayName)}" class="product-item__image product-image-style" src="${item.image}">
                        </div>
                        <div class="product-content-outside">
                            <h4>${escapeHtml(displayName)}</h4>
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
