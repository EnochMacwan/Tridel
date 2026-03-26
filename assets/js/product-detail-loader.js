/**
 * Product Detail Loader
 * Dynamically generates the product detail page content.
 *
 * Exports:
 *   window.renderProductDetail(container, productId)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
var formatAllowedInlineHtml = typeof formatAllowedInlineHtml === 'function'
    ? formatAllowedInlineHtml
    : function(text) {
        return esc(text == null ? '' : text).replace(/&lt;(\/?)strong&gt;/gi, '<$1strong>');
    };

function getProductDataLookupId(product) {
    if (product && product.id) {
        return String(product.id).trim();
    }

    if (product && product.link) {
        var match = String(product.link).match(/[?&]id=([^&]+)/i);
        if (match && match[1]) {
            try {
                return decodeURIComponent(match[1]).trim();
            } catch (e) {
                return String(match[1]).trim();
            }
        }
    }

    return '';
}

function getProductGallery(product) {
    var rawGallery = Array.isArray(product && product.gallery) ? product.gallery : [];
    var sourceImages = rawGallery.length
        ? rawGallery
        : (product && product.image ? [product.image] : []);
    var seen = Object.create(null);
    var uniqueImages = [];

    sourceImages.forEach(function(image) {
        if (!image) {
            return;
        }

        var normalized = String(image).trim();
        if (!normalized) {
            return;
        }

        var dedupeKey = normalized.indexOf('data:') === 0
            ? normalized.slice(0, 128) + '::' + normalized.length
            : normalized.toLowerCase();

        if (seen[dedupeKey]) {
            return;
        }

        seen[dedupeKey] = true;
        uniqueImages.push(normalized);
    });

    return uniqueImages;
}

/**
 * Renders a Product Detail page into the given container.
 * Exported as window.renderProductDetail for SPA router usage.
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @param {string} productId - The product ID to display
 */
window.renderProductDetail = function(container, productId) {
    // Support both variable names
    const data = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : (typeof productsData !== 'undefined' ? productsData : null);

    if (!productId || !data) {
        container.innerHTML = '<div style="text-align:center;"><h2>Product Not Found</h2><a href="#/products" class="button button--primary">View All Products</a></div>';
        return;
    }

    var requestedProductId = String(productId).trim().toLowerCase();
    const product = data.find(function(p) {
        return getProductDataLookupId(p).toLowerCase() === requestedProductId;
    });

    if (!product) {
        container.innerHTML = '<div style="text-align:center;"><h2>Product Not Found</h2><p>The requested product ID does not exist.</p><a href="#/products" class="button button--primary">View All Products</a></div>';
        return;
    }

    // Update Page Title
    document.title = `${product.name} | TRIDEL`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = product.description;

    // Build Features List
    let featuresHtml = '';
    if (product.features && product.features.length > 0) {
        featuresHtml = `
            <h3>Key Features</h3>
            <ul class="detail-layout__list">
                ${product.features.map(f => `<li>${formatAllowedInlineHtml(f)}</li>`).join('')}
            </ul>
        `;
    }

    // Build Gallery
    let galleryHtml = '';
    const galleryImages = getProductGallery(product);
    if (galleryImages.length > 0) {
        const mainImage = galleryImages[0];
        const thumbsHtml = galleryImages.map((img, index) => `
            <img loading="lazy" src="${img}" onclick="changeImage('${img}')" onkeydown="if(event.key==='Enter')changeImage('${img}')" tabindex="0" role="button" ${img === mainImage ? 'class="active"' : ''} alt="${escapeHtml(product.name)} - Image ${index + 1}">
        `).join('');

        galleryHtml = `
            <div class="product-gallery">
                <div class="gallery-main" onclick="openLightbox(this)" onkeydown="if(event.key==='Enter')openLightbox(this)" tabindex="0" role="button">
                    <img loading="lazy" id="main-product-image" src="${mainImage}" alt="${escapeHtml(product.name)}">
                    <div class="enlarge-hint">
                        <svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                        Click to Enlarge
                    </div>
                </div>
                <div class="gallery-thumbs">
                    ${thumbsHtml}
                </div>
            </div>
        `;
    }

    // Render Template
    container.innerHTML = `
        <div class="detail-layout">
          <div class="detail-layout__content">
            <h1 class="detail-layout__title">${escapeHtml(product.name)}</h1>
            <p class="detail-layout__description">${escapeHtml(product.longDescription || product.description)}</p>
            ${featuresHtml}

            <div class="product-actions">
              <a class="button button--primary" href="#/contact?subject=Quote for ${encodeURIComponent(product.name)}">Request Quote</a>
              <a href="#/products" class="button button--soft">Back to Products</a>
            </div>
          </div>
          <div class="detail-layout__image">
            ${galleryHtml}
          </div>
        </div>

        <!-- Sub-Products Section (Grid Layout) -->
        ${product.subProducts ? `
            <div class="sub-products-section" style="max-width: 1100px; margin: 2.5rem auto 0; padding-top: 2rem; border-top: 1px solid var(--border);">
                <h2 style="margin-bottom: 1.5rem; font-size: 1.3rem; font-weight: 600;">Related Systems / Products</h2>

                <div class="product-list-grid">
                    ${product.subProducts.map(subItem => {
                         // Resolve full object if it's just a reference
                        const sub = (typeof subItem === 'object' && subItem.name) ? subItem : data.find(p => p.id === (subItem.id || subItem));
                        if (!sub) return '';

                        return `
                        <a href="#/products/detail?id=${sub.id}" class="product-grid-wrapper" style="text-decoration:none; color:inherit;" aria-label="View details about ${escapeHtml(sub.name)}">
                            <div class="product-card-visual">
                                <img loading="lazy" alt="${escapeHtml(sub.name)}" class="product-item__image product-image-style" src="${sub.image || product.image}">
                            </div>
                            <div class="product-content-outside">
                                <h4>${escapeHtml(sub.name)}</h4>
                                <p class="product-item__excerpt">${escapeHtml((sub.description || '').substring(0, 100))}...</p>
                                <span class="button button--secondary">View Details</span>
                            </div>
                        </a>
                    `}).join('')}
                </div>
            </div>
        ` : ''}
    `;
};

// --- DOMContentLoaded Fallback (for admin.html / standalone page compatibility) ---
// Skip if SPA router is active (hash-based routing handles rendering)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initRouter === 'function') return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-detail-container');

    if (container) {
        window.renderProductDetail(container, productId);
    }
});

// changeImage and openLightbox are defined globally in script.js
