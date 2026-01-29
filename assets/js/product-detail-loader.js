document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-detail-container');

    // Support both variable names
    const data = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : (typeof productsData !== 'undefined' ? productsData : null);

    if (!productId || !data) {
        container.innerHTML = '<div style="text-align:center;"><h2>Product Not Found</h2><a href="products.html" class="button button--primary">View All Products</a></div>';
        return;
    }

    const product = data.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = '<div style="text-align:center;"><h2>Product Not Found</h2><p>The requested product ID does not exist.</p><a href="products.html" class="button button--primary">View All Products</a></div>';
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
                ${product.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        `;
    }

    // Build Gallery
    let galleryHtml = '';
    if (product.gallery && product.gallery.length > 0) {
        const mainImage = product.gallery[0];
        const thumbsHtml = product.gallery.map(img => `
            <img loading="lazy" src="${img}" onclick="changeImage('${img}')" ${img === mainImage ? 'class="active"' : ''} alt="${product.name}">
        `).join('');

        galleryHtml = `
            <div class="product-gallery">
                <div class="gallery-main" onclick="openLightbox(this)">
                    <img loading="lazy" id="main-product-image" src="${mainImage}" alt="${product.name}">
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
            <h1 class="detail-layout__title">${product.name}</h1>
            <p class="detail-layout__description">${product.longDescription || product.description}</p>
            ${featuresHtml}
            
            <div class="product-actions" style="margin-top: 2rem;">
              <a class="button button--primary" href="contact.html?subject=Quote for ${encodeURIComponent(product.name)}">Request Quote</a>
              <a href="products.html" class="button button--soft">Back to Products</a>
            </div>
          </div>
          <div class="detail-layout__image">
            ${galleryHtml}
          </div>
        </div>
        
        <!-- Sub-Products Section (Grid Layout) -->
        ${product.subProducts ? `
            <div class="sub-products-section" style="margin-top: 4rem; padding-top: 3rem; border-top: 1px solid var(--border);">
                <h2 style="margin-bottom: 2rem; font-size: 2rem;">Related Systems / Products</h2>
                
                <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
                    ${product.subProducts.map(subItem => {
                         // Resolve full object if it's just a reference
                        const sub = (typeof subItem === 'object' && subItem.name) ? subItem : data.find(p => p.id === (subItem.id || subItem));
                        if (!sub) return '';
                        
                        return `
                        <a href="product-detail.html?id=${sub.id}" class="service-card" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                            <div class="service-card__image-container" style="position: relative; height: 200px; overflow: hidden;">
                                <img src="${sub.image || product.image}" alt="${sub.name}" class="service-card__image" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" loading="lazy">
                                <div class="service-card__overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
                                    <span class="service-card__icon" style="color: white; font-size: 2rem;"><i class="fas fa-arrow-right"></i></span>
                                </div>
                            </div>
                            <div class="service-card__content" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
                                <h3 class="service-card__title" style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem;">${sub.name}</h3>
                                <p class="service-card__description" style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1;">${(sub.description || '').substring(0, 100)}...</p>
                                <span class="service-card__link" style="color: var(--accent); font-weight: 500; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                                    View Product <i class="fas fa-arrow-right"></i>
                                </span>
                            </div>
                        </a>
                    `}).join('')}
                </div>
            </div>
        ` : ''}
    `;
});

// Helper for gallery
window.changeImage = function(src) {
    document.getElementById('main-product-image').src = src;
    document.querySelectorAll('.gallery-thumbs img').forEach(img => {
        img.classList.remove('active');
        if(img.src.includes(src)) img.classList.add('active');
    });
}
window.openLightbox = function(el) {
    // Optional: Implement lightbox or just a simple alert for now if no lightbox lib
    // The previous code had a lightbox? Let's assume it's global or handled elsewhere.
    // We will just let the user zoom in if they have browser zoom.
    // Or we could implement a simple modal here.
    const img = el.querySelector('img');
    // Implement simple full screen overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;justify-content:center;align-items:center;cursor:zoom-out;';
    overlay.innerHTML = `<img src="${img.src}" style="max-width:90%;max-height:90%;border-radius:8px;">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}
