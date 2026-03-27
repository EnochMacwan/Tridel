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

function getServiceCategorySectionId(categoryName) {
    return 'service-category-' + String(categoryName || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getServiceDisplayName(service) {
    return String((service && (service.title || service.name)) || '').trim();
}

function getServiceGallery(service) {
    var rawGallery = Array.isArray(service && service.gallery) ? service.gallery : [];
    var sourceImages = rawGallery.length
        ? rawGallery
        : (service && service.image ? [service.image] : []);
    var seen = Object.create(null);
    var uniqueImages = [];

    sourceImages.forEach(function(image) {
        if (!image) return;

        var normalized = String(image).trim();
        if (!normalized) return;

        var dedupeKey = normalized.indexOf('data:') === 0
            ? normalized.slice(0, 128) + '::' + normalized.length
            : normalized.toLowerCase();

        if (seen[dedupeKey]) return;

        seen[dedupeKey] = true;
        uniqueImages.push(normalized);
    });

    return uniqueImages;
}

function getServicePrimaryImage(service) {
    var gallery = getServiceGallery(service);
    return gallery[0] || 'assets/images/logo/tridel.png';
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

function getServiceMegaMenuColumnMeta(columns, key, fallbackTitle, fallbackIcon) {
    var match = (columns || []).find(function (column) {
        return String(column.key || '').toLowerCase() === String(key || '').toLowerCase();
    });

    return {
        title: (match && match.title) || fallbackTitle,
        icon: (match && match.icon) || fallbackIcon
    };
}

function appendServiceMegaMenuLink(container, service, extraClass) {
    var link = document.createElement('a');
    link.href = service.link || '#/services';
    link.className = 'glass-link' + (extraClass ? ' ' + extraClass : '');
    link.dataset.title = getServiceDisplayName(service);
    link.dataset.desc = service.description || '';
    link.dataset.img = getServicePrimaryImage(service);
    link.innerHTML = escapeHtml(getServiceDisplayName(service));
    container.appendChild(link);
}

function appendServiceMegaMenuViewAll(container, href, label) {
    var link = document.createElement('a');
    link.href = href;
    link.className = 'glass-link glass-link--view-all';
    link.innerHTML = escapeHtml(label) + ' <i class="fas fa-arrow-right"></i>';
    container.appendChild(link);
}

function scrollToServicesSection(sectionId) {
    if (!sectionId) return;

    var target = document.getElementById(sectionId);
    if (!target) return;

    var headerOffset = 96;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function scheduleServicesSectionScroll(sectionId) {
    if (!sectionId) return;

    [160, 420, 900].forEach(function (delay) {
        window.setTimeout(function () {
            scrollToServicesSection(sectionId);
        }, delay);
    });
}

function attachServicesMegaHubInteractions(container) {
    var railItems = Array.from(container.querySelectorAll('.mega-hub__rail-item'));
    var panes = Array.from(container.querySelectorAll('.mega-hub__pane'));
    if (!railItems.length || !panes.length) return;

    function setPaneFeature(pane, source) {
        if (!pane || !source) return;
        var featureCard = pane.querySelector('.mega-hub__feature-card');
        if (!featureCard) return;

        var img = featureCard.querySelector('.mega-hub__feature-media img');
        var title = featureCard.querySelector('.mega-hub__feature-title');
        var link = featureCard.querySelector('.mega-hub__feature-link');
        var featureTitle = source.dataset.featureTitle || '';
        var featureHref = source.dataset.featureHref || '#/services';
        var featureImg = source.dataset.featureImg || '';

        if (img && featureImg) {
            img.src = featureImg;
            img.alt = featureTitle;
        }
        if (title) title.textContent = featureTitle;
        if (link) link.href = featureHref;
    }

    function resetPaneFeature(pane) {
        if (!pane) return;
        setPaneFeature(pane, pane);
    }

    function activatePanel(panelId) {
        railItems.forEach(function (item) {
            item.classList.toggle('is-active', item.dataset.panel === panelId);
            item.setAttribute('aria-selected', item.dataset.panel === panelId ? 'true' : 'false');
        });

        panes.forEach(function (pane) {
            var isActive = pane.dataset.panel === panelId;
            pane.classList.toggle('is-active', isActive);
            if (isActive) {
                resetPaneFeature(pane);
            }
        });
    }

    panes.forEach(function (pane) {
        var cards = Array.from(pane.querySelectorAll('.mega-hub__card'));
        cards.forEach(function (card) {
            ['mouseenter', 'focus'].forEach(function (eventName) {
                card.addEventListener(eventName, function () {
                    setPaneFeature(pane, card);
                });
            });
        });

        var grid = pane.querySelector('.mega-hub__grid');
        if (grid) {
            grid.addEventListener('mouseleave', function () {
                resetPaneFeature(pane);
            });
        }
    });

    railItems.forEach(function (item) {
        ['mouseenter', 'focus'].forEach(function (eventName) {
            item.addEventListener(eventName, function () {
                activatePanel(item.dataset.panel);
            });
        });

        item.addEventListener('click', function () {
            activatePanel(item.dataset.panel);
        });
    });

    activatePanel(railItems[0].dataset.panel);
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
    const columns = megaMenuConfig.columns;
    const groupedServices = {
        monitoring: data.filter(function (service) {
            return service.category === 'Environmental Monitoring' && !service.isNested;
        }),
        surveying: data.filter(function (service) {
            return service.category === 'Environmental Surveying' && !service.isNested;
        })
    };
    const monitoringMeta = getServiceMegaMenuColumnMeta(columns, 'Environmental Monitoring', 'Monitoring', 'fas fa-satellite-dish');
    const surveyingMeta = getServiceMegaMenuColumnMeta(columns, 'Environmental Surveying', 'Surveying', 'fas fa-map-marked-alt');
    const spotlightMatch = data.find(function (service) {
        return megaMenuConfig.spotlight &&
            (service.link === megaMenuConfig.spotlight.link || getServiceDisplayName(service) === megaMenuConfig.spotlight.title);
    });
    var featuredServices = [];
    [
        spotlightMatch,
        groupedServices.monitoring[0],
        groupedServices.monitoring[1],
        groupedServices.surveying[0],
        groupedServices.surveying[1]
    ].forEach(function (item) {
        if (!item) return;
        if (featuredServices.some(function (entry) { return getServiceDisplayName(entry) === getServiceDisplayName(item); })) return;
        featuredServices.push(item);
    });

    var panels = [
        {
            id: 'monitoring',
            label: monitoringMeta.title,
            title: monitoringMeta.title,
            description: 'Real-time and campaign-based monitoring services for air, water, groundwater, and acoustic environments.',
            items: groupedServices.monitoring,
            featureItem: groupedServices.monitoring[0],
            footerHref: '#/services?section=' + getServiceCategorySectionId('Environmental Monitoring'),
            footerLabel: 'Explore all monitoring'
        },
        {
            id: 'surveying',
            label: surveyingMeta.title,
            title: surveyingMeta.title,
            description: 'Hydrographic, geotechnical, and geoscience survey support for marine and coastal programs.',
            items: groupedServices.surveying,
            featureItem: groupedServices.surveying[0],
            footerHref: '#/services?section=' + getServiceCategorySectionId('Environmental Surveying'),
            footerLabel: 'Explore all surveying'
        }
    ];

    var railHtml = panels.map(function (panel) {
        return '<button type="button" class="mega-hub__rail-item" data-panel="' + panel.id + '" aria-selected="false">' + escapeHtml(panel.label) + '</button>';
    }).join('');

    var paneHtml = panels.map(function (panel) {
        var cards = panel.items.map(function (service) {
            return (
                '<a href="' + escapeHtml(service.link || '#/services') + '" class="mega-hub__card" data-feature-title="' + escapeHtml(getServiceDisplayName(service)) + '" data-feature-href="' + escapeHtml(service.link || '#/services') + '" data-feature-img="' + escapeHtml(getServicePrimaryImage(service)) + '">' +
                    '<div class="mega-hub__card-title">' + escapeHtml(getServiceDisplayName(service)) + '</div>' +
                '</a>'
            );
        }).join('');
        var featureItem = panel.featureItem || panel.items[0];
        var featureHtml = featureItem ? (
            '<aside class="mega-hub__feature-card">' +
                '<div class="mega-hub__feature-media">' +
                    '<img src="' + escapeHtml(getServicePrimaryImage(featureItem)) + '" alt="' + escapeHtml(getServiceDisplayName(featureItem)) + '">' +
                '</div>' +
                '<div class="mega-hub__feature-body">' +

                    '<div class="mega-hub__feature-title">' + escapeHtml(getServiceDisplayName(featureItem)) + '</div>' +
                    '<a href="' + escapeHtml(featureItem.link || '#/services') + '" class="mega-hub__feature-link">View details <i class="fas fa-arrow-right"></i></a>' +
                '</div>' +
            '</aside>'
        ) : '';

        return (
            '<section class="mega-hub__pane" data-panel="' + panel.id + '" data-feature-title="' + escapeHtml(featureItem ? getServiceDisplayName(featureItem) : '') + '" data-feature-href="' + escapeHtml(featureItem ? (featureItem.link || '#/services') : '#/services') + '" data-feature-img="' + escapeHtml(featureItem ? getServicePrimaryImage(featureItem) : '') + '">' +
                '<div class="mega-hub__heading-wrap">' +
                    '<h3 class="mega-hub__heading">' + escapeHtml(panel.title) + '</h3>' +
                    '<p class="mega-hub__description">' + escapeHtml(panel.description) + '</p>' +
                '</div>' +
                '<div class="mega-hub__body">' +
                    '<div class="mega-hub__grid">' + cards + '</div>' +
                    featureHtml +
                '</div>' +
                '<div class="mega-hub__pane-footer">' +
                    '<a href="' + escapeHtml(panel.footerHref) + '" class="mega-hub__footer-link">' + escapeHtml(panel.footerLabel) + ' <i class="fas fa-arrow-right"></i></a>' +
                '</div>' +
            '</section>'
        );
    }).join('');

    container.innerHTML =
        '<div class="mega-hub mega-hub--services">' +
            '<aside class="mega-hub__rail">' +
                '<div class="mega-hub__rail-list">' + railHtml + '</div>' +
                '<div class="mega-hub__rail-footer">' +
                    '<a href="#/services" class="mega-hub__rail-cta">View all services <i class="fas fa-arrow-right"></i></a>' +
                '</div>' +
            '</aside>' +
            '<div class="mega-hub__content">' + paneHtml + '</div>' +
        '</div>';

    attachServicesMegaHubInteractions(container);
};

/**
 * Renders the Services Page Grid
 * Exported as window.renderServicesGrid for SPA router usage.
 */
window.renderServicesGrid = function(container, targetSectionId) {
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
        sectionEl.id = getServiceCategorySectionId(section.category);

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
                        <img loading="lazy" alt="${escapeHtml(displayName)}" class="product-item__image product-image-style" src="${getServicePrimaryImage(item)}">
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
                            <img loading="lazy" alt="${escapeHtml(displayName)}" class="product-item__image product-image-style" src="${getServicePrimaryImage(item)}">
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

    scheduleServicesSectionScroll(targetSectionId);
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
