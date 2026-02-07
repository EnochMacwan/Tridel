document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('id');
    const container = document.getElementById('service-detail-container');

    // Support both variable names
    const data = typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : (typeof servicesData !== 'undefined' ? servicesData : null);

    if (!serviceId || !data) {
        container.innerHTML = '<div style="text-align:center;"><h2>Service Not Found</h2><a href="services.html" class="button button--primary">View All Services</a></div>';
        return;
    }

    const service = data.find(s => s.id === serviceId);

    if (!service) {
        container.innerHTML = '<div style="text-align:center;"><h2>Service Not Found</h2><p>The requested service ID does not exist.</p><a href="services.html" class="button button--primary">View All Services</a></div>';
        return;
    }

    // Update Page Title
    document.title = `${service.name} | TRIDEL`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = service.description;

    // Build Features List
    let featuresHtml = '';
    if (service.features && service.features.length > 0) {
        featuresHtml = `
            <h3>Key Capabilities</h3>
            <ul class="detail-layout__list">
                ${service.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
            </ul>
        `;
    }

    // Render Template
    container.innerHTML = `
        <div class="detail-layout">
          <div class="detail-layout__content">
            <h1 class="detail-layout__title">${escapeHtml(service.name)}</h1>
            <p class="detail-layout__description">${escapeHtml(service.description)}</p>
            ${featuresHtml}
            
            <div class="product-actions" style="margin-top: 2rem;">
              <a class="button button--primary" href="contact.html?subject=Service Inquiry: ${encodeURIComponent(service.name)}">Request Service</a>
              <a href="services.html" class="button button--soft">Back to Services</a>
            </div>
          </div>
          <div class="detail-layout__image">
            <div class="product-gallery">
              <div class="gallery-main" onclick="openLightbox(this)" onkeydown="if(event.key==='Enter')openLightbox(this)" tabindex="0" role="button">
                <img loading="lazy" id="main-product-image" src="${service.image}"
                  alt="${escapeHtml(service.name)}" class="product-image-style">
                <div class="enlarge-hint">
                  <svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  Click to Enlarge
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sub-Services Section (Grid Layout) -->
        ${service.subServices ? `
            <div class="sub-services-section" style="margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--border);">
                <h2 style="margin-bottom: 2rem; font-size: 2rem;">Related Services</h2>
                
                <div class="product-list-grid">
                    ${service.subServices.map(subItem => {
                        // Resolve full object if it's just a reference or if we want to ensure latest data
                        const sub = (typeof subItem === 'object' && subItem.name) ? subItem : data.find(s => s.id === (subItem.id || subItem));
                        if (!sub) return '';
                        
                        return `
                        <a href="service-detail.html?id=${sub.id}" class="product-grid-wrapper" style="text-decoration:none; color:inherit;" aria-label="View details about ${escapeHtml(sub.name)}">
                            <div class="product-card-visual">
                                <img loading="lazy" alt="${escapeHtml(sub.name)}" class="product-item__image product-image-style" src="${sub.image || service.image}">
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
});

// openLightbox is defined globally in script.js
