document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('id');
    const container = document.getElementById('service-detail-container');

    if (!serviceId || typeof servicesData === 'undefined') {
        container.innerHTML = '<div style="text-align:center;"><h2>Service Not Found</h2><a href="services.html" class="button button--primary">View All Services</a></div>';
        return;
    }

    const service = servicesData.find(s => s.id === serviceId);

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
                ${service.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        `;
    }

    // Render Template
    container.innerHTML = `
        <div class="detail-layout">
          <div class="detail-layout__content">
            <h1 class="detail-layout__title">${service.name}</h1>
            <p class="detail-layout__description">${service.description}</p>
            ${featuresHtml}
            
            <div class="product-actions" style="margin-top: 2rem;">
              <a class="button button--primary" href="contact.html?subject=Service Inquiry: ${encodeURIComponent(service.name)}">Request Service</a>
              <a href="services.html" class="button button--soft">Back to Services</a>
            </div>
          </div>
          <div class="detail-layout__image">
            <div class="product-gallery">
              <div class="gallery-main" onclick="openLightbox(this)">
                <img loading="lazy" id="main-product-image" src="${service.image}"
                  alt="${service.name}" class="product-image-style">
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
    `;
});

// Helper for gallery (reused from products, or global)
window.openLightbox = function(el) {
    const img = el.querySelector('img');
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;justify-content:center;align-items:center;cursor:zoom-out;';
    overlay.innerHTML = `<img src="${img.src}" style="max-width:90%;max-height:90%;border-radius:8px;">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}
