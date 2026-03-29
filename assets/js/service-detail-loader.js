/**
 * Service Detail Loader
 * Dynamically generates the service detail page content.
 *
 * Exports:
 *   window.renderServiceDetail(container, serviceId)
 */
var esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
var formatAllowedInlineHtml = typeof formatAllowedInlineHtml === 'function'
    ? formatAllowedInlineHtml
    : function(text) {
        return esc(text == null ? '' : text).replace(/&lt;(\/?)strong&gt;/gi, '<$1strong>');
    };

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

/**
 * Renders a Service Detail page into the given container.
 * Exported as window.renderServiceDetail for SPA router usage.
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @param {string} serviceId - The service ID to display
 */
window.renderServiceDetail = function(container, serviceId) {
    // Support both variable names
    const data = typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : (typeof servicesData !== 'undefined' ? servicesData : null);

    if (!serviceId || !data) {
        container.innerHTML = '<div style="text-align:center;"><h2>Service Not Found</h2><a href="#/services" class="button button--primary">View All Services</a></div>';
        return;
    }

    const service = data.find(s => s.id === serviceId);

    if (!service) {
        container.innerHTML = '<div style="text-align:center;"><h2>Service Not Found</h2><p>The requested service ID does not exist.</p><a href="#/services" class="button button--primary">View All Services</a></div>';
        return;
    }

    const serviceName = getServiceDisplayName(service);

    // Update Page Title
    document.title = `${serviceName} | TRIDEL`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = service.description;

    // Build Features List
    let featuresHtml = '';
    if (service.features && service.features.length > 0) {
        featuresHtml = `
            <h3>Key Capabilities</h3>
            <ul class="detail-layout__list">
                ${service.features.map(f => `<li>${formatAllowedInlineHtml(f)}</li>`).join('')}
            </ul>
        `;
    }

    const galleryImages = getServiceGallery(service);
    const mainImage = getServicePrimaryImage(service);
    const thumbsHtml = galleryImages.map((img, index) => `
        <img loading="lazy" src="${img}" onclick="changeImage('${img}')" onkeydown="if(event.key==='Enter')changeImage('${img}')" tabindex="0" role="button" ${img === mainImage ? 'class="active"' : ''} alt="${escapeHtml(serviceName)} - Image ${index + 1}">
    `).join('');

    const galleryHtml = `
        <div class="product-gallery">
          <div class="gallery-main" onclick="openLightbox(this)" onkeydown="if(event.key==='Enter')openLightbox(this)" tabindex="0" role="button">
            <img loading="lazy" id="main-product-image" src="${mainImage}"
              alt="${escapeHtml(serviceName)}" class="product-image-style">
            <div class="enlarge-hint">
              <svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Click to Enlarge
            </div>
          </div>
          ${thumbsHtml ? `<div class="gallery-thumbs">${thumbsHtml}</div>` : ''}
        </div>
    `;

    // Render Template
    container.innerHTML = `
        <div class="detail-layout">
          <div class="detail-layout__content">
            <h1 class="detail-layout__title">${escapeHtml(serviceName)}</h1>
            <p class="detail-layout__description">${escapeHtml(service.description)}</p>
            ${featuresHtml}

            <div class="product-actions">
              <a class="button button--primary" href="#/contact?subject=Service Inquiry: ${encodeURIComponent(serviceName)}">Request Service</a>
              <a href="#/services" class="button button--soft">Back to Services</a>
            </div>
          </div>
          <div class="detail-layout__image">
            ${galleryHtml}
          </div>
        </div>

        <!-- Sub-Services Section (Grid Layout) -->
        ${service.subServices ? `
            <div class="sub-services-section" style="max-width: 1100px; margin: 2.5rem auto 0; padding-top: 2rem; border-top: 1px solid var(--border);">
                <h2 style="margin-bottom: 1.5rem; font-size: 1.3rem; font-weight: 600;">Related Services</h2>

                <div class="product-list-grid">
                    ${service.subServices.map(subItem => {
                        // Resolve full object if it's just a reference or if we want to ensure latest data
                        const sub = (typeof subItem === 'object' && (subItem.name || subItem.title)) ? subItem : data.find(s => s.id === (subItem.id || subItem));
                        if (!sub) return '';
                        const subName = getServiceDisplayName(sub);

                        return `
                        <a href="#/services/detail?id=${sub.id}" class="product-grid-wrapper" style="text-decoration:none; color:inherit;" aria-label="View details about ${escapeHtml(subName)}">
                            <div class="product-card-visual">
                                <img loading="lazy" alt="${escapeHtml(subName)}" class="product-item__image product-image-style" src="${getServicePrimaryImage(sub) || mainImage}">
                            </div>
                            <div class="product-content-outside">
                                <h4>${escapeHtml(subName)}</h4>
                                <p class="product-item__excerpt">${escapeHtml(sub.description || '')}</p>
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
    const serviceId = params.get('id');
    const container = document.getElementById('service-detail-container');

    if (container) {
        window.renderServiceDetail(container, serviceId);
    }
});

// openLightbox is defined globally in script.js
