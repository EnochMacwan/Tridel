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
var PRODUCTS_LIST_STATE_KEY = 'tridel.productsListState';

function getProductCategorySectionId(categoryName) {
    return 'product-category-' + String(categoryName || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeProductMegaMenuIcon(iconClass, fallbackIcon) {
    var icon = String(iconClass || '').trim();
    if (!icon) return fallbackIcon;
    if (/\bfa[srlbd]\b/.test(icon)) return icon;
    if (icon.indexOf('fa-') !== -1) return 'fas ' + icon;
    return fallbackIcon;
}

function getProductsMegaMenuConfig() {
    var defaults = {
        columns: [
            { key: 'Buoys', title: 'Buoys', icon: 'fas fa-life-ring' },
            { key: 'Vessels', title: 'Vessels', icon: 'fas fa-ship' },
            { key: 'Equipment', title: 'Equipment', icon: 'fas fa-screwdriver-wrench' },
            { key: 'Software', title: 'Software', icon: 'fas fa-laptop-code' },
            { key: 'Integrated Solutions', title: 'Integrated Solutions', icon: 'fas fa-layer-group' }
        ],
        spotlight: typeof featuredProduct !== 'undefined' ? featuredProduct : {
            tag: 'Featured',
            title: 'Tridel Aquilon 8000',
            description: 'Our flagship carbon fiber USV for advanced autonomous hydrographic surveys.',
            link: '#/products/detail?id=aquilon-8000',
            buttonText: 'Learn More',
            image: 'assets/images/products/aquilon-8000/aquilon-8000-01.jpg'
        }
    };
    var rootConfig = typeof MEGA_MENU_CONFIG !== 'undefined' ? MEGA_MENU_CONFIG : (window.MEGA_MENU_CONFIG || {});
    var source = rootConfig && rootConfig.products ? rootConfig.products : {};
    var defaultColumnsByKey = {};

    defaults.columns.forEach(function (column) {
        defaultColumnsByKey[column.key] = column;
    });

    var columns = Array.isArray(source.columns) && source.columns.length
        ? source.columns.map(function (column, index) {
            var fallback = defaultColumnsByKey[column.key] || defaults.columns[index] || {};
            return {
                key: column.key || fallback.key || '',
                title: column.title || fallback.title || column.key || '',
                icon: normalizeProductMegaMenuIcon(column.icon, fallback.icon || 'fas fa-cube')
            };
        })
        : defaults.columns;

    return {
        columns: columns,
        spotlight: Object.assign({}, defaults.spotlight, source.spotlight || {})
    };
}

function getProductHref(item) {
    if (item && item.id) {
        return '#/products/detail?id=' + encodeURIComponent(item.id);
    }

    return item && item.link ? item.link : '#/products';
}

function saveProductsListState() {
    var hash = window.location.hash || '#/products';
    if (!hash || hash.indexOf('#/products') !== 0 || hash.indexOf('#/products/detail') === 0) return;

    var state = {
        hash: hash,
        scrollY: window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    };

    try {
        sessionStorage.setItem(PRODUCTS_LIST_STATE_KEY, JSON.stringify(state));
    } catch (e) {
        // Ignore sessionStorage issues
    }
}

function readProductsListState() {
    try {
        var raw = sessionStorage.getItem(PRODUCTS_LIST_STATE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

window.saveProductsListState = saveProductsListState;

window.restoreProductsListState = function() {
    var state = readProductsListState();
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
        sessionStorage.removeItem(PRODUCTS_LIST_STATE_KEY);
    } catch (e) {
        // Ignore sessionStorage issues
    }

    return true;
};

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

function attachProductsHoverEffects(container) {
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

function getProductMegaMenuColumnMeta(columns, key, fallbackTitle, fallbackIcon) {
    var match = (columns || []).find(function (column) {
        return String(column.key || '').toLowerCase() === String(key || '').toLowerCase();
    });

    return {
        title: (match && match.title) || fallbackTitle,
        icon: (match && match.icon) || fallbackIcon
    };
}

function appendProductMegaMenuLink(container, item, extraClass) {
    var link = document.createElement('a');
    link.href = getProductHref(item);
    link.className = 'glass-link' + (extraClass ? ' ' + extraClass : '');
    link.dataset.title = item.name;
    link.dataset.desc = item.description;
    link.dataset.img = item.image;

    var html = escapeHtml(item.name);
    if (item.isNew) {
        html += ' <span class="badge-new">New</span>';
    }
    link.innerHTML = html;
    container.appendChild(link);
}

function appendProductMegaMenuViewAll(container, href, label) {
    var link = document.createElement('a');
    link.href = href;
    link.className = 'glass-link glass-link--view-all';
    link.innerHTML = escapeHtml(label) + ' <i class="fas fa-arrow-right"></i>';
    container.appendChild(link);
}

function attachProductMegaHubInteractions(container) {
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
        var featureHref = source.dataset.featureHref || '#/products';
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

    container.innerHTML = '';
    const megaMenuConfig = getProductsMegaMenuConfig();
    const columns = megaMenuConfig.columns;
    const visibleProducts = data.filter(function (item) { return !item.isNested; });
    const groupedProducts = {
        vessels: visibleProducts.filter(function (item) { return item.category === 'Vessels'; }),
        buoys: visibleProducts.filter(function (item) { return item.category === 'Buoys'; }),
        software: visibleProducts.filter(function (item) { return item.category === 'Software'; }),
        equipment: visibleProducts.filter(function (item) { return item.category === 'Equipment'; }),
        integrated: visibleProducts.filter(function (item) { return item.category === 'Integrated Solutions'; })
    };
    const metaByCategory = {
        vessels: getProductMegaMenuColumnMeta(columns, 'Vessels', 'Platforms', 'fas fa-ship'),
        buoys: getProductMegaMenuColumnMeta(columns, 'Buoys', 'Buoys', 'fas fa-life-ring'),
        software: getProductMegaMenuColumnMeta(columns, 'Software', 'Software', 'fas fa-laptop-code'),
        equipment: getProductMegaMenuColumnMeta(columns, 'Equipment', 'Equipment & Systems', 'fas fa-layer-group')
    };

    var spotlightMatch = visibleProducts.find(function (item) {
        return megaMenuConfig.spotlight &&
            ((item.id && megaMenuConfig.spotlight.link && megaMenuConfig.spotlight.link.indexOf(encodeURIComponent(item.id)) !== -1) ||
            item.name === megaMenuConfig.spotlight.title);
    });
    var featuredProducts = [];
    [
        spotlightMatch,
        groupedProducts.vessels[0],
        groupedProducts.software[0],
        groupedProducts.software[1],
        groupedProducts.buoys[0],
        groupedProducts.integrated[0]
    ].forEach(function (item) {
        if (!item) return;
        if (featuredProducts.some(function (entry) { return entry.name === item.name; })) return;
        featuredProducts.push(item);
    });

    var panels = [
        {
            id: 'platforms',
            label: 'Platforms',
            title: 'Platforms',
            description: 'Survey vessels and marine-ready platforms for coastal, offshore, and autonomous operations.',
            items: groupedProducts.vessels,
            featureItem: groupedProducts.vessels[0],
            footerHref: '#/products?section=' + getProductCategorySectionId('Vessels'),
            footerLabel: 'Explore all platforms'
        },
        {
            id: 'buoys',
            label: metaByCategory.buoys.title,
            title: metaByCategory.buoys.title,
            description: 'Monitoring buoy systems for metocean, navigation, hydrographic, and LiDAR deployments.',
            items: groupedProducts.buoys,
            featureItem: groupedProducts.buoys[0],
            footerHref: '#/products?section=' + getProductCategorySectionId('Buoys'),
            footerLabel: 'Explore all buoys'
        },
        {
            id: 'software',
            label: metaByCategory.software.title,
            title: metaByCategory.software.title,
            description: 'Data management, analytics, inspection, and monitoring platforms built for environmental workflows.',
            items: groupedProducts.software,
            featureItem: groupedProducts.software[0],
            footerHref: '#/products?section=survey-monitoring-softwares',
            footerLabel: 'Explore all software'
        },
        {
            id: 'systems',
            label: metaByCategory.equipment.title,
            title: 'Equipment & Integrated Systems',
            description: 'Deployment hardware and complete monitoring systems for field-ready operations.',
            items: groupedProducts.equipment.concat(groupedProducts.integrated),
            featureItem: groupedProducts.integrated[0] || groupedProducts.equipment[0],
            footerHref: '#/products',
            footerLabel: 'Explore all products'
        }
    ];

    var railHtml = panels.map(function (panel) {
        return '<button type="button" class="mega-hub__rail-item" data-panel="' + panel.id + '" aria-selected="false">' + escapeHtml(panel.label) + '</button>';
    }).join('');

    var paneHtml = panels.map(function (panel) {
        var cards = panel.items.map(function (item) {
            return (
                '<a href="' + escapeHtml(getProductHref(item)) + '" class="mega-hub__card" data-feature-title="' + escapeHtml(item.name) + '" data-feature-href="' + escapeHtml(getProductHref(item)) + '" data-feature-img="' + escapeHtml(item.image || '') + '">' +
                    '<div class="mega-hub__card-title">' + escapeHtml(item.name) + '</div>' +
                '</a>'
            );
        }).join('');
        var featureItem = panel.featureItem || panel.items[0];
        var featureHtml = featureItem ? (
            '<aside class="mega-hub__feature-card">' +
                '<div class="mega-hub__feature-media">' +
                    '<img src="' + escapeHtml(featureItem.image || '') + '" alt="' + escapeHtml(featureItem.name) + '">' +
                '</div>' +
                '<div class="mega-hub__feature-body">' +

                    '<div class="mega-hub__feature-title">' + escapeHtml(featureItem.name) + '</div>' +
                    '<a href="' + escapeHtml(getProductHref(featureItem)) + '" class="mega-hub__feature-link">View details <i class="fas fa-arrow-right"></i></a>' +
                '</div>' +
            '</aside>'
        ) : '';

        return (
            '<section class="mega-hub__pane" data-panel="' + panel.id + '" data-feature-title="' + escapeHtml(featureItem ? featureItem.name : '') + '" data-feature-href="' + escapeHtml(featureItem ? getProductHref(featureItem) : '#/products') + '" data-feature-img="' + escapeHtml(featureItem ? (featureItem.image || '') : '') + '">' +
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
        '<div class="mega-hub mega-hub--products">' +
            '<aside class="mega-hub__rail">' +
                '<div class="mega-hub__rail-list">' + railHtml + '</div>' +
                '<div class="mega-hub__rail-footer">' +
                    '<a href="#/products" class="mega-hub__rail-cta">View all products <i class="fas fa-arrow-right"></i></a>' +
                '</div>' +
            '</aside>' +
            '<div class="mega-hub__content">' + paneHtml + '</div>' +
        '</div>';

    attachProductMegaHubInteractions(container);
};

/**
 * Renders the Products Page Grid
 * Exported as window.renderProductsGrid for SPA router usage.
 */
function scrollToProductSection(sectionId) {
    if (!sectionId) return;

    var target = document.getElementById(sectionId);
    if (!target) return;

    var headerOffset = 96;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function scheduleProductSectionScroll(sectionId) {
    if (!sectionId) return;

    [160, 420, 900].forEach(function (delay) {
        window.setTimeout(function () {
            scrollToProductSection(sectionId);
        }, delay);
    });
}

window.renderProductsGrid = function(container, targetSectionId) {
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
            id: 'survey-monitoring-platforms',
            title: 'Survey & Monitoring Platforms',
            subtitle: 'Robust hardware solutions engineering for the marine environment.',
            categories: ['Buoys', 'Vessels', 'Equipment'] // Grouping hardware
        },
        {
            id: 'survey-monitoring-softwares',
            title: 'Survey & Monitoring Softwares',
            subtitle: 'Advanced software platforms for data management and analysis.',
            categories: ['Software']
        },
        {
            id: 'integrated-solutions',
            title: 'Integrated Solutions',
            subtitle: 'Comprehensive solutions for environmental and operational intelligence.',
            categories: ['Integrated Solutions']
        }
    ];

    sections.forEach((section, index) => {
        // Create Section HTML
        const sectionEl = document.createElement('section');
        sectionEl.className = index % 2 === 0 ? 'section section--light-bg' : 'section'; // Alternate/Check ID styling
        sectionEl.id = section.id;

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

            sectionContent += `<div class="product-category" id="${getProductCategorySectionId(catName)}">`;

            if (showSubSelect) {
                sectionContent += `<h3 class="product-category__title">${getIconForProductCategory(catName)} ${catName}</h3>`;
            }

            sectionContent += `<div class="product-list-grid">`;

            items.forEach(item => {
                const itemHref = getProductHref(item);
                sectionContent += `
                    <a href="${itemHref}" class="product-grid-wrapper" aria-label="View details about ${escapeHtml(item.name)}">
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

    scheduleProductSectionScroll(targetSectionId);
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
